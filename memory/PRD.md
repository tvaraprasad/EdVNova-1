# EdVNova Learning Platform - PRD

## Original Problem Statement
Build EdVNova Learning - Premium educational publishing and learning platform for Cambridge IGCSE, AS Level, and A Level students. 10+ year scalable ecosystem. CMS-driven — never require code changes after deployment.

## Tech Stack
React 19 + TailwindCSS + Shadcn UI | FastAPI | MongoDB | JWT Auth | GPT-4o-mini (Emergent Key)

## Navigation
Home | **Learn** | Store | Community | About | Contact

## Admin Panel (14 tabs)
Overview | **Website Content** | Chapter Notes | Topics | Worksheets | Questions | Videos | Media Library | Courses | Resources | Products | Users | Orders | Contacts

## CMS Architecture

### Website Content CMS
Every public page section is editable from Admin > Website Content:
- **Home** (7 sections): Hero, Trust Strip, Choose Your Path, Boards, Why Different, Testimonials, Final CTA
- **About** (3 sections): Hero, Mission, Vision
- **Contact** (2 sections): Hero, Info (email, phone, WhatsApp, hours)
- **Global** (1 section): Footer (brand description, newsletter text, copyright)

Content stored in `site_content` collection. Frontend reads from `/api/cms/page/{page}` with hardcoded fallbacks.

### Topic Attachments System
Every topic supports unlimited file attachments:
- Upload: PDF, PPT/PPTX, DOC/DOCX, ZIP, images, videos
- Embed: YouTube, Vimeo, external links
- Per-attachment: title, description, type, visibility toggle, ordering
- All uploads auto-mirrored to Media Library
- Managed via Chapter Notes Editor (attachments section per topic)

### Media Library
Global file management:
- Upload to organized folders
- Tags per file, file type filters (images/documents/videos)
- Search, preview, copy URL, delete
- Storage usage dashboard (total files, total size, by type)
- Replace file (same metadata, new content)

## Learning Architecture
```
/learn → Board Selection
/learn/:board → Subject Selection  
/learn/:board/:subject → Chapter List
/learn/:board/:subject/:chapter → Unified Chapter Hub
  ├── Overview (stats, topic list)
  ├── Concept Notes (expandable inline)
  ├── Workbook (questions with answers/mark schemes)
  ├── Videos (YouTube embeds with status badges)
  └── Downloads (PDF worksheets)
```

## Content Management
- Chapter Notes Editor (bulk edit topics per chapter + attachments)
- Topic Editor (individual topic editing)
- Worksheet Upload Manager
- Question Manager with Bulk Import + auto Question IDs (P-EL-001)
- Video Manager with YouTube embeds + status badges
- Media Library with tags/filters/storage stats

## Other Systems
- Practice Questions (17+ with permanent IDs, filters, bookmarks)
- AI Academic Mentor (GPT-4o-mini, session management)
- Store, Programs, Contact, WhatsApp
- JWT Auth, Student Dashboard

## Prioritized Backlog

### P0 (Next)
- [ ] Publish topic content (10/340 published)
- [ ] Upload real YouTube videos
- [ ] Upload worksheets for key chapters

### P1
- [ ] Analytics dashboard (views, completions, popular content)
- [ ] Search (by Question ID, concept, topic, difficulty)
- [ ] QR codes per chapter

### P2
- [ ] Razorpay payments
- [ ] Quiz mode with scoring  
- [ ] Student progress per chapter
- [ ] Role permissions (Teacher, Editor, Moderator, Student)

### P3
- [ ] Dark mode, PDF export, SEO sitemap
- [ ] RAG grounding for AI Mentor
- [ ] Scale to IB, CBSE boards
