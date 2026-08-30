# EdVNova Learning Platform — PRD v3.1

## Vision
World-class learning platform for Cambridge IGCSE, AS & A Level, and IB students. Initially: Mathematics, Physics, Chemistry, Biology.

**Core principle:** POWERFUL UNDER THE HOOD. SIMPLE IN THE HANDS OF THE STUDENT.

## Tech Stack
React 19 + TailwindCSS + Shadcn UI | FastAPI | MongoDB | JWT Auth | GPT-4o-mini (Emergent Key) | Emergent Object Storage

## Dual Navigation Architecture (v3.0)
- **Public visitors** → Discovery nav: Learn ▾, Store, Community ▾, About, Contact + Sign In / Get Started
- **Authenticated students** → Learning nav: Home, Learn ▾, Practise, Store, About + Profile dropdown (Workshops, Career Guidance, Profile Building, Help, Admin, Logout)
- Global Search (⌘K) available in both contexts

## Data Architecture
- **Curriculum**: 3 boards × 4 subjects × 95 chapters × 340 topics
- **Past Papers**: curriculum, qualification, subject, syllabus_code, year, session, paper, variant, resource_type, file_url, review_status, inference_confidence
- **Questions**: 17+ seeded, with board/subject/topic/difficulty/marks/answer/mark_scheme
- **Learning Assets**: Universal parent_type + parent_id + section schema, 7 access levels
- **Global Search**: Searches across topics, chapters, questions, past_papers, courses

## Universal Content System
- **RichContentEditor**: Text + inline images (blocks format) — now used in BOTH TopicEditor and ChapterNotesEditor
- **LearningAssetManager**: Upload PDFs, embed YouTube, per-asset access levels
- **Emergent Object Storage**: All uploads persistent in cloud

## Admin Panel (14 tabs)
Overview | Website Content | Chapter Notes | Topics | **Past Papers** | Worksheets | Questions | Videos | Media Library | Courses | Products | Users | Orders | Contacts

## Key Systems
- **Past Paper Library**: Bulk upload with Cambridge filename auto-parsing (0580_s24_qp_22.pdf → metadata). Admin review workflow. Student browse with filters.
- **Global Search**: ⌘K shortcut, searches 5 collections, live results with type badges
- **Student Dashboard**: "What should I do next?" — quick actions (Learn/Practise/Past Papers/AI Mentor), Continue Learning, Your Subjects, sidebar stats
- **AI Academic Mentor**: GPT-4o-mini with curriculum context

## What's Been Completed
- [x] Full auth system (JWT, cookies, admin/student)
- [x] Curriculum hierarchy: 3 boards × 4 subjects × 95 chapters × 340 topics
- [x] CMS v2.1 for all public pages
- [x] Admin Panel with 14 tabs
- [x] LearningAssetManager + RichContentEditor
- [x] AI Mentor integration
- [x] File upload migration to Emergent Object Storage (Aug 2026)
- [x] Context-aware dual navigation — public vs authenticated (Aug 2026)
- [x] Past Paper System — backend API + admin bulk import + student library (Aug 2026)
- [x] Global Search — ⌘K overlay, searches topics/questions/papers/chapters/courses (Aug 2026)
- [x] Student Dashboard redesign — "What should I do next?" (Aug 2026)
- [x] System Consolidation — TopicEditor now uses RichContentEditor (Aug 2026)

## Current Backlog

### Phase 1 (Remaining)
- [ ] Extend curriculum data model (syllabus codes, learning objectives, IB support)
- [ ] Extend question bank metadata (source, year, session, paper, variant)
- [ ] Topic-wise past paper question extraction
- [ ] Student onboarding flow
- [ ] Mobile-first optimization

### Phase 2 — Core Learning
- [ ] Exam Mode (timer, question navigation, mark for review, scoring)
- [ ] Mistake Book
- [ ] Flashcards & Revision Notes
- [ ] Student Progress & Mastery tracking
- [ ] Quiz engine
- [ ] Student attempts tracking

### Phase 3 — Live Learning
- [ ] Scheduled Classes + Zoom integration
- [ ] Teacher class workspace
- [ ] Recording association + class summaries
- [ ] Attendance tracking

### Phase 4 — Teacher Ecosystem
- [ ] Teacher Platform + Test Builder
- [ ] Assignments + Homework
- [ ] Parent view
- [ ] Study Planner

### Phase 5 — Differentiation
- [ ] AI-assisted feedback + adaptive learning
- [ ] Personalised learning paths
- [ ] Advanced analytics
- [ ] RAG grounding for AI Mentor
