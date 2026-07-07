# 📋 Product Requirements Document (PRD)
## M. Taufiq, M.Kom - Academic Portfolio Platform

**Version:** 1.5.0  
**Status:** Active Development  
**Last Updated:** July 7, 2026  

---

## 1. EXECUTIVE SUMMARY

**Project Name:** M. Taufiq, M.Kom - Academic Portfolio & Digital Presence  

The M. Taufiq Portfolio is a modern, professionally designed digital presence platform for academic showcase and professional content management. It serves as a centralized hub for publications, teaching materials, research projects, community service activities, professional awards, developer projects, and blog insights.

**Purpose:** Establish and maintain a professional digital identity showcasing academic credentials, research contributions, teaching excellence, and technical expertise to students, researchers, colleagues, and potential collaborators.

**Key Statistics:**
- **Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Supabase
- **Deployment:** Vercel (recommended)
- **Core Features:** 14+ major features active
- **Content Types:** Publications, Teaching, Projects, Activities, Awards, Blog, Job Scraper
- **Users Supported:** 4 distinct personas

---

## 2. USER PERSONAS & SCENARIOS

### Persona 1: Academic Visitor (External Stakeholder)
**Profile:** Students, researchers, colleagues seeking information  
**Goals:**
- Discover teaching courses and materials
- Access research publications and abstracts
- Learn about academic background and expertise
- Find collaboration opportunities

**Typical Journey:**
1. Google search: "M. Taufiq" or specific course name
2. Land on homepage
3. Browse publications list
4. Read blog post or research abstract
5. Click external DOI/link to journal article
6. Contact via form or chat with AI assistant

**Device Preference:** Desktop (70%), Mobile (30%)  
**Visit Frequency:** Sporadic, with spikes during semester starts

---

### Persona 2: Portfolio Owner/Admin (M. Taufiq)
**Profile:** Academic content creator and portfolio manager  
**Goals:**
- Publish and manage academic content
- Maintain professional information
- Monitor analytics and engagement
- Manage authentication and platform settings

**Typical Workflows:**
1. **Publishing**: Write blog post → Use Quill editor → Publish/Draft → Schedule
2. **Adding Publication**: Fill form with DOI → Upload cover image → Submit
3. **Teaching Update**: Upload syllabus → Update credits/semester → Set materials
4. **Monitoring**: Check dashboard KPIs → Review popular content → Manage spam

**Device Preference:** Desktop (95%)  
**Visit Frequency:** Daily for 30-60 minutes

---

### Persona 3: Enrolled Student
**Profile:** Student taking courses taught by M. Taufiq  
**Goals:**
- Access course materials and syllabus
- View teaching schedules
- Download course resources
- Check course descriptions and credits

**Typical Workflows:**
1. Visit Teaching page
2. Find specific course
3. View course details
4. Download syllabus and materials
5. Check materials folder for assignments

**Device Preference:** Mobile (60%), Desktop (40%)  
**Visit Frequency:** During semester (weekly), offline during break

---

### Persona 4: Collaborator/Researcher
**Profile:** External researchers and academic partners  
**Goals:**
- Find research project details and publications
- Identify collaboration opportunities
- Access publication metadata (DOI, abstracts)
- Stay updated on research activities

**Typical Workflows:**
1. Search for researcher on Google Scholar
2. Land on portfolio
3. Browse publication list filtered by year
4. Read abstracts and click DOI links
5. Check active research projects
6. Send collaboration inquiry

**Device Preference:** Desktop (90%)  
**Visit Frequency:** Once or twice per year (research-driven)

---

## 3. CORE FEATURES ANALYSIS

### Public-Facing Features

#### Homepage & Hero Section
- **Purpose:** First impression, navigation hub
- **Key Elements:** 
  - Hero with gradient text animation
  - Profile summary and call-to-action
  - Tech stack visualization
  - Featured teaching highlights
  - Recent projects carousel
  - Recent activities feed
  - Blog snippets
- **Status:** ✅ Active
- **Components:** HeroSection, AboutSection, TechStackSection, RecentProject, RecentActivity, RecentPostsSection

