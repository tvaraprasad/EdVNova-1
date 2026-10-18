from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
import re
from curriculum.pathways import BOARDS, pathway_chapters, visible_topic_query

COMPLETE_RATIO = 0.9
MAX_RATE = 2.0
SLACK_SECONDS = 15


def _now():
    return datetime.now(timezone.utc)


def _yt_id(url: str) -> str:
    m = re.search(r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([a-zA-Z0-9_-]{11})", url or "")
    return m.group(1) if m else ""


def parse_duration(text) -> float:
    try:
        parts = [float(x) for x in str(text or "").strip().split(":") if x != ""]
    except ValueError:
        return 0
    total = 0
    for part in parts:
        total = total * 60 + part
    return total if len(parts) >= 2 else 0


def merge_intervals(intervals):
    out = []
    for s, e in sorted(intervals):
        if out and s <= out[-1][1] + 1:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out


def watched_seconds(intervals):
    return sum(e - s for s, e in intervals)


class LessonRef(BaseModel):
    board: str = Field(min_length=1, max_length=80)
    subject: str = Field(min_length=1, max_length=80)
    chapter: str = Field(min_length=1, max_length=120)
    topic: str = Field(min_length=1, max_length=160)


class VisitRef(LessonRef):
    view_board: Optional[str] = None


class SubtopicRef(LessonRef):
    subtopic: str = Field(min_length=1, max_length=120)


class VideoHeartbeat(BaseModel):
    position: float = Field(ge=0)
    duration: float = Field(gt=0, le=6 * 3600)
    intervals: List[List[float]] = Field(default_factory=list, max_length=50)


def create_progress_routes(db, get_current_user):
    router = APIRouter(prefix="/progress")

    async def optional_user(request: Request) -> Optional[dict]:
        try:
            return await get_current_user(request)
        except HTTPException:
            return None

    async def ensure_indexes():
        await db.learning_progress.create_index(
            [("user_id", 1), ("board", 1), ("subject", 1), ("chapter", 1), ("topic", 1)], unique=True)
        await db.learning_progress.create_index([("user_id", 1), ("last_visited_at", -1)])
        await db.video_progress.create_index([("user_id", 1), ("video_id", 1)], unique=True)
        await db.chapter_milestones.create_index(
            [("user_id", 1), ("board", 1), ("subject", 1), ("chapter", 1)], unique=True)

    async def published_topic(ref: LessonRef):
        t = await db.curriculum_topics.find_one(
            {"board_slug": ref.board, "subject_slug": ref.subject, "chapter_slug": ref.chapter,
             "slug": ref.topic, "status": "published"}, {"_id": 0, "title": 1})
        if not t:
            raise HTTPException(404, "Lesson not found or not published")
        return t

    async def course_summary(user_id: Optional[str], board: str, subject: str):
        subj = await db.curriculum_subjects.find_one({"board_slug": board, "slug": subject}, {"_id": 0, "name": 1, "board_name": 1})
        if not subj:
            raise HTTPException(404, "Subject not found")
        chapters, _ = await pathway_chapters(db, board, subject)
        boards = sorted({c["board_slug"] for c in chapters} | {board})
        topics = await db.curriculum_topics.find(
            {"board_slug": {"$in": boards}, "subject_slug": subject, "$or": [{"status": "published"}, {"syllabus_review": {"$exists": False}}]},
            {"_id": 0, "slug": 1, "title": 1, "board_slug": 1, "chapter_slug": 1, "order": 1, "status": 1, "study_time": 1, "syllabus_ref": 1, "subtopics": 1}).sort("order", 1).to_list(3000)
        videos = await db.videos.find(
            {"board": {"$in": boards}, "subject": subject, "status": "available"},
            {"_id": 1, "board": 1, "chapter": 1, "title": 1, "required": 1, "youtube_url": 1}).sort("order", 1).to_list(500)

        lesson_status, sub_done, video_done, last = {}, {}, set(), None
        if user_id:
            async for p in db.learning_progress.find({"user_id": user_id, "board": {"$in": boards}, "subject": subject}):
                k = (p["board"], p["chapter"], p["topic"])
                lesson_status[k] = p["status"]
                sub_done[k] = p.get("subtopics_completed", [])
                if not last or p["last_visited_at"] > last["last_visited_at"]:
                    last = p
            vids = [str(v["_id"]) for v in videos]
            async for vp in db.video_progress.find({"user_id": user_id, "video_id": {"$in": vids}, "completed": True}, {"video_id": 1}):
                video_done.add(vp["video_id"])

        out_chapters, seq = [], []
        total = done = 0
        for ch in chapters:
            cb = ch["board_slug"]
            ch_topics = []
            for t in topics:
                if t["board_slug"] != cb or t["chapter_slug"] != ch["slug"]:
                    continue
                published = t.get("status") == "published"
                k = (cb, ch["slug"], t["slug"])
                st = lesson_status.get(k, "not_started") if published else "unavailable"
                item = {"slug": t["slug"], "title": t["title"], "status": st, "available": published, "study_time": t.get("study_time", ""),
                        "syllabus_ref": t.get("syllabus_ref", ""), "subtopics": t.get("subtopics", []) if published else [],
                        "subtopics_completed": sub_done.get(k, [])}
                ch_topics.append(item)
                if published:
                    seq.append({"board": cb, "chapter": ch["slug"], "chapter_name": ch["name"], "topic": t["slug"], "title": t["title"], "status": st})
            req_videos = [v for v in videos if v.get("board") == cb and v.get("chapter") == ch["slug"] and v.get("required") and _yt_id(v.get("youtube_url", ""))]
            ch_total = sum(1 for t in ch_topics if t["available"]) + len(req_videos)
            ch_done = sum(1 for t in ch_topics if t["status"] == "completed") + sum(1 for v in req_videos if str(v["_id"]) in video_done)
            total += ch_total
            done += ch_done
            out_chapters.append({
                "slug": ch["slug"], "name": ch["name"], "board": cb, "group": ch.get("group", ""),
                "syllabus_number": ch.get("syllabus_number", ""), "kind": ch.get("kind", "theory"), "topics": ch_topics,
                "required_videos": [{"id": str(v["_id"]), "title": v["title"], "completed": str(v["_id"]) in video_done} for v in req_videos],
                "total": ch_total, "completed": ch_done,
                "percent": round(ch_done * 100 / ch_total) if ch_total else 0,
            })

        last_visited = None
        if last:
            title = next((s["title"] for s in seq if (s["board"], s["chapter"], s["topic"]) == (last["board"], last["chapter"], last["topic"])), None)
            if title:
                last_visited = {"chapter": last["chapter"], "topic": last["topic"], "title": title,
                                "visited_at": last["last_visited_at"].isoformat() if isinstance(last["last_visited_at"], datetime) else last["last_visited_at"]}

        next_lesson = None
        start = 0
        if last_visited:
            start = next((i for i, s in enumerate(seq) if s["chapter"] == last_visited["chapter"] and s["topic"] == last_visited["topic"]), 0)
        ordered = seq[start:] + seq[:start]
        nxt = next((s for s in ordered if s["status"] != "completed"), None)
        if nxt:
            next_lesson = {k: nxt[k] for k in ("chapter", "chapter_name", "topic", "title")}

        return {
            "board": board, "subject": subject, "subject_name": subj.get("name", ""), "board_name": subj.get("board_name", ""),
            "total": total, "completed": done, "percent": round(done * 100 / total) if total else 0,
            "chapters": out_chapters, "last_visited": last_visited, "next_lesson": next_lesson,
        }

    async def chapter_milestone(user_id: str, board: str, subject: str, chapter: str):
        summary = await course_summary(user_id, board, subject)
        ch = next((c for c in summary["chapters"] if c["slug"] == chapter and c["board"] == board), None)
        first = False
        if ch and ch["total"] and ch["completed"] == ch["total"]:
            res = await db.chapter_milestones.update_one(
                {"user_id": user_id, "board": board, "subject": subject, "chapter": chapter},
                {"$setOnInsert": {"achieved_at": _now()}}, upsert=True)
            first = res.upserted_id is not None
        return summary, first

    @router.get("/course/{board}/{subject}")
    async def get_course(board: str, subject: str, request: Request):
        user = await optional_user(request)
        return await course_summary(user["id"] if user else None, board, subject)

    @router.post("/visit")
    async def visit(ref: VisitRef, request: Request):
        user = await get_current_user(request)
        view = ref.board
        if ref.view_board in BOARDS and ref.view_board != ref.board:
            vs = await db.curriculum_subjects.find_one({"board_slug": ref.view_board, "slug": ref.subject}, {"_id": 0, "foundation_board": 1})
            if (vs or {}).get("foundation_board") == ref.board:
                view = ref.view_board
        ref = LessonRef(**ref.model_dump(exclude={"view_board"}))
        await published_topic(ref)
        now = _now()
        await db.learning_progress.update_one(
            {"user_id": user["id"], **ref.model_dump()},
            {"$set": {"last_visited_at": now, "view_board": view},
             "$setOnInsert": {"status": "in_progress", "first_visited_at": now}},
            upsert=True)
        doc = await db.learning_progress.find_one({"user_id": user["id"], **ref.model_dump()}, {"_id": 0, "status": 1})
        return {"status": doc["status"]}

    @router.post("/complete")
    async def complete(ref: LessonRef, request: Request):
        user = await get_current_user(request)
        await published_topic(ref)
        key = {"user_id": user["id"], **ref.model_dump()}
        doc = await db.learning_progress.find_one(key)
        if not doc:
            raise HTTPException(400, "Open the lesson before finishing it")
        res = await db.learning_progress.update_one(
            {**key, "status": {"$ne": "completed"}},
            {"$set": {"status": "completed", "completed_at": _now(), "last_visited_at": _now()}})
        newly = res.modified_count == 1
        summary, first = await chapter_milestone(user["id"], ref.board, ref.subject, ref.chapter)
        return {"status": "completed", "newly_completed": newly, "chapter_completed_first_time": first, "course": summary}

    @router.post("/subtopic")
    async def complete_subtopic(ref: SubtopicRef, request: Request):
        user = await get_current_user(request)
        lesson = LessonRef(**ref.model_dump(exclude={"subtopic"}))
        topic = await db.curriculum_topics.find_one(
            {"board_slug": ref.board, "subject_slug": ref.subject, "chapter_slug": ref.chapter, "slug": ref.topic, "status": "published"},
            {"_id": 0, "subtopics": 1, "content.sections": 1})
        if not topic:
            raise HTTPException(404, "Lesson not found or not published")
        if ref.subtopic not in {s["id"] for s in topic.get("subtopics", [])}:
            raise HTTPException(404, "Subtopic not found")
        key = {"user_id": user["id"], **lesson.model_dump()}
        if not await db.learning_progress.find_one(key, {"_id": 1}):
            raise HTTPException(400, "Open the lesson before completing a section")
        await db.learning_progress.update_one(key, {"$addToSet": {"subtopics_completed": ref.subtopic}, "$set": {"last_visited_at": _now()}})
        doc = await db.learning_progress.find_one(key, {"_id": 0, "subtopics_completed": 1, "status": 1})
        valid = {s["id"] for s in topic.get("subtopics", [])}
        authored = {sec.get("subtopic_id") for sec in (topic.get("content") or {}).get("sections", []) if sec.get("subtopic_id")} & valid
        lesson_completed = first = False
        course = None
        if authored and authored <= set(doc["subtopics_completed"]) and doc["status"] != "completed":
            res = await db.learning_progress.update_one({**key, "status": {"$ne": "completed"}}, {"$set": {"status": "completed", "completed_at": _now()}})
            lesson_completed = res.modified_count == 1
            if lesson_completed:
                course, first = await chapter_milestone(user["id"], ref.board, ref.subject, ref.chapter)
        return {"subtopics_completed": doc["subtopics_completed"], "lesson_completed": lesson_completed,
                "chapter_completed_first_time": first, "course": course}

    @router.get("/continue")
    async def continue_learning(request: Request):
        user = await get_current_user(request)
        recent = await db.learning_progress.aggregate([
            {"$match": {"user_id": user["id"]}},
            {"$group": {"_id": {"board": {"$ifNull": ["$view_board", "$board"]}, "subject": "$subject"}, "last": {"$max": "$last_visited_at"}}},
            {"$sort": {"last": -1}}, {"$limit": 4},
        ]).to_list(4)
        courses = []
        for r in recent:
            try:
                s = await course_summary(user["id"], r["_id"]["board"], r["_id"]["subject"])
            except HTTPException:
                continue
            s.pop("chapters", None)
            courses.append(s)
        return {"courses": courses}

    @router.get("/videos/{board}/{subject}/{chapter}")
    async def chapter_videos(board: str, subject: str, chapter: str, request: Request):
        user = await get_current_user(request)
        vids = await db.videos.find({"board": board, "subject": subject, "chapter": chapter}, {"_id": 1}).to_list(200)
        ids = [str(v["_id"]) for v in vids]
        out = {}
        async for vp in db.video_progress.find({"user_id": user["id"], "video_id": {"$in": ids}}):
            out[vp["video_id"]] = {
                "position": vp.get("position", 0), "duration": vp.get("duration", 0),
                "watched_percent": round(min(1, watched_seconds(vp.get("intervals", [])) / vp["duration"]) * 100) if vp.get("duration") else 0,
                "completed": vp.get("completed", False),
            }
        return out

    @router.post("/video/{video_id}")
    async def video_heartbeat(video_id: str, data: VideoHeartbeat, request: Request):
        user = await get_current_user(request)
        if not ObjectId.is_valid(video_id):
            raise HTTPException(400, "Invalid ID format")
        video = await db.videos.find_one({"_id": ObjectId(video_id), "status": "available"}, {"board": 1, "subject": 1, "chapter": 1, "required": 1, "duration": 1})
        if not video:
            raise HTTPException(404, "Video not found")
        key = {"user_id": user["id"], "video_id": video_id}
        doc = await db.video_progress.find_one(key) or {}
        now = _now()
        # Duration can only grow: admin-entered length and earlier reports are lower bounds.
        duration = max(parse_duration(video.get("duration")), doc.get("duration") or 0, data.duration)
        created = doc.get("created_at") or now
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        # Cumulative budget: total accepted watch time can never exceed real elapsed time at max speed.
        budget = (now - created).total_seconds() * MAX_RATE + SLACK_SECONDS - doc.get("accepted_total", 0)

        accepted = []
        for iv in data.intervals:
            if len(iv) != 2:
                continue
            s, e = max(0.0, float(iv[0])), min(float(duration), float(iv[1]))
            if e <= s:
                continue
            take = min(e - s, budget)
            if take <= 0:
                break
            accepted.append([s, s + take])
            budget -= take

        intervals = merge_intervals(doc.get("intervals", []) + accepted)
        watched = watched_seconds(intervals)
        was_done = doc.get("completed", False)
        completed = was_done or watched >= COMPLETE_RATIO * duration
        update = {"position": min(data.position, duration), "duration": duration, "intervals": intervals,
                  "accepted_total": doc.get("accepted_total", 0) + sum(e - s for s, e in accepted),
                  "completed": completed, "updated_at": now, "board": video.get("board"), "subject": video.get("subject"), "chapter": video.get("chapter")}
        if completed and not was_done:
            update["completed_at"] = now
        await db.video_progress.update_one(key, {"$set": update, "$setOnInsert": {"created_at": now}}, upsert=True)

        first = False
        if completed and not was_done and video.get("required"):
            _, first = await chapter_milestone(user["id"], video["board"], video["subject"], video["chapter"])
        return {"completed": completed, "newly_completed": completed and not was_done,
                "watched_percent": round(min(1, watched / duration) * 100), "position": update["position"],
                "chapter_completed_first_time": first}

    return router, ensure_indexes
