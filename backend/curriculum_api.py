from fastapi import APIRouter, HTTPException, Request
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
        if count > 0:
            return
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
        chapters = await db.curriculum_chapters.find(
            {"board_slug": board_slug, "subject_slug": subject_slug}, {"_id": 0}
        ).sort("order", 1).to_list(100)
        for ch in chapters:
            ch["published_count"] = await db.curriculum_topics.count_documents({
                "board_slug": board_slug, "subject_slug": subject_slug,
                "chapter_slug": ch["slug"], "status": "published"
            })
        subject["chapters"] = chapters
        return subject

    @router.get("/boards/{board_slug}/{subject_slug}/{chapter_slug}")
    async def get_chapter(board_slug: str, subject_slug: str, chapter_slug: str):
        chapter = await db.curriculum_chapters.find_one(
            {"board_slug": board_slug, "subject_slug": subject_slug, "slug": chapter_slug}, {"_id": 0}
        )
        if not chapter:
            raise HTTPException(404, "Chapter not found")
        topics = await db.curriculum_topics.find(
            {"board_slug": board_slug, "subject_slug": subject_slug, "chapter_slug": chapter_slug},
            {"_id": 0, "content": 0}
        ).sort("order", 1).to_list(100)
        chapter["topics"] = topics
        # Subject info for breadcrumb
        subject = await db.curriculum_subjects.find_one(
            {"board_slug": board_slug, "slug": subject_slug}, {"_id": 0, "name": 1, "slug": 1}
        )
        chapter["subject_name"] = subject["name"] if subject else ""
        return chapter

    @router.get("/boards/{board_slug}/{subject_slug}/{chapter_slug}/{topic_slug}")
    async def get_topic(board_slug: str, subject_slug: str, chapter_slug: str, topic_slug: str):
        topic = await db.curriculum_topics.find_one(
            {"board_slug": board_slug, "subject_slug": subject_slug,
             "chapter_slug": chapter_slug, "slug": topic_slug}
        )
        if not topic:
            raise HTTPException(404, "Topic not found")
        result = {k: v for k, v in topic.items() if k != "_id"}
        result["id"] = str(topic["_id"])
        # Get prev/next topics in same chapter
        all_topics = await db.curriculum_topics.find(
            {"board_slug": board_slug, "subject_slug": subject_slug, "chapter_slug": chapter_slug},
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

    @router.put("/admin/topics/{topic_id}")
    async def update_topic(topic_id: str, data: TopicUpdate, request: Request):
        await get_admin_user(request)
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = await db.curriculum_topics.update_one(
            {"_id": ObjectId(topic_id)}, {"$set": update_data}
        )
        if result.modified_count == 0:
            raise HTTPException(404, "Topic not found")
        return {"message": "Topic updated"}

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
