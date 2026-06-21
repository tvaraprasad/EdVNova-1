# EdVNova Learning Platform - PRD

## Original Problem Statement
Build EdVNova Learning - Advanced IGCSE Coaching & Academic Learning Platform for Cambridge IGCSE, AS Level, and A Level students. Premium Apple/Stripe design.

## Tech Stack
React 19 + TailwindCSS + Shadcn UI | FastAPI | MongoDB | JWT Auth | Razorpay (MOCKED) | Resend (MOCKED) | GPT-4o-mini via Emergent Key

## Implemented Features

### Core Platform
- JWT Auth, Admin/Student Dashboards, Store, Resources, Contact, WhatsApp
- Premium homepage with Learn/Community dropdown nav, Board Selection, Trust Strip, Testimonials

### Curriculum System (340 topics)
- 3 Boards (IGCSE, AS, A Level) × 4 Subjects × chapters × topics
- Premium topic pages with TOC, definitions, formulas, examples, examiner tips
- 10 published showcase topics, 330 drafts ready for content

### Practice Questions System
- 17 seeded exam-style questions (Physics, Chemistry, Biology, Math)
- Browse with filters (subject, board, topic, difficulty, paper type)
- Question cards with expandable Answer + Mark Scheme
- Student bookmark + completion tracking
- Admin CRUD + image upload

### AI Academic Mentor
- GPT-4o-mini powered chat in Student Dashboard
- Board/Subject/Topic context selectors
- Markdown rendering, session management, typing animation

### Content Management Workflow (Latest - Jun 21, 2026)
**Chapter Notes Editor (Admin > Chapter Notes):**
- Select Board → Subject → Chapter to see all topics at once
- Inline expandable editor per topic (Introduction, Sections, Definitions, Formulas, Worked Examples, Examiner Tips, Common Mistakes, Summary)
- Save Draft / Save & Publish per topic
- Bulk Publish All With Content button
- Fast workflow for publishing hundreds of notes

**Worksheet Upload Manager (Admin > Worksheets):**
- Upload PDF worksheets tagged by subject/board/chapter/topic
- Free/premium toggle per worksheet
- Download tracking, search/filter, file size display
- Student browse + download at /api/worksheets/browse

**Bulk Question Import (Admin > Questions):**
- Paste multiple questions in structured text format
- Auto-parse subject, board, topic, difficulty, paper type
- Import all at once with one click
- Template provided in the dialog

### Admin Panel (11 tabs)
Overview, Chapter Notes, Topics, Worksheets, Questions, Courses, Resources, Products, Users, Orders, Contacts

## How to Upload Content

### Notes (Chapter by Chapter):
1. Go to Admin > **Chapter Notes**
2. Select Board (IGCSE) → Subject (e.g., Physics) → Chapter (e.g., Electricity)
3. Click on a topic to expand the inline editor
4. Fill in: Introduction, Content Sections, Definitions, Formulas, Worked Examples, Tips, Summary
5. Click **Save & Publish** or use **Bulk Publish All With Content**

### Worksheets (PDF Upload):
1. Go to Admin > **Worksheets**
2. Click **Upload Worksheet**
3. Select PDF file, fill in title, subject, board, chapter, topic
4. Toggle Free/Premium
5. Click Upload

### Practice Questions (Individual or Bulk):
- **Individual:** Admin > Questions > Add Question → fill form
- **Bulk:** Admin > Questions > Bulk Import → paste text in format → Import

## Prioritized Backlog

### P1
- [ ] Publish more topic content (10/340 published)
- [ ] Upload worksheets for key chapters
- [ ] Add more practice questions
- [ ] Razorpay payment integration

### P2
- [ ] Google Analytics / Meta Pixel
- [ ] RAG grounding for AI Mentor
- [ ] Quiz/scoring mode for practice
- [ ] Student-facing worksheets browse page

### P3
- [ ] PDF export, dark mode, SEO sitemap
- [ ] Student progress analytics
- [ ] Break down server.py into modular routes
