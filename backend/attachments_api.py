from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from datetime import datetime, timezone
from bson import ObjectId
from storage import upload_file


def create_attachments_routes(db, get_admin_user):
    router = APIRouter(prefix="/attachments")

    def doc_out(doc):
        return {k: v for k, v in doc.items() if k != "_id"} | {"id": str(doc["_id"])}

    @router.post("/upload")
    async def upload_attachment(
        request: Request,
        file: UploadFile = File(...),
        topic_id: str = Form(...),
        attachment_type: str = Form("document"),
        title: str = Form(""),
        description: str = Form(""),
        is_visible: bool = Form(True),
        access_level: str = Form("public"),
    ):
        await get_admin_user(request)
        content = await file.read()
        storage_path = upload_file("attachments", file.filename, content, file.content_type or "application/octet-stream")
        file_url = f"/api/files/{storage_path}"
        ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
        now = datetime.now(timezone.utc).isoformat()
        count = await db.topic_attachments.count_documents({"topic_id": topic_id})
        doc = {
            "topic_id": topic_id,
            "title": title or file.filename,
            "description": description,
            "attachment_type": attachment_type,
            "file_url": file_url,
            "storage_path": storage_path,
            "original_name": file.filename,
            "file_size": len(content),
            "extension": ext.lower(),
            "content_type": file.content_type or "",
            "is_visible": is_visible,
            "access_level": access_level,
            "order": count,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.topic_attachments.insert_one(doc)
        await db.media_files.insert_one({
            "filename": storage_path.split("/")[-1],
            "original_name": file.filename,
            "folder": f"attachments/{attachment_type}",
            "file_url": file_url,
            "storage_path": storage_path,
            "file_size": len(content),
            "content_type": file.content_type or "",
            "extension": ext.lower(),
            "tags": [attachment_type, topic_id],
            "created_at": now,
        })
        return {"id": str(result.inserted_id), "file_url": file_url}

    @router.post("/embed")
    async def add_embed_attachment(request: Request):
        await get_admin_user(request)
        body = await request.json()
        topic_id = body.get("topic_id")
        if not topic_id:
            raise HTTPException(400, "topic_id required")
        now = datetime.now(timezone.utc).isoformat()
        count = await db.topic_attachments.count_documents({"topic_id": topic_id})
        doc = {
            "topic_id": topic_id,
            "title": body.get("title", ""),
            "description": body.get("description", ""),
            "attachment_type": body.get("attachment_type", "youtube"),
            "embed_url": body.get("embed_url", ""),
            "file_url": "",
            "original_name": "",
            "file_size": 0,
            "extension": "",
            "content_type": "",
            "is_visible": body.get("is_visible", True),
            "access_level": body.get("access_level", "public"),
            "order": count,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.topic_attachments.insert_one(doc)
        return {"id": str(result.inserted_id)}

    @router.get("/topic/{topic_id}")
    async def get_topic_attachments(topic_id: str):
        docs = await db.topic_attachments.find(
            {"topic_id": topic_id}
        ).sort("order", 1).to_list(100)
        return [doc_out(d) for d in docs]

    @router.get("/topic/{topic_id}/visible")
    async def get_visible_attachments(topic_id: str):
        docs = await db.topic_attachments.find(
            {"topic_id": topic_id, "is_visible": True}
        ).sort("order", 1).to_list(100)
        return [doc_out(d) for d in docs]

    @router.put("/{attachment_id}")
    async def update_attachment(attachment_id: str, request: Request):
        await get_admin_user(request)
        if not ObjectId.is_valid(attachment_id):
            raise HTTPException(400, "Invalid ID")
        body = await request.json()
        allowed = {"title", "description", "is_visible", "order", "attachment_type", "embed_url", "access_level"}
        update = {k: v for k, v in body.items() if k in allowed}
        update["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = await db.topic_attachments.update_one(
            {"_id": ObjectId(attachment_id)}, {"$set": update}
        )
        if result.matched_count == 0:
            raise HTTPException(404, "Attachment not found")
        return {"message": "Updated"}

    @router.put("/reorder/{topic_id}")
    async def reorder_attachments(topic_id: str, request: Request):
        await get_admin_user(request)
        body = await request.json()
        ids = body.get("order", [])
        for idx, aid in enumerate(ids):
            if ObjectId.is_valid(aid):
                await db.topic_attachments.update_one(
                    {"_id": ObjectId(aid)}, {"$set": {"order": idx}}
                )
        return {"message": "Reordered"}

    @router.delete("/{attachment_id}")
    async def delete_attachment(attachment_id: str, request: Request):
        await get_admin_user(request)
        if not ObjectId.is_valid(attachment_id):
            raise HTTPException(400, "Invalid ID")
        # Soft-delete (storage has no delete API)
        await db.topic_attachments.delete_one({"_id": ObjectId(attachment_id)})
        return {"message": "Deleted"}

    return router
