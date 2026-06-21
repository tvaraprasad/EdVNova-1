from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from bson import ObjectId

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, 
        "email": email, 
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id, 
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "created_at": user.get("created_at")
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# Create the main app
app = FastAPI(title="EdVNova Learning API")

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
courses_router = APIRouter(prefix="/courses", tags=["Courses"])
workshops_router = APIRouter(prefix="/workshops", tags=["Workshops"])
resources_router = APIRouter(prefix="/resources", tags=["Resources"])
products_router = APIRouter(prefix="/products", tags=["Products"])
orders_router = APIRouter(prefix="/orders", tags=["Orders"])
admin_router = APIRouter(prefix="/admin", tags=["Admin"])

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class CourseCreate(BaseModel):
    title: str
    subject: str
    description: str
    syllabus: List[str]
    teaching_approach: str
    exam_strategy: str
    schedule: str
    outcomes: List[str]
    duration: str
    price: float
    image_url: Optional[str] = None

class CourseResponse(BaseModel):
    id: str
    title: str
    subject: str
    description: str
    syllabus: List[str]
    teaching_approach: str
    exam_strategy: str
    schedule: str
    outcomes: List[str]
    duration: str
    price: float
    image_url: Optional[str] = None
    is_active: bool = True

class WorkshopCreate(BaseModel):
    title: str
    description: str
    date: str
    time: str
    duration: str
    capacity: int
    price: float
    topics: List[str]
    image_url: Optional[str] = None

class WorkshopResponse(BaseModel):
    id: str
    title: str
    description: str
    date: str
    time: str
    duration: str
    capacity: int
    enrolled: int = 0
    price: float
    topics: List[str]
    image_url: Optional[str] = None
    is_active: bool = True

class ResourceCreate(BaseModel):
    title: str
    description: str
    subject: str
    resource_type: str
    file_url: Optional[str] = None
    preview_content: Optional[str] = None
    is_premium: bool = True

class ResourceResponse(BaseModel):
    id: str
    title: str
    description: str
    subject: str
    resource_type: str
    file_url: Optional[str] = None
    preview_content: Optional[str] = None
    is_premium: bool = True

class ProductCreate(BaseModel):
    title: str
    description: str
    category: str
    price: float
    stock: int
    image_url: Optional[str] = None

class ProductResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    price: float
    stock: int
    image_url: Optional[str] = None
    is_active: bool = True

class CartItem(BaseModel):
    product_id: str
    quantity: int

class OrderCreate(BaseModel):
    items: List[CartItem]
    shipping_address: str
    phone: str

class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[dict]
    total: float
    status: str
    shipping_address: str
    phone: str
    created_at: str

class EnrollmentCreate(BaseModel):
    course_id: str

class WorkshopRegistration(BaseModel):
    workshop_id: str

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str
    subject: str = "General Inquiry"

# Auth Routes
@auth_router.post("/register")
async def register(user_data: UserRegister, response: Response):
    email = user_data.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(user_data.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": user_data.name,
        "role": "student",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {"id": user_id, "email": email, "name": user_data.name, "role": "student"}

@auth_router.post("/login")
async def login(user_data: UserLogin, response: Response):
    email = user_data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {"id": user_id, "email": user["email"], "name": user["name"], "role": user["role"]}

@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}

@auth_router.get("/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@auth_router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        access_token = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# Courses Routes
@courses_router.get("", response_model=List[CourseResponse])
async def get_courses():
    courses = await db.courses.find({"is_active": True}, {"_id": 1, "title": 1, "subject": 1, "description": 1, "syllabus": 1, "teaching_approach": 1, "exam_strategy": 1, "schedule": 1, "outcomes": 1, "duration": 1, "price": 1, "image_url": 1, "is_active": 1}).to_list(100)
    return [{"id": str(c["_id"]), **{k: v for k, v in c.items() if k != "_id"}} for c in courses]

@courses_router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: str):
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"id": str(course["_id"]), **{k: v for k, v in course.items() if k != "_id"}}

