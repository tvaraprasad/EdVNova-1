# EdVNova Learning Platform - PRD

## Original Problem Statement
Build EdVNova Learning - Advanced IGCSE Coaching & Academic Learning Platform. Full-stack platform for Cambridge IGCSE, AS Level, and A Level students. Maximize sign-ups, course enrollments, consultation bookings. Premium Apple/Stripe style design.

## Tech Stack
- Frontend: React 19 + TailwindCSS + Shadcn UI
- Backend: FastAPI (Python)
- Database: MongoDB
- Auth: JWT with httpOnly cookies
- Payment: Razorpay (MOCKED)
- Email: Resend (MOCKED — ready for API key plug-in)

## What's Been Implemented

### Phase 1: Core Platform (Complete)
- JWT Authentication (login, register, logout, refresh)
- All pages: Home, About, Programs, Workshops, Resources, Store, Cart, Contact, Dashboard, Admin
- WhatsApp floating button, form redirects to WA
- 15-part UI/UX refinement (institutional tone, Inter font, no gradients)
- Real testimonials, CRO optimizations

### Phase 2: Content Management System (Complete - Feb 4, 2026)
- Admin panel with 8 tabs: Overview, Topics, Courses, Resources, Products, Users, Orders, Contacts
- Course hierarchy: Course -> Modules -> Lessons (video URL/upload, PDF, worksheet, preview flag)
- File upload system (/api/uploads/file) for PDFs, videos, worksheets
- Resource management with category filters and free/locked toggle
- Product management with file uploads
- Student dashboard with tabs: Overview, My Courses, My Resources, Downloads, Orders
- Course content viewer at /course/:courseId with module sidebar + lesson player
- Access control: free preview vs enrolled content

### Phase 3: Curriculum System (Complete - May 3, 2026)
**World-class academic learning platform for Cambridge students:**
- 3 Boards: Cambridge IGCSE, AS Level, A Level
- 4 Subjects: Mathematics, Physics, Chemistry, Biology
- 340 Topics seeded across all boards/subjects (10 published with full content, 330 drafts)
- SEO-friendly URLs: /igcse/chemistry/atomic-structure/isotopes

**Pages Built:**
- /boards - Board selection (3 gradient cards)
- /:board - Subject selection (4 colored subject cards)
- /:board/:subject - Chapter listing (numbered, with published counts)
- /:board/:subject/:chapter - Topic listing (with difficulty, study time, status)
- /:board/:subject/:chapter/:topic - Premium topic page
- /search - Search with board/subject filters

**Topic Page Features:**
- Clean hero with breadcrumb, study time, difficulty badge
- Sticky Table of Contents sidebar with active section highlighting
- Blue Definitions Box, Purple Formulas Box, Green Worked Examples Box
- Amber Common Mistakes Box, Accent Examiner Tips Box, Gray Summary Box
- Related Topics pills, Previous/Next topic navigation
- Bookmark (save) and Mark Complete buttons (auth required)

### Phase 4: Admin Topic Editor & Email (Complete - May 3, 2026)
**Admin Topic Editor:**
- Full topic management UI under Admin > Topics tab
- Stats dashboard: Total (340), Published (10), Draft (330)
- Search, filter by Board/Subject/Status, pagination (30 per page)
- Quick publish/unpublish toggle from list view
- Full structured editor with collapsible sections:
  - Topic Meta (Title, SEO Title, Meta Description, Study Time, Difficulty)
  - Main Content (Introduction + dynamic content sections)
  - Definitions (term/definition pairs)
  - Formulas (name/formula/description)
  - Worked Examples (question/solution pairs)
  - Examiner Tips (one per line)
  - Common Mistakes (one per line)
  - Summary (one per line)
- Save Draft / Save & Publish workflow
- Designed for speed: admin can publish hundreds of topics quickly

**Email Integration (Mock Mode):**
- Resend email service architecture fully wired
- Contact form (POST /api/contact) → sends email to info@edvnova.com
- Order creation (POST /api/orders/create) → sends order notification email
- Mock mode: When RESEND_API_KEY is empty, emails are logged server-side
- Production ready: Set RESEND_API_KEY and SENDER_EMAIL in .env to enable real emails
- Professional HTML email templates for contact forms and order notifications

**10 Published Showcase Topics:**
1. IGCSE Chemistry > Atomic Structure > Isotopes
2. IGCSE Physics > Motion > Acceleration
3. IGCSE Biology > Movement In and Out of Cells > Osmosis
4. IGCSE Biology > Plant Nutrition > Photosynthesis
5. IGCSE Chemistry > Bonding > Ionic Bonding
6. IGCSE Chemistry > Stoichiometry > Mole Concept
7. IGCSE Physics > Forces > Newton Laws
8. IGCSE Physics > Electricity > Resistance
9. IGCSE Mathematics > Algebra > Equations
10. IGCSE Mathematics > Number > Percentages

## Database Collections
- users, courses, enrollments, workshops, workshop_registrations
- resources, products, orders, contacts
- modules, lessons, downloads
- curriculum_boards, curriculum_subjects, curriculum_chapters, curriculum_topics
- bookmarks, topic_progress

## Key API Endpoints
- Auth: /api/auth/login, /register, /logout, /me, /refresh
- Courses: /api/courses, /api/admin/courses
- Content: /api/modules/*, /api/lessons/*, /api/uploads/file, /api/content/course/:id
- Curriculum Browse: /api/curriculum/boards/*, /api/curriculum/search
- Curriculum Student: /api/curriculum/user/bookmark, /api/curriculum/user/progress
- Curriculum Admin: /api/curriculum/admin/topics (list), /api/curriculum/admin/topics/:id (get/update), /api/curriculum/admin/topics/:id/publish, /api/curriculum/admin/topics-stats
- Contact: /api/contact (with email notification)
- Orders: /api/orders/create (with email notification)

## Prioritized Backlog

### P1 (High Priority)
- [ ] Improve resources browsing UX (search, filters, topic categories)
- [ ] Razorpay payment integration (currently mocked)

### P2 (Medium Priority)
- [ ] Google Analytics / Meta Pixel for conversion tracking
- [ ] Dark mode for reading
- [ ] Mobile-optimized reading mode
- [ ] Practice questions system (MCQ)
- [ ] Past papers section
- [ ] Break down server.py (~1000 lines) into modular route files

### P3 (Low Priority)
- [ ] Revision notes printing/PDF export
- [ ] Schema markup for SEO
- [ ] Sitemap generation
- [ ] Student progress analytics dashboard
- [ ] Topical questions by chapter
- [ ] Continue-where-left-off feature
- [ ] Difficulty-based topic filtering
- [ ] Social sharing for topics
- [ ] Scale to CBSE, ICSE, JEE, NEET, SAT, AP boards