#### About Section
- **Purpose:** Professional biography
- **Content:** Academic background, institution, expertise areas
- **Status:** ✅ Active
- **Component:** AboutSection.jsx

#### Teaching Materials
- **Purpose:** Academic course portal
- **Features:**
  - Course listing with name, credits, semester
  - Course description and syllabus
  - Material download (PDF, docs)
  - Course-specific pages
- **Data Model:** Teaching table with course metadata
- **Status:** ✅ Active
- **Routes:** /teaching, /teaching/[id], /teaching/[id]/materials

#### Publications
- **Purpose:** Research publication showcase
- **Features:**
  - Searchable/filterable list
  - Publication type: Journal, Conference, Book Chapter, Proceeding
  - DOI links to external journals
  - Abstract display
  - Authors and metadata
  - Publication year filtering
  - Cover image thumbnails
- **Data Model:** Publications table with rich metadata
- **Status:** ✅ Active
- **Routes:** /publications, /publications/[slug]

#### Research Projects
- **Purpose:** Showcase active/completed research
- **Features:**
  - Project description and funding source
  - Timeline display
  - Abstract and research goals
  - Related publications
- **Data Model:** Research Projects table
- **Status:** ✅ Active
- **Routes:** /penelitian

#### Developer Projects
- **Purpose:** Software engineering portfolio
- **Features:**
  - Project showcase with tech stack
  - Project description and links
  - GitHub/demo links
  - Featured projects on homepage
- **Data Model:** Projects table with tech_stack field
- **Status:** ✅ Active
- **Routes:** /project, /project/[slug]

#### Community Service Activities
- **Purpose:** Document community engagement
- **Features:**
  - Activity descriptions with location and year
  - Service category tagging
  - Activity year range
  - Featured on homepage
- **Data Model:** Community Services table with slug
- **Status:** ✅ Active
- **Routes:** /activity, /activity/[slug]

#### Awards & Recognition
- **Purpose:** Display institutional achievements
- **Features:**
  - Award name and institution
  - Year of award
  - Award certificate
  - Recognition category
- **Data Model:** Awards table
- **Status:** ✅ Active
- **Dashboard Route:** /manage/dashboard/awards

#### Blog/Developer Notes
- **Purpose:** Publish thoughts on teaching, research, technical topics
- **Features:**
  - Rich text editing (Quill editor)
  - Draft/Published workflow
  - Author information
  - Publication date
  - Featured posts on homepage
  - Blog archive by date
- **Data Model:** Blogs table with status enum
- **Status:** ✅ Active
- **Routes:** /blog, /blog/[slug]

#### AI Chatbot
- **Purpose:** Answer questions about portfolio
- **Features:**
  - Claude/Gemini-powered assistant
  - Context-aware responses
  - Suggested prompt templates
  - Chat history per session
  - Typing indicators
- **Technology:** Gemini API
- **Status:** ✅ Active (requires GEMINI_API_KEY)
- **Component:** AIChatbot.jsx
- **API Route:** /api/chat

#### Job Vacancy Scraper
- **Purpose:** Aggregate and display job opportunities
- **Features:**
  - Web scraper collecting job postings
  - HTML cleaning and sanitization
  - Gender-inclusive title normalization
  - Job description parsing
  - Source link preservation
- **Data Model:** Job Vacancies table
- **Status:** ✅ Active
- **Routes:** /loker, /api/loker/scrape

#### Responsive Design
- **Purpose:** Optimal viewing on all devices
- **Features:**
  - Mobile-first approach
  - Tailwind CSS breakpoints
  - Touch-friendly interface
  - Optimized navigation for mobile
  - Image responsive loading
- **Status:** ✅ Active
- **Tools:** Tailwind CSS v4

#### Dark Mode Support
- **Purpose:** Reduce eye strain, modern UX
- **Features:**
  - Light/Dark theme toggle
  - Persistent user preference
  - System preference detection
  - All components support both modes
  - Glassmorphism in dark mode
- **Status:** ✅ Active
- **Implementation:** Tailwind dark: prefix, HTML class toggle

