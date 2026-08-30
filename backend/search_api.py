"""
Global Search API.
Search across topics, questions, past papers, and courses.
"""
from fastapi import APIRouter
from bson import ObjectId
import re


def create_search_routes(db):
    router = APIRouter(prefix="/search")

    def doc_out(doc):
        return {k: v for k, v in doc.items() if k != "_id"} | {"id": str(doc["_id"])}

    @router.get("")
    async def global_search(q: str = "", limit: int = 20):
        if not q or len(q.strip()) < 2:
            return {"results": [], "total": 0}
        query_text = q.strip()
        regex = {"$regex": re.escape(query_text), "$options": "i"}
        results = []

        # Search topics
        topic_docs = await db.curriculum_topics.find(
            {"$or": [{"title": regex}, {"slug": regex}, {"chapter_title": regex}]},
            {"title": 1, "slug": 1, "board_slug": 1, "subject_slug": 1, "chapter_slug": 1,
             "chapter_title": 1, "difficulty": 1, "status": 1}
        ).limit(limit).to_list(limit)
        for t in topic_docs:
            results.append({
                "type": "topic", "id": str(t["_id"]),
                "title": t.get("title", ""), "subtitle": f"{t.get('chapter_title', '')} · {t.get('subject_slug', '').title()} · {t.get('board_slug', '').upper()}",
                "url": f"/learn/{t.get('board_slug')}/{t.get('subject_slug')}/{t.get('chapter_slug')}",
                "status": t.get("status", "draft"),
            })

        # Search questions
        q_docs = await db.questions.find(
            {"$or": [{"question_text": regex}, {"question_id": regex}, {"topic": regex}]},
            {"question_id": 1, "question_text": 1, "board": 1, "subject": 1, "topic": 1, "difficulty": 1}
        ).limit(limit).to_list(limit)
        for qd in q_docs:
            results.append({
                "type": "question", "id": str(qd["_id"]),
                "title": qd.get("question_id", "Question"),
                "subtitle": (qd.get("question_text", "")[:100] + "...") if len(qd.get("question_text", "")) > 100 else qd.get("question_text", ""),
                "url": "/practice",
                "difficulty": qd.get("difficulty", ""),
            })

        # Search past papers
        pp_docs = await db.past_papers.find(
            {"$or": [{"title": regex}, {"original_name": regex}, {"syllabus_code": regex}, {"subject": regex}],
             "is_deleted": {"$ne": True}, "is_visible": True},
            {"title": 1, "qualification": 1, "subject": 1, "syllabus_code": 1, "year": 1,
             "session": 1, "paper": 1, "resource_type": 1}
        ).limit(limit).to_list(limit)
        for pp in pp_docs:
            label = f"{pp.get('qualification', '').upper()} {pp.get('subject', '').title()} {pp.get('syllabus_code', '')} · {pp.get('year', '')} {pp.get('session', '')} P{pp.get('paper', '')}"
            results.append({
                "type": "past_paper", "id": str(pp["_id"]),
                "title": pp.get("title", ""),
                "subtitle": label.strip(),
                "url": "/exam/past-papers",
                "resource_type": pp.get("resource_type", ""),
            })

        # Search chapters
        ch_docs = await db.curriculum_chapters.find(
            {"$or": [{"name": regex}, {"slug": regex}]},
            {"name": 1, "slug": 1, "board_slug": 1, "subject_slug": 1}
        ).limit(8).to_list(8)
        for ch in ch_docs:
            results.append({
                "type": "chapter", "id": str(ch["_id"]),
                "title": ch.get("name", ""),
                "subtitle": f"{ch.get('subject_slug', '').title()} · {ch.get('board_slug', '').upper()}",
                "url": f"/learn/{ch.get('board_slug')}/{ch.get('subject_slug')}/{ch.get('slug')}",
            })

        # Search courses
        cr_docs = await db.courses.find(
            {"$or": [{"title": regex}, {"subject": regex}, {"description": regex}], "is_active": True},
            {"title": 1, "subject": 1, "price": 1}
        ).limit(5).to_list(5)
        for cr in cr_docs:
            results.append({
                "type": "course", "id": str(cr["_id"]),
                "title": cr.get("title", ""),
                "subtitle": cr.get("subject", ""),
                "url": f"/programs/{cr.get('subject', '').lower()}",
            })

        return {"results": results[:limit], "total": len(results), "query": query_text}

    return router
