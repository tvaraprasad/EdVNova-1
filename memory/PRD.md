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
- Student dashboard, course content viewer, access control

### Phase 3: Curriculum System (Complete)
- 3 Boards: Cambridge IGCSE, AS Level, A Level
- 4 Subjects: Mathematics, Physics, Chemistry, Biology
- 340 Topics seeded (10 published with full content, 330 drafts)
- SEO-friendly URLs, premium topic pages, bookmarks, progress tracking, search

### Phase 4: Admin Topic Editor & Email (Complete)
- Full topic management UI with search/filter/pagination/editor
- Email integration (mock mode, ready for Resend API key)

### Phase 5: UX Transformation (Complete)
- Premium centered hero, Trust Strip, Choose Your Path, Board Selection, Why EdVNova, Subjects, Testimonials
- Resources page with search bar, category cards, filters, empty states

### Phase 6: Navigation Architecture Restructure (Complete - May 5, 2026)
**New Navigation Structure:**
- Learn (dropdown): IGCSE, AS Level, A Level, Live Coaching, Courses
- Resources (flat link to /resources)
- Store (flat link to /store)
- Community (dropdown): Profile Building, Career Guidance, Workshops
- About, Contact (flat links)
- **Book Consultation** CTA button (replaces "Get Started" for unauthenticated users)

**Key UX Decisions:**
- "Learn" replaces "Boards" — more intuitive for first-time visitors
- "Community" groups all beyond-academics content (Profile Building, Career Guidance, Workshops)
- Store is a standalone nav item (academic products, not generic ecommerce)
- No overlapping terminology — each nav item has clear, distinct purpose

**Homepage Updates:**
- Hero: "The Premium Learning Platform for Cambridge Students"
- Choose Your Path: 3 cards (Guided Learning → /boards, Notes & Resources → /resources, Beyond Academics → /profile-building)
- Final CTA: "Explore Resources" → /resources (label-link consistency)

**Footer Updated:**
- Three columns: Learn, Resources, Community (matching nav structure)

**Mobile Menu:**
- Accordion-style expandable sections for Learn and Community
- Book Consultation CTA for unauthenticated users

## Navigation Map
```
Learn (dropdown)
├── IGCSE → /igcse
├── AS Level → /as-level
├── A Level → /a-level
├── Live Coaching → /programs
└── Courses → /programs

Resources → /resources
Store → /store

Community (dropdown)
├── Profile Building → /profile-building
├── Career Guidance → /career-guidance
└── Workshops → /workshops

About → /about
Contact → /contact
```

## Database Collections
- users, courses, enrollments, workshops, workshop_registrations
- resources, products, orders, contacts
- modules, lessons, downloads
- curriculum_boards, curriculum_subjects, curriculum_chapters, curriculum_topics
- bookmarks, topic_progress

## Key API Endpoints
- Auth: /api/auth/login, /register, /logout, /me, /refresh
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
- [ ] Practice questions system (MCQ)
- [ ] Past papers section
- [ ] Break down server.py (~1000 lines) into modular route files

### P3 (Low Priority)
- [ ] Revision notes printing/PDF export
- [ ] Schema markup for SEO / Sitemap generation
- [ ] Student progress analytics dashboard
- [ ] Social sharing for topics
- [ ] Scale to additional boards (CBSE, IB, etc.)
