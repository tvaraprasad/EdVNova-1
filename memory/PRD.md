# EdVNova Learning Platform - PRD

## Original Problem Statement
Build EdVNova Learning - Premium educational publishing and learning platform for Cambridge IGCSE, AS Level, and A Level students. 10+ year scalable ecosystem.

## Tech Stack
React 19 + TailwindCSS + Shadcn UI | FastAPI | MongoDB | JWT Auth | GPT-4o-mini (Emergent Key)

## Navigation (v1.1)
Home | **Learn** | Store | Community | About | Contact

## Admin Panel (13 tabs)
Overview | Chapter Notes | Topics | Worksheets | Questions | **Videos** | **Media Library** | Courses | Resources | Products | Users | Orders | Contacts

## Implemented Systems

### Learning Flow
`/learn` → Board → Subject → Chapter Hub (Overview, Notes, Workbook, Videos, Downloads)

### Video Management (Phase B)
- Admin CRUD: Title, YouTube URL, status badges (Available/Coming Soon/Premium/Locked/Draft)
- Per-chapter: Board, Subject, Chapter, Topic, Question ID, Difficulty, Duration
- YouTube embed extraction + thumbnail previews
- Chapter page Videos tab shows embedded videos with status badges
- Public browse + chapter-specific video endpoints

### Question ID System (Phase B)
- Permanent IDs: `P-EL-001` format (P=Physics, EL=topic code, 001=sequence)
- Auto-generated on create and bulk import
- All 17 existing questions backfilled with IDs
- Searchable by Question ID across platform
- Links between questions and videos via Question ID

### Media Library (Phase B)
- Admin file upload with folder organization
- Search, browse, delete files
- Copy URL to clipboard for use in content
- File preview for images, icon display for documents
- File size tracking and folder-based navigation

### Content Management
- Chapter Notes Editor (bulk edit all topics in a chapter)
- Topic Editor (individual topic editing)
- Worksheet Upload Manager (PDF upload with tags)
- Question Manager with Bulk Import
- Video Manager with YouTube embed support

### Practice Questions
- 17+ questions with permanent IDs, filters, bookmarks, completions

### AI Academic Mentor
- GPT-4o-mini chat with board/subject/topic context

### Core Platform
- JWT Auth, Admin/Student Dashboards, Store, Programs, Contact
- 340 curriculum topics (10 published), 3 boards, 4 subjects

## Prioritized Backlog

### P0 (Next)
- [ ] QR codes per chapter (permanent URLs)
- [ ] Analytics dashboard (views, completions, popular content)
- [ ] Search system (by Question ID, concept, topic, difficulty)

### P1
- [ ] Publish more topic content (10/340)
- [ ] Add real YouTube videos to chapters
- [ ] Student progress per chapter (Not Started/In Progress/Completed)
- [ ] Role permissions (Teacher, Content Editor, Moderator, Student)

### P2
- [ ] Razorpay payments
- [ ] Quiz mode with scoring
- [ ] RAG grounding for AI Mentor
- [ ] Break server.py into modular routes

### P3
- [ ] Dark mode, PDF export, SEO sitemap
- [ ] Scale to IB, CBSE boards
