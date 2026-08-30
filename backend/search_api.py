"""
Global Search API.
Search across topics, questions, past papers, chapters, and courses.
Handles natural queries: "quadratic equations", "0580 paper 22 2024", "9701/31 mark scheme 2022"
"""
from fastapi import APIRouter
import re


def create_search_routes(db):
    router = APIRouter(prefix="/search")

    def doc_out(doc):
        return {k: v for k, v in doc.items() if k != "_id"} | {"id": str(doc["_id"])}

    def make_paper_url(p):
        qual = p.get("qualification", "igcse")
        code = p.get("syllabus_code", "")
        year = p.get("year", 0)
        sess = (p.get("session", "") or "").lower().replace("/", "-").replace(" ", "-")
        paper = p.get("paper", 0)
        rt = (p.get("resource_type", "") or "").replace("_", "-")
        if code and year and paper and rt:
            return f"/past-papers/{qual}/{code}/{year}/{sess}/paper-{paper}/{rt}"
        return "/exam/past-papers"

    def make_paper_subtitle(p):
        parts = [p.get("qualification", "").upper(), p.get("subject", "").title(),
                 p.get("syllabus_code", ""), str(p.get("year", "")),
                 p.get("session", ""), f"Paper {p['paper']}" if p.get("paper") else ""]
        return " · ".join(x for x in parts if x and x != "0")

    @router.get("")
    async def global_search(q: str = "", limit: int = 25):
        if not q or len(q.strip()) < 2:
            return {"results": [], "total": 0, "query": q}

        query_text = q.strip()
        regex = {"$regex": re.escape(query_text), "$options": "i"}
        results = []

        # Detect if query looks like a syllabus code pattern (e.g. "0580", "9701/31", "0580 paper 22 2024")
        code_match = re.match(r"(\d{4})(?:/(\d{1,2}))?\s*(.*)", query_text)
        is_code_query = bool(code_match and code_match.group(1))

        # ── Search Past Papers (prioritize if code query) ──
        if is_code_query:
            code = code_match.group(1)
            paper_variant = code_match.group(2)
            rest = (code_match.group(3) or "").strip().lower()

            pp_query = {"syllabus_code": code, "is_deleted": {"$ne": True}, "is_visible": True}

            # Parse additional context from rest: "paper 22 2024", "mark scheme 2022", etc.
            year_m = re.search(r"(20\d{2})", rest)
            if year_m: pp_query["year"] = int(year_m.group(1))
            if paper_variant: pp_query["paper"] = int(paper_variant[0])
            elif "paper" in rest:
                pm = re.search(r"paper\s*(\d+)", rest)
                if pm: pp_query["paper"] = int(pm.group(1))
            if "mark" in rest or "ms" in rest: pp_query["resource_type"] = "mark_scheme"
            elif "examiner" in rest or "er" in rest: pp_query["resource_type"] = "examiner_report"
            elif "qp" in rest or "question" in rest: pp_query["resource_type"] = "question_paper"

            pp_docs = await db.past_papers.find(pp_query).sort([("year", -1), ("paper", 1)]).limit(limit).to_list(limit)
            for pp in pp_docs:
                rt_label = (pp.get("resource_type", "") or "").replace("_", " ").title()
                results.append({
                    "type": "past_paper", "id": str(pp["_id"]),
                    "title": f"{pp.get('subject', '').title()} {pp.get('syllabus_code', '')} — {rt_label}",
                    "subtitle": make_paper_subtitle(pp),
                    "url": make_paper_url(pp),
                    "category": "Exam",
                })
        else:
            # General text search across past papers
            pp_docs = await db.past_papers.find(
                {"$or": [{"title": regex}, {"original_name": regex}, {"subject": regex}, {"syllabus_code": regex}],
                 "is_deleted": {"$ne": True}, "is_visible": True}
            ).sort([("year", -1)]).limit(8).to_list(8)
            for pp in pp_docs:
                rt_label = (pp.get("resource_type", "") or "").replace("_", " ").title()
                results.append({
                    "type": "past_paper", "id": str(pp["_id"]),
                    "title": f"{pp.get('subject', '').title()} {pp.get('syllabus_code', '')} — {rt_label}",
                    "subtitle": make_paper_subtitle(pp),
                    "url": make_paper_url(pp),
                    "category": "Exam",
                })

        # ── Search Topics ──
        topic_docs = await db.curriculum_topics.find(
            {"$or": [{"title": regex}, {"slug": regex}, {"chapter_title": regex}]},
            {"title": 1, "slug": 1, "board_slug": 1, "subject_slug": 1, "chapter_slug": 1,
             "chapter_title": 1, "difficulty": 1, "status": 1}
        ).limit(10).to_list(10)
        for t in topic_docs:
            results.append({
                "type": "topic", "id": str(t["_id"]),
                "title": t.get("title", ""),
                "subtitle": f"{t.get('chapter_title', '')} · {t.get('subject_slug', '').title()} · {t.get('board_slug', '').upper()}",
                "url": f"/learn/{t.get('board_slug')}/{t.get('subject_slug')}/{t.get('chapter_slug')}",
                "category": "Learn",
            })

        # ── Search Chapters ──
        ch_docs = await db.curriculum_chapters.find(
            {"$or": [{"name": regex}, {"slug": regex}]},
            {"name": 1, "slug": 1, "board_slug": 1, "subject_slug": 1}
        ).limit(6).to_list(6)
        for ch in ch_docs:
            results.append({
                "type": "chapter", "id": str(ch["_id"]),
                "title": ch.get("name", ""),
                "subtitle": f"{ch.get('subject_slug', '').title()} · {ch.get('board_slug', '').upper()}",
                "url": f"/learn/{ch.get('board_slug')}/{ch.get('subject_slug')}/{ch.get('slug')}",
                "category": "Learn",
            })

        # ── Search Questions ──
        q_docs = await db.questions.find(
            {"$or": [{"question_text": regex}, {"question_id": regex}, {"topic": regex}]},
            {"question_id": 1, "question_text": 1, "board": 1, "subject": 1, "topic": 1, "difficulty": 1}
        ).limit(8).to_list(8)
        for qd in q_docs:
            text = qd.get("question_text", "")
            results.append({
                "type": "question", "id": str(qd["_id"]),
                "title": qd.get("question_id", "Question"),
                "subtitle": (text[:100] + "...") if len(text) > 100 else text,
                "url": "/practice",
                "category": "Practise",
            })

        # ── Search Courses ──
        cr_docs = await db.courses.find(
            {"$or": [{"title": regex}, {"subject": regex}, {"description": regex}], "is_active": True},
            {"title": 1, "subject": 1}
        ).limit(4).to_list(4)
        for cr in cr_docs:
            results.append({
                "type": "course", "id": str(cr["_id"]),
                "title": cr.get("title", ""),
                "subtitle": cr.get("subject", ""),
                "url": f"/programs/{cr.get('subject', '').lower()}",
                "category": "Learn",
            })

        # Sort: exact title matches first, then by category priority
        cat_priority = {"Exam": 0, "Learn": 1, "Practise": 2}
        if is_code_query:
            cat_priority = {"Exam": 0, "Learn": 2, "Practise": 3}

        results.sort(key=lambda r: cat_priority.get(r.get("category", ""), 5))

        return {"results": results[:limit], "total": len(results), "query": query_text}

    return router
