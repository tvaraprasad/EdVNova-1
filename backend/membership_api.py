"""
Membership & Access Control Architecture for EdVNova.
Designed for future Razorpay/Stripe integration without redesign.
"""
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime, timezone
from bson import ObjectId

# Access levels ordered by privilege
ACCESS_LEVELS = ["public", "registered", "premium", "school", "private", "draft", "scheduled"]

MEMBERSHIP_TIERS = [
    {"slug": "free", "name": "Free", "access_level": "registered", "order": 0},
    {"slug": "starter", "name": "Starter", "access_level": "registered", "order": 1},
    {"slug": "premium", "name": "Premium", "access_level": "premium", "order": 2},
    {"slug": "school", "name": "School License", "access_level": "school", "order": 3},
    {"slug": "teacher", "name": "Teacher", "access_level": "school", "order": 4},
    {"slug": "lifetime", "name": "Lifetime", "access_level": "premium", "order": 5},
]


def can_access(user_access_level: str, content_access_level: str) -> bool:
    """Check if a user's access level permits viewing content."""
    if content_access_level == "public":
        return True
    if content_access_level in ("draft", "scheduled"):
        return False
    if content_access_level == "private":
        return False
    # Hierarchy: school > premium > registered > public
    hierarchy = {"public": 0, "registered": 1, "premium": 2, "school": 3}
    user_rank = hierarchy.get(user_access_level, 0)
    content_rank = hierarchy.get(content_access_level, 99)
    return user_rank >= content_rank


def get_user_access_level(user: dict) -> str:
    """Derive access level from user's membership tier."""
    tier = user.get("membership_tier", "free")
    for t in MEMBERSHIP_TIERS:
        if t["slug"] == tier:
            return t["access_level"]
    return "registered"


def create_membership_routes(db, get_current_user, get_admin_user):
    router = APIRouter(prefix="/membership")

    @router.get("/tiers")
    async def get_tiers():
        return MEMBERSHIP_TIERS

    @router.get("/access-levels")
    async def get_access_levels():
        return ACCESS_LEVELS

    @router.get("/my-tier")
    async def get_my_tier(request: Request):
        user = await get_current_user(request)
        # Fetch fresh from DB to get membership_tier
        user_doc = await db.users.find_one({"_id": ObjectId(user["id"])}, {"membership_tier": 1})
        tier_slug = (user_doc or {}).get("membership_tier", "free")
        tier = next((t for t in MEMBERSHIP_TIERS if t["slug"] == tier_slug), MEMBERSHIP_TIERS[0])
        access = get_user_access_level({"membership_tier": tier_slug})
        return {"tier": tier, "access_level": access, "user_id": user["id"]}

    @router.put("/admin/user/{user_id}/tier")
    async def set_user_tier(user_id: str, request: Request):
        await get_admin_user(request)
        body = await request.json()
        tier = body.get("tier", "free")
        if tier not in [t["slug"] for t in MEMBERSHIP_TIERS]:
            raise HTTPException(400, f"Invalid tier: {tier}")
        if not ObjectId.is_valid(user_id):
            raise HTTPException(400, "Invalid user ID")
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"membership_tier": tier, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        if result.matched_count == 0:
            raise HTTPException(404, "User not found")
        return {"message": f"Tier set to {tier}"}

    @router.get("/admin/stats")
    async def membership_stats(request: Request):
        await get_admin_user(request)
        total_users = await db.users.count_documents({})
        by_tier = {}
        for t in MEMBERSHIP_TIERS:
            by_tier[t["slug"]] = await db.users.count_documents({"membership_tier": t["slug"]})
        by_tier["unset"] = await db.users.count_documents({"membership_tier": {"$exists": False}})
        return {"total_users": total_users, "by_tier": by_tier}

    return router
