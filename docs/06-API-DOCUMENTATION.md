# API Documentation

**Last Updated:** 2026-07-07

## Table of Contents
- [Base URL & Authentication](#base-url--authentication)
- [Authentication Endpoints](#authentication-endpoints)
- [Blog Endpoints](#blog-endpoints)
- [Chat Endpoint](#chat-endpoint)
- [Upload Endpoint](#upload-endpoint)
- [Job Scraping Endpoint](#job-scraping-endpoint)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Base URL & Authentication

### Base URL

All API endpoints are relative to the application root:

```
http://localhost:3000/api
# Production
https://your-domain.com/api
```

### Authentication

Most endpoints require Supabase authentication. Authentication is handled via:

1. **Session Cookies:** Automatically set after login
2. **JWT Token:** In Authorization header (for API access)

**Example with Authorization Header:**
```bash
curl -X GET https://your-domain.com/api/blogs \
  -H "Authorization: Bearer eyJhbGci..."
```

**Example with Cookie (Browser):**
Browser automatically includes session cookie in requests.

---

## Authentication Endpoints

### Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user with email and password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "user_metadata": {}
  }
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid login credentials"
}
```

**Response (Error - 400):**
```json
{
  "error": "Missing credentials"
}
```

**Example Usage:**
```javascript
// Browser/Node.js
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  }),
  credentials: 'include' // Include cookies
});

const { user, error } = await response.json();
if (error) {
  console.error('Login failed:', error);
} else {
  console.log('Logged in as:', user.email);
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## Blog Endpoints

### Get All Blogs

**Endpoint:** `GET /api/blogs`

**Description:** Retrieve paginated list of blogs

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 0 | Page number (0-indexed) |

**Response (Success - 200):**
```json
{
  "blogs": [
    {
      "id": 1,
      "user_id": "uuid",
      "title": "Blog Title",
      "slug": "blog-title",
      "content": "<p>Blog content HTML</p>",
      "status": "published",
      "created_at": "2024-07-01T10:00:00Z",
      "updated_at": "2024-07-01T10:00:00Z"
    }
  ],
  "totalCount": 25
}
```

**Response (Error - 500):**
```json
{
  "error": "Error message"
}
```

**Example Usage:**
```javascript
// Fetch first page (10 posts)
const response = await fetch('/api/blogs?page=0');
const { blogs, totalCount } = await response.json();

console.log(`Total blogs: ${totalCount}`);
console.log(`Fetched ${blogs.length} blogs`);

// Fetch second page
const page2 = await fetch('/api/blogs?page=1');
```

**Curl Example:**
```bash
# Get first page
curl http://localhost:3000/api/blogs?page=0

# Get second page
curl http://localhost:3000/api/blogs?page=1
```

### Create Blog

**Endpoint:** `POST /api/blogs`

**Description:** Create a new blog post (requires authentication)

**Authentication:** Required ✓

**Request:**
```json
{
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "content": "<p>Blog content in HTML</p>",
  "status": "draft"
}
```

**Response (Success - 201):**
```json
{
  "blog": {
    "id": 42,
    "user_id": "uuid",
    "title": "New Blog Post",
    "slug": "new-blog-post",
    "content": "<p>Blog content in HTML</p>",
    "status": "draft",
    "created_at": "2024-07-07T12:00:00Z",
    "updated_at": "2024-07-07T12:00:00Z"
  }
}
```

**Response (Error - 401):**
```json
{
  "error": "Unauthorized"
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid JSON body"
}
```

**Example Usage:**
```javascript
const newBlog = {
  title: "My First Blog Post",
  slug: "my-first-blog-post",
  content: "<p>This is my first blog post.</p>",
  status: "draft"
};

const response = await fetch('/api/blogs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newBlog),
  credentials: 'include'
});

const { blog, error } = await response.json();
```

### Get Single Blog

**Endpoint:** `GET /api/blogs/[id]`

**Description:** Retrieve a single blog by ID

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Blog ID |

**Response (Success - 200):**
```json
{
  "id": 1,
  "user_id": "uuid",
  "title": "Blog Title",
  "slug": "blog-title",
  "content": "<p>Blog content</p>",
  "status": "published",
  "created_at": "2024-07-01T10:00:00Z",
  "updated_at": "2024-07-01T10:00:00Z"
}
```

**Response (Error - 404):**
```json
{
  "error": "Blog not found"
}
```

**Example Usage:**
```javascript
const response = await fetch('/api/blogs/1');
const blog = await response.json();
console.log(blog.title);
```

### Update Blog

**Endpoint:** `PUT /api/blogs/[id]`

**Description:** Update an existing blog (requires authentication)

**Authentication:** Required ✓

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Blog ID |

**Request:**
```json
{
  "title": "Updated Title",
  "content": "<p>Updated content</p>",
  "status": "published"
}
```

**Response (Success - 200):**
```json
{
  "blog": {
    "id": 1,
    "title": "Updated Title",
    "content": "<p>Updated content</p>",
    "status": "published",
    "updated_at": "2024-07-07T12:30:00Z"
  }
}
```

**Example Usage:**
```javascript
const updates = {
  title: "Updated Blog Title",
  content: "<p>Updated content</p>",
  status: "published"
};

const response = await fetch('/api/blogs/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates),
  credentials: 'include'
});

const { blog } = await response.json();
```

### Delete Blog

**Endpoint:** `DELETE /api/blogs/[id]`

**Description:** Delete a blog post (requires authentication)

**Authentication:** Required ✓

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Blog ID |

**Response (Success - 200):**
```json
{
  "message": "Blog deleted successfully"
}
```

**Response (Error - 404):**
```json
{
  "error": "Blog not found"
}
```

**Example Usage:**
```javascript
const response = await fetch('/api/blogs/1', {
  method: 'DELETE',
  credentials: 'include'
});

const result = await response.json();
console.log(result.message);
```

---

## Chat Endpoint

### Send Message to AI Chatbot

**Endpoint:** `POST /api/chat`

**Description:** Send message to AI assistant and receive response

**Authentication:** Not required

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What are your research interests?"
    }
  ]
}
```

**Response (Success - 200):**
```json
{
  "response": "I focus on Artificial Intelligence and Cloud-based Learning systems. My research explores applications of neural networks in educational technology and secure cloud infrastructure for learning platforms."
}
```

**Response (Warning - 200, API Key not configured):**
```json
{
  "response": "Maaf, layanan Chatbot AI saat ini belum aktif karena GEMINI_API_KEY belum dikonfigurasi di environment variables server (.env.local)."
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid request payload. 'messages' array is required."
}
```

**Message Format:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "First question"
    },
    {
      "role": "assistant",
      "content": "Assistant response"
    },
    {
      "role": "user",
      "content": "Follow-up question"
    }
  ]
}
```

