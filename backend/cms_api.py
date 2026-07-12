from fastapi import APIRouter, HTTPException, Request
from datetime import datetime, timezone
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)


def create_cms_routes(db, get_admin_user):
    router = APIRouter(prefix="/cms")

    def doc_out(doc):
        return {k: v for k, v in doc.items() if k != "_id"} | {"id": str(doc["_id"])}

    # ── Get page content (public) ──
    @router.get("/page/{page}")
    async def get_page_content(page: str):
        docs = await db.site_content.find({"page": page}).to_list(100)
        result = {}
        for d in docs:
            result[d["section"]] = d.get("content", {})
        return result

    @router.get("/section/{page}/{section}")
    async def get_section(page: str, section: str):
        doc = await db.site_content.find_one({"page": page, "section": section})
        if not doc:
            return {}
        return doc.get("content", {})

    # ── Admin: list all pages ──
    @router.get("/admin/pages")
    async def list_cms_pages(request: Request):
        await get_admin_user(request)
        pages = await db.site_content.distinct("page")
        result = []
        for p in sorted(pages):
            sections = await db.site_content.find({"page": p}, {"_id": 0, "section": 1}).to_list(50)
            result.append({"page": p, "sections": [s["section"] for s in sections]})
        return result

    # ── Admin: get all sections for a page ──
    @router.get("/admin/page/{page}")
    async def admin_get_page(page: str, request: Request):
        await get_admin_user(request)
        docs = await db.site_content.find({"page": page}).to_list(100)
        return [doc_out(d) for d in docs]

    # ── Admin: update section ──
    @router.put("/admin/{page}/{section}")
    async def update_section(page: str, section: str, request: Request):
        await get_admin_user(request)
        body = await request.json()
        content = body.get("content", {})
        now = datetime.now(timezone.utc).isoformat()
        await db.site_content.update_one(
            {"page": page, "section": section},
            {"$set": {"content": content, "updated_at": now}},
            upsert=True
        )
        return {"message": f"Updated {page}/{section}"}

    # ── Admin: delete section ──
    @router.delete("/admin/{page}/{section}")
    async def delete_section(page: str, section: str, request: Request):
        await get_admin_user(request)
        await db.site_content.delete_one({"page": page, "section": section})
        return {"message": "Deleted"}

    # ══ SEED ══
    async def seed_cms_content():
        count = await db.site_content.count_documents({})
        if count > 0:
            return
        now = datetime.now(timezone.utc).isoformat()
        sections = [
            # ── HOME ──
            {"page": "home", "section": "hero", "content": {
                "badge": "Premium Learning for Cambridge Students",
                "heading": "The Premium Learning Platform for Cambridge Students",
                "heading_accent": "Cambridge Students",
                "subheading": "Master Mathematics and Science through expert coaching, structured resources, premium courses, and academic guidance.",
                "cta_primary": {"text": "Start Learning", "link": "/learn"},
                "cta_secondary": {"text": "Book Consultation", "link": "/contact"},
                "trust_line": "Trusted by students across India, UAE, UK, and Singapore",
            }},
            {"page": "home", "section": "trust_strip", "content": {
                "items": [
                    {"value": "340+", "label": "Revision Topics"},
                    {"value": "3", "label": "Cambridge Boards"},
                    {"value": "4", "label": "Core Subjects"},
                    {"value": "95%+", "label": "Success Rate"},
                    {"value": "A*/A", "label": "Average Grade"},
                ],
            }},
            {"page": "home", "section": "choose_path", "content": {
                "heading": "Choose Your Path",
                "subheading": "Whether you need guided learning, practice resources, or academic mentorship — we've got you covered.",
                "cards": [
                    {"title": "Need Guided Learning?", "description": "Live coaching, mentoring, and structured academic support for IGCSE, AS & A Level students.", "cta": "Explore Learning", "link": "/learn", "color": "blue"},
                    {"title": "Need Notes & Practice Resources?", "description": "Revision notes, worksheets, topic questions, formula sheets, and study guides for every chapter.", "cta": "Explore Resources", "link": "/resources", "color": "emerald"},
                    {"title": "Looking Beyond Academics?", "description": "Profile building, workshops, career guidance, and academic mentorship for university readiness.", "cta": "Explore Community", "link": "/profile-building", "color": "violet"},
                ],
            }},
            {"page": "home", "section": "boards", "content": {
                "heading": "Choose Your Curriculum",
                "subheading": "Structured learning for IGCSE, AS & A Level students. Select your board to explore subjects, notes, and resources.",
                "cards": [
                    {"name": "Cambridge IGCSE", "slug": "igcse", "description": "Ages 14–16. The world's most popular international qualification.", "color": "from-blue-600 to-blue-700"},
                    {"name": "AS Level", "slug": "as-level", "description": "Ages 16–17. Advanced Subsidiary — the first half of A Level.", "color": "from-indigo-600 to-indigo-700"},
                    {"name": "A Level", "slug": "a-level", "description": "Ages 17–18. The gold standard pre-university qualification.", "color": "from-violet-600 to-violet-700"},
                ],
            }},
            {"page": "home", "section": "why_different", "content": {
                "heading": "Why EdVNova is Different",
                "subheading": "We don't just prepare students for exams. We build deep understanding that lasts a lifetime.",
                "features": [
                    {"title": "Concept-First Learning", "description": "Every concept taught with clarity and depth. True understanding over memorization."},
                    {"title": "Structured Systems", "description": "No random studying. Organized curriculum, clear progression, measurable outcomes."},
                    {"title": "A* Level Performance", "description": "Teaching methodology designed specifically for top grades. 95%+ achieve A*/A."},
                    {"title": "Premium Resources", "description": "Topic-wise revision notes, formulas, worked examples, and examiner tips."},
                    {"title": "Personalized Guidance", "description": "Individual attention, progress tracking, and academic strategy for serious students."},
                    {"title": "Long-Term Foundation", "description": "Preparing students not just for exams but for university and career success."},
                ],
            }},
            {"page": "home", "section": "testimonials", "content": {
                "heading": "What Parents & Students Say",
                "subheading": "Real feedback from our students and their families.",
                "items": [
                    {"quote": "I had a great learning experience with Vara sir! He has a deep understanding of Physics, Chemistry, Math, and Biology, and explains every concept with clarity and patience. His guidance really helped me build strong fundamentals and boosted my confidence for exams.", "name": "Ishika Dhomse", "role": "IGCSE Student", "rating": 5, "initial": "I"},
                    {"quote": "Vara sir tutored my son Pranav in Science and Maths through one-on-one online sessions for a year. He is a patient and dedicated teacher who made concepts easy to understand. Thanks to his personalized approach, my son saw a clear boost in his grades.", "name": "Venkat", "role": "Parent", "rating": 5, "initial": "V"},
                    {"quote": "You were truly a blessing in our children's lives. After a difficult experience with their previous teacher, your entry brought a complete turnaround with your patience, dedication, and personal touch. As a teacher myself, I deeply admire how you connected with them.", "name": "Pallavi Kumar", "role": "Parent", "rating": 5, "initial": "P"},
                ],
            }},
            {"page": "home", "section": "final_cta", "content": {
                "heading": "Start Your Cambridge Learning Journey Today",
                "subheading": "Join students who are building clarity, confidence, and results with EdVNova. Book a free consultation or explore our resources.",
                "cta_primary": {"text": "Book Consultation", "link": "/contact"},
                "cta_secondary": {"text": "Start Learning", "link": "/learn"},
                "whatsapp": "https://wa.me/919652546434",
                "phone": "+91 9652546434",
            }},
            # ── ABOUT ──
            {"page": "about", "section": "hero", "content": {
                "badge": "About EdVNova",
                "heading": "Redefining Cambridge Education",
                "subheading": "We are committed to nurturing academic excellence through conceptual understanding, personalized mentorship, and strategic exam preparation.",
            }},
            {"page": "about", "section": "vision", "content": {
                "heading": "Our Vision",
                "description": "To become the most trusted learning platform for Cambridge students worldwide — setting new standards for academic coaching, educational resources, and personalized student development.",
                "image_url": "https://images.unsplash.com/photo-1675179190669-ef6bc809d8d7?w=800&q=80",
            }},
            {"page": "about", "section": "mission", "content": {
                "heading": "Our Mission",
                "description": "To deliver concept-first education that empowers every student to achieve academic excellence with clarity and confidence.",
                "points": [
                    "Build strong conceptual foundations in Mathematics and Sciences",
                    "Provide personalized academic guidance for every student",
                    "Create premium learning resources aligned with Cambridge standards",
                    "Foster a love for learning that extends beyond exams",
                ],
            }},
            # ── CONTACT ──
            {"page": "contact", "section": "hero", "content": {
                "heading": "Get in Touch",
                "subheading": "Have questions about our programs? Want to book a free demo class? We're here to help.",
            }},
            {"page": "contact", "section": "info", "content": {
                "email": "info@edvnova.com",
                "phone": "+91 9652546434",
                "whatsapp": "https://wa.me/919652546434",
                "location": "Based in India · Teaching Globally Online",
                "hours": "Monday - Saturday, 9 AM - 8 PM IST",
            }},
            # ── FOOTER ──
            {"page": "global", "section": "footer", "content": {
                "brand_description": "Premium learning support for Cambridge IGCSE, AS & A Level students. Expert coaching, structured notes, and academic guidance.",
                "newsletter_heading": "Stay updated with EdVNova",
                "newsletter_subheading": "Get notified about new notes, courses, workshops, and exam tips.",
                "copyright": "EdVNova Learning. All rights reserved.",
            }},
        ]
        for s in sections:
            s["created_at"] = now
            s["updated_at"] = now
        await db.site_content.insert_many(sections)
        await db.site_content.create_index([("page", 1), ("section", 1)], unique=True)
        logger.info(f"CMS seeded with {len(sections)} sections")

    return router, seed_cms_content
