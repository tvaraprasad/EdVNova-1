# EdVNova Learning Platform — PRD v3.2

## Vision
World-class learning platform for Cambridge IGCSE, AS & A Level, and IB. Mathematics, Physics, Chemistry, Biology.

**Core principle:** VERY DEEP UNDER THE HOOD. EXTREMELY SIMPLE IN FRONT.

**UX Principle:** Don't make students navigate EdVNova. Make EdVNova navigate the learning for them.

## Tech Stack
React 19 + TailwindCSS + Shadcn UI | FastAPI | MongoDB | JWT Auth | GPT-4o-mini (Emergent Key) | Emergent Object Storage

## Architecture

### Dual Navigation
- **Public**: Learn ▾ | Store | Community ▾ | About | Contact + Search... ⌘K + Sign In / Get Started
- **Authenticated**: Home | Learn ▾ | Practise | Store | About + Profile dropdown

### Search-First Homepage
- "What do you want to learn today?" hero with animated placeholder cycling 6 phrases
- Prominent search bar → `/search?q=...` dedicated results page
- Popular quick links: Quadratic Equations, Electrolysis, Newton Laws, Photosynthesis

### Global Search
- ⌘K shortcut overlay + homepage hero bar + dedicated `/search` results page
- Searches: topics, chapters, questions, past papers, courses (5 collections)
- Understands code patterns: "0580 paper 22 2024", "9701/31 mark scheme 2022"
- Results categorized: Learn / Practise / Exam

### Course Workspace
- Persistent collapsible sidebar showing course outline (chapters + topics)
- "Find a topic..." search within course
- Breadcrumb: Board > Subject > Chapter
- Tabs: Overview | Concept Notes | Workbook | Videos | Downloads
- Mobile: drawer overlay triggered by Menu icon

### Past Paper SEO Engine
- Individual pages: `/past-papers/{qualification}/{code}/{year}/{session}/paper-{n}/{type}`
- Collection pages: `/past-papers/{qualification}/{code}`
- Auto-linked: QP ↔ MS ↔ ER (same syllabus+year+session+paper)
- Public, indexable, no login required for discovery
- Cambridge filename parser: `0580_s24_qp_22.pdf` → full metadata inference

### Data Model
- **Curriculum**: 3 boards × 4 subjects × 95 chapters × 340 topics
- **Past Papers**: curriculum, qualification, subject, syllabus_code, year, session, paper, variant, resource_type, file_url, review_status, inference_confidence
- **Questions**: 17+ seeded, board/subject/topic/difficulty/marks
- **Learning Assets**: Universal parent_type + parent_id + section, 7 access levels

### Admin Panel (14 tabs)
Overview | Website Content | Chapter Notes | Topics | Past Papers | Worksheets | Questions | Videos | Media Library | Courses | Products | Users | Orders | Contacts

## What's Been Completed
- [x] Auth, CMS, Admin Panel, Store/Cart/Orders, Workshops, Career Guidance
- [x] Curriculum hierarchy, AI Mentor, Practice Questions
- [x] Emergent Object Storage migration (all 8 upload endpoints)
- [x] Context-aware dual navigation (public vs authenticated)
- [x] Past Paper System (bulk upload + admin review + metadata inference)
- [x] **Search-first homepage** with animated placeholder (Aug 2026)
- [x] **Dedicated search results page** with categorized results (Aug 2026)
- [x] **Individual past paper SEO pages** with clean URLs + auto-linked QP↔MS↔ER (Aug 2026)
- [x] **Past paper collection pages** (Aug 2026)
- [x] **Course workspace** with persistent sidebar (Aug 2026)
- [x] System consolidation (TopicEditor → RichContentEditor)
- [x] Student Dashboard redesign ("What should I do next?")
- [x] Global Search (⌘K + homepage + /search page)

## Backlog

### Phase 1 (Remaining)
- [ ] Extend curriculum: syllabus codes, learning objectives, IB support
- [ ] Extend question bank metadata
- [ ] Topic-wise past paper question extraction
- [ ] Student onboarding flow
- [ ] Mobile-first optimization
- [ ] Continue Learning tracking (last_visited per user)

### Phase 2 — Core Learning
- [ ] Exam Mode (timer, navigation, review, scoring)
- [ ] Mistake Book
- [ ] Flashcards & Revision Notes
- [ ] Student Progress & Mastery tracking
- [ ] Quiz/Assessment engine

### Phase 3 — Live Learning
- [ ] Scheduled Classes + Zoom
- [ ] Teacher workspace, Recordings, Summaries
- [ ] Attendance, Topic mapping

### Phase 4 — Teacher Ecosystem
- [ ] Teacher Platform, Test Builder, Assignments
- [ ] Parent view, Study Planner

### Phase 5 — Differentiation
- [ ] AI adaptive learning, Personalised paths
- [ ] RAG grounding, Advanced analytics
