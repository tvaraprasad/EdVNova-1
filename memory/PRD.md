# EdVNova Learning Platform - PRD v2.0

## Vision
EdVNova is a global educational publishing platform. CMS-driven — never requires code changes after deployment. Designed for 10+ years of growth.

## Tech Stack
React 19 + TailwindCSS + Shadcn UI | FastAPI | MongoDB | JWT Auth | GPT-4o-mini (Emergent Key)

## Navigation
Home | **Learn** | Store | Community | About | Contact
(Resources removed — all content lives inside Learn hierarchy)

## Content Hierarchy
Curriculum → Subject → Chapter → Topic → Subtopic → Learning Resources

## Admin Panel (13 tabs)
Overview | Website Content | Chapter Notes | Topics | Worksheets | Questions | Videos | Media Library | Courses | Products | Users | Orders | Contacts

## Access Control System
7 levels: **public** | registered | premium | school | private | draft | scheduled
Applied to: attachments, worksheets, videos, topics, downloads

## Membership Tiers
6 tiers: **free** | starter | premium | school | teacher | lifetime
Architecture ready for Razorpay/Stripe — no redesign needed.

## CMS Coverage (9 pages, 20+ sections)
- **Home** (7): Hero, Trust Strip, Choose Your Path, Boards, Why Different, Testimonials, Final CTA
- **About** (3): Hero, Mission, Vision
- **Contact** (2): Hero, Info
- **Store** (1): Hero
- **Community** (1): Hero
- **Career Guidance** (1): Hero
- **Profile Building** (1): Hero
- **Learn** (1): Hero
- **Global** (3): Footer, SEO, Navigation

## Auto-Content Surfacing
When admin uploads content to Board → Subject → Chapter → Topic:
- Notes auto-appear in chapter Concept Notes tab
- Attachments auto-appear in Downloads tab
- Videos auto-appear in Videos tab
- Worksheets auto-appear in Downloads tab
- No manual linking required

## Key Systems
- **Chapter Hub** (`/learn/:board/:subject/:chapter`): 5 tabs (Overview, Notes, Workbook, Videos, Downloads)
- **Topic Attachments**: Unlimited files per topic (PDF, PPT, DOC, images, videos, YouTube, ZIP) with access control
- **Video Management**: YouTube embeds, 5 status badges, per-chapter display
- **Question IDs**: Permanent (P-EL-001), auto-generated, searchable
- **Media Library**: Folders, tags, type filters, storage stats, replace
- **AI Academic Mentor**: GPT-4o-mini chat with curriculum context
- **Practice Questions**: 17+ with filters, bookmarks, completions
- **Bulk Import**: Questions, topic notes

## Backlog

### P0
- [ ] Publish topic content (10/340)
- [ ] Upload real YouTube videos
- [ ] Upload worksheets

### P1
- [ ] Analytics dashboard
- [ ] Search (Question ID, concept, topic)
- [ ] QR codes per chapter
- [ ] Student progress tracking

### P2
- [ ] Razorpay/Stripe payment integration
- [ ] Quiz mode with scoring
- [ ] Role permissions (Teacher, Editor, Moderator)
- [ ] Break server.py into modular routes

### P3
- [ ] RAG grounding for AI Mentor
- [ ] Dark mode, PDF export, SEO sitemap
- [ ] Scale to IB, CBSE boards
- [ ] Mobile app architecture
