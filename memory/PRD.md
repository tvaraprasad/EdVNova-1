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

### Phase 2: Content Management System (Complete)
- Admin panel with 8 tabs: Overview, Topics, Courses, Resources, Products, Users, Orders, Contacts
- Course hierarchy: Course -> Modules -> Lessons (video URL/upload, PDF, worksheet, preview flag)
- File upload system (/api/uploads/file) for PDFs, videos, worksheets
- Resource management with category filters and free/locked toggle
- Product management with file uploads
- Student dashboard with tabs: Overview, My Courses, My Resources, Downloads, Orders
- Course content viewer at /course/:courseId with module sidebar + lesson player
- Access control: free preview vs enrolled content

### Phase 3: Curriculum System (Complete)
- 3 Boards: Cambridge IGCSE, AS Level, A Level
- 4 Subjects: Mathematics, Physics, Chemistry, Biology
- 340 Topics seeded (10 published with full content, 330 drafts)
- SEO-friendly URLs, premium topic pages, bookmarks, progress tracking, search

### Phase 4: Admin Topic Editor & Email (Complete)
- Full topic management UI with search/filter/pagination/editor
- Email integration (mock mode, ready for Resend API key)
- 10 published showcase topics

### Phase 5: UX Transformation (Complete - May 3, 2026)
**Homepage Overhaul:**
- Premium hero: "The Premium Learning Platform for IGCSE, AS & A Level Students"
- Trust Strip: 340+ Topics, 3 Boards, 4 Subjects, 95%+ Success, A*/A Grade
- Choose Your Path: 3 cards (Coaching, Notes & Worksheets, Self-Paced Learning)
- Board Selection: 3 gradient cards (IGCSE, AS Level, A Level)
- Why EdVNova: 6 differentiators (concept-first, structured, A*, resources, guidance, foundation)
- Subjects Preview: 4 subject cards with icons
- Testimonials: 3 real testimonials with premium layout
- Final CTA: "Start Your Cambridge Learning Journey Today"

**Resources Page Upgrade:**
- Hero with prominent search bar
- Subject category filter cards (Mathematics, Physics, Chemistry, Biology) with counts
- Type and access (free/premium) dropdown filters
- Clear all filters button
- Premium empty state with messaging
- "Browse Topics" CTA linking to /boards
- Premium resource cards with subject badges, premium/free tags

**Global Updates:**
- Header: 6 nav links (Boards, Programs, Resources, Workshops, About, Contact)
- Footer: Global messaging ("Based in India · Teaching Globally Online")
- Copy consistency: Cambridge-inclusive messaging throughout
- Removed "Locations Across Pune" section
- Removed IGCSE-only hero messaging, replaced with inclusive Cambridge messaging

## Database Collections
- users, courses, enrollments, workshops, workshop_registrations
- resources, products, orders, contacts
- modules, lessons, downloads
- curriculum_boards, curriculum_subjects, curriculum_chapters, curriculum_topics
- bookmarks, topic_progress

## Key API Endpoints
- Auth: /api/auth/login, /register, /logout, /me, /refresh
- Courses: /api/courses, /api/admin/courses
- Content: /api/modules/*, /api/lessons/*, /api/uploads/file
- Curriculum: /api/curriculum/boards/*, /api/curriculum/search, /api/curriculum/admin/topics
- Contact: /api/contact (with email notification)
- Orders: /api/orders/create (with email notification)

## Prioritized Backlog

### P1 (High Priority)
- [ ] Razorpay payment integration (currently mocked)
- [ ] More published topic content (currently 10/340 published)

### P2 (Medium Priority)
- [ ] Google Analytics / Meta Pixel for conversion tracking
- [ ] Dark mode for reading
- [ ] Mobile-optimized reading mode
- [ ] Practice questions system (MCQ)
- [ ] Past papers section
- [ ] Break down server.py (~1000 lines) into modular route files

### P3 (Low Priority)
- [ ] Revision notes printing/PDF export
- [ ] Schema markup for SEO / Sitemap generation
- [ ] Student progress analytics dashboard
- [ ] Social sharing for topics
- [ ] Scale to CBSE, ICSE, JEE, NEET, SAT, AP boards
