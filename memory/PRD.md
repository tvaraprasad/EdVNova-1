# EdVNova Learning Platform - PRD

## Original Problem Statement
Build EdVNova Learning - Advanced IGCSE Coaching & Academic Learning Platform. Full-stack platform for Cambridge IGCSE, AS Level, and A Level students. Maximize sign-ups, course enrollments, consultation bookings. Premium Apple/Stripe style design.

## Tech Stack
- Frontend: React 19 + TailwindCSS + Shadcn UI
- Backend: FastAPI (Python)
- Database: MongoDB
- Auth: JWT with httpOnly cookies
- Payment: Razorpay (MOCKED)

## What's Been Implemented

### Phase 1: Core Platform (Complete)
- JWT Authentication (login, register, logout, refresh)
- All pages: Home, About, Programs, Workshops, Resources, Store, Cart, Contact, Dashboard, Admin
- WhatsApp floating button, form redirects to WA
- 15-part UI/UX refinement (institutional tone, Inter font, no gradients)
- Real testimonials, CRO optimizations

### Phase 2: Content Management System (Complete - Feb 4, 2026)
- Admin panel with 7 tabs: Overview, Courses, Resources, Products, Users, Orders, Contacts
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
- 340+ Topics seeded across all boards/subjects
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
- Blue Definitions Box
- Purple Formulas Box (with mono font)
- Green Worked Examples Box
- Amber Common Mistakes Box
- Accent Examiner Tips Box
- Gray Summary Box with checkmarks
- Related Topics pills
- Previous/Next topic navigation
- Bookmark (save) and Mark Complete buttons (auth required)

**Showcase Topics with Full Content:**
- IGCSE Chemistry > Atomic Structure > Isotopes
- IGCSE Physics > Motion > Acceleration

**Student Features:**
- Bookmark topics (toggle, auth required)
- Mark topics as complete (progress tracking)
- Search across all topics with board/subject filters

**Backend Architecture:**
- /app/backend/curriculum_data.py - All seed data
- /app/backend/curriculum_api.py - Browse, search, admin, student routes
- Auto-seeded on startup (idempotent)
- Text indexes for search
- Compound indexes for fast lookups

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
- Curriculum: /api/curriculum/boards/*, /api/curriculum/search, /api/curriculum/user/bookmark, /api/curriculum/user/progress
- Admin: /api/curriculum/admin/topics/:id

## Prioritized Backlog

### P0 (Next Sprint)
- [ ] Admin Topic Editor UI (add/edit topic content from admin panel)
- [ ] Integrate email sending to info@edvnova.com (Resend/SendGrid)
- [ ] Add more published topic content

### P1 (High Priority)
- [ ] Dark mode for reading
- [ ] Mobile-optimized reading mode
- [ ] Practice questions system (MCQ)
- [ ] Past papers section
- [ ] Razorpay payment integration

### P2 (Medium Priority)
- [ ] Revision notes printing/PDF export
- [ ] Google Analytics / Meta Pixel
- [ ] Schema markup for SEO
- [ ] Sitemap generation
- [ ] Student progress analytics dashboard
- [ ] Topical questions by chapter

### P3 (Low Priority)
- [ ] Continue-where-left-off feature
- [ ] Difficulty-based topic filtering
- [ ] Social sharing for topics
- [ ] Scale to CBSE, ICSE, JEE, NEET, SAT, AP boards
