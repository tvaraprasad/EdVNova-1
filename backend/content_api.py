from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
import uuid
import os

UPLOAD_DIR = "/app/uploads"


def create_content_routes(db, get_current_user, get_admin_user):
    router = APIRouter()

    # ===== Pydantic Models =====
    class ModuleCreate(BaseModel):
        course_id: str
        title: str
        description: str = ""
        order: int = 0

    class LessonCreate(BaseModel):
        module_id: str
        title: str
        description: str = ""
        video_url: Optional[str] = None
        video_type: str = "youtube"
        pdf_url: Optional[str] = None
        worksheet_url: Optional[str] = None
        is_preview: bool = False
        order: int = 0
        duration: str = ""

    # ===== MODULE ROUTES =====
    @router.get("/modules/by-course/{course_id}")
    async def get_modules(course_id: str):
        modules = await db.modules.find({"course_id": course_id}).sort("order", 1).to_list(100)
        result = []
        for m in modules:
            lesson_count = await db.lessons.count_documents({"module_id": str(m["_id"])})
            result.append({
                "id": str(m["_id"]),
                "course_id": m["course_id"],
                "title": m["title"],
                "description": m.get("description", ""),
                "order": m.get("order", 0),
                "lesson_count": lesson_count,
                "created_at": m.get("created_at", "")
            })
        return result

    @router.post("/modules")
    async def create_module(data: ModuleCreate, request: Request):
        await get_admin_user(request)
        doc = data.model_dump()
        doc["created_at"] = datetime.now(timezone.utc).isoformat()
        result = await db.modules.insert_one(doc)
        return {"id": str(result.inserted_id), "message": "Module created"}

    @router.put("/modules/{module_id}")
    async def update_module(module_id: str, data: ModuleCreate, request: Request):
        await get_admin_user(request)
        await db.modules.update_one(
            {"_id": ObjectId(module_id)},
            {"$set": data.model_dump()}
        )
        return {"message": "Module updated"}

    @router.delete("/modules/{module_id}")
    async def delete_module(module_id: str, request: Request):
        await get_admin_user(request)
        await db.lessons.delete_many({"module_id": module_id})
        await db.modules.delete_one({"_id": ObjectId(module_id)})
        return {"message": "Module and its lessons deleted"}

    # ===== LESSON ROUTES =====
    @router.get("/lessons/by-module/{module_id}")
    async def get_lessons(module_id: str):
        lessons = await db.lessons.find({"module_id": module_id}).sort("order", 1).to_list(100)
        return [{
            "id": str(l["_id"]),
            **{k: v for k, v in l.items() if k != "_id"}
        } for l in lessons]

    @router.get("/lessons/detail/{lesson_id}")
    async def get_lesson_detail(lesson_id: str, request: Request):
        lesson = await db.lessons.find_one({"_id": ObjectId(lesson_id)})
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")

        if lesson.get("is_preview"):
            return {"id": str(lesson["_id"]), **{k: v for k, v in lesson.items() if k != "_id"}}

        try:
            user = await get_current_user(request)
            course_id = lesson.get("course_id")
            if course_id:
                enrollment = await db.enrollments.find_one({"user_id": user["id"], "course_id": course_id})
                if enrollment:
                    return {"id": str(lesson["_id"]), **{k: v for k, v in lesson.items() if k != "_id"}}
            raise HTTPException(status_code=403, detail="Enrollment required to access this lesson")
        except HTTPException as e:
            if e.status_code in (401, 403):
                raise
            raise

    @router.post("/lessons")
    async def create_lesson(data: LessonCreate, request: Request):
        await get_admin_user(request)
        doc = data.model_dump()
        module = await db.modules.find_one({"_id": ObjectId(data.module_id)})
        if not module:
            raise HTTPException(status_code=404, detail="Module not found")
        doc["course_id"] = module["course_id"]
        doc["created_at"] = datetime.now(timezone.utc).isoformat()
        result = await db.lessons.insert_one(doc)
        return {"id": str(result.inserted_id), "message": "Lesson created"}

    @router.put("/lessons/{lesson_id}")
    async def update_lesson(lesson_id: str, data: LessonCreate, request: Request):
        await get_admin_user(request)
        update_data = data.model_dump()
        module = await db.modules.find_one({"_id": ObjectId(data.module_id)})
        if module:
            update_data["course_id"] = module["course_id"]
        await db.lessons.update_one({"_id": ObjectId(lesson_id)}, {"$set": update_data})
        return {"message": "Lesson updated"}

    @router.delete("/lessons/{lesson_id}")
    async def delete_lesson(lesson_id: str, request: Request):
        await get_admin_user(request)
        await db.lessons.delete_one({"_id": ObjectId(lesson_id)})
        return {"message": "Lesson deleted"}

    # ===== FILE UPLOAD =====
    @router.post("/uploads/file")
    async def upload_file(
        request: Request,
        file: UploadFile = File(...),
        upload_type: str = Form("pdfs")
    ):
        await get_admin_user(request)

        allowed_types = ["pdfs", "videos", "worksheets", "products", "resources"]
        if upload_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Type must be: {allowed_types}")

        max_mb = 200 if upload_type == "videos" else 50
        unique_name = f"{uuid.uuid4().hex[:12]}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, upload_type, unique_name)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        content = await file.read()
        if len(content) > max_mb * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File too large. Max {max_mb}MB")

        from storage import upload_file as storage_upload
        storage_path = storage_upload(upload_type, file.filename, content, file.content_type or "application/octet-stream")
        file_url = f"/api/files/{storage_path}"
        return {"file_url": file_url, "filename": file.filename, "size": len(content)}

    # ===== COURSE CONTENT (Student-facing) =====
    @router.get("/content/course/{course_id}")
    async def get_course_content(course_id: str, request: Request):
        course = await db.courses.find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        is_enrolled = False
        user_id = None
        try:
            user = await get_current_user(request)
            user_id = user["id"]
            enrollment = await db.enrollments.find_one({"user_id": user_id, "course_id": course_id})
            is_enrolled = enrollment is not None
        except Exception:
            pass

        course_data = {
            "id": str(course["_id"]),
            "title": course["title"],
            "subject": course.get("subject", ""),
            "description": course.get("description", ""),
            "duration": course.get("duration", ""),
            "price": course.get("price", 0),
            "image_url": course.get("image_url"),
            "is_enrolled": is_enrolled,
        }

        modules = await db.modules.find({"course_id": course_id}).sort("order", 1).to_list(100)
        modules_data = []
        for m in modules:
            lessons = await db.lessons.find({"module_id": str(m["_id"])}).sort("order", 1).to_list(100)
            lessons_data = []
            for l in lessons:
                ld = {
                    "id": str(l["_id"]),
                    "title": l["title"],
                    "description": l.get("description", ""),
                    "is_preview": l.get("is_preview", False),
                    "duration": l.get("duration", ""),
                    "order": l.get("order", 0),
                    "has_video": bool(l.get("video_url")),
                    "has_pdf": bool(l.get("pdf_url")),
                    "has_worksheet": bool(l.get("worksheet_url")),
                }
                if is_enrolled or l.get("is_preview"):
                    ld["video_url"] = l.get("video_url")
                    ld["video_type"] = l.get("video_type", "youtube")
                    ld["pdf_url"] = l.get("pdf_url")
                    ld["worksheet_url"] = l.get("worksheet_url")
                lessons_data.append(ld)

            modules_data.append({
                "id": str(m["_id"]),
                "title": m["title"],
                "description": m.get("description", ""),
                "order": m.get("order", 0),
                "lessons": lessons_data,
            })

        course_data["modules"] = modules_data
        return course_data

    # ===== DOWNLOADS TRACKING =====
    @router.post("/downloads/track")
    async def track_download(request: Request):
        user = await get_current_user(request)
        body = await request.json()
        download = {
            "user_id": user["id"],
            "resource_type": body.get("resource_type", "resource"),
            "resource_id": body.get("resource_id", ""),
            "resource_title": body.get("resource_title", ""),
            "file_url": body.get("file_url", ""),
            "downloaded_at": datetime.now(timezone.utc).isoformat()
        }
        await db.downloads.insert_one(download)
        return {"message": "Download tracked"}

    @router.get("/downloads/my")
    async def get_my_downloads(request: Request):
        user = await get_current_user(request)
        downloads = await db.downloads.find(
            {"user_id": user["id"]}, {"_id": 0}
        ).sort("downloaded_at", -1).to_list(100)
        return downloads

    # ===== ADMIN MANAGEMENT ENDPOINTS =====
    @router.get("/manage/courses")
    async def admin_get_all_courses(request: Request):
        await get_admin_user(request)
        courses = await db.courses.find({}).to_list(100)
        result = []
        for c in courses:
            module_count = await db.modules.count_documents({"course_id": str(c["_id"])})
            lesson_count = await db.lessons.count_documents({"course_id": str(c["_id"])})
            result.append({
                "id": str(c["_id"]),
                "title": c["title"],
                "subject": c.get("subject", ""),
                "description": c.get("description", ""),
                "duration": c.get("duration", ""),
                "price": c.get("price", 0),
                "is_active": c.get("is_active", True),
                "image_url": c.get("image_url"),
                "module_count": module_count,
                "lesson_count": lesson_count,
                "syllabus": c.get("syllabus", []),
                "teaching_approach": c.get("teaching_approach", ""),
                "exam_strategy": c.get("exam_strategy", ""),
                "schedule": c.get("schedule", ""),
                "outcomes": c.get("outcomes", []),
            })
        return result

    @router.get("/manage/resources")
    async def admin_get_all_resources(request: Request):
        await get_admin_user(request)
        resources = await db.resources.find({}).to_list(1000)
        return [{
            "id": str(r["_id"]),
            **{k: v for k, v in r.items() if k != "_id"}
        } for r in resources]

    @router.get("/manage/products")
    async def admin_get_all_products(request: Request):
        await get_admin_user(request)
        products = await db.products.find({}).to_list(1000)
        return [{
            "id": str(p["_id"]),
            **{k: v for k, v in p.items() if k != "_id"}
        } for p in products]

    return router
