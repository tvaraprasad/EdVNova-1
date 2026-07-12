"""
Universal Learning Asset API.
ONE system for all uploadable/embeddable resources across the platform.
Uses parent_type + parent_id + section to attach assets to anything.
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from datetime import datetime, timezone
from bson import ObjectId
import pathlib, uuid


def create_learning_assets_routes(db, get_admin_user):
    router = APIRouter(prefix="/learning-assets")

    def doc_out(doc):
        return {k: v for k, v in doc.items() if k != "_id"} | {"id": str(doc["_id"])}

    # ── Upload file asset ──
    @router.post("/upload")
    async def upload_asset(
        request: Request,
        file: UploadFile = File(...),
        parent_type: str = Form(...),
        parent_id: str = Form(...),
        section: str = Form("general"),
        asset_type: str = Form("document"),
        title: str = Form(""),
        description: str = Form(""),
        access_level: str = Form("public"),
    ):
        await get_admin_user(request)
        upload_dir = pathlib.Path("/app/uploads/assets")
        upload_dir.mkdir(parents=True, exist_ok=True)
        ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
        filename = f"{uuid.uuid4().hex[:12]}.{ext}"
        filepath = upload_dir / filename
        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)
        file_url = f"/api/uploads/assets/{filename}"
        now = datetime.now(timezone.utc).isoformat()
        count = await db.learning_assets.count_documents({"parent_type": parent_type, "parent_id": parent_id, "section": section})
        doc = {
            "parent_type": parent_type,
            "parent_id": parent_id,
            "section": section,
            "asset_type": asset_type,
            "title": title or file.filename,
            "description": description,
            "file_url": file_url,
            "embed_url": "",
            "original_name": file.filename,
            "file_size": len(content),
            "extension": ext.lower(),
            "content_type": file.content_type or "",
            "access_level": access_level,
            "is_visible": True,
            "order": count,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.learning_assets.insert_one(doc)
        # Mirror to media library
        await db.media_files.insert_one({
            "filename": filename,
            "original_name": file.filename,
            "folder": f"assets/{asset_type}",
            "file_url": file_url,
            "file_size": len(content),
            "content_type": file.content_type or "",
            "extension": ext.lower(),
            "tags": [asset_type, parent_type, section],
            "created_at": now,
        })
        return {"id": str(result.inserted_id), "file_url": file_url}

    # ── Inline image upload (for rich content editor) ──
    @router.post("/upload-image")
    async def upload_inline_image(request: Request, file: UploadFile = File(...)):
        await get_admin_user(request)
        upload_dir = pathlib.Path("/app/uploads/assets/images")
        upload_dir.mkdir(parents=True, exist_ok=True)
        ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "png"
        filename = f"{uuid.uuid4().hex[:12]}.{ext}"
        filepath = upload_dir / filename
        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)
        file_url = f"/api/uploads/assets/images/{filename}"
        now = datetime.now(timezone.utc).isoformat()
        await db.media_files.insert_one({
            "filename": filename,
            "original_name": file.filename,
            "folder": "inline-images",
            "file_url": file_url,
            "file_size": len(content),
            "content_type": file.content_type or "",
            "extension": ext.lower(),
            "tags": ["inline", "content-image"],
            "created_at": now,
        })
        return {"url": file_url}

    # ── Add embed/link asset ──
    @router.post("/embed")
    async def add_embed_asset(request: Request):
        await get_admin_user(request)
        body = await request.json()
        parent_type = body.get("parent_type")
        parent_id = body.get("parent_id")
        section = body.get("section", "general")
        if not parent_type or not parent_id:
            raise HTTPException(400, "parent_type and parent_id required")
        now = datetime.now(timezone.utc).isoformat()
        count = await db.learning_assets.count_documents({"parent_type": parent_type, "parent_id": parent_id, "section": section})
        doc = {
            "parent_type": parent_type,
            "parent_id": parent_id,
            "section": section,
            "asset_type": body.get("asset_type", "youtube"),
            "title": body.get("title", ""),
            "description": body.get("description", ""),
            "file_url": "",
            "embed_url": body.get("embed_url", ""),
            "original_name": "",
            "file_size": 0,
            "extension": "",
            "content_type": "",
            "access_level": body.get("access_level", "public"),
            "is_visible": body.get("is_visible", True),
            "order": count,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.learning_assets.insert_one(doc)
        return {"id": str(result.inserted_id)}

    # ── Get assets for a parent+section ──
    @router.get("/list")
    async def list_assets(parent_type: str, parent_id: str, section: str = ""):
        query = {"parent_type": parent_type, "parent_id": parent_id}
        if section:
            query["section"] = section
        docs = await db.learning_assets.find(query).sort("order", 1).to_list(200)
        return [doc_out(d) for d in docs]

    # ── Get visible assets only (public) ──
    @router.get("/visible")
    async def list_visible_assets(parent_type: str, parent_id: str, section: str = ""):
        query = {"parent_type": parent_type, "parent_id": parent_id, "is_visible": True}
        if section:
            query["section"] = section
        # Exclude draft/scheduled/private from public view
        query["access_level"] = {"$nin": ["draft", "scheduled", "private"]}
        docs = await db.learning_assets.find(query).sort("order", 1).to_list(200)
        return [doc_out(d) for d in docs]

    # ── Update asset ──
    @router.put("/{asset_id}")
    async def update_asset(asset_id: str, request: Request):
        await get_admin_user(request)
        if not ObjectId.is_valid(asset_id):
            raise HTTPException(400, "Invalid ID")
        body = await request.json()
        allowed = {"title", "description", "is_visible", "order", "asset_type", "embed_url", "access_level", "section"}
        update = {k: v for k, v in body.items() if k in allowed}
        update["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = await db.learning_assets.update_one({"_id": ObjectId(asset_id)}, {"$set": update})
        if result.matched_count == 0:
            raise HTTPException(404, "Asset not found")
        return {"message": "Updated"}

    # ── Reorder ──
    @router.put("/reorder/{parent_type}/{parent_id}")
    async def reorder_assets(parent_type: str, parent_id: str, request: Request):
        await get_admin_user(request)
        body = await request.json()
        ids = body.get("order", [])
        for idx, aid in enumerate(ids):
            if ObjectId.is_valid(aid):
                await db.learning_assets.update_one({"_id": ObjectId(aid)}, {"$set": {"order": idx}})
        return {"message": "Reordered"}

    # ── Delete ──
    @router.delete("/{asset_id}")
    async def delete_asset(asset_id: str, request: Request):
        await get_admin_user(request)
        if not ObjectId.is_valid(asset_id):
            raise HTTPException(400, "Invalid ID")
        doc = await db.learning_assets.find_one({"_id": ObjectId(asset_id)})
        if doc and doc.get("file_url"):
            fname = doc["file_url"].split("/")[-1]
            real_path = pathlib.Path(f"/app/uploads/assets/{fname}")
            if real_path.exists():
                real_path.unlink()
            # Also try images subfolder
            img_path = pathlib.Path(f"/app/uploads/assets/images/{fname}")
            if img_path.exists():
                img_path.unlink()
        await db.learning_assets.delete_one({"_id": ObjectId(asset_id)})
        return {"message": "Deleted"}

    # ── Get all assets for a topic (across all sections) ──
    @router.get("/topic/{topic_id}")
    async def get_all_topic_assets(topic_id: str):
        docs = await db.learning_assets.find(
            {"parent_type": "topic", "parent_id": topic_id, "is_visible": True,
             "access_level": {"$nin": ["draft", "scheduled", "private"]}}
        ).sort("order", 1).to_list(200)
        return [doc_out(d) for d in docs]

    return router
