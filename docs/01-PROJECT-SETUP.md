# Project Setup & Installation Guide

**Last Updated:** 2026-07-07

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Node.js**: Version 18.x or later (LTS recommended)
- **npm**: Version 9.x or later (or Yarn 3.x+)
- **Git**: For cloning the repository
- **Supabase Account**: For database and authentication services
- **Text Editor**: VS Code recommended

### Verify Prerequisites
```bash
# Check Node.js version
node --version  # Should output v18.x.x or higher

# Check npm version
npm --version   # Should output 9.x.x or higher

# Check Git installation
git --version
```

---

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository_url>
cd portofolio
```

### 2. Install Dependencies
```bash
npm install
# or with Yarn
yarn install
```

This will install all required packages listed in `package.json`:
- **Next.js 16.2.7**: React framework for production
- **React 19.2.3**: UI library
- **Supabase JS SDK**: Database and auth client
- **Tailwind CSS 4**: Utility-first CSS framework
- **React Quill**: Rich text editor
- **date-fns 4.1.0**: Date utility library

### 3. Create Environment Configuration File
```bash
# Copy environment template
cp .env.example .env.local  # If .env.example exists, or create manually
```

### 4. Verify Installation
```bash
npm run dev
```

The application should now be running at `http://localhost:3000`.

---

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Database Configuration
SUPABASE_BUCKET=your_storage_bucket_name

# AI Chatbot (Optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Server-side Supabase (Optional, for additional functionality)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### How to Get Supabase Credentials

1. **Create a Supabase Account**
   - Visit [https://supabase.com](https://supabase.com)
   - Sign up or log in

2. **Create a New Project**
   - Click "New Project"
   - Select region (e.g., Singapore for Asia)
   - Set a secure password
   - Wait for project to initialize

3. **Get API Keys**
   - Navigate to **Settings → API**
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key (if needed) → `SUPABASE_SERVICE_ROLE_KEY`

4. **Get Gemini API Key** (Optional, for AI Chatbot)
   - Visit [https://ai.google.dev/](https://ai.google.dev/)
   - Click "Get API Key"
   - Create new API key in Google Cloud Console
   - Copy and paste in `.env.local`

### Environment Variables Explanation

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key for client-side auth | Yes | `eyJhbGc...` |
| `SUPABASE_BUCKET` | Storage bucket name for file uploads | Yes | `portfolio-uploads` |
| `GEMINI_API_KEY` | Google Gemini API for AI chatbot | No | `AIzaSy...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin-level Supabase access | No | `eyJhbGc...` |

---

## Database Setup

### 1. Create Database Tables

1. **Access Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** in the sidebar
   - Click "New Query"

2. **Run Database Schema Script**
   - Open [database/create_tables.sql](../database/create_tables.sql)
   - Copy the entire content
   - Paste into Supabase SQL Editor
   - Click "Execute"

3. **Run RLS Policies** (Security)
   - Open [database/rls_policies.sql](../database/rls_policies.sql)
   - Execute in SQL Editor

### 2. Create Storage Bucket

1. **Navigate to Storage**
   - Go to Supabase Dashboard → **Storage**
   - Click "New Bucket"

2. **Create Bucket**
   - **Name**: `portfolio-uploads`
   - **Privacy**: Public (for file access)
   - Click "Create Bucket"

3. **Enable CORS** (if needed)
   - Go to bucket settings
   - Add your domain(s) to CORS configuration
   - Save

### 3. Database Schema Overview

The project uses the following main tables:

- **users**: User profiles connected to auth
- **educations**: Educational background
- **teaching**: Courses and teaching materials
- **publications**: Research publications
- **research_projects**: Research project details
- **community_services**: Community service activities
- **awards**: Awards and recognitions
- **projects**: Portfolio projects
- **gallery**: Image gallery
- **blogs**: Blog posts
- **blog_comments**: Blog post comments
- **contacts**: Contact form submissions
- **page_views**: Analytics tracking

### 4. Optional: Seed Database

If seed data is available:

```bash
# Run seeder script in SQL Editor
# Copy content from database/seeders.sql
```

---

## Verification

### Test Development Server

```bash
# Start development server
npm run dev

# Expected output:
# ✔ ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Verify Supabase Connection

1. Open browser to `http://localhost:3000`
2. Navigate to a page that loads data (e.g., Blog or Publications)
3. Check browser console (F12) for errors
4. Network tab should show successful requests to Supabase

### Test Authentication

1. If login feature exists, test sign-in flow
2. Check browser DevTools → Application → Cookies
3. Should see `sb-...` cookies for Supabase session

---

## Troubleshooting

### "Cannot find module" Errors

**Symptom**: `Module not found: Can't resolve '@/...'`

**Solution**:
```bash
# Clear Next.js cache and node_modules
rm -rf node_modules .next
npm install
npm run dev
```

### Supabase Connection Error

**Symptom**: `Error: Missing Supabase URL or Anon Key`

**Solution**:
1. Verify `.env.local` exists in project root
2. Confirm all Supabase credentials are correct
3. Check for trailing spaces in `.env.local`
4. Restart development server

### Port 3000 Already in Use

**Symptom**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Option 1: Use different port
npm run dev -- -p 3001

# Option 2: Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Storage Bucket Not Found

**Symptom**: `Upload failed - Bucket not found`

**Solution**:
1. Verify bucket exists in Supabase Storage
2. Check `SUPABASE_BUCKET` env variable matches bucket name
3. Ensure bucket is set to "Public" privacy
4. Restart development server

### RLS (Row Level Security) Policy Issues

**Symptom**: `new row violates row-level security policy` or `permission denied`

**Solution**:
1. Run RLS policy scripts from [database/rls_policies.sql](../database/rls_policies.sql)
2. Check Supabase dashboard → Authentication tab
3. Verify user has correct role assignments

### Build Errors

**Symptom**: `npm run build` fails with errors

**Solution**:
```bash
# Clean build
rm -rf .next
npm run build

# If still failing, check for TypeScript errors
npm run lint
```

---

## Next Steps

After successful setup:

1. **Review Configuration**: Check [next.config.mjs](../next.config.mjs) for image optimization settings
2. **Customize Content**: Update user profile in Supabase database
3. **Add Content**: Use admin dashboard to add publications, projects, etc.
4. **Configure Domain**: Prepare for deployment to production
5. **Read API Documentation**: See [06-API-DOCUMENTATION.md](06-API-DOCUMENTATION.md) for API endpoints

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start development server

# Production
npm run build           # Create production build
npm start              # Start production server

# Linting
npm run lint           # Run ESLint checks

# Clean installation
npm ci                 # Clean install from package-lock.json
```

---

**Need Help?** Check the [07-MAINTENANCE.md](07-MAINTENANCE.md) file for common issues and solutions.