#### Glassmorphism UI
- **Purpose:** Premium visual effects
- **Features:**
  - Frosted glass effect on navigation
  - Backdrop blur on key elements
  - Transparency and depth
  - Slate/Indigo color scheme
- **Status:** ✅ Active
- **Implementation:** Tailwind backdrop-blur, bg-opacity

---

### Admin Dashboard Features

#### Dashboard Home
- **Purpose:** Content overview and KPIs
- **Features:**
  - Circular progress indicators for KPIs
  - Activity summary
  - Content statistics
  - Quick links to content management
- **Status:** ✅ Active
- **Route:** /manage/dashboard

#### Content Management
- **Features:**
  - CRUD operations for all content types
  - Form validation
  - Media upload integration
  - Publish/draft workflow
- **Sub-routes:**
  - /manage/blogs - Blog management
  - /manage/publications - Publication editor
  - /manage/teaching - Course materials
  - /manage/projects - Project showcase
  - /manage/activities - Activity tracking
  - /manage/awards - Award management
  - /manage/loker - Job vacancy management
- **Status:** ✅ Active

#### Rich Text Editing
- **Purpose:** Format blog and publication content
- **Tool:** React Quill (react-quill-new v3.7.0)
- **Features:**
  - Text formatting (bold, italic, underline)
  - Lists and indentation
  - Link insertion
  - Image embedding
  - Code blocks
  - Heading styles
- **Component:** QuillEditor.jsx
- **Status:** ✅ Active

#### Media Upload
- **Purpose:** Store images, PDFs, documents
- **Features:**
  - Direct file upload to Supabase Storage
  - File type validation
  - Size limits enforcement
  - Progress indication
  - URL generation for CDN
- **Storage:** Supabase Storage (acbwbhwwloncxbxgyedm.supabase.co)
- **Status:** ✅ Active
- **API Route:** /api/uploads

#### Authentication
- **Purpose:** Secure admin access
- **Features:**
  - Email/password login via Supabase Auth
  - Social login support
  - Session management
  - JWT-based authorization
- **Technology:** Supabase Auth (@supabase/ssr v0.8.0)
- **Status:** ✅ Active
- **API Route:** /api/auth/login

#### Authorization
- **Purpose:** Ensure users access only their content
- **Features:**
  - Row-Level Security (RLS) policies
  - User ID-based content filtering
  - Admin role enforcement
  - Cascading delete protection
- **Technology:** Supabase RLS policies
- **Status:** ✅ Active
- **Implementation:** database/rls_policies.sql

#### Profile Management
- **Purpose:** Maintain personal information
- **Features:**
  - Edit bio and professional info
  - Update profile photo
  - Social media links
  - Institution information
- **Data Model:** Users table
- **Status:** ✅ Active

---

## 4. DATA MODELS

### Core Entities

```sql
-- Users (Authentication & Profile)
users {
  id: uuid (primary key)
  name: string
  email: string (unique)
  avatar_url: string
  bio: text
  title: string
  institution: string
  social_links: json
  created_at: timestamp
  updated_at: timestamp
}

-- Teaching (Academic Courses)
teaching {
  id: uuid
  user_id: uuid (FK to users)
  name: string
  description: text
  semester: string
  credits: integer
  syllabus_url: string
  created_at: timestamp
  updated_at: timestamp
}

-- Publications (Academic Papers)
publications {
  id: uuid
  user_id: uuid
  title: string
  type: enum (Journal, Conference, Book Chapter, Proceeding)
  publisher: string
  year: integer
  authors: string[]
  abstract: text
  doi: string
  link: string
  cover_url: string
  created_at: timestamp
  updated_at: timestamp
}

-- Projects (Developer & Research Projects)
projects {
  id: uuid
  user_id: uuid
  title: string
  description: text
  slug: string (unique)
  tech_stack: string[]
  image_url: string
  link: string
  github_link: string
  featured: boolean
  year_start: integer
  year_end: integer
  created_at: timestamp
  updated_at: timestamp
}

-- Community Services
community_services {
  id: uuid
  user_id: uuid
  title: string
  description: text
  slug: string
  location: string
  year: integer
  category: string
  image_url: string
  created_at: timestamp
  updated_at: timestamp
}

-- Awards
awards {
  id: uuid
  user_id: uuid
  title: string
  institution: string
  year: integer
  certificate_url: string
  created_at: timestamp
  updated_at: timestamp
}

-- Blogs
blogs {
  id: uuid
  user_id: uuid
  title: string
  content: text (rich HTML from Quill)
  slug: string (unique)
  status: enum (draft, published)
  featured: boolean
  published_at: timestamp
  created_at: timestamp
  updated_at: timestamp
}

-- Job Vacancies
job_vacancies {
  id: uuid
  title: string
  company: string
  description: text (cleaned HTML)
  location: string
  salary_range: string
  job_type: string
  requirements: text[]
  application_url: string
  scraped_at: timestamp
  source: string
  created_at: timestamp
  updated_at: timestamp
}

-- Gallery (Media Storage)
gallery {
  id: uuid
  user_id: uuid
  file_url: string
  file_type: enum (image, document, video)
  category: enum (teaching, research, community_service, award, event)
  description: string
  uploaded_at: timestamp
}
```

