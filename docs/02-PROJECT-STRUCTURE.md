# Project Structure & Architecture

**Last Updated:** 2026-07-07

## Table of Contents
- [Directory Organization](#directory-organization)
- [File Structure Overview](#file-structure-overview)
- [Component Hierarchy](#component-hierarchy)
- [Page Routing Structure](#page-routing-structure)
- [API Endpoint Map](#api-endpoint-map)
- [Database Schema](#database-schema)

---

## Directory Organization

```
portofolio/
├── app/                      # Next.js App Router directory
│   ├── api/                 # API routes (backend)
│   ├── about/              # About page
│   ├── activity/           # Activity listing page
│   ├── blog/               # Blog pages
│   ├── contact/            # Contact form page
│   ├── lecturer/           # Lecturer information
│   ├── loker/              # Job listings
│   ├── manage/             # Admin dashboard
│   ├── penelitian/         # Research page
│   ├── pengabdian/         # Community service page
│   ├── project/            # Projects showcase
│   ├── publications/       # Publications listing
│   ├── teaching/           # Teaching materials
│   ├── layout.js           # Root layout
│   ├── page.js             # Home page
│   ├── not-found.jsx       # 404 page
│   └── supabase-provider.jsx # Supabase context provider
├── components/             # Reusable React components
├── config/                 # Configuration files
├── database/               # Database schemas & scripts
├── lib/                    # Utility functions & helpers
├── public/                 # Static assets
├── utils/                  # Utility functions
├── .env.local             # Environment variables (local)
├── eslint.config.mjs      # ESLint configuration
├── jsconfig.json          # JavaScript path aliases
├── next.config.mjs        # Next.js configuration
├── package.json           # Dependencies & scripts
├── postcss.config.mjs     # PostCSS configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

---

## File Structure Overview

### `/app` - Next.js App Router

The Next.js 16 App Router structure where all pages and API routes live.

#### Page Routing Structure

```
app/
├── page.js                          # Home page (/)
├── layout.js                        # Root layout
├── not-found.jsx                   # 404 fallback
├── about/
│   └── page.jsx                    # About page (/about)
├── activity/
│   ├── page.jsx                    # Activity list (/activity)
│   └── [slug]/
│       └── page.jsx                # Activity detail (/activity/[slug])
├── blog/
│   ├── page.jsx                    # Blog list (/blog)
│   └── [slug]/
│       └── page.jsx                # Blog post (/blog/[slug])
├── contact/
│   └── page.jsx                    # Contact form (/contact)
├── lecturer/
│   └── page.jsx                    # Lecturer info (/lecturer)
├── loker/
│   └── page.jsx                    # Job listings (/loker)
├── manage/                          # Admin dashboard
│   ├── page.jsx                    # Manage home (/manage)
│   └── dashboard/
│       ├── layout.jsx              # Dashboard layout
│       ├── page.jsx                # Dashboard home
│       ├── activities/
│       │   └── page.jsx            # Manage activities
│       ├── awards/
│       │   └── page.jsx            # Manage awards
│       ├── blogs/
│       │   └── page.jsx            # Manage blogs
│       ├── loker/
│       │   └── page.jsx            # Manage job listings
│       ├── projects/
│       │   └── page.jsx            # Manage projects
│       ├── publications/
│       │   ├── ClientOnly.jsx      # Client component
│       │   └── page.jsx            # Manage publications
│       └── teaching/
│           ├── page.jsx            # Manage teaching
│           └── [id]/
│               └── materials/
│                   └── page.jsx    # Manage teaching materials
├── penelitian/
│   └── page.jsx                    # Research page (/penelitian)
├── pengabdian/
│   └── page.jsx                    # Community service (/pengabdian)
├── project/
│   ├── page.jsx                    # Projects list (/project)
│   └── [slug]/
│       └── page.jsx                # Project detail (/project/[slug])
├── publications/
│   ├── page.jsx                    # Publications list (/publications)
│   └── [slug]/
│       └── page.jsx                # Publication detail (/publications/[slug])
└── teaching/
    └── [id]/
        └── page.jsx                # Teaching detail (/teaching/[id])
```

#### API Routes Structure

```
app/api/
├── auth/
│   └── login/
│       └── route.js                # POST /api/auth/login
├── blogs/
│   ├── route.js                    # GET /api/blogs, POST /api/blogs
│   └── [id]/
│       └── route.js                # GET/PUT/DELETE /api/blogs/[id]
├── chat/
│   └── route.js                    # POST /api/chat (AI Chatbot)
├── loker/
│   └── scrape/
│       └── route.js                # POST /api/loker/scrape
└── uploads/
    └── route.js                    # POST /api/uploads (File upload)
```

### `/components` - Reusable Components

```
components/
├── AboutSection.jsx              # About section component
├── AIChatbot.jsx                # AI chatbot interface
├── DeveloperProjectClient.jsx    # Project showcase
├── FeaturedTeachingSection.jsx   # Featured courses
├── Footer.jsx                    # Site footer
├── Header.jsx                    # Navigation header
├── HeroSection.jsx               # Hero section
├── LayoutWrapper.jsx             # Layout wrapper
├── PageTracker.jsx               # Page analytics
├── PenelitianPengabdianClient.jsx # Research & service
├── ProfessionalCV.jsx            # CV display
├── QuillEditor.jsx               # Rich text editor
├── RecentActivity.jsx            # Activity feed
├── RecentLecturer.jsx            # Course listing
├── RecentPostsSection.jsx        # Blog posts preview
├── RecentProject.jsx             # Project showcase
├── RecentPublications.jsx        # Publications preview
├── Skeleton.jsx                  # Loading skeleton
└── TechStackSection.jsx          # Technology stack display
```

### `/config` - Configuration

```
config/
└── supabaseClient.js             # Supabase client initialization
```

**Key:** Browser-side Supabase client for client components.

### `/database` - Database Schemas

```
database/
├── create_tables.sql                    # Main schema definition
├── rls_policies.sql                     # Row-level security policies
├── add_description_to_job_vacancies.sql # Migration script
├── add_kpi_columns_to_publications.sql  # Migration script
└── seeders.sql                          # Sample data
```

**Key:** All SQL scripts for database setup and migrations.

### `/lib` - Utilities

```
lib/
└── sequelize.js                  # Database connection utilities
```

### `/utils` - Utility Functions

```
utils/
├── tracker.js                    # Page view tracking
└── supabase/
    └── server.js                 # Server-side Supabase client
```

**Key:** Utility functions and Supabase server initialization.

### `/public` - Static Assets

```
public/
└── llms.txt                      # LLM configuration
```

---

## Component Hierarchy

### Layout Hierarchy

```
layout.js (Root)
├── Header (Navigation)
├── SupabaseProvider (Auth Context)
├── Main Content
│   ├── Page Content
│   ├── Nested Layouts (in /manage/dashboard/)
│   └── Dynamic Pages ([slug], [id])
└── Footer
```

### Key Component Dependencies

**Header.jsx** (Navigation)
- Displays navigation menu
- Theme toggle (light/dark mode)
- Mobile menu handling
- Links to all main sections

**LayoutWrapper.jsx** (Page Layout)
- Wrapper for consistent page structure
- Manages page margins and padding
- Responsive grid system

**Footer.jsx** (Footer Content)
- Footer navigation
- Social links
- Copyright information

**AIChatbot.jsx** (Chatbot)
- Floating chat interface
- Integrates with `/api/chat` endpoint
- Gemini AI backend

**QuillEditor.jsx** (Content Editing)
- Rich text editor
- Used in blog and publication management
- Client-side component

**Skeleton.jsx** (Loading State)
- Loading placeholder component
- Used for async content loading

### Section Components (Reusable)

- **RecentPostsSection**: Blog preview
- **RecentPublications**: Publication listing
- **RecentProject**: Project showcase
- **RecentActivity**: Activity feed
- **RecentLecturer**: Course listing
- **HeroSection**: Landing page hero
- **AboutSection**: About section
- **TechStackSection**: Tech stack display

---

## Page Routing Structure

### Public Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `page.js` | Home page |
| `/about` | `about/page.jsx` | About section |
| `/project` | `project/page.jsx` | Projects listing |
| `/project/[slug]` | `project/[slug]/page.jsx` | Project details |
| `/publications` | `publications/page.jsx` | Publications listing |
| `/publications/[slug]` | `publications/[slug]/page.jsx` | Publication details |
| `/blog` | `blog/page.jsx` | Blog listing |
| `/blog/[slug]` | `blog/[slug]/page.jsx` | Blog post |
| `/activity` | `activity/page.jsx` | Activities listing |
| `/activity/[slug]` | `activity/[slug]/page.jsx` | Activity details |
| `/teaching` | `teaching/page.jsx` | Teaching materials |
| `/teaching/[id]` | `teaching/[id]/page.jsx` | Course details |
| `/penelitian` | `penelitian/page.jsx` | Research overview |
| `/pengabdian` | `pengabdian/page.jsx` | Community service |
| `/lecturer` | `lecturer/page.jsx` | Lecturer info |
| `/loker` | `loker/page.jsx` | Job listings |
| `/contact` | `contact/page.jsx` | Contact form |

### Protected Routes (Admin)

| Route | Component | Purpose | Auth Required |
|-------|-----------|---------|----------------|
| `/manage` | `manage/page.jsx` | Manage home | Yes |
| `/manage/dashboard` | `manage/dashboard/page.jsx` | Dashboard | Yes |
| `/manage/dashboard/blogs` | `dashboard/blogs/page.jsx` | Manage blogs | Yes |
| `/manage/dashboard/publications` | `dashboard/publications/page.jsx` | Manage publications | Yes |
| `/manage/dashboard/projects` | `dashboard/projects/page.jsx` | Manage projects | Yes |
| `/manage/dashboard/activities` | `dashboard/activities/page.jsx` | Manage activities | Yes |
| `/manage/dashboard/teaching` | `dashboard/teaching/page.jsx` | Manage courses | Yes |
| `/manage/dashboard/awards` | `dashboard/awards/page.jsx` | Manage awards | Yes |
| `/manage/dashboard/loker` | `dashboard/loker/page.jsx` | Manage job listings | Yes |

---

## API Endpoint Map

### Authentication

```
POST /api/auth/login
├── Request: { email, password }
├── Response: { user, session }
└── Purpose: Sign in user
```

### Blogs

```
GET /api/blogs?page=0
├── Query: page (pagination)
└── Response: { blogs[], totalCount }

POST /api/blogs
├── Request: { title, content, author, status }
├── Auth: Required
└── Response: { blog }

GET /api/blogs/[id]
├── Response: { blog }
└── Purpose: Get single blog

PUT /api/blogs/[id]
├── Auth: Required
├── Request: { title, content, status, ... }
└── Response: { blog }

DELETE /api/blogs/[id]
├── Auth: Required
└── Purpose: Delete blog
```

### Chat (AI Chatbot)

```
POST /api/chat
├── Request: { messages[] }
├── Response: { response }
└── Purpose: Chat with AI assistant
```

### File Upload

```
POST /api/uploads
├── Request: FormData { file }
├── Auth: Required
├── Response: { url }
└── Purpose: Upload file to Supabase storage
```

### Job Scraping

```
POST /api/loker/scrape
├── Purpose: Scrape job vacancies
└── Response: { jobs[] }
```

---

## Database Schema

### Core Tables

#### users
```sql
id (UUID, PK)
name (VARCHAR)
email (VARCHAR, UNIQUE)
password (VARCHAR)
photo (VARCHAR)
title (VARCHAR)
institution (VARCHAR)
biography (TEXT)
social_links (JSONB)
created_at (TIMESTAMPTZ)
```

#### teaching
```sql
id (BIGINT, PK)
user_id (UUID, FK)
course_name (VARCHAR)
semester (VARCHAR)
credits (INT)
description (TEXT)
syllabus_file (VARCHAR)
created_at (TIMESTAMPTZ)
```

#### publications
```sql
id (BIGINT, PK)
user_id (UUID, FK)
title (VARCHAR)
year (INT)
type (ENUM: Journal|Conference|Book Chapter|Proceeding)
publisher (VARCHAR)
doi (VARCHAR)
link (VARCHAR)
abstract (TEXT)
authors (TEXT)
cover_image (VARCHAR)
created_at (TIMESTAMPTZ)
```

#### research_projects
```sql
id (BIGINT, PK)
user_id (UUID, FK)
title (VARCHAR)
year_start (INT)
year_end (INT)
funding_source (VARCHAR)
role (VARCHAR)
abstract (TEXT)
created_at (TIMESTAMPTZ)
```

#### projects
```sql
id (BIGINT, PK)
user_id (UUID, FK)
title (VARCHAR)
slug (VARCHAR, UNIQUE)
description (TEXT)
technologies (TEXT)
link (VARCHAR)
image (VARCHAR)
created_at (TIMESTAMPTZ)
```

#### blogs
```sql
id (BIGINT, PK)
user_id (UUID, FK)
title (VARCHAR)
slug (VARCHAR, UNIQUE)
content (TEXT)
status (ENUM: draft|published)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

#### gallery
```sql
id (BIGINT, PK)
user_id (UUID, FK)
title (VARCHAR)
image (VARCHAR)
category (ENUM)
created_at (TIMESTAMPTZ)
```

### Enum Types

```sql
publication_type: Journal | Conference | Book Chapter | Proceeding
gallery_category: Teaching | Research | Community Service | Award | Event
blog_status: draft | published
```

### Relationships

```
users (1) ──→ (N) teaching
users (1) ──→ (N) publications
users (1) ──→ (N) research_projects
users (1) ──→ (N) community_services
users (1) ──→ (N) awards
users (1) ──→ (N) projects
users (1) ──→ (N) gallery
users (1) ──→ (N) blogs
blogs (1) ──→ (N) blog_comments
```

---

## Configuration Files

### next.config.mjs
- Image optimization for Supabase storage
- Server actions configuration
- Output format: standalone

### jsconfig.json
- Path alias: `@/*` → project root
- Enables clean imports like `@/components/Header`

### tailwind.config.js
- Tailwind CSS configuration
- Custom colors and theme

### postcss.config.mjs
- PostCSS plugins for CSS processing
- Tailwind CSS integration

### eslint.config.mjs
- ESLint rules
- Next.js config preset

---

## Key Architectural Decisions

### 1. **App Router (Next.js 16)**
- Modern file-based routing
- Server and client components
- Simplified API routes

### 2. **Supabase for Backend**
- PostgreSQL database
- Built-in authentication
- File storage (S3-compatible)
- Real-time capabilities

### 3. **Component-Based Structure**
- Reusable components in `/components`
- Page-specific components co-located with pages
- Clear separation of concerns

### 4. **Utility Functions**
- Centralized in `/utils` and `/lib`
- Reusable across components and pages

### 5. **Environment-Based Configuration**
- `.env.local` for sensitive data
- `NEXT_PUBLIC_*` prefix for client-side variables

---

## Data Flow

### Content Display Flow

```
User Request → Next.js Page → Supabase Query → Component Render → Browser
```

### Content Management Flow

```
Admin Form → API Route → Supabase Insert/Update → Database → Component Update
```

### Authentication Flow

```
Login Form → /api/auth/login → Supabase Auth → Session Cookie → Redirect Dashboard
```

---

**Next:** Read [03-FEATURES.md](03-FEATURES.md) for detailed feature documentation.
