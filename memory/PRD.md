# EdVNova Learning Platform - PRD

## Original Problem Statement
Build EdVNova Learning - Advanced IGCSE Coaching Platform (Pune, India). Full-stack production-ready platform to maximize student sign-ups, course enrollments, and consultation bookings. Platform must feel premium, academic, trustworthy, and global.

## User Personas
1. **Students (Ages 13-16)**: IGCSE students seeking quality coaching
2. **Parents**: Decision makers looking for reliable education for children
3. **Administrators**: Staff managing courses, workshops, resources, and orders

## Core Requirements (Static)
- Premium Apple/Stripe style design
- Color scheme: Primary #0B1F3A, Accent #2563EB, Background #F8FAFC
- Font: Inter (headings + body, no decorative fonts)
- JWT authentication with role-based access
- Course management (4 subjects: Math, Physics, Chemistry, Biology)
- Workshop registration system
- Resource library with premium content (locked for guests)
- E-commerce store with cart
- Student and Admin dashboards
- Contact form with WhatsApp redirect
- WhatsApp floating button on all pages

## Tech Stack
- Frontend: React 19 + TailwindCSS + Shadcn UI
- Backend: FastAPI (Python)
- Database: MongoDB
- Auth: JWT with httpOnly cookies
- Payment: Razorpay (MOCKED for now)

## What's Been Implemented

### Frontend Pages
- Homepage with hero, stats bar, Why Different, Our Vision, Programs, Teaching Approach, Profile Building, Testimonials, Locations, Final CTA
- About page with vision, philosophy, stats
- Programs listing page
- Program detail page with enrollment
- Workshops listing with registration
- Resources library (locked content for non-authenticated)
- Store with products and category filters
- Cart with checkout (mock payment + WhatsApp redirect + full address)
- Contact page with form (WhatsApp redirect)
- Login/Register pages
- Student Dashboard
- Admin Panel with tabs (Overview, Users, Orders, Contacts)
- Profile Building page
- Career Guidance page

### Backend APIs
- Complete auth system (register, login, logout, me, refresh)
- Courses CRUD and enrollment
- Workshops CRUD and registration
- Resources management (premium content access control)
- Products CRUD
- Orders with mock payment
- Contact form submissions
- Admin stats and management endpoints

### Database
- Users collection with role-based access
- Courses with sample data (4 subjects)
- Workshops with sample data (2 workshops)
- Resources with sample data (3 resources)
- Products with sample data (3 products)
- Orders, Enrollments, Workshop registrations, Contacts

### Design & UI (Completed Feb 4, 2026)
15-Part UI/UX Refinement Applied:
1. Removed personal branding ("IISER Pune Graduate")
2. Hero typography fixed (text-6xl, Inter bold, tracking-tight)
3. Hero copy refined (headline + subheadline + supporting line)
4. "Our Vision" section added to homepage
5. Inter font enforced globally (no decorative fonts)
6. Visual polish (py-20/py-24 spacing, rounded-xl cards, shadow-sm hover:shadow-lg)
7. Profile Building visible in nav and homepage
8. Real testimonials displayed (Ishika, Venkat, Pallavi)
9. CTA year updated to "2026-2028 batch"
10. Strong final CTA ("Limited Seats. Serious Students Only.")
11. Contact form redirects to WhatsApp after submission
12. Store checkout includes full address (mandatory) + WhatsApp redirect
13. WhatsApp floating button on all pages
14. Navbar clean with CTA button; Footer with correct contact info
15. Premium minimal design feel throughout

### CRO & Conversion Optimization
- "Limited Seats. Serious Students Only." messaging
- Multiple CTAs across sections
- Stats bar: 67+ Chapters, 50+ Students, 95%+ Success Rate, A*/A Grade
- Real testimonials from edvnova.com
- WhatsApp quick-contact on every page

## Prioritized Backlog

### P0 (Critical - Next Sprint)
- [ ] Integrate email sending to info@edvnova.com on form/order submit (Resend/SendGrid)
- [ ] Integrate Razorpay for actual payments

### P1 (High Priority)
- [ ] Add course content/lessons pages
- [ ] Add progress tracking for enrolled courses
- [ ] Implement file upload for resources
- [ ] Add password reset flow

### P2 (Medium Priority)
- [ ] Google Analytics / Meta Pixel for conversion tracking
- [ ] Add video content support
- [ ] Implement search functionality
- [ ] Add user profile editing
- [ ] Implement batch/class scheduling

### P3 (Low Priority)
- [ ] Analytics dashboard for admin
- [ ] Notifications system
- [ ] Testimonials management via admin
- [ ] Social media integration
- [ ] Blog/News section
