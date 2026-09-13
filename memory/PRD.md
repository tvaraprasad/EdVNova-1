# EdVNova Learning Platform — PRD v4.0

## Vision
The Premium Learning Platform for Cambridge Students — IGCSE, AS & A Level.
Mathematics, Physics, Chemistry, Biology.

**Product Principle:** VERY DEEP UNDER THE HOOD. EXTREMELY SIMPLE IN FRONT.

## Tech Stack
React 19 + TailwindCSS + Shadcn UI | FastAPI | MongoDB | JWT Auth | GPT-4o-mini (Emergent Key) | Emergent Object Storage

## Architecture

### Navigation
- **EdVNova | Learn ▾ | Store | Community ▾ | About | Contact** + Search ⌘K + Cart + Sign In / Get Started
- **Learn mega-menu**: Two columns — "Explore by Qualification" (IGCSE, AS, A Level) + "Study" (Courses, Practice, Past Papers, Free Resources)
- **Authenticated**: Home | Learn ▾ | Store | About + Profile dropdown

### Homepage (9 sections)
1. Hero: "The Premium Learning Platform for Cambridge Students" + Explore Learning / Browse Past Papers CTAs + animated search bar
2. Four Learning Paths: Expert, Self-paced, Practice, Future Building
3. Explore Cambridge: IGCSE / AS / A Level cards
4. Past Papers Finder: Qualification + Subject dropdowns → Find Past Papers
5. Free Learning Library: Revision Notes, Formula Sheets, Practice, Past Papers
6. Subjects: Mathematics, Physics, Chemistry, Biology
7. AI Mentor: CTA for signed-in students
8. Testimonials
9. Final CTA: Get Started Free / Explore Learning

### Friction-Free Learning Flow
- `/learn/igcse` → Direct to "Choose a Subject" (no marketing hero)
- `/learn/igcse/chemistry` → Direct to chapter list (no marketing hero)
- `/learn/igcse/chemistry/chapter` → Course workspace with persistent sidebar

### Course Workspace (Approved Interface — DO NOT CHANGE)
- Persistent collapsible sidebar: course outline, topic search, chapter/topic hierarchy
- Breadcrumb + Tabs: Overview | Concept Notes | Workbook | Videos | Downloads
- Available / Coming Soon states, topic cards

### Search
- ⌘K overlay + homepage bar + `/search?q=...` results page
- Searches: topics, chapters, questions, past papers, courses
- Understands code patterns: "0580 paper 22 2024", "9701/31 mark scheme 2022"

### Past Paper Engine
- `/past-papers` — Browse all with filters
- `/past-papers/:qualification` — Pre-filtered
- `/past-papers/:qual/:code` — Collection page (grouped by year/session)
- `/past-papers/:qual/:code/:year/:session/paper-:n/:type` — Individual SEO page
- Auto-linked: QP ↔ MS ↔ ER
- Cambridge filename parser for bulk import

### Data
- 3 boards × 4 subjects × 95 chapters × 340 topics
- Learning assets with Emergent Object Storage
- Past papers with metadata inference
- AI Mentor (GPT-4o-mini)
- CMS for all public pages

## Completed
- [x] Auth, Admin (14 tabs), Store/Cart, CMS, Workshops, Career Guidance
- [x] Curriculum, AI Mentor, Practice Questions
- [x] Emergent Object Storage, Learning Asset Manager, Rich Content Editor
- [x] Course workspace with persistent sidebar (approved interface)
- [x] Past paper system (bulk upload, SEO pages, collection pages)
- [x] Global search (⌘K + homepage + /search)
- [x] Student Dashboard ("What should I do next?")
- [x] **P1: Subject → Course workspace direct** — no intermediate ChaptersList page (Sep 2026)
- [x] **P2: Combined Science (0653) + Co-ordinated Sciences (0654)** seeded (14ch/40t + 14ch/45t) (Sep 2026)
- [x] **P3: Whitespace audit** — tightened all homepage + page sections (Sep 2026)
- [x] **P4: Hero upgrade** — "Where Curiosity Becomes Mastery" + scientific SVG visual (Sep 2026)
- [x] **P5: Learn dropdown** — Academic (IGCSE/AS/A) + Learning (Courses/Expert/AI Mentor) (Sep 2026)
- [x] **P6: Homepage 10-section hierarchy** with Combined/Coordinated Sciences (Sep 2026)

## Backlog

### Phase 1 (Remaining)
- [ ] Combined Science (0653) + Co-ordinated Sciences (0654) curriculum seeding
- [ ] Extend curriculum: syllabus codes, learning objectives
- [ ] Free Resources dedicated page
- [ ] SEO meta tags + sitemap generation
- [ ] Student onboarding flow
- [ ] Mobile optimization pass

### Phase 2 — Core Learning
- [ ] Exam Mode (timer, navigation, review, scoring)
- [ ] Mistake Book
- [ ] Flashcards & Revision Notes
- [ ] Student Progress & Mastery tracking
- [ ] Question Bank expansion

### Phase 3 — Live Learning
- [ ] Scheduled Classes + Zoom
- [ ] Recordings, Summaries, Attendance

### Phase 4 — Teacher Ecosystem
- [ ] Teacher Platform, Test Builder, Assignments
- [ ] Parent view, Study Planner

### Phase 5 — Differentiation
- [ ] AI adaptive learning, Personalised paths
- [ ] RAG grounding, Advanced analytics
