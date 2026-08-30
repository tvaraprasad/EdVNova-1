"""
Past Paper System API.
Structured, searchable, syllabus-aware Cambridge Past Paper Library.
Supports bulk import with filename-based metadata inference.
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from datetime import datetime, timezone
from bson import ObjectId
from storage import upload_file
import re


# ── Filename parser: infer metadata from Cambridge-style filenames ──
SUBJECT_CODES = {
    "0580": ("mathematics", "igcse"), "0606": ("additional-mathematics", "igcse"),
    "0620": ("chemistry", "igcse"), "0625": ("physics", "igcse"), "0610": ("biology", "igcse"),
    "9709": ("mathematics", "as-level"), "9231": ("further-mathematics", "a-level"),
    "9702": ("physics", "as-level"), "9701": ("chemistry", "as-level"), "9700": ("biology", "as-level"),
}
SESSION_MAP = {"m": "Feb/Mar", "s": "May/Jun", "w": "Oct/Nov"}
RESOURCE_TYPES = {"qp": "question_paper", "ms": "mark_scheme", "er": "examiner_report",
                  "gt": "grade_thresholds", "ci": "confidential_instructions", "sf": "source_files",
                  "in": "insert", "sp": "specimen_paper", "sm": "specimen_mark_scheme"}


def parse_cambridge_filename(filename: str) -> dict:
    """Try to extract metadata from Cambridge-style filenames like 0580_s24_qp_22.pdf"""
    result = {"confidence": "low", "inferred": {}}
    clean = filename.rsplit(".", 1)[0] if "." in filename else filename
    # Pattern: {code}_{session}{year}_{type}_{paper}{variant}
    m = re.search(r"(\d{4})_([smw])(\d{2})_([a-z]{2})_?(\d)(\d)?", clean, re.IGNORECASE)
    if m:
        code, sess, yr, rtype, paper, variant = m.groups()
        year = int(yr) + (1900 if int(yr) > 50 else 2000)
        subj_info = SUBJECT_CODES.get(code, (None, None))
        result["confidence"] = "high"
        result["inferred"] = {
            "syllabus_code": code,
            "subject": subj_info[0],
            "qualification": subj_info[1],
            "curriculum": "cambridge",
            "year": year,
            "session": SESSION_MAP.get(sess.lower(), sess),
            "resource_type": RESOURCE_TYPES.get(rtype.lower(), rtype),
            "paper": int(paper),
            "variant": int(variant) if variant else None,
        }
        return result
    # Simpler pattern: just code and year
    m2 = re.match(r"(\d{4}).*?(\d{4}|\d{2})", clean)
    if m2:
        code = m2.group(1)
        yr_str = m2.group(2)
        year = int(yr_str) if len(yr_str) == 4 else int(yr_str) + (1900 if int(yr_str) > 50 else 2000)
        subj_info = SUBJECT_CODES.get(code, (None, None))
        result["confidence"] = "medium"
        result["inferred"] = {
            "syllabus_code": code,
            "subject": subj_info[0],
            "qualification": subj_info[1],
            "curriculum": "cambridge",
            "year": year,
        }
    return result


def create_past_papers_routes(db, get_admin_user):
    router = APIRouter(prefix="/past-papers")

    def doc_out(doc):
        return {k: v for k, v in doc.items() if k != "_id"} | {"id": str(doc["_id"])}

    # ── Upload single past paper ──
    @router.post("/upload")
    async def upload_past_paper(
        request: Request,
        file: UploadFile = File(...),
        curriculum: str = Form("cambridge"),
        qualification: str = Form(""),
        subject: str = Form(""),
        syllabus_code: str = Form(""),
        year: int = Form(0),
        session: str = Form(""),
        paper: int = Form(0),
        variant: int = Form(0),
        resource_type: str = Form("question_paper"),
        title: str = Form(""),
        access_level: str = Form("public"),
    ):
        await get_admin_user(request)
        content = await file.read()
        storage_path = upload_file("past-papers", file.filename, content, file.content_type or "application/pdf")
        file_url = f"/api/files/{storage_path}"
        now = datetime.now(timezone.utc).isoformat()

        # Auto-infer missing fields from filename
        parsed = parse_cambridge_filename(file.filename)
        inf = parsed.get("inferred", {})

        doc = {
            "curriculum": curriculum or inf.get("curriculum", "cambridge"),
            "qualification": qualification or inf.get("qualification", ""),
            "subject": subject or inf.get("subject", ""),
            "syllabus_code": syllabus_code or inf.get("syllabus_code", ""),
            "year": year or inf.get("year", 0),
            "session": session or inf.get("session", ""),
            "paper": paper or inf.get("paper", 0),
            "variant": variant or inf.get("variant", 0),
            "resource_type": resource_type if resource_type != "question_paper" else inf.get("resource_type", "question_paper"),
            "title": title or file.filename,
            "file_url": file_url,
            "storage_path": storage_path,
            "original_name": file.filename,
            "file_size": len(content),
            "content_type": file.content_type or "",
            "access_level": access_level,
            "rights_status": "educational_use",
            "is_visible": True,
            "is_deleted": False,
            "inference_confidence": parsed.get("confidence", "low"),
            "review_status": "pending" if parsed.get("confidence") != "high" else "auto_approved",
            "created_at": now,
            "updated_at": now,
        }
        result = await db.past_papers.insert_one(doc)
        return {"id": str(result.inserted_id), "file_url": file_url, "inferred": parsed}

    # ── Bulk upload: multiple files at once ──
    @router.post("/bulk-upload")
    async def bulk_upload_past_papers(request: Request):
        await get_admin_user(request)
        form = await request.form()
        files = form.getlist("files")
        if not files:
            raise HTTPException(400, "No files provided")

        results = []
        now = datetime.now(timezone.utc).isoformat()
        for f in files:
            content = await f.read()
            storage_path = upload_file("past-papers", f.filename, content, f.content_type or "application/pdf")
            file_url = f"/api/files/{storage_path}"
            parsed = parse_cambridge_filename(f.filename)
            inf = parsed.get("inferred", {})

            doc = {
                "curriculum": inf.get("curriculum", "cambridge"),
                "qualification": inf.get("qualification", ""),
                "subject": inf.get("subject", ""),
                "syllabus_code": inf.get("syllabus_code", ""),
                "year": inf.get("year", 0),
                "session": inf.get("session", ""),
                "paper": inf.get("paper", 0),
                "variant": inf.get("variant", 0),
                "resource_type": inf.get("resource_type", "question_paper"),
                "title": f.filename,
                "file_url": file_url,
                "storage_path": storage_path,
                "original_name": f.filename,
                "file_size": len(content),
                "content_type": f.content_type or "",
                "access_level": "public",
                "rights_status": "educational_use",
                "is_visible": True,
                "is_deleted": False,
                "inference_confidence": parsed.get("confidence", "low"),
                "review_status": "pending" if parsed.get("confidence") != "high" else "auto_approved",
                "created_at": now,
                "updated_at": now,
            }
            r = await db.past_papers.insert_one(doc)
            results.append({"id": str(r.inserted_id), "filename": f.filename, "confidence": parsed.get("confidence", "low"), "inferred": inf})
        return {"uploaded": len(results), "papers": results}

    # ── Preview filename parsing (dry run) ──
    @router.post("/parse-filename")
    async def parse_filename(request: Request):
        await get_admin_user(request)
        body = await request.json()
        filename = body.get("filename", "")
        return parse_cambridge_filename(filename)

    # ── List / Browse (public, student-facing) ──
    @router.get("/browse")
    async def browse_past_papers(
        curriculum: str = "", qualification: str = "", subject: str = "",
        syllabus_code: str = "", year: int = 0, session: str = "",
        resource_type: str = "", paper: int = 0,
        page: int = 1, limit: int = 50,
    ):
        query = {"is_visible": True, "is_deleted": {"$ne": True}}
        if curriculum: query["curriculum"] = curriculum
        if qualification: query["qualification"] = qualification
        if subject: query["subject"] = subject
        if syllabus_code: query["syllabus_code"] = syllabus_code
        if year: query["year"] = year
        if session: query["session"] = session
        if resource_type: query["resource_type"] = resource_type
        if paper: query["paper"] = paper

        total = await db.past_papers.count_documents(query)
        skip = (page - 1) * limit
        docs = await db.past_papers.find(query).sort([("year", -1), ("session", 1), ("paper", 1)]).skip(skip).limit(limit).to_list(limit)
        return {"total": total, "page": page, "papers": [doc_out(d) for d in docs]}

    # ── Get filter options (for dropdowns) ──
    @router.get("/filters")
    async def get_filter_options():
        query = {"is_visible": True, "is_deleted": {"$ne": True}}
        qualifications = await db.past_papers.distinct("qualification", query)
        subjects = await db.past_papers.distinct("subject", query)
        syllabus_codes = await db.past_papers.distinct("syllabus_code", query)
        years = sorted(await db.past_papers.distinct("year", query), reverse=True)
        sessions = await db.past_papers.distinct("session", query)
        return {
            "qualifications": [q for q in qualifications if q],
            "subjects": [s for s in subjects if s],
            "syllabus_codes": [c for c in syllabus_codes if c],
            "years": [y for y in years if y],
            "sessions": [s for s in sessions if s],
        }

    # ── SEO: Individual past paper page by slug parts ──
    @router.get("/page/{qualification}/{subject_code}/{year}/{session_slug}/{paper_slug}/{resource_type_slug}")
    async def get_paper_page(qualification: str, subject_code: str, year: int, session_slug: str, paper_slug: str, resource_type_slug: str):
        """Public SEO-friendly individual paper page."""
        session_map = {"feb-mar": "Feb/Mar", "may-jun": "May/Jun", "oct-nov": "Oct/Nov"}
        session = session_map.get(session_slug, session_slug.replace("-", "/").title())
        type_map = {"question-paper": "question_paper", "mark-scheme": "mark_scheme", "examiner-report": "examiner_report",
                     "grade-thresholds": "grade_thresholds", "insert": "insert", "specimen": "specimen_paper"}
        resource_type = type_map.get(resource_type_slug, resource_type_slug.replace("-", "_"))
        paper_num = int(paper_slug.replace("paper-", "")) if paper_slug.startswith("paper-") else 0

        query = {
            "qualification": qualification, "syllabus_code": subject_code,
            "year": year, "resource_type": resource_type,
            "is_deleted": {"$ne": True}, "is_visible": True,
        }
        if session: query["session"] = session
        if paper_num: query["paper"] = paper_num

        doc = await db.past_papers.find_one(query)
        if not doc:
            raise HTTPException(404, "Paper not found")

        paper = doc_out(doc)

        # Find related papers (same syllabus+year+session+paper, different resource_type)
        related_query = {
            "syllabus_code": doc.get("syllabus_code"), "year": doc.get("year"),
            "session": doc.get("session"), "paper": doc.get("paper"),
            "is_deleted": {"$ne": True}, "is_visible": True,
            "_id": {"$ne": doc["_id"]},
        }
        related_docs = await db.past_papers.find(related_query).to_list(10)
        related = [doc_out(r) for r in related_docs]

        # Other papers from same subject
        other_query = {
            "syllabus_code": doc.get("syllabus_code"),
            "is_deleted": {"$ne": True}, "is_visible": True,
            "_id": {"$ne": doc["_id"]},
            "year": doc.get("year"),
        }
        other_docs = await db.past_papers.find(other_query).sort([("session", 1), ("paper", 1)]).limit(20).to_list(20)
        other_papers = [doc_out(o) for o in other_docs if o["_id"] != doc["_id"] and str(o["_id"]) not in [r["id"] for r in related]]

        return {"paper": paper, "related": related, "other_same_year": other_papers[:10]}

    # ── SEO: Collection page for a subject/syllabus ──
    @router.get("/collection/{qualification}/{subject_code}")
    async def get_paper_collection(qualification: str, subject_code: str, year: int = 0, session: str = ""):
        """Public collection page: all papers for a subject."""
        query = {
            "qualification": qualification, "syllabus_code": subject_code,
            "is_deleted": {"$ne": True}, "is_visible": True,
        }
        if year: query["year"] = year
        session_map = {"feb-mar": "Feb/Mar", "may-jun": "May/Jun", "oct-nov": "Oct/Nov"}
        if session: query["session"] = session_map.get(session, session)

        docs = await db.past_papers.find(query).sort([("year", -1), ("session", 1), ("paper", 1), ("resource_type", 1)]).to_list(500)
        papers = [doc_out(d) for d in docs]

        # Group by year → session → paper
        years_available = sorted(set(p.get("year", 0) for p in papers if p.get("year")), reverse=True)
        sessions_available = sorted(set(p.get("session", "") for p in papers if p.get("session")))

        # Subject info
        subj_info = SUBJECT_CODES.get(subject_code, (subject_code, qualification))

        return {
            "qualification": qualification,
            "syllabus_code": subject_code,
            "subject": subj_info[0] if isinstance(subj_info, tuple) else subject_code,
            "total": len(papers),
            "years": years_available,
            "sessions": sessions_available,
            "papers": papers,
        }

    # ── Get single paper by ID (public) ──
    @router.get("/paper/{paper_id}")
    async def get_single_paper(paper_id: str):
        if not ObjectId.is_valid(paper_id):
            raise HTTPException(400, "Invalid ID")
        doc = await db.past_papers.find_one({"_id": ObjectId(paper_id), "is_visible": True, "is_deleted": {"$ne": True}})
        if not doc:
            raise HTTPException(404, "Paper not found")
        paper = doc_out(doc)

        # Related papers
        related_query = {
            "syllabus_code": doc.get("syllabus_code"), "year": doc.get("year"),
            "session": doc.get("session"), "paper": doc.get("paper"),
            "is_deleted": {"$ne": True}, "is_visible": True,
            "_id": {"$ne": doc["_id"]},
        }
        related_docs = await db.past_papers.find(related_query).to_list(10)
        return {"paper": paper, "related": [doc_out(r) for r in related_docs]}

    # ── Admin: list all (including hidden) ──
    @router.get("/admin/list")
    async def admin_list_papers(request: Request, page: int = 1, limit: int = 50, review_status: str = ""):
        await get_admin_user(request)
        query = {"is_deleted": {"$ne": True}}
        if review_status: query["review_status"] = review_status
        total = await db.past_papers.count_documents(query)
        skip = (page - 1) * limit
        docs = await db.past_papers.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        return {"total": total, "page": page, "papers": [doc_out(d) for d in docs]}

    # ── Admin: bulk approve ──
    @router.put("/admin/bulk-approve")
    async def bulk_approve(request: Request):
        await get_admin_user(request)
        body = await request.json()
        ids = body.get("paper_ids", [])
        count = 0
        for pid in ids:
            if ObjectId.is_valid(pid):
                r = await db.past_papers.update_one(
                    {"_id": ObjectId(pid)},
                    {"$set": {"review_status": "approved", "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
                if r.modified_count: count += 1
        return {"approved": count}

    # ── Admin: update paper metadata ──
    @router.put("/admin/{paper_id}")
    async def update_past_paper(paper_id: str, request: Request):
        await get_admin_user(request)
        if not ObjectId.is_valid(paper_id):
            raise HTTPException(400, "Invalid ID")
        body = await request.json()
        allowed = {"curriculum", "qualification", "subject", "syllabus_code", "year", "session",
                    "paper", "variant", "resource_type", "title", "access_level", "rights_status",
                    "is_visible", "review_status", "tier"}
        update = {k: v for k, v in body.items() if k in allowed}
        update["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = await db.past_papers.update_one({"_id": ObjectId(paper_id)}, {"$set": update})
        if result.matched_count == 0:
            raise HTTPException(404, "Paper not found")
        return {"message": "Updated"}

    # ── Admin: delete ──
    @router.delete("/admin/{paper_id}")
    async def delete_past_paper(paper_id: str, request: Request):
        await get_admin_user(request)
        if not ObjectId.is_valid(paper_id):
            raise HTTPException(400, "Invalid ID")
        await db.past_papers.update_one({"_id": ObjectId(paper_id)}, {"$set": {"is_deleted": True, "is_visible": False}})
        return {"message": "Deleted"}

    # ── Stats ──
    @router.get("/stats")
    async def paper_stats(request: Request):
        await get_admin_user(request)
        total = await db.past_papers.count_documents({"is_deleted": {"$ne": True}})
        pending = await db.past_papers.count_documents({"review_status": "pending", "is_deleted": {"$ne": True}})
        approved = await db.past_papers.count_documents({"review_status": {"$in": ["approved", "auto_approved"]}, "is_deleted": {"$ne": True}})
        by_qual = {}
        for q in ["igcse", "as-level", "a-level"]:
            by_qual[q] = await db.past_papers.count_documents({"qualification": q, "is_deleted": {"$ne": True}})
        return {"total": total, "pending_review": pending, "approved": approved, "by_qualification": by_qual}

    return router
