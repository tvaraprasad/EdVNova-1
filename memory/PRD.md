# EdVNova Learning Platform - PRD v2.1

## Vision
Global educational publishing platform. CMS-driven — zero code changes after deployment. Designed for 10+ years of growth supporting thousands of videos, notes, worksheets, and multiple curricula.

## Tech Stack
React 19 + TailwindCSS + Shadcn UI | FastAPI | MongoDB | JWT Auth | GPT-4o-mini (Emergent Key)

## Content Hierarchy
Curriculum → Subject → Chapter → Topic → Subtopic → Learning Resources

## Universal Content System (v2.1)

### Rich Content Editor
Every topic section supports **text + inline images** interleaved:
- Text blocks with free-form content
- Inline image blocks (upload new or choose from Media Library)
- Images appear naturally within explanations, not just as downloads
- Stored as block arrays `[{type:"text",value:""},{type:"image",url:"",caption:""}]`
- Backward compatible with plain string content

### Learning Asset Manager
ONE reusable "Add Learning Asset" component used everywhere:
- Upload: PDF, PPT/PPTX, DOC/DOCX, ZIP, images, videos, audio
- Embed: YouTube, Vimeo, external links
- Per-asset: title, description, type, access level, visibility, display order
- All uploads auto-mirrored to Media Library
- `parent_type` + `parent_id` + `section` schema (attaches to anything)
- Used in: Topic intro, content sections, formulas, worked examples, general

### Access Control
7 levels on every asset: **public** | registered | premium | school | private | draft | scheduled

### Membership Architecture
6 tiers: free | starter | premium | school | teacher | lifetime
Ready for Razorpay/Stripe — no redesign needed.

## Auto-Content Surfacing
Upload to Board → Subject → Chapter → Topic → Section → automatically appears on public page. No manual linking.

## CMS Coverage (9 pages, 20+ sections)
Home (7) | About (3) | Contact (2) | Store (1) | Community (1) | Career Guidance (1) | Profile Building (1) | Learn (1) | Global (3: Footer, SEO, Navigation)

## Admin Panel (13 tabs)
Overview | Website Content | Chapter Notes | Topics | Worksheets | Questions | Videos | Media Library | Courses | Products | Users | Orders | Contacts

## Key Systems
- **Chapter Hub** (`/learn/:board/:subject/:chapter`): 5 tabs
- **Question IDs**: Permanent (P-EL-001), auto-generated
- **Video Management**: YouTube embeds, 5 status badges
- **AI Academic Mentor**: GPT-4o-mini with curriculum context
- **Practice Questions**: 17+ with filters, bookmarks, completions

## Backlog

### P0
- [ ] Publish topic content with inline images (10/340 published)
- [ ] Upload real YouTube videos
- [ ] Upload worksheets per chapter

### P1
- [ ] Analytics dashboard
- [ ] Search system (Question ID, concept, topic)
- [ ] QR codes per chapter
- [ ] Student progress tracking

### P2
- [ ] Razorpay/Stripe payments
- [ ] Quiz mode with scoring
- [ ] Role permissions (Teacher, Editor, Moderator)
- [ ] Signed URLs for private asset access

### P3
- [ ] RAG grounding for AI Mentor
- [ ] Dark mode, PDF export, SEO sitemap
- [ ] Scale to IB, CBSE boards
- [ ] Mobile app
