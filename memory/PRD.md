# EdVNova Learning Platform - PRD

## Original Problem Statement
Build EdVNova Learning - Premium educational publishing and learning platform for Cambridge IGCSE, AS Level, and A Level students. 10+ year scalable ecosystem.

## Tech Stack
React 19 + TailwindCSS + Shadcn UI | FastAPI | MongoDB | JWT Auth | GPT-4o-mini (Emergent Key)

## Navigation (v1.1)
Home | **Learn** | Store | Community | About | Contact

Learn dropdown: IGCSE, AS Level, A Level, Live Coaching

## Core Architecture (v1.1)

### Learning Flow
```
/learn → Board Selection
/learn/:board → Subject Selection
/learn/:board/:subject → Chapter List
/learn/:board/:subject/:chapter → Unified Chapter Hub
```

### Chapter Hub (Heart of EdVNova)
Each chapter page `/learn/:board/:subject/:chapter` contains:
- **Overview** — Stats, topic list with status badges
- **Concept Notes** — Expandable inline topic notes (definitions, formulas, examples, tips)
- **Workbook** — Practice questions with answers/mark schemes, bookmark/complete tracking
- **Videos** — Coming Soon (architecture ready for YouTube embeds + status badges)
- **Downloads** — PDF worksheets per chapter

### Legacy Routes (still working)
`/:board`, `/:board/:subject`, `/:board/:subject/:chapter`, `/:board/:subject/:chapter/:topic`

## Implemented Features

### Core Platform (v1.0)
- JWT Auth, Admin Dashboard (11 tabs), Student Dashboard with AI Mentor
- Store, Programs, Contact, WhatsApp integration
- Premium homepage with Learn/Community dropdowns

### Curriculum System
- 3 Boards × 4 Subjects × chapters × 340 topics (10 published)
- Premium topic pages with TOC, definitions, formulas, examples, tips

### Practice Questions System
- 17+ seeded exam-style questions with filters, bookmarks, completions
- Admin CRUD + bulk import

### AI Academic Mentor
- GPT-4o-mini chat in Student Dashboard with session management

### Content Management Workflow
- Chapter Notes Editor (bulk editing per chapter)
- Worksheet Upload Manager (PDF upload with tagging)
- Bulk Question Import (paste-based)
- Topic Editor (individual topic editing)

### v1.1 Navigation Restructure (Latest)
- Resources removed from navigation
- All learning links now use `/learn/*` paths
- Unified chapter hub page with 5 tabs
- Breadcrumbs use Learn > Board > Subject > Chapter
- Homepage, footer, all internal links updated
- Old routes preserved for backwards compatibility

## Admin Panel Tabs
Overview, Chapter Notes, Topics, Worksheets, Questions, Courses, Resources, Products, Users, Orders, Contacts

## Prioritized Backlog

### P0 (Next)
- [ ] Video management system (YouTube embeds, status badges, admin CRUD)
- [ ] Question ID system (permanent IDs like M-NL-001)
- [ ] QR code per chapter (permanent URLs)
- [ ] Media library (folders, search, preview, replace)

### P1
- [ ] Publish more topic content (10/340)
- [ ] Analytics dashboard (views, completions, popular content)
- [ ] Search by Question ID, concept, topic, difficulty

### P2
- [ ] Quiz mode with scoring
- [ ] Student progress per chapter (Not Started / In Progress / Completed)
- [ ] Role permissions (Teacher, Content Editor, Moderator, Student)
- [ ] Razorpay payments
- [ ] Break server.py into modular routes

### P3
- [ ] Dark mode, PDF export, SEO sitemap
- [ ] RAG grounding for AI Mentor
- [ ] Scale to IB, CBSE boards