@courses_router.post("/enroll")
async def enroll_course(data: EnrollmentCreate, request: Request):
    user = await get_current_user(request)
    course = await db.courses.find_one({"_id": ObjectId(data.course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    existing = await db.enrollments.find_one({"user_id": user["id"], "course_id": data.course_id})
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")
    
    enrollment = {
        "user_id": user["id"],
        "course_id": data.course_id,
        "course_title": course["title"],
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
        "status": "active"
    }
    await db.enrollments.insert_one(enrollment)
    return {"message": "Enrolled successfully", "course": course["title"]}

@courses_router.get("/user/enrollments")
async def get_user_enrollments(request: Request):
    user = await get_current_user(request)
    enrollments = await db.enrollments.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return enrollments

# Workshops Routes
@workshops_router.get("", response_model=List[WorkshopResponse])
async def get_workshops():
    workshops = await db.workshops.find({"is_active": True}).to_list(100)
    return [{"id": str(w["_id"]), "enrolled": w.get("enrolled", 0), **{k: v for k, v in w.items() if k not in ["_id", "enrolled"]}} for w in workshops]

@workshops_router.get("/{workshop_id}", response_model=WorkshopResponse)
async def get_workshop(workshop_id: str):
    workshop = await db.workshops.find_one({"_id": ObjectId(workshop_id)})
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return {"id": str(workshop["_id"]), "enrolled": workshop.get("enrolled", 0), **{k: v for k, v in workshop.items() if k not in ["_id", "enrolled"]}}

@workshops_router.post("/register")
async def register_workshop(data: WorkshopRegistration, request: Request):
    user = await get_current_user(request)
    workshop = await db.workshops.find_one({"_id": ObjectId(data.workshop_id)})
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    if workshop.get("enrolled", 0) >= workshop["capacity"]:
        raise HTTPException(status_code=400, detail="Workshop is full")
    
    existing = await db.workshop_registrations.find_one({"user_id": user["id"], "workshop_id": data.workshop_id})
    if existing:
        raise HTTPException(status_code=400, detail="Already registered")
    
    registration = {
        "user_id": user["id"],
        "workshop_id": data.workshop_id,
        "workshop_title": workshop["title"],
        "registered_at": datetime.now(timezone.utc).isoformat(),
        "status": "confirmed"
    }
    await db.workshop_registrations.insert_one(registration)
    await db.workshops.update_one({"_id": ObjectId(data.workshop_id)}, {"$inc": {"enrolled": 1}})
    return {"message": "Registered successfully", "workshop": workshop["title"]}

@workshops_router.get("/user/registrations")
async def get_user_workshop_registrations(request: Request):
    user = await get_current_user(request)
    registrations = await db.workshop_registrations.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return registrations

# Resources Routes
@resources_router.get("")
async def get_resources(request: Request):
    try:
        user = await get_current_user(request)
        is_authenticated = True
    except:
        is_authenticated = False
    
    resources = await db.resources.find({}).to_list(100)
    result = []
    for r in resources:
        resource_data = {
            "id": str(r["_id"]),
            "title": r["title"],
            "description": r["description"],
            "subject": r["subject"],
            "resource_type": r["resource_type"],
            "preview_content": r.get("preview_content"),
            "is_premium": r.get("is_premium", True)
        }
        if is_authenticated or not r.get("is_premium", True):
            resource_data["file_url"] = r.get("file_url")
        result.append(resource_data)
    return result

@resources_router.get("/{resource_id}")
async def get_resource(resource_id: str, request: Request):
    resource = await db.resources.find_one({"_id": ObjectId(resource_id)})
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    try:
        user = await get_current_user(request)
        is_authenticated = True
    except:
        is_authenticated = False
    
    resource_data = {
        "id": str(resource["_id"]),
        "title": resource["title"],
        "description": resource["description"],
        "subject": resource["subject"],
        "resource_type": resource["resource_type"],
        "preview_content": resource.get("preview_content"),
        "is_premium": resource.get("is_premium", True)
    }
    if is_authenticated or not resource.get("is_premium", True):
        resource_data["file_url"] = resource.get("file_url")
    return resource_data

# Products Routes
@products_router.get("", response_model=List[ProductResponse])
async def get_products():
    products = await db.products.find({"is_active": True}).to_list(100)
    return [{"id": str(p["_id"]), **{k: v for k, v in p.items() if k != "_id"}} for p in products]

@products_router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"id": str(product["_id"]), **{k: v for k, v in product.items() if k != "_id"}}

# Orders Routes
@orders_router.post("/create")
async def create_order(order_data: OrderCreate, request: Request):
    user = await get_current_user(request)
    
    items = []
    total = 0
    for item in order_data.items:
        product = await db.products.find_one({"_id": ObjectId(item.product_id)})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['title']}")
        
        item_total = product["price"] * item.quantity
        items.append({
            "product_id": item.product_id,
            "product_title": product["title"],
            "quantity": item.quantity,
            "price": product["price"],
            "subtotal": item_total
        })
        total += item_total
        await db.products.update_one({"_id": ObjectId(item.product_id)}, {"$inc": {"stock": -item.quantity}})
    
    order = {
        "user_id": user["id"],
        "items": items,
        "total": total,
        "status": "pending",
        "shipping_address": order_data.shipping_address,
        "phone": order_data.phone,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "payment_status": "pending"
    }
    result = await db.orders.insert_one(order)
    order_id = str(result.inserted_id)

    # Send email notification (mock or real depending on RESEND_API_KEY)
    from email_service import notify_new_order
    try:
        await notify_new_order(order_id, user["email"], items, total, order_data.shipping_address, order_data.phone)
    except Exception as e:
        logger.error(f"Order email notification failed: {e}")

    return {
        "id": order_id,
        "total": total,
        "status": "pending",
        "message": "Order created successfully. Proceed to payment."
    }

@orders_router.get("/my-orders")
async def get_user_orders(request: Request):
    user = await get_current_user(request)
    orders = await db.orders.find({"user_id": user["id"]}).to_list(100)
    return [{"id": str(o["_id"]), **{k: v for k, v in o.items() if k != "_id"}} for o in orders]

@orders_router.post("/{order_id}/mock-payment")
async def mock_payment(order_id: str, request: Request):
    user = await get_current_user(request)
    order = await db.orders.find_one({"_id": ObjectId(order_id), "user_id": user["id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "confirmed", "payment_status": "completed", "paid_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Payment successful (mock)", "status": "confirmed"}

# Contact Route
@api_router.post("/contact")
async def submit_contact(form: ContactForm):
    contact = {
        "name": form.name,
        "email": form.email,
        "phone": form.phone,
        "message": form.message,
        "subject": form.subject,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "new"
    }
    await db.contacts.insert_one(contact)
    # Send email notification (mock or real depending on RESEND_API_KEY)
    from email_service import notify_contact_form
    try:
        await notify_contact_form(form.name, form.email, form.phone, form.message, form.subject)
    except Exception as e:
        logger.error(f"Email notification failed: {e}")
    return {"message": "Thank you for contacting us. We will get back to you soon."}

# Admin Routes
@admin_router.get("/stats")
async def get_admin_stats(request: Request):
    await get_admin_user(request)
    
    users_count = await db.users.count_documents({})
    courses_count = await db.courses.count_documents({})
    workshops_count = await db.workshops.count_documents({})
    orders_count = await db.orders.count_documents({})
    enrollments_count = await db.enrollments.count_documents({})
    
    return {
        "users": users_count,
        "courses": courses_count,
        "workshops": workshops_count,
        "orders": orders_count,
        "enrollments": enrollments_count
    }

@admin_router.get("/users")
async def get_all_users(request: Request):
    await get_admin_user(request)
    users = await db.users.find({}, {"password_hash": 0}).to_list(1000)
    return [{"id": str(u["_id"]), **{k: v for k, v in u.items() if k != "_id"}} for u in users]

@admin_router.post("/courses")
async def create_course(course: CourseCreate, request: Request):
    await get_admin_user(request)
    course_doc = course.model_dump()
    course_doc["is_active"] = True
    course_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.courses.insert_one(course_doc)
    return {"id": str(result.inserted_id), "message": "Course created successfully"}

@admin_router.put("/courses/{course_id}")
async def update_course(course_id: str, course: CourseCreate, request: Request):
    await get_admin_user(request)
    await db.courses.update_one({"_id": ObjectId(course_id)}, {"$set": course.model_dump()})
    return {"message": "Course updated successfully"}

@admin_router.delete("/courses/{course_id}")
async def delete_course(course_id: str, request: Request):
    await get_admin_user(request)
    await db.courses.update_one({"_id": ObjectId(course_id)}, {"$set": {"is_active": False}})
    return {"message": "Course deleted successfully"}

@admin_router.post("/workshops")
async def create_workshop(workshop: WorkshopCreate, request: Request):
    await get_admin_user(request)
    workshop_doc = workshop.model_dump()
    workshop_doc["is_active"] = True
    workshop_doc["enrolled"] = 0
    workshop_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.workshops.insert_one(workshop_doc)
    return {"id": str(result.inserted_id), "message": "Workshop created successfully"}

@admin_router.put("/workshops/{workshop_id}")
async def update_workshop(workshop_id: str, workshop: WorkshopCreate, request: Request):
    await get_admin_user(request)
    await db.workshops.update_one({"_id": ObjectId(workshop_id)}, {"$set": workshop.model_dump()})
    return {"message": "Workshop updated successfully"}

@admin_router.delete("/workshops/{workshop_id}")
async def delete_workshop(workshop_id: str, request: Request):
    await get_admin_user(request)
    await db.workshops.update_one({"_id": ObjectId(workshop_id)}, {"$set": {"is_active": False}})
    return {"message": "Workshop deleted successfully"}

@admin_router.post("/resources")
async def create_resource(resource: ResourceCreate, request: Request):
    await get_admin_user(request)
    resource_doc = resource.model_dump()
    resource_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.resources.insert_one(resource_doc)
    return {"id": str(result.inserted_id), "message": "Resource created successfully"}

@admin_router.put("/resources/{resource_id}")
async def update_resource(resource_id: str, resource: ResourceCreate, request: Request):
    await get_admin_user(request)
    await db.resources.update_one({"_id": ObjectId(resource_id)}, {"$set": resource.model_dump()})
    return {"message": "Resource updated successfully"}

@admin_router.delete("/resources/{resource_id}")
async def delete_resource(resource_id: str, request: Request):
    await get_admin_user(request)
    await db.resources.delete_one({"_id": ObjectId(resource_id)})
    return {"message": "Resource deleted successfully"}

@admin_router.post("/products")
async def create_product(product: ProductCreate, request: Request):
    await get_admin_user(request)
    product_doc = product.model_dump()
    product_doc["is_active"] = True
    product_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.products.insert_one(product_doc)
    return {"id": str(result.inserted_id), "message": "Product created successfully"}

@admin_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductCreate, request: Request):
    await get_admin_user(request)
    await db.products.update_one({"_id": ObjectId(product_id)}, {"$set": product.model_dump()})
    return {"message": "Product updated successfully"}

@admin_router.delete("/products/{product_id}")
async def delete_product(product_id: str, request: Request):
    await get_admin_user(request)
    await db.products.update_one({"_id": ObjectId(product_id)}, {"$set": {"is_active": False}})
    return {"message": "Product deleted successfully"}

@admin_router.get("/orders")
async def get_all_orders(request: Request):
    await get_admin_user(request)
    orders = await db.orders.find({}).to_list(1000)
    return [{"id": str(o["_id"]), **{k: v for k, v in o.items() if k != "_id"}} for o in orders]

@admin_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, request: Request):
    await get_admin_user(request)
    body = await request.json()
    status = body.get("status")
    await db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": {"status": status}})
    return {"message": "Order status updated"}

@admin_router.get("/contacts")
async def get_contacts(request: Request):
    await get_admin_user(request)
    contacts = await db.contacts.find({}).to_list(1000)
    return [{"id": str(c["_id"]), **{k: v for k, v in c.items() if k != "_id"}} for c in contacts]

# Include routers
api_router.include_router(auth_router)
api_router.include_router(courses_router)
api_router.include_router(workshops_router)
api_router.include_router(resources_router)
api_router.include_router(products_router)
api_router.include_router(orders_router)
api_router.include_router(admin_router)

@api_router.get("/")
async def root():
    return {"message": "EdVNova Learning API", "version": "1.0.0"}

# Content management routes (modules, lessons, uploads, etc.)
from content_api import create_content_routes
content_router = create_content_routes(db, get_current_user, get_admin_user)
api_router.include_router(content_router)

# Curriculum routes (boards, subjects, chapters, topics)
from curriculum_api import create_curriculum_routes
curriculum_router, seed_curriculum = create_curriculum_routes(db, get_current_user, get_admin_user)
api_router.include_router(curriculum_router)

# Questions routes (practice questions system)
from questions_api import create_questions_routes
questions_router, seed_questions = create_questions_routes(db, get_current_user, get_admin_user)
api_router.include_router(questions_router)

# Worksheets routes
from worksheets_api import create_worksheets_routes
worksheets_router = create_worksheets_routes(db, get_current_user, get_admin_user)
api_router.include_router(worksheets_router)

# AI Mentor routes
from ai_mentor_api import create_ai_mentor_routes
ai_mentor_router = create_ai_mentor_routes(db, get_current_user)
api_router.include_router(ai_mentor_router)

app.include_router(api_router)

# Serve uploaded files
import pathlib
upload_dir = pathlib.Path("/app/uploads")
upload_dir.mkdir(exist_ok=True)
for sub in ["pdfs", "videos", "worksheets", "products", "resources", "questions"]:
    (upload_dir / sub).mkdir(exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory="/app/uploads"), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get('FRONTEND_URL', 'http://localhost:3000'), "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Startup event
@app.on_event("startup")
async def startup():
    # Create indexes
    await db.users.create_index("email", unique=True)
    
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@edvnova.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info(f"Admin password updated: {admin_email}")
    
    # Seed sample data
    if await db.courses.count_documents({}) == 0:
        sample_courses = [
            {
                "title": "IGCSE Mathematics",
                "subject": "Mathematics",
                "description": "Comprehensive IGCSE Mathematics preparation covering all topics from algebra to calculus with focus on conceptual understanding and exam techniques.",
                "syllabus": ["Number Systems", "Algebra", "Geometry", "Statistics", "Probability", "Calculus Basics"],
                "teaching_approach": "Our approach combines conceptual clarity with extensive practice. Each concept is broken down into digestible parts with real-world applications.",
                "exam_strategy": "Focused preparation on high-yield topics, time management techniques, and past paper analysis for maximum exam performance.",
                "schedule": "Monday, Wednesday, Friday - 4:00 PM to 6:00 PM",
                "outcomes": ["Strong foundation in mathematical concepts", "Problem-solving skills", "Exam confidence", "Grade improvement"],
                "duration": "12 months",
                "price": 45000,
                "image_url": "https://images.unsplash.com/photo-1758685848095-249ad965f4f3?w=800",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "title": "IGCSE Physics",
                "subject": "Physics",
                "description": "Master IGCSE Physics with our comprehensive program focusing on theoretical understanding and practical applications.",
                "syllabus": ["Mechanics", "Waves", "Electricity", "Magnetism", "Thermal Physics", "Nuclear Physics"],
                "teaching_approach": "Visualization-based learning with experiments, simulations, and real-world problem solving.",
                "exam_strategy": "Focus on numerical problems, diagram-based questions, and conceptual MCQs with timed practice.",
                "schedule": "Tuesday, Thursday - 4:00 PM to 6:00 PM",
                "outcomes": ["Deep understanding of physics principles", "Analytical thinking", "Lab skills", "Exam excellence"],
                "duration": "12 months",
                "price": 45000,
                "image_url": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "title": "IGCSE Chemistry",
                "subject": "Chemistry",
                "description": "Excel in IGCSE Chemistry with our structured program covering organic, inorganic, and physical chemistry.",
                "syllabus": ["Atomic Structure", "Chemical Bonding", "Acids & Bases", "Organic Chemistry", "Electrochemistry", "Environmental Chemistry"],
                "teaching_approach": "Conceptual teaching with visual aids, molecular models, and practical demonstrations.",
                "exam_strategy": "Emphasis on chemical equations, reaction mechanisms, and structured answer techniques.",
                "schedule": "Monday, Wednesday - 6:00 PM to 8:00 PM",
                "outcomes": ["Strong chemistry fundamentals", "Laboratory techniques", "Problem-solving abilities", "Exam readiness"],
                "duration": "12 months",
                "price": 45000,
                "image_url": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "title": "IGCSE Biology",
                "subject": "Biology",
                "description": "Comprehensive IGCSE Biology program covering cell biology to ecology with emphasis on understanding life processes.",
                "syllabus": ["Cell Biology", "Human Physiology", "Plant Biology", "Genetics", "Evolution", "Ecology"],
                "teaching_approach": "Visual learning with diagrams, flowcharts, and case studies for deep understanding.",
                "exam_strategy": "Focus on diagram labeling, process explanations, and data analysis questions.",
                "schedule": "Tuesday, Thursday - 6:00 PM to 8:00 PM",
                "outcomes": ["Thorough biology knowledge", "Scientific thinking", "Diagram skills", "Exam confidence"],
                "duration": "12 months",
                "price": 45000,
                "image_url": "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.courses.insert_many(sample_courses)
        logger.info("Sample courses seeded")
    
    if await db.workshops.count_documents({}) == 0:
        sample_workshops = [
            {
                "title": "Exam Preparation Masterclass",
                "description": "Intensive workshop on exam strategies, time management, and stress handling for IGCSE students.",
                "date": "2026-02-15",
                "time": "10:00 AM",
                "duration": "4 hours",
                "capacity": 30,
                "enrolled": 0,
                "price": 2500,
                "topics": ["Time Management", "Answer Techniques", "Stress Management", "Paper Analysis"],
                "image_url": "https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=800",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "title": "Scientific Research Methods",
                "description": "Learn research methodology, scientific writing, and project development for academic excellence.",
                "date": "2026-02-22",
                "time": "2:00 PM",
                "duration": "3 hours",
                "capacity": 25,
                "enrolled": 0,
                "price": 2000,
                "topics": ["Research Design", "Data Collection", "Scientific Writing", "Presentation Skills"],
                "image_url": "https://images.unsplash.com/photo-1675179190669-ef6bc809d8d7?w=800",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.workshops.insert_many(sample_workshops)
        logger.info("Sample workshops seeded")
    
    if await db.resources.count_documents({}) == 0:
        sample_resources = [
            {
                "title": "IGCSE Mathematics Formula Sheet",
                "description": "Comprehensive formula sheet covering all IGCSE Mathematics topics.",
                "subject": "Mathematics",
                "resource_type": "PDF",
                "file_url": "/resources/math-formulas.pdf",
                "preview_content": "This formula sheet includes: Algebraic identities, Geometric formulas, Trigonometric ratios, Statistical formulas...",
                "is_premium": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "title": "Physics Concepts Summary",
                "description": "Key concepts and laws summarized for quick revision.",
                "subject": "Physics",
                "resource_type": "PDF",
                "file_url": "/resources/physics-concepts.pdf",
                "preview_content": "Quick reference guide covering: Newton's Laws, Energy Conservation, Wave Properties, Electrical Circuits...",
                "is_premium": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "title": "Chemistry Reaction Guide",
                "description": "Complete guide to chemical reactions and equations.",
                "subject": "Chemistry",
                "resource_type": "PDF",
                "file_url": "/resources/chemistry-reactions.pdf",
                "preview_content": "Covers: Acid-Base Reactions, Oxidation-Reduction, Organic Reactions, Electrochemical Reactions...",
                "is_premium": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.resources.insert_many(sample_resources)
        logger.info("Sample resources seeded")
    
    if await db.products.count_documents({}) == 0:
        sample_products = [
            {
                "title": "IGCSE Mathematics Workbook",
                "description": "Comprehensive workbook with 500+ practice problems and detailed solutions.",
                "category": "Workbooks",
                "price": 1500,
                "stock": 50,
                "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "title": "Science Lab Kit",
                "description": "Complete lab kit for Physics and Chemistry experiments at home.",
                "category": "Kits",
                "price": 3500,
                "stock": 25,
                "image_url": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "title": "Study Planner 2026",
                "description": "Academic planner designed specifically for IGCSE students with study tips and schedules.",
                "category": "Stationery",
                "price": 800,
                "stock": 100,
                "image_url": "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.products.insert_many(sample_products)
        logger.info("Sample products seeded")
    
    # Write test credentials
    import pathlib
    memory_dir = pathlib.Path("/app/memory")
    memory_dir.mkdir(exist_ok=True)
    with open(memory_dir / "test_credentials.md", "w") as f:
        f.write(f"""# Test Credentials

## Admin Account
- Email: {admin_email}
- Password: {admin_password}
- Role: admin

## Auth Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/refresh
""")
    logger.info("Test credentials written")

    # Seed curriculum data
    await seed_curriculum()
    logger.info("Curriculum data seeded")

    # Seed practice questions
    await seed_questions()
    logger.info("Practice questions seeded")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
