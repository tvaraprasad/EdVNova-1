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
- Font: Outfit (headings), Inter (body)
- JWT authentication with role-based access
- Course management (4 subjects: Math, Physics, Chemistry, Biology)
- Workshop registration system
- Resource library with premium content (locked for guests)
- E-commerce store with cart
- Student and Admin dashboards
- Contact form

## Tech Stack
- Frontend: React 19 + TailwindCSS + Shadcn UI
- Backend: FastAPI (Python)
- Database: MongoDB
- Auth: JWT with httpOnly cookies
- Payment: Razorpay (MOCKED for now)

## What's Been Implemented (Jan 4, 2026)

### ✅ Frontend Pages
- Homepage with hero, programs, testimonials, resources preview, CTA
- About page with vision, philosophy, stats
- Programs listing page
- Program detail page with enrollment
- Workshops listing with registration
- Resources library (locked content for non-authenticated)
- Store with products and category filters
- Cart with checkout (mock payment)
- Contact page with form
- Login/Register pages
- Student Dashboard
- Admin Panel with tabs (Overview, Users, Orders, Contacts)
- Profile Building page
- Career Guidance page

### ✅ Backend APIs
- Complete auth system (register, login, logout, me, refresh)
- Courses CRUD and enrollment
- Workshops CRUD and registration
- Resources management (premium content access control)
- Products CRUD
- Orders with mock payment
- Contact form submissions
- Admin stats and management endpoints

### ✅ Database
- Users collection with role-based access
- Courses with sample data (4 subjects)
- Workshops with sample data (2 workshops)
- Resources with sample data (3 resources)
- Products with sample data (3 products)
- Orders, Enrollments, Workshop registrations, Contacts

### ✅ Design Implementation
- Premium minimal design following design guidelines
- Glassmorphism header
- Premium card hover effects
- Consistent spacing and typography
- Mobile responsive

## Prioritized Backlog

### P0 (Critical - Next Sprint)
- [ ] Integrate real Razorpay payment gateway
- [ ] Add email notifications (welcome, order confirmation)
- [ ] Implement password reset flow

### P1 (High Priority)
- [ ] Add course content/lessons pages
- [ ] Add progress tracking for enrolled courses
- [ ] Implement file upload for resources
- [ ] Add more comprehensive admin CRUD for courses/workshops

### P2 (Medium Priority)
- [ ] Add video content support
- [ ] Implement search functionality
- [ ] Add filters for workshops by date
- [ ] Add user profile editing
- [ ] Implement batch/class scheduling

### P3 (Low Priority)
- [ ] Add analytics dashboard for admin
- [ ] Implement notifications system
- [ ] Add testimonials management
- [ ] Social media integration
- [ ] Blog/News section

## Next Tasks List
1. Add real Razorpay integration when API keys are available
2. Implement email service for notifications
3. Build course content delivery system
4. Add progress tracking for students
5. Enhance admin panel with more management features

## CRO & UI Upgrade (Jan 4, 2026 - Session 2)

### Trust Building Sections Added
- **Why EdVNova is Different**: Concept-First Learning, A* Grade Focus, Structured Academic System, Personalized Attention
- **Built for Serious Students**: Deep Understanding, Long-Term Academic Growth, University Preparation

### Conversion Optimization
- "Limited Seats. Serious Students Only." messaging throughout
- Multiple CTAs across sections (Book Free Demo Class, WhatsApp Us)
- Stats bar: 67+ Chapters, 50+ Students, 95%+ Success Rate, A*/A Grade

### Real Testimonials (from edvnova.com)
- Ishika Dhomse (IGCSE Student)
- Venkat (Parent)
- Pallavi Kumar (Parent)

### Form & Lead System
- Contact form with Student Name, Grade, Phone, Email
- Auto-redirect to WhatsApp after form submission
- Pre-filled WhatsApp message with form data

### Store Checkout Enhanced
- Full address fields: Address, City, Pincode
- Customer details: Name, Email, Phone
- Order summary sent to WhatsApp for confirmation

### WhatsApp Integration
- Floating button on all pages (bottom right)
- Links to: https://wa.me/919652546434
- Contact page WhatsApp quick-contact button

### Visual Enhancements
- Larger hero headline (text-6xl/7xl)
- Improved whitespace and spacing
- Enhanced testimonial cards with initials
- Better visual hierarchy throughout