---

## 5. USER STORIES & USE CASES

### Use Case 1: Visitor Exploring Portfolio
**Actor:** Academic Visitor  
**Trigger:** User searches for "M. Taufiq" on Google  

**Flow:**
1. User lands on homepage
2. Views hero section and introduction
3. Scrolls through tech stack section
4. Reviews featured teaching
5. Browses recent projects
6. Reads blog highlights
7. Navigates to full publications page
8. Clicks DOI link to read full paper
9. Interacts with AI chatbot for specific questions
10. Returns to specific blog post

**Result:** Visitor gains comprehensive understanding of portfolio  
**Success Criteria:**
- Page loads in <2 seconds
- All links functional
- Responsive on mobile
- Chatbot responds accurately

---

### Use Case 2: Admin Publishing New Publication
**Actor:** Portfolio Owner (M. Taufiq)  
**Trigger:** Published new research paper  

**Flow:**
1. Login via /api/auth/login
2. Navigate to Dashboard > Publications
3. Click "Add New Publication"
4. Fill form fields:
   - Title
   - Year
   - Type (Journal/Conference/etc.)
   - Publisher
   - DOI
   - Link
   - Abstract
   - Authors
5. Upload cover image via /api/uploads
6. Submit form (POST to /api/blogs)
7. Publication appears on Publications page
8. Featured on homepage if marked

**Result:** Publication indexed and publicly discoverable  
**Success Criteria:**
- Form validates correctly
- Image uploads without error
- Publication visible within 5 minutes
- SEO metadata auto-generated

---

### Use Case 3: Student Accessing Course
**Actor:** Enrolled Student  
**Trigger:** Semester starts, needs course materials  

**Flow:**
1. Visit Teaching page from navigation
2. View all courses with details
3. Click on specific course (e.g., Backend Development)
4. Read syllabus and course description
5. Navigate to Materials tab
6. Download course files (PDF, docs)
7. Access via /teaching/[id]/materials

**Result:** Student accesses all necessary course resources  
**Success Criteria:**
- Course information clearly displayed
- Materials accessible and downloadable
- Mobile-friendly interface
- No authentication required for viewing

---

### Use Case 4: Job Seeker Finding Opportunities
**Actor:** Student/Job Seeker  
**Trigger:** Looking for job opportunities  

**Flow:**
1. Visit Loker page
2. View list of scraped job vacancies
3. Search or filter by criteria
4. Click on job posting
5. View cleaned job description
6. Access company website or apply
7. Share opportunity with friends

**Result:** User discovers relevant job opportunities  
**Success Criteria:**
- Job list loads quickly
- Descriptions are clean and readable
- External links work correctly
- Data refreshes daily

---

## 6. TECHNICAL ARCHITECTURE

### Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.2.7 | Full-stack React with SSR/SSG |
| **UI Library** | React | 19.2.3 | Component framework |
| **Styling** | Tailwind CSS | 4.x | Utility-first styling |
| **Database** | Supabase PostgreSQL | Latest | Real-time database |
| **Auth** | Supabase Auth | 0.8.0 | Email/social login |
| **SDK** | @supabase/supabase-js | 2.78.0 | Client library |
| **Editor** | react-quill-new | 3.7.0 | Rich text editing |
| **Dates** | date-fns | 4.1.0 | Date utilities |
| **Env Config** | dotenv | 17.2.3 | Environment variables |
| **Linting** | ESLint | 9.x | Code quality |

### Architecture Pattern

```
┌─────────────────────────────────────────┐
│       CLIENT LAYER (React Components)   │
│  ├─ Public Pages (static/dynamic)       │
│  ├─ Admin Dashboard                      │
│  └─ UI Components (Header, Footer, etc.)│
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│     API ROUTES (/api/*)                 │
│  ├─ /auth/login (authentication)        │
│  ├─ /blogs (CRUD blogs)                 │
│  ├─ /chat (AI chatbot)                  │
│  ├─ /loker/scrape (job scraper)         │
│  └─ /uploads (media storage)            │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│      SUPABASE BACKEND                   │
│  ├─ PostgreSQL Database                 │
│  ├─ Row-Level Security (RLS)            │
│  ├─ Authentication System               │
│  └─ File Storage                        │
└─────────────────────────────────────────┘
```

---

## 7. CONSTRAINTS & SCOPE

### In Scope ✅
- Content management for all entity types
- Public portfolio with responsive design
- Admin dashboard with authentication
- Rich text editing for blog/publications
- Media uploads to Supabase Storage
- AI chatbot powered by Gemini
- Job scraping and display
- Dark/light mode support
- SEO-friendly page structure

### Out of Scope ❌
- Full-text search across content
- Comment system on blogs
- Email notifications
- Event calendar/scheduling
- Video hosting
- Integration with academic databases (ArXiv, etc.)
- Multi-user admin panel
- Newsletter system
- A/B testing framework
- Advanced analytics

### Key Constraints
| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| Single Admin User | Limited collaboration | Document for future multi-user |
| Supabase Dependency | Vendor lock-in | Use standard PostgreSQL schema |
| GEMINI_API_KEY Required | Chatbot disabled without key | Clear setup documentation |
| Job Scraper Fragility | May break with site changes | Regular maintenance schedule |
| Storage Quotas | Limits on file uploads | Monitor usage, implement CDN caching |

---

## 8. SUCCESS METRICS

### Business Metrics
- Portfolio visibility for "M. Taufiq" keywords (Google rank)
- 500+ monthly unique visitors
- 80% student access to teaching materials
- 30%+ publication link-through rate
- 5+ collaboration inquiries per quarter
- 50+ AI chatbot conversations per month

### Technical Metrics
- Page load speed <2 seconds (LCP)
- Accessibility score ≥95/100
- Uptime ≥99.5%
- API response time <200ms (p95)
- Mobile responsiveness 100/100
- Bundle size <500KB (gzipped)

---

## 9. FUTURE ENHANCEMENTS (Roadmap)

### Phase 2: Advanced Features
- Full-text search across publications
- Comment system on blog posts
- Email notification system
- Advanced user analytics
- Publication recommendation engine

### Phase 3: Collaboration
- Multi-user admin panel with roles
- Shared publication editing
- Collaboration network visualization
- Institutional SSO integration

### Phase 4: Extended Services
- Mobile app (React Native)
- Research paper PDF viewer
- Citation management integration
- Conference/event management
- Student assessment system

---

## 10. RELEASE NOTES

**Current Version:** 1.5.0

**Latest Updates:**
- ✅ Supabase SSR integration
- ✅ AI Chatbot with Gemini API
- ✅ Job scraper with HTML sanitization
- ✅ Responsive design improvements
- ✅ Dark mode refinements
- ✅ Admin dashboard enhancements

**Known Issues:**
- None critical as of July 2026

---

**Document Prepared:** July 7, 2026  
**For Questions:** Refer to `/docs/` folder for detailed documentation
