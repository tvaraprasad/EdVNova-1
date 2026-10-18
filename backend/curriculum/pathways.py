"""Course pathways: a subject can include another board's chapters as its foundation (A Level includes AS)."""

BOARDS = ("igcse", "as-level", "a-level")


def visible_topic_query(board, subject, chapter=None):
    q = {"board_slug": board, "subject_slug": subject,
         "$or": [{"status": "published"}, {"syllabus_review": {"$exists": False}}]}
    if chapter:
        q["chapter_slug"] = chapter
    return q


def has_content(c):
    return isinstance(c, dict) and any((len(v) > 0 if isinstance(v, (list, str)) else bool(v)) for v in c.values())


async def lessons_with_content(db, topics):
    """String ids of published topics that have lesson content or attached files."""
    pub = [t for t in topics if t.get("status") == "published"]
    ready = {str(t["_id"]) for t in pub if has_content(t.get("content"))}
    rest = [str(t["_id"]) for t in pub if str(t["_id"]) not in ready]
    if rest:
        ready |= set(await db.learning_assets.distinct("parent_id", {"parent_id": {"$in": rest}}))
        ready |= set(await db.topic_attachments.distinct("topic_id", {"topic_id": {"$in": rest}}))
    return ready


async def pathway_chapters(db, board, subject, projection=None):
    """Ordered chapters for a course view; each chapter keeps its own source board_slug."""
    proj = {"_id": 0, **(projection or {})} if projection else {"_id": 0}
    subj = await db.curriculum_subjects.find_one({"board_slug": board, "slug": subject}, {"_id": 0, "foundation_board": 1})
    foundation = (subj or {}).get("foundation_board")
    own = await db.curriculum_chapters.find({"board_slug": board, "subject_slug": subject}, proj).sort("order", 1).to_list(200)
    base = await db.curriculum_chapters.find({"board_slug": foundation, "subject_slug": subject}, proj).sort("order", 1).to_list(200) if foundation else []
    theory = lambda chs: [c for c in chs if c.get("kind") != "practical"]
    practical = lambda chs: [c for c in chs if c.get("kind") == "practical"]
    async def in_nav(c):
        return c.get("nav_status") != "retired" or await db.curriculum_topics.count_documents(
            {"board_slug": c.get("board_slug") or (foundation if c in base else board), "subject_slug": subject, "chapter_slug": c["slug"], "status": "published"}) > 0
    own = [c for c in own if await in_nav(c)]
    base = [c for c in base if await in_nav(c)]
    ordered = []
    for group, chs in (("A Level Extension" if foundation else "", theory(own)), ("AS Foundation" if foundation else "", theory(base)),
                       ("Practical skills", practical(base)), ("Practical skills", practical(own))):
        for c in chs:
            c.setdefault("board_slug", foundation if c in base else board)
            c["group"] = group
            ordered.append(c)
    return ordered, foundation


async def resolve_chapter_board(db, board, subject, chapter):
    """Board that owns the chapter for this course view (itself or its foundation)."""
    if await db.curriculum_chapters.find_one({"board_slug": board, "subject_slug": subject, "slug": chapter}, {"_id": 1}):
        return board
    subj = await db.curriculum_subjects.find_one({"board_slug": board, "slug": subject}, {"_id": 0, "foundation_board": 1})
    foundation = (subj or {}).get("foundation_board")
    if foundation and await db.curriculum_chapters.find_one({"board_slug": foundation, "subject_slug": subject, "slug": chapter}, {"_id": 1}):
        return foundation
    return None