**Example Usage:**
```javascript
const chatHistory = [];

async function sendMessage(userMessage) {
  // Add user message to history
  chatHistory.push({
    role: "user",
    content: userMessage
  });

  // Send to API
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: chatHistory })
  });

  const { response: assistantMessage, error } = await response.json();

  if (error) {
    console.error('Chat error:', error);
    return;
  }

  // Add assistant response to history
  chatHistory.push({
    role: "assistant",
    content: assistantMessage
  });

  return assistantMessage;
}

// Usage
await sendMessage("What is your teaching experience?");
await sendMessage("Which courses do you teach?");
```

**Curl Example:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Tell me about your research"
      }
    ]
  }'
```

---

## Upload Endpoint

### Upload File

**Endpoint:** `POST /api/uploads`

**Description:** Upload file to Supabase storage (requires authentication)

**Authentication:** Required ✓

**Content-Type:** `multipart/form-data`

**Request:**
```
Form Data:
  file: <binary file>
```

**Response (Success - 200):**
```json
{
  "url": "https://acbwbhwwloncxbxgyedm.supabase.co/storage/v1/object/public/portfolio-uploads/1720316400000_image.jpg"
}
```

**Response (Error - 400):**
```json
{
  "error": "No file provided"
}
```

**Response (Error - 401):**
```json
{
  "error": "Unauthorized"
}
```

**Response (Error - 500):**
```json
{
  "error": "Upload failed - error message"
}
```

**Example Usage (JavaScript/Fetch):**
```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  const { url } = await response.json();
  return url;
};

// Usage in file input handler
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const url = await uploadFile(file);
    console.log('File uploaded:', url);
    // Use url in form submission, etc
  } catch (err) {
    console.error('Upload failed:', err.message);
  }
};
```

**Example Usage (HTML):**
```html
<form id="uploadForm">
  <input type="file" id="fileInput" required />
  <button type="submit">Upload</button>
</form>

