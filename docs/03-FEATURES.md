# Feature Documentation

**Last Updated:** 2026-07-07

## Table of Contents
- [Authentication & Authorization](#authentication--authorization)
- [Content Management](#content-management)
- [Admin Dashboard](#admin-dashboard)
- [Job Scraping System](#job-scraping-system)
- [AI Chatbot](#ai-chatbot)
- [File Upload System](#file-upload-system)
- [Analytics Tracking](#analytics-tracking)

---

## Authentication & Authorization

### Overview

The project uses **Supabase Authentication** with email/password authentication. Auth state is managed via the Supabase Provider in the root layout.

### Login Flow

**Location:** `/manage` (admin dashboard)

```
User enters credentials
    ↓
POST /api/auth/login
    ↓
Supabase Auth validates
    ↓
Session created (cookie-based)
    ↓
Redirect to /manage/dashboard
```

### Implementation

**API Endpoint:**
```javascript
// app/api/auth/login/route.js
POST /api/auth/login
Body: { email: string, password: string }
Response: { user: Object } or { error: string }
```

**Usage in Components:**
```jsx
// Using Supabase client in client component
'use client';
import { supabase } from '@/config/supabaseClient';

export function LoginForm() {
  const handleLogin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) console.error('Login failed:', error);
  };
  
  return (/* form JSX */);
}
```

### Authentication Provider

**Location:** `app/supabase-provider.jsx`

The `SupabaseProvider` wraps the entire app and:
- Initializes Supabase client
- Listens to auth state changes
- Refreshes router on auth changes
- Provides session context

```jsx
'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SupabaseProvider({ children }) {
    const [supabase] = useState(() =>
        createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
    )

    const router = useRouter()

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            router.refresh()
        })

        return () => subscription?.unsubscribe()
    }, [supabase, router])

    return children
}
```

### Authorization Patterns

**Server-Side Auth Check:**
```javascript
// app/api/[endpoint]/route.js
const supabase = await createSupabaseServerClient();
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Client-Side Auth Check:**
```jsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';
import { useRouter } from 'next/navigation';

export function ProtectedComponent() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/');
      setUser(user);
    };
    getUser();
  }, [router]);

  if (!user) return <p>Loading...</p>;
  return <div>Protected content</div>;
}
```

---

## Content Management

### Blog Management

**Database Table:** `blogs`

**Fields:**
- `id`: Unique identifier
- `user_id`: Author reference
- `title`: Blog title
- `slug`: URL-friendly title
- `content`: Rich text content (HTML)
- `status`: 'draft' or 'published'
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Features:**
- Rich text editing with QuillEditor
- Draft/publish states
- Comment system (blog_comments table)
- Pagination support

**Admin Interface:**
- Location: `/manage/dashboard/blogs`
- Create, edit, delete blogs
- Save as draft or publish
- Preview before publishing

**Public Display:**
- List view: `/blog`
- Detail view: `/blog/[slug]`
- Pagination with 10 posts per page

**API Endpoints:**
```
GET /api/blogs?page=0           # List with pagination
POST /api/blogs                 # Create blog
GET /api/blogs/[id]             # Get single blog
PUT /api/blogs/[id]             # Update blog
DELETE /api/blogs/[id]          # Delete blog
```

### Publications Management

**Database Table:** `publications`

**Fields:**
- `id`: Unique identifier
- `user_id`: Author/owner
- `title`: Publication title
- `year`: Year of publication
- `type`: Enum (Journal, Conference, Book Chapter, Proceeding)
- `publisher`: Publisher name
- `doi`: Digital Object Identifier
- `link`: Publication URL
- `abstract`: Publication abstract
- `authors`: List of authors
- `cover_image`: Cover image URL

**Admin Interface:**
- Location: `/manage/dashboard/publications`
- Uses React Quill for rich text abstracts
- Support for multiple publication types
- Image upload for cover

**Public Display:**
- List view: `/publications`
- Detail view: `/publications/[slug]`
- Filterable by type

### Projects Management

**Database Table:** `projects`

**Fields:**
- `id`: Unique identifier
- `user_id`: Project owner
- `title`: Project title
- `slug`: URL-friendly title
- `description`: Project description
- `technologies`: Tech stack (comma-separated)
- `link`: Project URL/repository
- `image`: Project thumbnail

**Admin Interface:**
- Location: `/manage/dashboard/projects`
- Upload project image
- Add multiple technologies
- Link to GitHub/live demo

**Public Display:**
- List view: `/project`
- Detail view: `/project/[slug]`
- Technology badges
- Project showcase grid

### Teaching/Courses Management

**Database Table:** `teaching`

**Fields:**
- `id`: Unique identifier
- `user_id`: Instructor reference
- `course_name`: Course title
- `semester`: Semester info
- `credits`: Course credits
- `description`: Course description
- `syllabus_file`: Syllabus document URL

**Admin Interface:**
- Location: `/manage/dashboard/teaching`
- Manage course materials
- Upload syllabus
- Add course description

**Sub-feature: Teaching Materials**
- Location: `/manage/dashboard/teaching/[id]/materials`
- Upload/manage course materials
- Organize by lecture

**Public Display:**
- List view: `/teaching`
- Detail view: `/teaching/[id]`
- Display materials and syllabus

### Activities Management

**Database Table:** (referenced in schema)

**Features:**
- Track academic activities
- Gallery integration
- Timeline view

**Admin Interface:**
- Location: `/manage/dashboard/activities`
- Add activity events
- Attach photos/gallery

**Public Display:**
- List view: `/activity`
- Detail view: `/activity/[slug]`
- Activity feed on home

### Awards Management

**Database Table:** `awards`

**Features:**
- Track awards and recognitions
- Year and category tracking

**Admin Interface:**
- Location: `/manage/dashboard/awards`
- Add/edit awards
- Category classification

### Research & Community Service

**Database Tables:**
- `research_projects`
- `community_services`

**Pages:**
- `/penelitian` - Research overview
- `/pengabdian` - Community service overview

**Content Includes:**
- Project title and duration
- Funding/organization
- Role and description
- Outcomes and impact

---

## Admin Dashboard

### Dashboard Overview

**Location:** `/manage/dashboard`

**Access:** Requires authentication

### Dashboard Layout

```
Dashboard Home
├── Sidebar Navigation
│   ├── Blogs
│   ├── Publications
│   ├── Projects
│   ├── Teaching
│   ├── Activities
│   ├── Awards
│   └── Job Listings
└── Main Content Area
    └── Admin Section Content
```

### Dashboard Features

#### 1. Blog Management
- **Path:** `/manage/dashboard/blogs`
- **Operations:**
  - Create new blog post
  - Edit existing blogs
  - Delete blogs
  - Preview before publishing
  - Set status (draft/published)
  - Rich text editing with QuillEditor

#### 2. Publication Management
- **Path:** `/manage/dashboard/publications`
- **Operations:**
  - Add publications
  - Edit publication details
  - Upload cover images
  - Categorize by type
  - Add DOI and links

#### 3. Project Management
- **Path:** `/manage/dashboard/projects`
- **Operations:**
  - Create project entries
  - Add project images
  - List technologies
  - Add project links/repositories
  - Edit project details

#### 4. Teaching Management
- **Path:** `/manage/dashboard/teaching`
- **Operations:**
  - Manage courses
  - Upload syllabus
  - Edit course details
  - **Sub-feature:** Manage materials by course ID

#### 5. Activity Management
- **Path:** `/manage/dashboard/activities`
- **Operations:**
  - Add activity entries
  - Attach photos
  - Categorize activities
  - Timeline management

#### 6. Award Management
- **Path:** `/manage/dashboard/awards`
- **Operations:**
  - Record awards
  - Add award details
  - Categorize awards

#### 7. Job Listings Management
- **Path:** `/manage/dashboard/loker`
- **Operations:**
  - View scraped jobs
  - Manage job listings
  - Filter and search jobs

### Dashboard Layout Structure

**Location:** `/manage/dashboard/layout.jsx`

Provides consistent layout for all dashboard pages:
- Sidebar navigation
- Header with user info
- Content area
- Responsive design for mobile

---

## Job Scraping System

### Overview

Automatically scrapes job vacancies from external sources and stores them in the database.

### Implementation

**Endpoint:** `POST /api/loker/scrape`

**Purpose:**
- Scrape job listings from job boards
- Clean and sanitize HTML descriptions
- Remove gender indicators from job titles
- Store in database
- Serve on `/loker` page

### Scraping Features

**HTML Sanitization:**
```javascript
// Remove dangerous elements
- Scripts, styles, iframes
- Event handlers (onclick, etc.)
- JavaScript: links
- Normalize line breaks
```

**Job Title Cleaning:**
```javascript
// Remove gender indicators
"Senior Developer (m/w/d)" → "Senior Developer"
"Manager (f/m/x)" → "Manager"
```

**Data Validation:**
```javascript
- Required fields: title, location, salary
- URL validation
- Content sanitization
- Duplicate detection
```

### Job Listing Display

**Public Page:** `/loker`

**Features:**
- Paginated job listing
- Filter by location/category
- Search functionality
- Direct apply links
- Job details modal/expansion

### Database Schema

```sql
CREATE TABLE job_vacancies (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    title VARCHAR(255),
    location VARCHAR(150),
    company VARCHAR(150),
    salary VARCHAR(100),
    description TEXT,
    url VARCHAR(255),
    source VARCHAR(100),
    posted_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## AI Chatbot

### Overview

AI-powered chatbot using Google Gemini API to answer questions about the portfolio, projects, and professional background.

### Implementation

**Endpoint:** `POST /api/chat`

**Requirements:**
- `GEMINI_API_KEY` environment variable configured
- Google Gemini API access

### Chatbot Features

**System Instructions:**
- Responds as assistant for M. Taufiq, M.Kom
- Knowledgeable about portfolio, projects, research
- Responds in professional, friendly tone
- Defaults to Indonesian language
- Multi-language support

**Context Information (built-in):**
- Biography and background
- Education history (S1, S2, S3)
- Research areas (AI, Cloud Systems)
- Teaching courses
- Publications and projects
- Contact information

### Component Location

**Frontend:** `components/AIChatbot.jsx`

**Features:**
- Floating chat widget
- Message history
- Typing indicators
- Error handling
- Graceful degradation if API not configured

### Usage Example

```jsx
import AIChatbot from '@/components/AIChatbot';

export default function Home() {
  return (
    <div>
      {/* Page content */}
      <AIChatbot />
    </div>
  );
}
```

### API Response Format

```javascript
POST /api/chat
Body: {
  messages: [
    { role: "user", content: "What are your research interests?" },
    { role: "assistant", content: "..." }
  ]
}

Response: {
  response: "Assistant response text"
}
```

### Error Handling

**Missing API Key:**
```
Response: "Maaf, layanan Chatbot AI saat ini belum aktif karena GEMINI_API_KEY belum dikonfigurasi di environment variables server (.env.local)."
```

### Customization

To customize chatbot responses, edit the `systemInstruction` in `/app/api/chat/route.js`.

---

## File Upload System

### Overview

Manages file uploads to Supabase Storage, integrated throughout the application for images, documents, and media.

### Implementation

**Endpoint:** `POST /api/uploads`

**Requirements:**
- User must be authenticated
- `SUPABASE_BUCKET` environment variable configured
- File size limits (server-side)

### Upload Process

```
User selects file
    ↓
POST to /api/uploads with FormData
    ↓
Server validates and converts to buffer
    ↓
Upload to Supabase Storage
    ↓
Generate public URL
    ↓
Return URL to client
```

### API Implementation

```javascript
// app/api/uploads/route.js
export const POST = async (req) => {
    const supabase = await createSupabaseServerClient();
    const form = await req.formData();
    const file = form.get('file');

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, buffer, { contentType: file.type });

    const { data: publicData } = supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(fileName);

    return Response.json({ url: publicData.publicUrl });
};
```

### Client-Side Usage

```jsx
'use client';
import { useState } from 'react';

export function UploadForm() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      const { url } = await res.json();
      setImageUrl(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
}
```

### Storage Configuration

**Bucket Setup:**
1. Create bucket named `portfolio-uploads` in Supabase
2. Set privacy to "Public" for public file access
3. Add CORS configuration for your domain

**Environment Variable:**
```env
SUPABASE_BUCKET=portfolio-uploads
```

### Supported File Types

- **Images:** JPG, PNG, GIF, WebP
- **Documents:** PDF, DOC, DOCX
- **Media:** MP4, WebM (depends on bucket config)

### File Naming

Files are renamed server-side for uniqueness:
```
${Date.now()}_${originalFileName}
```

Example: `1720316400000_resume.pdf`

### Accessing Uploaded Files

Files are publicly accessible via:
```
https://[project].supabase.co/storage/v1/object/public/portfolio-uploads/[fileName]
```

---

## Analytics Tracking

### Overview

Tracks page views and user interactions for analytics.

### Implementation

**Location:** `utils/tracker.js`

**Component:** `components/PageTracker.jsx`

### Page View Tracking

```jsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/utils/tracker';

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView({
      path: pathname,
      title: document.title,
      timestamp: new Date()
    });
  }, [pathname]);

  return null; // Non-visual component
}
```

### Database Storage

**Table:** `page_views`

**Fields:**
- `id`: Unique identifier
- `user_id`: User reference (if logged in)
- `path`: Page path
- `title`: Page title
- `user_agent`: Browser info
- `created_at`: Timestamp

### Analytics Queries

Get popular pages:
```sql
SELECT path, COUNT(*) as views
FROM page_views
GROUP BY path
ORDER BY views DESC;
```

Get daily visits:
```sql
SELECT DATE(created_at) as date, COUNT(*) as visits
FROM page_views
GROUP BY DATE(created_at);
```

---

**Next:** Read [04-DEPLOYMENT.md](04-DEPLOYMENT.md) for deployment instructions.
