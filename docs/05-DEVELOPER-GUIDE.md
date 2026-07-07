# Developer Guide

**Last Updated:** 2026-07-07

## Table of Contents
- [Code Conventions](#code-conventions)
- [Component Creation Patterns](#component-creation-patterns)
- [Adding New Pages & Features](#adding-new-pages--features)
- [State Management](#state-management)
- [Styling with Tailwind](#styling-with-tailwind)
- [Best Practices](#best-practices)

---

## Code Conventions

### File Naming

**Pages:**
- Use PascalCase for component files
- Keep file names descriptive
- Examples: `BlogList.jsx`, `PublicationDetail.jsx`

```
✓ Good
app/blog/page.jsx
app/project/[slug]/page.jsx

✗ Poor
app/blog/blog-page.jsx
app/project/details.jsx
```

**Components:**
- PascalCase for component files (start with uppercase)
- One component per file (unless very small)

```
components/
  ✓ Header.jsx
  ✓ BlogCard.jsx
  ✗ header.jsx
  ✗ blog-card.jsx
```

**Utilities:**
- camelCase for utility function files

```
utils/
  ✓ tracker.js
  ✓ supabase/server.js
  ✗ Tracker.js
  ✗ SupabaseServer.js
```

### Import Organization

**Order imports** in the following sequence:

```jsx
// 1. External dependencies
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 2. Absolute imports (path aliases)
import { supabase } from '@/config/supabaseClient';
import Header from '@/components/Header';

// 3. Relative imports
import { trackPageView } from '../utils/tracker';

// 4. Type imports (if using TypeScript)
import type { Blog } from '@/types/blog';
```

### Code Style

**Formatting:**
- 2 spaces for indentation
- No trailing semicolons (optional)
- Use const by default, let only when needed
- Avoid var

**Variable Naming:**
```javascript
// ✓ Good
const userName = 'John';
const isLoading = false;
const userList = [];
const handleClick = () => {};

// ✗ Poor
const user_name = 'John';
const loading = false;
const user = [];
const onClick = () => {};
```

**Function Naming:**
```javascript
// ✓ Good
const fetchBlogs = async () => {};
const formatDate = (date) => {};
const isValidEmail = (email) => {};

// ✗ Poor
const get_blogs = async () => {};
const format_date = (date) => {};
const checkEmail = (email) => {};
```

### Comments & Documentation

**Use comments sparingly** - code should be self-explanatory:

```javascript
// ✓ Good - explains why, not what
const fetchBlogs = async () => {
  // Pagination prevents loading too many posts at once
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .range(0, 9);
  
  return { data, error };
};

// ✗ Poor - explains what code does (obvious)
const fetchBlogs = async () => {
  // Get blogs from supabase
  const { data, error } = await supabase // Get data and error
    .from('blogs') // From blogs table
    .select('*') // Select all
    .range(0, 9); // First 10
  
  return { data, error };
};
```

**JSDoc for reusable functions:**

```javascript
/**
 * Fetches paginated blog posts from the database
 * @param {number} page - Page number (0-indexed)
 * @param {number} perPage - Posts per page (default: 10)
 * @returns {Promise<{data: Array, error: Error}>}
 */
const fetchBlogs = async (page = 0, perPage = 10) => {
  // Implementation
};
```

---

## Component Creation Patterns

### Client Components

Use `'use client'` directive when component needs interactivity:

```jsx
'use client';

import { useState } from 'react';

export default function BlogForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Blog title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Blog content"
      />
      <button type="submit">Publish</button>
    </form>
  );
}
```

### Server Components

Default components are server components (no `'use client'`):

```jsx
import { createSupabaseServerClient } from '@/utils/supabase/server';

export default async function BlogList() {
  const supabase = await createSupabaseServerClient();
  
  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      {blogs?.map((blog) => (
        <div key={blog.id}>{blog.title}</div>
      ))}
    </div>
  );
}
```

### Reusable Component Pattern

Create modular components that accept props:

```jsx
// ✓ Good - reusable
export function BlogCard({ blog, onDelete }) {
  return (
    <article className="card">
      <h2>{blog.title}</h2>
      <p>{blog.excerpt}</p>
      <button onClick={() => onDelete(blog.id)}>Delete</button>
    </article>
  );
}

// Usage
<BlogCard 
  blog={blogData} 
  onDelete={handleDelete} 
/>

// ✗ Poor - tightly coupled to specific blog
export function SpecificBlog() {
  return (
    <article className="card">
      <h2>Specific Blog Title</h2>
      <p>Hardcoded content</p>
      <button onClick={() => console.log('Delete')}>Delete</button>
    </article>
  );
}
```

### Error Boundaries

Implement error handling in components:

```jsx
'use client';

import { useState, useEffect } from 'react';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blogs');
        if (!res.ok) throw new Error('Failed to fetch');
        const { blogs } = await res.json();
        setBlogs(blogs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {blogs.map((blog) => (
        <div key={blog.id}>{blog.title}</div>
      ))}
    </div>
  );
}
```

---

## Adding New Pages & Features

### Adding a New Public Page

**Step 1: Create page file**

```
app/new-section/page.jsx
```

**Step 2: Implement page component**

```jsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'New Section - M. Taufiq',
  description: 'Description of new section'
};

export default function NewSectionPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-8">New Section</h1>
          {/* Content */}
        </div>
      </main>
      <Footer />
    </>
  );
}
```

**Step 3: Add navigation link**

Edit `components/Header.jsx`:

```jsx
const navLinks = [
  { href: "/project", label: "Proyek Riset" },
  { href: "/new-section", label: "New Section" },
  // ... other links
];
```

### Adding a Dynamic Route

**Step 1: Create route folder**

```
app/blog/[slug]/page.jsx
```

**Step 2: Implement dynamic page**

```jsx
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function generateMetadata({ params }) {
  const supabase = await createSupabaseServerClient();
  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', params.slug)
    .single();

  return {
    title: blog?.title || 'Blog - M. Taufiq',
  };
}

export default async function BlogPost({ params }) {
  const supabase = await createSupabaseServerClient();
  
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !blog) notFound();

  return (
    <div>
      <h1>{blog.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  );
}
```

### Adding a New API Endpoint

**Step 1: Create route file**

```
app/api/new-endpoint/route.js
```

**Step 2: Implement API handler**

```javascript
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';

// GET handler
export async function GET(request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('table_name')
      .select('*');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const { data, error } = await supabase
      .from('table_name')
      .insert([body])
      .select();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
```

### Adding Admin Dashboard Section

**Step 1: Create management page**

```
app/manage/dashboard/new-section/page.jsx
```

**Step 2: Implement admin interface**

```jsx
'use client';

import { useState, useEffect } from 'react';

export default function ManageNewSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/new-endpoint');
      const { data } = await res.json();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    const res = await fetch('/api/new-endpoint', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    const { data } = await res.json();
    setItems([...items, data]);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage New Section</h1>
      {/* Create form */}
      {/* List of items */}
    </div>
  );
}
```

**Step 3: Add sidebar link**

Edit `app/manage/dashboard/layout.jsx` to include navigation.

---

## State Management

### Local Component State

For simple state within a single component:

```jsx
'use client';

import { useState } from 'react';

export function TodoItem() {
  const [completed, setCompleted] = useState(false);

  return (
    <div>
      <input
        type="checkbox"
        checked={completed}
        onChange={(e) => setCompleted(e.target.checked)}
      />
      <span className={completed ? 'line-through' : ''}>
        Todo item
      </span>
    </div>
  );
}
```

### Lifting State Up

When multiple components need same state:

```jsx
'use client';

import { useState } from 'react';

export function TodoList() {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, completed: false }]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div>
      <TodoInput onAdd={addTodo} />
      <TodoItems todos={todos} onToggle={toggleTodo} />
    </div>
  );
}

export function TodoInput({ onAdd }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}
```

### Server-Side Data Fetching

For data that doesn't need real-time updates:

```jsx
// Server component - data fetched at build/request time
import { createSupabaseServerClient } from '@/utils/supabase/server';

export default async function BlogList() {
  const supabase = await createSupabaseServerClient();

  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      {blogs?.map(blog => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}
```

### Combining Server & Client State

```jsx
// Server component - fetches data
import BlogListClient from '@/components/BlogListClient';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export default async function BlogPage() {
  const supabase = await createSupabaseServerClient();

  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  // Pass data to client component for interactivity
  return <BlogListClient initialBlogs={blogs} />;
}

// Client component - handles interactivity
'use client';

import { useState } from 'react';

export default function BlogListClient({ initialBlogs }) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [filter, setFilter] = useState('all');

  const filteredBlogs = blogs.filter(blog =>
    filter === 'all' ? true : blog.status === filter
  );

  return (
    <div>
      <select onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
      
      {filteredBlogs.map(blog => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}
```

---

## Styling with Tailwind

### Tailwind CSS Classes

Use Tailwind utility classes for styling:

```jsx
// ✓ Good - Tailwind utilities
export function BlogCard({ blog }) {
  return (
    <article className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {blog.title}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {blog.excerpt}
      </p>
      <a
        href={`/blog/${blog.slug}`}
        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold"
      >
        Read More →
      </a>
    </article>
  );
}

// ✗ Poor - inline styles
export function BlogCard({ blog }) {
  return (
    <article style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '24px',
      marginBottom: '16px'
    }}>
      {/* ... */}
    </article>
  );
}
```

### Responsive Design

Use Tailwind breakpoints:

```jsx
export function Hero() {
  return (
    <section className="
      px-4 py-8          // Mobile
      sm:px-6 sm:py-12   // Small devices
      md:px-8 md:py-16   // Medium devices
      lg:px-12 lg:py-24  // Large devices
    ">
      <h1 className="
        text-3xl           // Mobile
        sm:text-4xl        // Small
        md:text-5xl        // Medium
        lg:text-6xl        // Large
        font-bold
      ">
        Responsive Heading
      </h1>
    </section>
  );
}
```

### Dark Mode Support

Use `dark:` prefix for dark mode styles:

```jsx
export function Card({ title, content }) {
  return (
    <div className="
      bg-white dark:bg-gray-900
      text-gray-900 dark:text-white
      border border-gray-200 dark:border-gray-700
      rounded-lg
      p-6
    ">
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{content}</p>
    </div>
  );
}
```

### Utility Class Organization

Keep classes organized for readability:

```jsx
// ✓ Good - organized by type
<div className="
  /* Layout */
  flex items-center justify-between
  /* Spacing */
  p-4 mb-6
  /* Colors */
  bg-white dark:bg-gray-900
  border border-gray-200 dark:border-gray-700
  /* Text */
  text-gray-900 dark:text-white
  /* Effects */
  rounded-lg shadow-md
">
  {/* Content */}
</div>
```

---

## Best Practices

### 1. Keep Components Small

```jsx
// ✓ Good - single responsibility
export function BlogTitle({ title }) {
  return <h1 className="text-3xl font-bold">{title}</h1>;
}

// ✗ Poor - too many responsibilities
export function BlogComponent() {
  return (
    <div>
      <h1>{blog.title}</h1>
      <img src={blog.image} />
      <p>{blog.content}</p>
      <button onClick={handleDelete}>Delete</button>
      {/* ... 100 more lines */}
    </div>
  );
}
```

### 2. Use Error Boundaries

Wrap components that might fail:

```jsx
export function SafeComponent() {
  const [error, setError] = useState(null);

  const handleAsync = async () => {
    try {
      // Do something
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <p>Error: {error}</p>;
  return <div>{/* component */}</div>;
}
```

### 3. Memoize Expensive Components

Use React.memo for components that render frequently with same props:

```jsx
import { memo } from 'react';

// ✓ Good - memoized expensive component
const BlogCard = memo(function BlogCard({ blog }) {
  return (
    // Expensive rendering
  );
});

export default BlogCard;
```

### 4. Use Constants for Magic Numbers

```jsx
// ✗ Poor
const { data } = await supabase
  .from('blogs')
  .select('*')
  .range(0, 9);

// ✓ Good
const POSTS_PER_PAGE = 10;
const { data } = await supabase
  .from('blogs')
  .select('*')
  .range(0, POSTS_PER_PAGE - 1);
```

### 5. Validate Input Data

```jsx
// ✓ Good - validate before use
export function createBlog(formData) {
  if (!formData.title?.trim()) {
    throw new Error('Title is required');
  }
  
  if (!formData.content?.trim()) {
    throw new Error('Content is required');
  }

  return supabase.from('blogs').insert([formData]);
}
```

### 6. Use Consistent Error Handling

```jsx
// API route pattern
try {
  const result = await operation();
  return NextResponse.json({ success: true, data: result });
} catch (err) {
  console.error('Operation failed:', err);
  return NextResponse.json(
    { error: err.message },
    { status: 500 }
  );
}
```

### 7. Document Complex Logic

```jsx
/**
 * Calculates page range for database query
 * @param {number} page - Current page (0-indexed)
 * @param {number} pageSize - Items per page
 * @returns {[number, number]} [start, end] for Supabase range()
 */
function calculatePageRange(page, pageSize = 10) {
  const start = page * pageSize;
  const end = start + pageSize - 1;
  return [start, end];
}
```

---

**Next:** Read [06-API-DOCUMENTATION.md](06-API-DOCUMENTATION.md) for detailed API endpoint documentation.