<script>
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = document.getElementById('fileInput').files[0];
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  const { url, error } = await response.json();
  if (url) {
    console.log('Success:', url);
    document.getElementById('uploadForm').reset();
  } else {
    console.error('Error:', error);
  }
});
</script>
```

**Curl Example:**
```bash
curl -X POST http://localhost:3000/api/uploads \
  -F "file=@/path/to/file.jpg" \
  -b "session-cookie"
```

---

## Job Scraping Endpoint

### Scrape Job Listings

**Endpoint:** `GET /api/loker/scrape` | `POST /api/loker/scrape`

**Description:** Scrape job vacancies from external sources (Remotive, Arbeitnow, Jobicy) and delete listings older than 30 days. Supports automated execution via Vercel Cron (`vercel.json`) set to run daily at 17:00 UTC (00:00 WIB).

**Authentication:** Optional Bearer token if `CRON_SECRET` environment variable is configured.

**Response (Success - 200):**
```json
{
  "message": "Berhasil mengambil 35 loker dari sumber. 5 loker baru ditambahkan. 2 loker kadaluarsa (lebih dari 30 hari) telah dihapus.",
  "count": 5,
  "deletedCount": 2
}
```

**Response (Error - 500):**
```json
{
  "error": "Gagal memproses scraping."
}
```

**Features:**
- Supports HTTP `GET` (for automated Vercel Cron triggers) and `POST` (for manual dashboard triggers)
- HTML sanitization (removes scripts, styles, dangerous content)
- Gender indicator removal from job titles
- Duplicate detection & automatic purging of jobs older than 30 days

**Example Usage:**
```javascript
// Manual trigger via POST
const response = await fetch('/api/loker/scrape', {
  method: 'POST'
});
const data = await response.json();
```

**Curl Example:**
```bash
# GET (used by Vercel Cron)
curl http://localhost:3000/api/loker/scrape

# POST (used by Admin Dashboard)
curl -X POST http://localhost:3000/api/loker/scrape
```


---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Status | Meaning | Reason |
|--------|---------|--------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request format or missing required fields |
| 401 | Unauthorized | Authentication required or invalid |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

### Error Handling in Client Code

```javascript
const handleApiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    // Handle HTTP errors
    if (!response.ok) {
      const { error } = await response.json();
      
      if (response.status === 401) {
        // Redirect to login
        window.location.href = '/';
      }
      
      throw new Error(error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('API Error:', err.message);
    throw err;
  }
};

// Usage
try {
  const { blogs } = await handleApiCall('/api/blogs');
} catch (err) {
  // Show error to user
  alert(`Failed to load blogs: ${err.message}`);
}
```

---

## Rate Limiting

### Current Implementation

- **No explicit rate limiting** implemented in API
- **Database limits:** Supabase enforces database connection limits
- **Storage limits:** File upload limited by bucket quota

### Recommended Rate Limiting

For production deployments, consider implementing:

1. **Vercel Rate Limiting:** Built-in to Vercel Pro
2. **Custom Middleware:** Implement in Next.js middleware
3. **Database Quotas:** Set in Supabase project settings

**Example Rate Limit Middleware:**
```javascript
// middleware.js
import { NextResponse } from 'next/server';

const rateLimitMap = new Map();

const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30      // 30 requests per minute
};

export function middleware(request) {
  const ip = request.ip || 'unknown';
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { requests: 0, resetTime: now + RATE_LIMIT.windowMs });
  }

  const entry = rateLimitMap.get(ip);

  if (now > entry.resetTime) {
    entry.requests = 0;
    entry.resetTime = now + RATE_LIMIT.windowMs;
  }

  entry.requests++;

  if (entry.requests > RATE_LIMIT.maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
```

---

## API Testing

### Using cURL

Basic request:
```bash
curl -X GET http://localhost:3000/api/blogs
```

With authentication:
```bash
curl -X POST http://localhost:3000/api/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{"title":"New Blog"}'
```

### Using Postman

1. Import endpoints as collections
2. Set up environment variables for base URL
3. Use Postman's pre-request scripts for auth

### Using JavaScript Fetch

```javascript
// GET request
fetch('/api/blogs')
  .then(res => res.json())
  .then(data => console.log(data));

// POST request with authentication
fetch('/api/blogs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ title: 'New Blog' }),
  credentials: 'include'
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

**Next:** Read [07-MAINTENANCE.md](07-MAINTENANCE.md) for maintenance and troubleshooting.
