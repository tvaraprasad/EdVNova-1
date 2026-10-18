from fastapi import APIRouter, HTTPException, Request
from curriculum.pathways import lessons_with_content, pathway_chapters, resolve_chapter_board, visible_topic_query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId

from curriculum_data import (
    BOARDS, SUBJECT_META, ALL_CURRICULUM, SAMPLE_CONTENT, slugify
)


def create_curriculum_routes(db, get_current_user, get_admin_user):
    router = APIRouter(prefix="/curriculum")

    # ===== SEED =====
    async def seed_curriculum():
        count = await db.curriculum_boards.count_documents({})
        if count == 0:
            now = datetime.now(timezone.utc).isoformat()

            # Boards
            for i, b in enumerate(BOARDS):
                await db.curriculum_boards.insert_one({**b, "order": i, "created_at": now})

            # For each board -> subjects -> chapters -> topics
            for board_slug, subjects in ALL_CURRICULUM.items():
                board = next((b for b in BOARDS if b["slug"] == board_slug), None)
                if not board:
                    continue
                for subj_order, (subj_slug, subj_data) in enumerate(subjects.items()):
                    meta = SUBJECT_META.get(subj_slug, {})
                    total_topics = sum(len(ch["topics"]) for ch in subj_data["chapters"])
                    await db.curriculum_subjects.insert_one({
                        "board_slug": board_slug, "board_name": board["name"],
                        "slug": subj_slug, "name": subj_data["name"],
                        "description": subj_data.get("description", ""),
                        "icon": meta.get("icon", "book"), "color": meta.get("color", "#2563eb"),
                        "chapter_count": len(subj_data["chapters"]),
                        "topic_count": total_topics,
                        "order": subj_order, "created_at": now,
                    })
                    for ch_order, ch in enumerate(subj_data["chapters"]):
                        ch_slug = slugify(ch["name"])
                        await db.curriculum_chapters.insert_one({
                            "board_slug": board_slug, "subject_slug": subj_slug,
                            "slug": ch_slug, "name": ch["name"],
                            "description": "", "topic_count": len(ch["topics"]),
                            "order": ch_order, "created_at": now,
                        })
                        for t_order, topic_name in enumerate(ch["topics"]):
                            t_slug = slugify(topic_name)
                            sample = SAMPLE_CONTENT.get((board_slug, subj_slug, ch_slug, t_slug))
                            content = sample if sample else {
                                "introduction": "",
                                "sections": [],
                                "definitions": [],
                                "formulas": [],
                                "worked_examples": [],
                                "common_mistakes": [],
                                "examiner_tips": [],
                                "summary": [],
                            }
                            times = ["15 min", "20 min", "25 min", "30 min"]
                            await db.curriculum_topics.insert_one({
                                "board_slug": board_slug, "subject_slug": subj_slug,
                                "chapter_slug": ch_slug, "slug": t_slug,
                                "title": topic_name,
                                "chapter_title": ch["name"],
                                "subject_title": subj_data["name"],
                                "board_title": board["name"],
                                "order": t_order,
                                "study_time": times[t_order % len(times)],
                                "difficulty": ["easy", "medium", "hard"][t_order % 3],
                                "status": "published" if sample else "draft",
                                "content": content,
                                "seo_title": f"{topic_name} - {ch['name']} - {subj_data['name']} {board['name']}",
                                "seo_description": f"Learn {topic_name} in {ch['name']} for {board['name']} {subj_data['name']}. Revision notes, worked examples and exam tips.",
                                "created_at": now, "updated_at": now,
                            })

            # Create indexes
            await db.curriculum_topics.create_index([("board_slug", 1), ("subject_slug", 1), ("chapter_slug", 1), ("slug", 1)], unique=True)
            await db.curriculum_topics.create_index([("title", "text"), ("seo_title", "text"), ("seo_description", "text")])
            await db.curriculum_chapters.create_index([("board_slug", 1), ("subject_slug", 1), ("slug", 1)])
            await db.curriculum_subjects.create_index([("board_slug", 1), ("slug", 1)])

        # Always update draft topics that now have sample content
        now = datetime.now(timezone.utc).isoformat()
        for key, content in SAMPLE_CONTENT.items():
            board_slug, subj_slug, ch_slug, t_slug = key
            result = await db.curriculum_topics.update_one(
                {"board_slug": board_slug, "subject_slug": subj_slug, "chapter_slug": ch_slug, "slug": t_slug, "status": "draft"},
                {"$set": {"content": content, "status": "published", "updated_at": now}}
            )
            if result.modified_count > 0:
                import logging
                logging.getLogger(__name__).info(f"Published topic: {t_slug}")

    # ===== PUBLIC BROWSE =====
    @router.get("/boards")
    async def list_boards():
        boards = await db.curriculum_boards.find({}, {"_id": 0}).sort("order", 1).to_list(10)
        for b in boards:
            b["subject_count"] = await db.curriculum_subjects.count_documents({"board_slug": b["slug"]})
            b["topic_count"] = await db.curriculum_topics.count_documents({"board_slug": b["slug"]})
        return boards

    @router.get("/boards/{board_slug}")
    async def get_board(board_slug: str):
        board = await db.curriculum_boards.find_one({"slug": board_slug}, {"_id": 0})
        if not board:
            raise HTTPException(404, "Board not found")
        subjects = await db.curriculum_subjects.find(
            {"board_slug": board_slug}, {"_id": 0}
        ).sort("order", 1).to_list(20)
        board["subjects"] = subjects
        return board

    @router.get("/boards/{board_slug}/{subject_slug}")
    async def get_subject(board_slug: str, subject_slug: str):
        subject = await db.curriculum_subjects.find_one(
            {"board_slug": board_slug, "slug": subject_slug}, {"_id": 0}
        )
        if not subject:
            raise HTTPException(404, "Subject not found")
        chapters, _ = await pathway_chapters(db, board_slug, subject_slug)
        for ch in chapters:
            ch["published_count"] = await db.curriculum_topics.count_documents({
                "board_slug": ch["board_slug"], "subject_slug": subject_slug,
                "chapter_slug": ch["slug"], "status": "published"
            })
        subject["chapters"] = chapters
        return subject

    @router.get("/boards/{board_slug}/{subject_slug}/{chapter_slug}")
    async def get_chapter(board_slug: str, subject_slug: str, chapter_slug: str):
        board_slug = await resolve_chapter_board(db, board_slug, subject_slug, chapter_slug) or board_slug
        chapter = await db.curriculum_chapters.find_one(
            {"board_slug": board_slug, "subject_slug": subject_slug, "slug": chapter_slug}, {"_id": 0}
        )
        if not chapter:
            raise HTTPException(404, "Chapter not found")
        topics = await db.curriculum_topics.find(
            visible_topic_query(board_slug, subject_slug, chapter_slug)
        ).sort("order", 1).to_list(100)
        ready = await lessons_with_content(db, topics)
        chapter["topics"] = [{**{k: v for k, v in t.items() if k not in ("_id", "content")}, "available": str(t["_id"]) in ready} for t in topics]
        # Subject info for breadcrumb
        subject = await db.curriculum_subjects.find_one(
            {"board_slug": board_slug, "slug": subject_slug}, {"_id": 0, "name": 1, "slug": 1}
        )
        chapter["subject_name"] = subject["name"] if subject else ""
        return chapter

    @router.get("/boards/{board_slug}/{subject_slug}/{chapter_slug}/{topic_slug}")
    async def get_topic(board_slug: str, subject_slug: str, chapter_slug: str, topic_slug: str, request: Request):
        board_slug = await resolve_chapter_board(db, board_slug, subject_slug, chapter_slug) or board_slug
        topic = await db.curriculum_topics.find_one(
            {"board_slug": board_slug, "subject_slug": subject_slug,
             "chapter_slug": chapter_slug, "slug": topic_slug}
        )
        if not topic:
            raise HTTPException(404, "Topic not found")
        if topic.get("status") != "published":
            try:
                await get_admin_user(request)
            except HTTPException:
                raise HTTPException(404, "Topic not found")
        result = {k: v for k, v in topic.items() if k != "_id"}
        result["id"] = str(topic["_id"])
        # Get prev/next topics in same chapter
        all_topics = await db.curriculum_topics.find(
            visible_topic_query(board_slug, subject_slug, chapter_slug),
            {"_id": 0, "slug": 1, "title": 1, "order": 1}
        ).sort("order", 1).to_list(100)
        current_idx = next((i for i, t in enumerate(all_topics) if t["slug"] == topic_slug), -1)
        result["prev_topic"] = all_topics[current_idx - 1] if current_idx > 0 else None
        result["next_topic"] = all_topics[current_idx + 1] if current_idx < len(all_topics) - 1 else None
        # Related topics from same chapter
        result["related_topics"] = [t for t in all_topics if t["slug"] != topic_slug][:5]
        return result

    # ===== SEARCH =====
    @router.get("/search")
    async def search_topics(q: str = "", board: str = "", subject: str = "", limit: int = 20):
        query = {}
        if board:
            query["board_slug"] = board
        if subject:
            query["subject_slug"] = subject
        if q:
            query["$or"] = [
                {"title": {"$regex": q, "$options": "i"}},
                {"chapter_title": {"$regex": q, "$options": "i"}},
                {"seo_description": {"$regex": q, "$options": "i"}},
            ]
        topics = await db.curriculum_topics.find(
            query, {"_id": 0, "content": 0}
        ).sort("order", 1).to_list(limit)
        return topics

    # ===== ADMIN =====
    class TopicUpdate(BaseModel):
        title: Optional[str] = None
        study_time: Optional[str] = None
        difficulty: Optional[str] = None
        status: Optional[str] = None
        content: Optional[dict] = None
        seo_title: Optional[str] = None
        seo_description: Optional[str] = None

    @router.get("/admin/topics")
    async def list_admin_topics(request: Request, board: str = "", subject: str = "", chapter: str = "", status: str = "", q: str = "", page: int = 1, limit: int = 50):
        await get_admin_user(request)
        query = {}
        if board:
            query["board_slug"] = board
        if subject:
            query["subject_slug"] = subject
        if chapter:
            query["chapter_slug"] = chapter
        if status:
            query["status"] = status
        if q:
            query["$or"] = [
                {"title": {"$regex": q, "$options": "i"}},
                {"chapter_title": {"$regex": q, "$options": "i"}},
            ]
        total = await db.curriculum_topics.count_documents(query)
        skip = (page - 1) * limit
        topics = await db.curriculum_topics.find(
            query, {"content": 0}
        ).sort([("board_slug", 1), ("subject_slug", 1), ("chapter_slug", 1), ("order", 1)]).skip(skip).limit(limit).to_list(limit)
        result = []
        for t in topics:
            item = {k: v for k, v in t.items() if k != "_id"}
            item["id"] = str(t["_id"])
            result.append(item)
        return {"topics": result, "total": total, "page": page, "limit": limit}

    @router.get("/admin/topics/{topic_id}")
    async def get_admin_topic(topic_id: str, request: Request):
        await get_admin_user(request)
        topic = await db.curriculum_topics.find_one({"_id": ObjectId(topic_id)})
        if not topic:
            raise HTTPException(404, "Topic not found")
        if topic.get("status") != "published":
            try:
                await get_admin_user(request)
            except HTTPException:
                raise HTTPException(404, "Topic not found")
        result = {k: v for k, v in topic.items() if k != "_id"}
        result["id"] = str(topic["_id"])
        return result

    @router.put("/admin/topics/bulk-publish")
    async def bulk_publish_topics_early(request: Request):
        """Publish multiple topics at once. Declared before /{topic_id} to avoid path shadowing."""
        await get_admin_user(request)
        body = await request.json()
        topic_ids = body.get("topic_ids", [])
        now = datetime.now(timezone.utc).isoformat()
        count = 0
        for tid in topic_ids:
            if not ObjectId.is_valid(tid):
                continue
            r = await db.curriculum_topics.update_one(
                {"_id": ObjectId(tid)},
                {"$set": {"status": "published", "updated_at": now}}
            )
            if r.modified_count > 0:
                count += 1
        return {"message": f"{count} topics published", "count": count}

    @router.put("/admin/topics/{topic_id}")
    async def update_topic(topic_id: str, data: TopicUpdate, request: Request):
        await get_admin_user(request)
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = await db.curriculum_topics.update_one(
            {"_id": ObjectId(topic_id)}, {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(404, "Topic not found")
        return {"message": "Topic updated"}

    @router.put("/admin/topics/{topic_id}/publish")
    async def toggle_publish_topic(topic_id: str, request: Request):
        await get_admin_user(request)
        topic = await db.curriculum_topics.find_one({"_id": ObjectId(topic_id)})
        if not topic:
            raise HTTPException(404, "Topic not found")
        new_status = "draft" if topic.get("status") == "published" else "published"
        await db.curriculum_topics.update_one(
            {"_id": ObjectId(topic_id)},
            {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"message": f"Topic {'published' if new_status == 'published' else 'unpublished'}", "status": new_status}

    @router.get("/admin/topics-stats")
    async def get_topics_stats(request: Request):
        await get_admin_user(request)
        total = await db.curriculum_topics.count_documents({})
        published = await db.curriculum_topics.count_documents({"status": "published"})
        draft = await db.curriculum_topics.count_documents({"status": "draft"})
        boards = await db.curriculum_boards.find({}, {"_id": 0, "slug": 1, "name": 1}).to_list(10)
        subjects = await db.curriculum_subjects.distinct("slug")
        return {"total": total, "published": published, "draft": draft, "boards": boards, "subjects": subjects}

    # ── Chapter-level bulk editing ──
    @router.get("/admin/chapters")
    async def list_chapters_for_editor(request: Request, board: str = "", subject: str = ""):
        await get_admin_user(request)
        query = {}
        if board: query["board_slug"] = board
        if subject: query["subject_slug"] = subject
        chapters = await db.curriculum_chapters.find(query, {"_id": 0}).sort([("board_slug", 1), ("subject_slug", 1), ("order", 1)]).to_list(200)
        return chapters

    @router.get("/admin/chapter-topics")
    async def get_chapter_topics_for_editor(request: Request, board: str = "", subject: str = "", chapter: str = ""):
        """Get all topics in a chapter with full content for bulk editing."""
        await get_admin_user(request)
        query = {}
        if board: query["board_slug"] = board
        if subject: query["subject_slug"] = subject
        if chapter: query["chapter_slug"] = chapter
        topics = await db.curriculum_topics.find(query).sort("order", 1).to_list(100)
        result = []
        for t in topics:
            item = {k: v for k, v in t.items() if k != "_id"}
            item["id"] = str(t["_id"])
            result.append(item)
        return result

    # ===== STUDENT FEATURES =====
    @router.post("/user/bookmark")
    async def toggle_bookmark(request: Request):
        user = await get_current_user(request)
        body = await request.json()
        topic_path = body.get("topic_path", "")
        existing = await db.bookmarks.find_one({"user_id": user["id"], "topic_path": topic_path})
        if existing:
            await db.bookmarks.delete_one({"_id": existing["_id"]})
            return {"bookmarked": False}
        await db.bookmarks.insert_one({
            "user_id": user["id"],
            "topic_path": topic_path,
            "topic_title": body.get("topic_title", ""),
            "board_slug": body.get("board_slug", ""),
            "subject_slug": body.get("subject_slug", ""),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return {"bookmarked": True}

    @router.get("/user/bookmarks")
    async def get_bookmarks(request: Request):
        user = await get_current_user(request)
        bookmarks = await db.bookmarks.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
        return bookmarks

    @router.post("/user/progress")
    async def toggle_progress(request: Request):
        user = await get_current_user(request)
        body = await request.json()
        topic_path = body.get("topic_path", "")
        existing = await db.topic_progress.find_one({"user_id": user["id"], "topic_path": topic_path})
        if existing:
            await db.topic_progress.delete_one({"_id": existing["_id"]})
            return {"completed": False}
        await db.topic_progress.insert_one({
            "user_id": user["id"],
            "topic_path": topic_path,
            "board_slug": body.get("board_slug", ""),
            "subject_slug": body.get("subject_slug", ""),
            "completed_at": datetime.now(timezone.utc).isoformat()
        })
        return {"completed": True}

    @router.get("/user/progress")
    async def get_progress(request: Request):
        user = await get_current_user(request)
        progress = await db.topic_progress.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
        return progress

    return router, seed_curriculum
