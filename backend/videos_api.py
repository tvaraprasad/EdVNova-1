from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
import pathlib, uuid, os


def create_videos_routes(db, get_current_user, get_admin_user):
    router = APIRouter(prefix="/videos")

    class VideoCreate(BaseModel):
        title: str
        description: Optional[str] = ""
        board: str = "igcse"
        subject: str = "physics"
        chapter: Optional[str] = ""
        topic: Optional[str] = ""
        question_id: Optional[str] = ""
        youtube_url: Optional[str] = ""
        thumbnail_url: Optional[str] = ""
        duration: Optional[str] = ""
        difficulty: Optional[str] = "medium"
        status: str = "coming_soon"
        order: Optional[int] = 0

    class VideoUpdate(BaseModel):
        title: Optional[str] = None
        description: Optional[str] = None
        board: Optional[str] = None
        subject: Optional[str] = None
        chapter: Optional[str] = None
        topic: Optional[str] = None
        question_id: Optional[str] = None
        youtube_url: Optional[str] = None
        thumbnail_url: Optional[str] = None
        duration: Optional[str] = None
        difficulty: Optional[str] = None
        status: Optional[str] = None
        order: Optional[int] = None

    def doc_to_response(doc):
        return {k: v for k, v in doc.items() if k != "_id"} | {"id": str(doc["_id"])}

    # ══ Admin Endpoints ══

    @router.post("/admin/create")
    async def create_video(data: VideoCreate, request: Request):
        await get_admin_user(request)
        now = datetime.now(timezone.utc).isoformat()
        doc = data.model_dump()
        doc["created_at"] = now
        doc["updated_at"] = now
        doc["view_count"] = 0
        result = await db.videos.insert_one(doc)
        return {"id": str(result.inserted_id), "message": "Video created"}

    @router.put("/admin/{video_id}")
    async def update_video(video_id: str, data: VideoUpdate, request: Request):
        await get_admin_user(request)
        if not ObjectId.is_valid(video_id):
            raise HTTPException(400, "Invalid ID")
        update = {k: v for k, v in data.model_dump().items() if v is not None}
        update["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = await db.videos.update_one({"_id": ObjectId(video_id)}, {"$set": update})
        if result.matched_count == 0:
            raise HTTPException(404, "Video not found")
        return {"message": "Video updated"}

    @router.delete("/admin/{video_id}")
    async def delete_video(video_id: str, request: Request):
        await get_admin_user(request)
        if not ObjectId.is_valid(video_id):
            raise HTTPException(400, "Invalid ID")
        await db.videos.delete_one({"_id": ObjectId(video_id)})
        return {"message": "Video deleted"}

    @router.get("/admin/list")
    async def admin_list_videos(
        request: Request, subject: str = "", board: str = "",
        chapter: str = "", status: str = "", q: str = "",
        page: int = 1, limit: int = 30
    ):
        await get_admin_user(request)
        query = {}
        if subject:
            query["subject"] = subject
        if board:
            query["board"] = board
        if chapter:
            query["chapter"] = {"$regex": chapter, "$options": "i"}
        if status:
            query["status"] = status
        if q:
            query["$or"] = [
                {"title": {"$regex": q, "$options": "i"}},
                {"question_id": {"$regex": q, "$options": "i"}},
            ]
        total = await db.videos.count_documents(query)
        skip = (page - 1) * limit
        docs = await db.videos.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        return {"videos": [doc_to_response(d) for d in docs], "total": total, "page": page}

    @router.get("/admin/stats")
    async def admin_video_stats(request: Request):
        await get_admin_user(request)
        total = await db.videos.count_documents({})
        available = await db.videos.count_documents({"status": "available"})
        coming_soon = await db.videos.count_documents({"status": "coming_soon"})
        by_subject = {}
        for s in ["physics", "chemistry", "biology", "mathematics"]:
            by_subject[s] = await db.videos.count_documents({"subject": s})
        return {
            "total": total, "available": available,
            "coming_soon": coming_soon, "by_subject": by_subject,
        }

    # ══ Public Endpoints ══

    @router.get("/chapter/{board}/{subject}/{chapter}")
    async def get_chapter_videos(board: str, subject: str, chapter: str):
        query = {"board": board, "subject": subject, "chapter": chapter}
        docs = await db.videos.find(query).sort("order", 1).to_list(100)
        return [doc_to_response(d) for d in docs]

    @router.get("/by-question/{question_id}")
    async def get_video_by_question(question_id: str):
        doc = await db.videos.find_one({"question_id": question_id})
        if not doc:
            raise HTTPException(404, "No video found for this question")
        return doc_to_response(doc)

    @router.get("/browse")
    async def browse_videos(
        subject: str = "", board: str = "", chapter: str = "",
        status: str = "", page: int = 1, limit: int = 20
    ):
        query = {}
        if subject:
            query["subject"] = subject
        if board:
            query["board"] = board
        if chapter:
            query["chapter"] = {"$regex": chapter, "$options": "i"}
        if status:
            query["status"] = status
        else:
            query["status"] = {"$in": ["available", "coming_soon"]}
        total = await db.videos.count_documents(query)
        skip = (page - 1) * limit
        docs = await db.videos.find(query).sort([("order", 1), ("created_at", -1)]).skip(skip).limit(limit).to_list(limit)
        return {"videos": [doc_to_response(d) for d in docs], "total": total}

    return router


def create_media_routes(db, get_admin_user):
    router = APIRouter(prefix="/media")

    def doc_to_response(doc):
        return {k: v for k, v in doc.items() if k != "_id"} | {"id": str(doc["_id"])}

    @router.post("/upload")
    async def upload_media(
        request: Request,
        file: UploadFile = File(...),
        folder: str = Form("general"),
    ):
        await get_admin_user(request)
        upload_dir = pathlib.Path(f"/app/uploads/media/{folder}")
        upload_dir.mkdir(parents=True, exist_ok=True)
        ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
        filename = f"{uuid.uuid4().hex[:12]}.{ext}"
        filepath = upload_dir / filename
        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)
        file_url = f"/api/uploads/media/{folder}/{filename}"
        now = datetime.now(timezone.utc).isoformat()
        doc = {
            "filename": filename,
            "original_name": file.filename,
            "folder": folder,
            "file_url": file_url,
            "file_size": len(content),
            "content_type": file.content_type or "",
            "extension": ext.lower(),
            "created_at": now,
        }
        result = await db.media_files.insert_one(doc)
        return {"id": str(result.inserted_id), "file_url": file_url, "filename": filename}

    @router.get("/list")
    async def list_media(
        request: Request, folder: str = "", q: str = "",
        page: int = 1, limit: int = 30
    ):
        await get_admin_user(request)
        query = {}
        if folder:
            query["folder"] = folder
        if q:
            query["original_name"] = {"$regex": q, "$options": "i"}
        total = await db.media_files.count_documents(query)
        skip = (page - 1) * limit
        docs = await db.media_files.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        return {"files": [doc_to_response(d) for d in docs], "total": total}

    @router.get("/folders")
    async def list_folders(request: Request):
        await get_admin_user(request)
        folders = await db.media_files.distinct("folder")
        counts = {}
        for f in folders:
            counts[f] = await db.media_files.count_documents({"folder": f})
        return [{"name": f, "count": counts[f]} for f in sorted(folders)]

    @router.delete("/{file_id}")
    async def delete_media(file_id: str, request: Request):
        await get_admin_user(request)
        if not ObjectId.is_valid(file_id):
            raise HTTPException(400, "Invalid ID")
        doc = await db.media_files.find_one({"_id": ObjectId(file_id)})
        if not doc:
            raise HTTPException(404, "File not found")
        filepath = pathlib.Path(f"/app/uploads/media/{doc['folder']}/{doc['filename']}")
        if filepath.exists():
            filepath.unlink()
        await db.media_files.delete_one({"_id": ObjectId(file_id)})
        return {"message": "File deleted"}

    return router
