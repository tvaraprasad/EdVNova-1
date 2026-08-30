# EdVNova Learning Platform — PRD v3.0

## Vision
World-class learning platform for Cambridge IGCSE, AS & A Level, and IB students. Initially focused on Mathematics, Physics, Chemistry, Biology. Long-term: UNDERSTAND → PRACTISE → APPLY → ASSESS → ANALYSE → IMPROVE.

**Core principle:** POWERFUL UNDER THE HOOD. SIMPLE IN THE HANDS OF THE STUDENT.

## Tech Stack
React 19 + TailwindCSS + Shadcn UI | FastAPI | MongoDB | JWT Auth | GPT-4o-mini (Emergent Key) | Emergent Object Storage

## Dual Navigation Architecture (v3.0)
- **Public visitors** → Discovery nav: Learn, Store, Community, About, Contact + Sign In / Get Started
- **Authenticated students** → Learning nav: Home, Learn, Practise, Store, About + Profile dropdown (Workshops, Career Guidance, Profile Building, Help, Admin, Logout)
- Same platform, same data, different UX context

## Content Hierarchy
Curriculum → Qualification → Subject → Syllabus → Topic → Subtopic → Learning Objective → Learning Asset

## Universal Content System
- **RichContentEditor**: Text + inline images for concept explanations
- **LearningAssetManager**: Upload PDFs, embed YouTube, per-asset access levels
- **Emergent Object Storage**: All uploads persistent in cloud (migrated from local pod storage)
- 7 access levels: public | registered | premium | school | private | draft | scheduled

## CMS Coverage (9 pages, 20+ sections)
Home, About, Contact, Store, Community, Career Guidance, Profile Building, Learn, Global

## Admin Panel (13 tabs)
Overview | Website Content | Chapter Notes | Topics | Worksheets | Questions | Videos | Media Library | Courses | Products | Users | Orders | Contacts

## Key Systems
- **Chapter Hub** (`/learn/:board/:subject/:chapter`): 5 tabs (Overview, Notes, Workbook, Videos, Downloads)
- **AI Academic Mentor**: GPT-4o-mini with curriculum context
- **Practice Questions**: Bookmarks, completions, filters
- **Course enrollment + Store + Cart + Orders** (payments MOCKED)

## What's Been Completed
- [x] Full auth system (JWT, cookies, admin/student)
- [x] Curriculum hierarchy: 3 boards × 4 subjects × 95 chapters × 340 topics
- [x] CMS v2.1 for all public pages
- [x] Admin Panel with 13 tabs
- [x] LearningAssetManager (upload + embed, per-asset access)
- [x] RichContentEditor (inline images)
- [x] AI Mentor integration
- [x] File upload migration to Emergent Object Storage (Aug 2026)
- [x] Context-aware dual navigation (public vs authenticated) (Aug 2026)
- [x] Route shadowing + bare exception fixes (Aug 2026)

## Current Backlog

### Phase 1A — Foundation
- [ ] Extend curriculum data model (syllabus codes, learning objectives, IB)
- [ ] Extend question bank metadata (source, year, session, paper, variant)
- [ ] Past Paper data model + admin bulk import
- [ ] Past Paper Library student UI
- [ ] Consolidate duplicate systems (TopicEditor ↔ ChapterNotesEditor, attachments ↔ learning_assets)
- [ ] Global search
- [ ] Redesign student dashboard ("What should I do next?")

### Phase 1B — Student Experience
- [ ] Improve Learn experience (lesson-like flow)
- [ ] Student onboarding flow
- [ ] Mobile-first optimization

### Phase 2 — Core Learning
- [ ] Exam Mode (timer, navigation, review)
- [ ] Mistake Book
- [ ] Flashcards & Revision Notes
- [ ] Student Progress & Mastery tracking
- [ ] Quiz engine

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
