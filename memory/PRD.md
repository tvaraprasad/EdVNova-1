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
- [x] **Visual Polish** — Hero: "Understand. Practise. Master Cambridge." + tighter spacing + micro-interactions + typography refinement (Sep 2026)

- [x] **EdVNova 3.0 P0 Security** (Jun 2026) — admin seed create-if-missing only (never overwrites password); cookies HttpOnly+Secure(https)+SameSite=Lax incl. logout; mock-payment blocked when PAYMENT_MODE=live or ENVIRONMENT=production; CORS wildcard removed (explicit FRONTEND_URL list); invalid ObjectId -> 400 instead of 500
- [x] **EdVNova 3.0 P1 3D Hero** (Jun 2026) — ScientificHeroBackground.js in plain three.js (R3F removed: dev babel plugin injects x-line-number props that crash R3F). Reduced-motion -> static SVG; mobile: lower dpr, no AA, low-power, fewer objects; WebGL missing/context lost -> static SVG; pauses offscreen/hidden tab. Tested 1920/1440/768/390 (iteration_23)
- [x] Student dashboard no longer calls admin-only topics endpoint (403 noise)

- [x] **Homepage hero redesign with React Bits CrystalizedBall** (Jun 2026). The official JS-CSS source is used unmodified (src/components/CrystalizedBall.jsx/.css, dependency `ogl`). The wrapper is src/components/CrystalHero.js: the live crystal runs only at >=1024px with WebGL2 and no reduced-motion setting; otherwise a static CSS crystal is shown. The hero is midnight navy and two-column. ScientificHeroBackground.js and the `three` dependency were removed. Licences are in frontend/THIRD_PARTY_LICENSES.md.

- [x] **Design system Pass A** (Jun 2026, iteration_24).
  - Tokens: navy/electric/soft/tint/ink colours and card/card-hover/pop shadows in tailwind; primary is now #07182E.
  - Shared classes in App.css: .ev-card, .ev-card-link, .ev-icon-tile, .ev-eyebrow, .ev-section-title, .ev-select, .nav-pop and .glass-header (with @supports fallback and .is-scrolled).
  - Header: frosted glass, fixed 60/72px height, aria-expanded, keyboard and Escape support, focus rings.
  - Homepage sections below the hero restyled on the shared classes.
  - WhatsApp button reduced to 50/46px.
  - GlobalSearch now renders in a portal; backdrop-filter on the header was clipping it.
  - Past-papers rows no longer overflow on mobile; AI Mentor no longer scrolls the whole page; the toast is offset below the header.

- [x] **Learning Experience 3.0 Phase 1: progress tracking** (Jun 2026, iteration_25 plus a security fix).
  - Backend progress_api.py with collections learning_progress, video_progress and chapter_milestones (unique indexes).
  - Endpoints under /api/progress: course/{b}/{s} (works anonymously), visit, complete, continue, videos/{b}/{s}/{c}, video/{id}.
  - Rules: Finish lesson requires a prior visit; updates are idempotent and race-safe; only published topics count; videos count only when Admin marks them `required`.
  - Video tracking: YouTube IFrame API, a cumulative server watch budget (elapsed×2+15s), duration that can only grow (admin duration as the floor), complete at 90% unique watched, resume position saved.
  - Frontend: CourseOutline sidebar, LessonView (finish, prev/next, links), YouTubeTracker, ContinueLearning on the dashboard, Required checkbox in VideoManager, AI Mentor prefill via /dashboard?tab=mentor&topic=, TopicPage moved to the new system.
  - Proposal: /app/memory/INTERACTIVE_LAB_PROPOSAL.md

- [x] **Chemistry 9701 AS + A Level unified curriculum** (built and tested in STAGING only, iteration_26).
  - Specification: backend/curriculum/chem_9701_spec.py
  - Pathways: backend/curriculum/pathways.py (A Level includes the AS foundation through subject.foundation_board)
  - Migration: backend/scripts/chem_9701_migrate.py
  - Subtopic progress: /api/progress/subtopic
  - Learning journey UI: LessonJourney.js
  - Private staging bridge: frontend/src/staging.js and setupProxy.js; scripts in /app/scripts/staging
  - Approval pack: /app/memory/CHEM_9701_DELIVERY.md
  - Draft topics now return 404 to non-admins
  - MAIN DB NOT MIGRATED, waiting for owner approval
- 2026-10-18 coursebook navigation (staging run e4f4aea0a1): AS 1-18, A Level 19-30 listed first, retired chapters hidden from students via nav_status; see CHEM_9701_DELIVERY.md
- 2026-10-18 staging corrections (iteration 27, all tests pass):
  - Practical P3/P5 chapters always listed as "Coming soon". AS shows 1-22 + P3. Full A Level shows AS Foundation / A Level Extension / P3 + P5
  - course_title "Full A Level Chemistry" shown in the outline, breadcrumb, subject card and continue card. AS Foundation group collapsed and A Level Extension expanded
  - A lesson counts as available only if it is published AND has content or assets (lessons_with_content in pathways.py). Visit/complete/subtopic/get_topic return 404 otherwise (admins exempt)
  - Navigation shows syllabus_title (official 9701 labels in chem_9701_spec.py). Published lesson titles unchanged
  - Staging label update applied (run 188e9a19d0, 67 label-only updates). TEST section removed from staging 7.1. MAIN dry run regenerated (97 inserts / 58 updates)


## Awaiting user approval
- Apply the Chemistry 9701 migration to the main DB (see CHEM_9701_DELIVERY.md)
- Phase 2: course-player polish, saved notes, course collections, dashboard discovery
- Phase 3: interactive simulations (see the proposal) and mastery features
- Quiz and worksheet submission system (none exists yet; needed for quiz completion rules)
- Pass B: apply the design system to discovery pages, workspace polish, practice and dashboards (DO NOT START until approved)
- P2 AI Mind Map Studio — DO NOT START until user approves P0/P1 report
- P3 AI Study Studio (Notes/Worksheets/Quizzes/Flashcards, Draft->Review->Publish)

## Known risks / follow-ups
- No login brute-force lockout yet (recommend 5 fails -> 15 min lock)
- Order creation decrements stock before payment; no restock for abandoned orders
- Preview ingress rewrites cookie SameSite to None; Partitioned (infra, not app)
- server.py monolithic (1000+ lines)

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
