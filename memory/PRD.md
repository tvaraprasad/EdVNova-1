# EdVNova Learning Platform - PRD

## Original Problem Statement
Build EdVNova Learning - Advanced IGCSE Coaching & Academic Learning Platform. Full-stack platform for Cambridge IGCSE, AS Level, and A Level students. Maximize sign-ups, course enrollments, consultation bookings. Premium Apple/Stripe style design.

## Tech Stack
- Frontend: React 19 + TailwindCSS + Shadcn UI
- Backend: FastAPI (Python)
- Database: MongoDB
- Auth: JWT with httpOnly cookies
- Payment: Razorpay (MOCKED)
- Email: Resend (MOCKED)
- AI: GPT-4o-mini via Emergent Universal Key

## What's Been Implemented

### Phase 1-5: Core Platform, CMS, Curriculum, Admin Topic Editor, UX Transformation (Complete)
- Full platform with auth, admin, dashboard, store, resources, 340 topics, 10 published

### Phase 6: Navigation Architecture (Complete)
- Learn/Community dropdowns, Book Consultation CTA, streamlined nav

### Phase 7: Practice Questions System (Complete - May 20, 2026)
**Backend (questions_api.py):**
- Full CRUD: POST/PUT/DELETE /api/questions/admin/*
- Browse: GET /api/questions/browse with filters (subject, board, topic, difficulty, paper_type)
- Topics: GET /api/questions/topics (dynamic filter options)
- Stats: GET /api/questions/admin/stats
- Image upload: POST /api/questions/admin/upload-image
- Student bookmarks: POST /api/questions/bookmark/{id}
- Student completions: POST /api/questions/complete/{id}
- 15 sample questions seeded (Physics 5, Chemistry 4, Biology 3, Math 3)

**Frontend:**
- /practice page with premium filter UI (subject pills, board/topic/difficulty/paper type dropdowns)
- Question cards with difficulty/type/marks/board badges
- Expandable Answer and Mark Scheme accordion sections
- Bookmark and Complete toggle buttons (auth required)
- Admin Questions tab with CRUD dialog, image upload, stats dashboard
- Resources page navigation tabs (Revision Notes / Practice Questions / Topic Notes)

### Phase 8: AI Academic Mentor (Complete - May 20, 2026)
**Backend (ai_mentor_api.py):**
- POST /api/ai-mentor/chat — sends message with board/subject/topic context
- GET /api/ai-mentor/sessions — list conversation sessions
- GET /api/ai-mentor/history/{session_id} — get messages in a session
- DELETE /api/ai-mentor/session/{session_id} — delete a session
- DELETE /api/ai-mentor/clear-all — clear all chat history
- Uses GPT-4o-mini via Emergent Universal Key
- Educational system prompt focused on Cambridge IGCSE/AS/A Level
- Conversation history included in context (not replayed as separate calls)

**Frontend (AIMentor.js in Student Dashboard):**
- Premium chat UI with sidebar for session management
- New Chat button, session list with previews
- Board/Subject/Topic context selectors in header
- Markdown rendering (react-markdown) for formatted responses
- Typing indicator animation
- Suggested starter prompts
- Save/load/delete chat sessions
- Disclaimer: "AI Mentor is a learning assistant. Always verify with your teacher."

## Database Collections
- users, courses, enrollments, workshops, workshop_registrations
- resources, products, orders, contacts
- modules, lessons, downloads
- curriculum_boards, curriculum_subjects, curriculum_chapters, curriculum_topics
- bookmarks, topic_progress
- **questions** (practice question bank)
- **question_bookmarks** (student saved questions)
- **question_completions** (student completed questions)
- **ai_chats** (AI mentor conversation messages)

## Key API Endpoints
- Auth: /api/auth/login, /register, /logout, /me, /refresh
- Curriculum: /api/curriculum/boards/*, /api/curriculum/admin/topics
- Questions: /api/questions/browse, /api/questions/admin/*, /api/questions/bookmark/*, /api/questions/complete/*
- AI Mentor: /api/ai-mentor/chat, /api/ai-mentor/sessions, /api/ai-mentor/history/*
- Contact: /api/contact
- Orders: /api/orders/create

## Prioritized Backlog

### P1 (High Priority)
- [ ] Publish more topic content (10/340 published)
- [ ] Add more practice questions via admin panel
- [ ] Razorpay payment integration

### P2 (Medium Priority)
- [ ] Google Analytics / Meta Pixel
- [ ] RAG grounding for AI Mentor (use EdVNova topic content)
- [ ] Practice questions - session/quiz mode with scoring
- [ ] Dark mode for reading

### P3 (Low Priority)
- [ ] PDF export for revision notes
- [ ] Schema markup for SEO / Sitemap
- [ ] Student progress analytics dashboard
- [ ] Break down server.py into modular route files
