from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from storage import upload_file as storage_upload


def create_worksheets_routes(db, get_current_user, get_admin_user):
    router = APIRouter(prefix="/worksheets")

    def doc_to_response(doc):
        return {k: v for k, v in doc.items() if k != "_id"} | {"id": str(doc["_id"])}

    # ── Admin CRUD ──

    @router.post("/admin/upload")
    async def upload_worksheet(
        request: Request,
        file: UploadFile = File(...),
        title: str = Form(...),
        subject: str = Form("physics"),
        board: str = Form("igcse"),
        chapter: str = Form(""),
        topic: str = Form(""),
        description: str = Form(""),
        is_free: bool = Form(False),
    ):
        await get_admin_user(request)
        content = await file.read()
        storage_path = storage_upload("worksheets", file.filename, content, file.content_type or "application/pdf")
        file_url = f"/api/files/{storage_path}"
        now = datetime.now(timezone.utc).isoformat()
        doc = {
            "title": title,
            "subject": subject,
            "board": board,
            "chapter": chapter,
            "topic": topic,
            "description": description,
            "file_url": file_url,
            "storage_path": storage_path,
            "file_name": file.filename,
            "file_size": len(content),
            "is_free": is_free,
            "is_active": True,
            "download_count": 0,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.worksheets.insert_one(doc)
        return {"id": str(result.inserted_id), "file_url": file_url, "message": "Worksheet uploaded"}

    @router.put("/admin/{worksheet_id}")
    async def update_worksheet(worksheet_id: str, request: Request):
        await get_admin_user(request)
        body = await request.json()
        allowed = {"title", "subject", "board", "chapter", "topic", "description", "is_free", "is_active"}
        update = {k: v for k, v in body.items() if k in allowed}
        update["updated_at"] = datetime.now(timezone.utc).isoformat()
        if not ObjectId.is_valid(worksheet_id):
            raise HTTPException(400, "Invalid ID")
        result = await db.worksheets.update_one({"_id": ObjectId(worksheet_id)}, {"$set": update})
        if result.matched_count == 0:
            raise HTTPException(404, "Worksheet not found")
        return {"message": "Worksheet updated"}

    @router.delete("/admin/{worksheet_id}")
    async def delete_worksheet(worksheet_id: str, request: Request):
        await get_admin_user(request)
        if not ObjectId.is_valid(worksheet_id):
            raise HTTPException(400, "Invalid ID")
        await db.worksheets.delete_one({"_id": ObjectId(worksheet_id)})
        return {"message": "Worksheet deleted"}

    @router.get("/admin/list")
    async def admin_list_worksheets(request: Request, subject: str = "", board: str = "", q: str = "", page: int = 1, limit: int = 30):
        await get_admin_user(request)
        query = {}
        if subject: query["subject"] = subject
        if board: query["board"] = board
        if q: query["$or"] = [{"title": {"$regex": q, "$options": "i"}}, {"topic": {"$regex": q, "$options": "i"}}, {"chapter": {"$regex": q, "$options": "i"}}]
        total = await db.worksheets.count_documents(query)
        skip = (page - 1) * limit
        docs = await db.worksheets.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        return {"worksheets": [doc_to_response(d) for d in docs], "total": total, "page": page}

    @router.get("/admin/stats")
    async def admin_worksheet_stats(request: Request):
        await get_admin_user(request)
        total = await db.worksheets.count_documents({})
        by_subject = {}
        for s in ["physics", "chemistry", "biology", "mathematics"]:
            by_subject[s] = await db.worksheets.count_documents({"subject": s})
        return {"total": total, "by_subject": by_subject}

    # ── Public / Student Endpoints ──

    @router.get("/browse")
    async def browse_worksheets(subject: str = "", board: str = "", chapter: str = "", topic: str = "", free_only: bool = False, page: int = 1, limit: int = 20):
        query = {"is_active": True}
        if subject: query["subject"] = subject
        if board: query["board"] = board
        if chapter: query["chapter"] = {"$regex": chapter, "$options": "i"}
        if topic: query["topic"] = {"$regex": topic, "$options": "i"}
        if free_only: query["is_free"] = True
        total = await db.worksheets.count_documents(query)
        skip = (page - 1) * limit
        docs = await db.worksheets.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        results = []
        for d in docs:
            item = doc_to_response(d)
            results.append(item)
        return {"worksheets": results, "total": total, "page": page}

    @router.post("/download/{worksheet_id}")
    async def track_download(worksheet_id: str, request: Request):
        """Track download and return file URL. Auth required for premium."""
        if not ObjectId.is_valid(worksheet_id):
            raise HTTPException(400, "Invalid ID")
        ws = await db.worksheets.find_one({"_id": ObjectId(worksheet_id)})
        if not ws:
            raise HTTPException(404, "Worksheet not found")
        if not ws.get("is_free", False):
            try:
                user = await get_current_user(request)
            except Exception:
                raise HTTPException(401, "Sign in to download premium worksheets")
        await db.worksheets.update_one({"_id": ObjectId(worksheet_id)}, {"$inc": {"download_count": 1}})
        return {"file_url": ws["file_url"], "file_name": ws.get("file_name", "")}

    return router
