# Deployment & DevOps

**Last Updated:** 2026-07-07

## Table of Contents
- [Development Workflow](#development-workflow)
- [Build Process](#build-process)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Migration](#database-migration)
- [Monitoring & Logging](#monitoring--logging)

---

## Development Workflow

### Local Development

**Start Development Server:**
```bash
npm run dev
```

**Server runs on:** `http://localhost:3000`

**Features:**
- Hot reload on code changes
- Fast refresh for React components
- Error overlay for debugging
- Next.js fast refresh preserves component state

### Development Guidelines

**Code Changes:**
1. Create feature branch: `git checkout -b feature/description`
2. Make changes with hot reload testing
3. Test locally before committing
4. Run linter: `npm run lint`

**Database Changes:**
1. Create migration SQL script in `/database`
2. Test in local Supabase instance
3. Document changes
4. Include rollback script if needed

**File Organization:**
- Keep components in `/components` for reusable widgets
- Keep page-specific content in `/app/[section]/`
- Utilities in `/utils` and `/lib`

### Testing

**Current Testing Setup:**
- ESLint for code quality
- Manual browser testing
- Network inspection in DevTools

**Recommended Test Scenarios:**
- Test all CRUD operations on each content type
- Test authentication flow
- Test file uploads
- Test chatbot responses
- Test pagination
- Test responsive design

---

## Build Process

### Production Build

**Create Production Build:**
```bash
npm run build
```

**Build Output:**
- `.next/` directory with optimized code
- Static assets optimization
- JavaScript minification
- CSS purification (Tailwind)

**Build Steps:**
1. Next.js compiles all pages and components
2. Tailwind CSS generates optimized styles
3. Assets are minified and optimized
4. Build artifacts ready for deployment

### Build Configuration

**File:** `next.config.mjs`

```javascript
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'acbwbhwwloncxbxgyedm.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Additional image patterns
    ],
  },
};
```

**Key Settings:**
- `output: 'standalone'` - Creates self-contained build for Docker
- `remotePatterns` - Allows images from Supabase and Google

### Build Optimization

**Image Optimization:**
- Automatic WebP conversion
- Responsive image sizes
- Lazy loading with blur placeholders

**Code Splitting:**
- Automatic route-based code splitting
- Dynamic imports for large components

**Bundle Size:**
```bash
# Analyze bundle size (if using next/bundle-analyzer)
npm run build
```

---

## Production Deployment

### Vercel Deployment (Recommended)

Vercel is the official Next.js hosting platform and recommended for production.

### Step 1: Prepare Repository

```bash
# Ensure code is committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. **Visit:** [https://vercel.com](https://vercel.com)
2. **Click:** "New Project"
3. **Import:** Select your Git repository
4. **Configure:** Vercel auto-detects Next.js
5. **Add Environment Variables:** (see below)
6. **Deploy:** Click "Deploy"

### Step 3: Environment Variables on Vercel

1. Navigate to **Project Settings → Environment Variables**
2. Add all variables from `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL = https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_BUCKET = portfolio-uploads
GEMINI_API_KEY = AIzaSy...
SUPABASE_SERVICE_ROLE_KEY = eyJ... (optional)
```

3. **Production/Preview/Development:** Select appropriate environments
4. **Save** and trigger redeploy

### Step 4: Domain Setup

1. In Vercel Dashboard, go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records at your registrar:
   - Point A record to Vercel's IP
   - Or use CNAME record (recommended)
4. **SSL Certificate:** Automatic via Vercel

### Post-Deployment Verification

```bash
# Test deployed site
curl -I https://your-domain.com

# Should return 200 OK
```

---

### Alternative: Docker Deployment

For custom hosting (AWS, DigitalOcean, self-hosted):

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

**Build and Run:**
```bash
# Build image
docker build -t portofolio:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=<url> \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=<key> \
  -e SUPABASE_BUCKET=portfolio-uploads \
  portofolio:latest
```

**Docker Compose:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_BUCKET=${SUPABASE_BUCKET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
```

---

## Environment Configuration

### Environment Variable Checklist

**Required for All Deployments:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_BUCKET`

**Optional but Recommended:**
- [ ] `GEMINI_API_KEY` (for AI chatbot)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

### Development vs Production

**Development (.env.local):**
```env
# Can include test credentials
NEXT_PUBLIC_SUPABASE_URL=https://[dev-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key
SUPABASE_BUCKET=dev-uploads
```

**Production (Vercel/Hosting):**
```env
# Must use production credentials
NEXT_PUBLIC_SUPABASE_URL=https://[prod-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
SUPABASE_BUCKET=prod-uploads
```

### Staging Environment

For testing before production:

1. **Create staging branch:** `git checkout -b staging`
2. **Create staging Vercel project** (optional):
   - Import same repository on staging domain
   - Use staging Supabase credentials
   - Deploy to `staging.your-domain.com`

---

## Database Migration

### Backup Before Migration

**Export Database:**
```bash
# Using Supabase CLI
supabase db pull  # Downloads schema

# Or via Supabase Dashboard:
# 1. Settings → Database → Backups
# 2. Click "Request backup"
# 3. Download backup file
```

### Migration Process

### Step 1: Create Migration Script

**File:** `database/migration_[date].sql`

```sql
-- Migration: Add new column to publications
-- Date: 2026-07-07
-- Purpose: Add DOI field

BEGIN;

ALTER TABLE public.publications 
ADD COLUMN IF NOT EXISTS doi VARCHAR(255);

COMMIT;
```

### Step 2: Test Migration Locally

1. **Create test database** in local Supabase
2. **Run migration:** Execute SQL in test database
3. **Verify:** Check schema and test queries

### Step 3: Apply to Production

**Via Supabase Dashboard:**
1. Go to **SQL Editor**
2. Click "New Query"
3. Paste migration SQL
4. Review before executing
5. Click "Execute"

**Create Rollback:**
```sql
-- Rollback: Remove doi column
ALTER TABLE public.publications 
DROP COLUMN IF EXISTS doi;
```

### Step 4: Verify Migration

```sql
-- Check table structure
\d public.publications

-- Verify data integrity
SELECT COUNT(*) FROM public.publications;
```

### Common Migrations

**Add Column:**
```sql
ALTER TABLE public.table_name 
ADD COLUMN IF NOT EXISTS column_name TYPE;
```

**Modify Column:**
```sql
ALTER TABLE public.table_name 
ALTER COLUMN column_name TYPE new_type;
```

**Create Index:**
```sql
CREATE INDEX idx_table_column 
ON public.table_name(column_name);
```

**Update Data:**
```sql
UPDATE public.table_name 
SET column = value 
WHERE condition;
```

---

## Monitoring & Logging

### Application Monitoring

**Vercel Analytics:**
1. **Real-time metrics:** Vercel Dashboard
2. **Performance:** Page speed insights
3. **Errors:** Crash reporting

**Error Tracking:**
```javascript
// In next.config.mjs or custom error handler
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});
```

### Database Monitoring

**Supabase Monitor:**
1. **Project Dashboard → Database**
2. **Query performance:** Slow queries log
3. **Storage usage:** Monitor quota
4. **Connections:** Connection count

**View Database Logs:**
```sql
-- Check recent queries
SELECT * FROM pg_stat_statements 
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables 
WHERE schemaname = 'public';
```

### Log Management

**Application Logs:**
```javascript
// Log to console (visible in Vercel Logs)
console.log('Info message');
console.error('Error message');
console.warn('Warning message');

// Structured logging
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  message: 'Event occurred',
  data: { userId, actionId }
}));
```

**View Logs:**
- **Vercel:** Dashboard → Deployments → Function Logs
- **Local:** Terminal where `npm run dev` runs

### Performance Monitoring

**Web Vitals:**
```javascript
// In app/layout.js
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log('Web Vital:', metric);
    
    // Send to analytics service
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(metric),
    });
  });

  return null;
}
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All code committed to main branch
- [ ] No console errors in development
- [ ] All environment variables configured
- [ ] Database schema up to date
- [ ] No breaking changes in dependencies
- [ ] Tested authentication flow
- [ ] Tested file uploads
- [ ] Performance tested (Build time < 10 min)

### During Deployment

- [ ] Vercel build completes successfully
- [ ] No deployment errors
- [ ] Environment variables set correctly
- [ ] Build preview loads without errors

### Post-Deployment

- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] API endpoints respond
- [ ] Authentication works
- [ ] File uploads work
- [ ] Static assets load
- [ ] Images display correctly
- [ ] Mobile responsive
- [ ] No JavaScript errors in console

---

## Rollback Procedure

**If issues occur in production:**

### Quick Rollback (Vercel)

1. **Vercel Dashboard → Deployments**
2. **Find previous stable deployment**
3. **Click deployment → Redeploy**
4. **Confirm rollback**

### Full Rollback

```bash
# Revert code to previous commit
git revert HEAD  # Creates new commit
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

### Database Rollback

If migration caused issues:

1. **Restore from backup:**
   - Supabase Dashboard → Backups
   - Restore from date before migration

2. **Or run rollback SQL:**
   - Execute rollback migration script
   - Verify data integrity

---

## Continuous Deployment

### GitHub Actions (Optional)

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

This enables automatic deployment on every push to main branch.

---

**Next:** Read [05-DEVELOPER-GUIDE.md](05-DEVELOPER-GUIDE.md) for code development guidelines.
