# Maintenance & Troubleshooting

**Last Updated:** 2026-07-07

## Table of Contents
- [Common Issues & Solutions](#common-issues--solutions)
- [Performance Optimization](#performance-optimization)
- [Security Considerations](#security-considerations)
- [Backup & Recovery](#backup--recovery)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Regular Maintenance Tasks](#regular-maintenance-tasks)

---

## Common Issues & Solutions

### 1. Application Won't Start

**Symptom:** `Error: ENOENT: no such file or directory`

**Cause:** Missing dependencies or corrupted node_modules

**Solution:**
```bash
# Clean installation
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Try running again
npm run dev
```

---

### 2. Supabase Connection Failed

**Symptom:** `Error: Missing Supabase URL or Anon Key`

**Cause:** Environment variables not configured

**Solution:**

1. **Verify .env.local exists** in project root
2. **Check file contains:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_BUCKET=portfolio-uploads
   ```
3. **Verify credentials are correct:**
   - Check Supabase Dashboard → Settings → API
   - Copy fresh credentials
4. **Restart development server:**
   ```bash
   npm run dev
   ```

---

### 3. Authentication Not Working

**Symptom:** Login fails, or stays logged out

**Causes & Solutions:**

**Issue 3a: Session not persisting**
```javascript
// Check if cookies are enabled in browser
// DevTools → Application → Cookies
// Should see sb-* cookies after login
```

**Issue 3b: CORS errors**
```javascript
// Error: "Access to XMLHttpRequest blocked by CORS policy"

// Solution: Add redirect URL in Supabase
// Settings → Authentication → Site URL
// Set to: http://localhost:3000 (dev) or https://yourdomain.com (prod)
```

**Issue 3c: Incorrect credentials**
```bash
# Test login with curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "correct-password"
  }'

# Should return user data, not error
```

---

### 4. File Upload Not Working

**Symptom:** Upload fails with error message

**Cause & Solutions:**

**Issue 4a: Bucket not found**
```bash
# Check bucket exists in Supabase Storage
# Should be named "portfolio-uploads"

# Verify SUPABASE_BUCKET environment variable
echo $SUPABASE_BUCKET
# Should output: portfolio-uploads
```

**Issue 4b: Not authenticated**
```javascript
// Upload requires login
// Make sure user is authenticated before uploading

const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  // Redirect to login
  window.location.href = '/manage';
}
```

**Issue 4c: File too large**
```javascript
// Supabase has file size limits
// Check bucket settings → Limits

// Recommended max: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}
```

---

### 5. Database Queries Slow

**Symptom:** Pages load slowly, API responses take > 1 second

**Causes & Solutions:**

**Issue 5a: Missing indexes**
```sql
-- Check existing indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public';

-- Add indexes for frequently queried columns
CREATE INDEX idx_blogs_created_at ON public.blogs(created_at DESC);
CREATE INDEX idx_blogs_user_id ON public.blogs(user_id);
CREATE INDEX idx_blogs_status ON public.blogs(status);
```

**Issue 5b: N+1 queries**
```javascript
// ✗ Bad - separate query for each user
const blogs = await supabase.from('blogs').select('*');
for (let blog of blogs) {
  const user = await supabase.from('users')
    .select('name').eq('id', blog.user_id).single();
}

// ✓ Good - single query with joins
const blogs = await supabase.from('blogs')
  .select('*, users(name)')
  .order('created_at', { ascending: false });
```

**Issue 5c: Large result sets**
```javascript
// ✗ Bad - fetches all records
const { data } = await supabase
  .from('blogs')
  .select('*');

// ✓ Good - pagination
const { data } = await supabase
  .from('blogs')
  .select('*')
  .range(0, 9);  // First 10 records

// Also add limit for safety
.limit(50);
```

---

### 6. Images Not Displaying

**Symptom:** Broken image icons, 404 errors

**Causes & Solutions:**

**Issue 6a: Incorrect image URL**
```javascript
// Wrong format
const url = 'portfolio-uploads/image.jpg';

// Correct format
const url = 'https://project.supabase.co/storage/v1/object/public/portfolio-uploads/image.jpg';
```

**Issue 6b: Image path not whitelisted**
```javascript
// In next.config.mjs, add hostname
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'acbwbhwwloncxbxgyedm.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
  ],
}
```

**Issue 6c: Bucket privacy settings**
```bash
# Image must be in public bucket
# Supabase Dashboard → Storage → Buckets
# Make sure bucket is set to "Public"
```

---

### 7. Build Fails on Deployment

**Symptom:** Vercel build fails with errors

**Solution Steps:**

1. **Check build logs:**
   - Vercel Dashboard → Deployments → Failed build
   - Click "View Function Logs"

2. **Common causes:**
   ```bash
   # Missing environment variable
   Error: Missing NEXT_PUBLIC_SUPABASE_URL
   
   # Solution: Add to Vercel Environment Variables
   
   # TypeScript errors
   Error: Type mismatch in component
   
   # Solution: Run npm run lint locally to find issues
   ```

3. **Test build locally:**
   ```bash
   npm run build
   npm start
   
   # Visit http://localhost:3000
   # Test all critical paths
   ```

---

## Performance Optimization

### 1. Image Optimization

**Current Setup:** Next.js automatic image optimization

```jsx
import Image from 'next/image';

// ✓ Good - optimized
<Image
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority={false}
/>

// ✗ Slow - unoptimized
<img src="/image.jpg" alt="Description" />
```

### 2. Code Splitting

Next.js automatically splits code by page:

```javascript
// Automatic: Each page bundle only includes needed code
// No configuration needed

// Manual dynamic imports for specific cases:
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
});
```

### 3. Database Query Optimization

```sql
-- ✓ Good - uses index
SELECT * FROM blogs 
WHERE user_id = 'uuid' 
ORDER BY created_at DESC 
LIMIT 10;

-- ✗ Slow - full table scan
SELECT * FROM blogs 
WHERE content LIKE '%search-term%';

-- Better - use full-text search
SELECT * FROM blogs 
WHERE content @@ to_tsquery('search-term');
```

### 4. API Response Caching

```javascript
// Cache GET requests for 1 hour
export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const data = await fetchData();
  return Response.json(data);
}
```

### 5. Lazy Loading

```jsx
// Defer non-critical components
import dynamic from 'next/dynamic';

const AIChatbot = dynamic(
  () => import('@/components/AIChatbot'),
  { loading: () => null, ssr: false }
);
```

### 6. Bundle Size Monitoring

```bash
# Check bundle size
npm run build

# Output shows optimized bundle sizes
# Look for unexpectedly large packages
# Use dynamic imports to split large components
```

---

## Security Considerations

### 1. Environment Variables

**Never commit secrets to Git:**

```bash
# ✓ Good - .gitignore
.env.local
.env.*.local

# ✗ Bad - don't commit these
NEXT_PUBLIC_SUPABASE_ANON_KEY in repository
SUPABASE_SERVICE_ROLE_KEY visible anywhere
```

### 2. Authentication Security

**Implement proper auth flow:**

```javascript
// ✓ Good - check auth on protected routes
export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/');
  }
  
  return <AdminContent />;
}
```

### 3. CORS Configuration

**Prevent unauthorized domains:**

```javascript
// In next.config.mjs
images: {
  remotePatterns: [
    // Only allow your Supabase instance
    {
      protocol: 'https',
      hostname: 'acbwbhwwloncxbxgyedm.supabase.co',
      pathname: '/storage/**',
    },
  ],
}
```

### 4. SQL Injection Prevention

**Always use parameterized queries:**

```javascript
// ✗ Bad - vulnerable to SQL injection
const { data } = await supabase
  .from('blogs')
  .select('*')
  .where(`title = ${userInput}`);

// ✓ Good - parameterized
const { data } = await supabase
  .from('blogs')
  .select('*')
  .eq('title', userInput);
```

### 5. XSS Prevention

**Sanitize user input:**

```javascript
// In job scraping (example from code)
function cleanHtmlDescription(html) {
  // Remove scripts, styles, iframes
  clean = clean.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  // Remove event handlers
  clean = clean.replace(/\s+on\w+\s*=\s*(["'])(.*?)\2/gi, "");
  return clean;
}
```

### 6. Rate Limiting

**Implement to prevent abuse:**

```javascript
// See deployment.md for rate limiting middleware example
// Protects against:
// - Brute force login attempts
// - API abuse
// - DDoS attacks
```

---

## Backup & Recovery

### 1. Database Backups

**Automatic Backups (Supabase Pro):**
- Daily backups retained for 7 days
- Point-in-time recovery available

**Manual Backup:**

```bash
# Using Supabase CLI
supabase db pull > backup-$(date +%Y%m%d).sql

# Via Supabase Dashboard
# Settings → Database → Backups → Request Backup
```

### 2. Restore from Backup

**Via Supabase Dashboard:**

1. Go to **Settings → Database → Backups**
2. Find backup to restore
3. Click **Restore**
4. Confirm action
5. Wait for restoration (5-30 minutes)

**Via SQL Script:**

```bash
# Restore from downloaded backup file
psql -U postgres -d postgres < backup-20240707.sql
```

### 3. Code Backups

```bash
# Tag releases for easy recovery
git tag -a v1.0.0 -m "Version 1.0.0 release"
git push origin v1.0.0

# Create backup branch
git checkout -b backup-20240707
git push origin backup-20240707

# Restore from tag if needed
git checkout v1.0.0
```

### 4. Storage Backups

```bash
# Download files from Supabase Storage
supabase storage download portfolio-uploads --recursive

# Upload backup to external storage (Google Drive, S3, etc)
```

---

## Monitoring & Health Checks

### 1. Uptime Monitoring

**Using Vercel Analytics:**
- Dashboard shows deployment status
- Real-time error tracking
- Performance metrics

**Third-party Services:**
```javascript
// UptimeRobot, Healthchecks.io, etc
// Set up HTTP checks to:
// - https://your-domain.com
// - https://your-domain.com/api/blogs
```

### 2. Application Logs

**View Vercel Logs:**
1. Dashboard → Deployments
2. Select deployment
3. View "Function Logs"

**Local Logs:**
```bash
# During development
npm run dev
# Check terminal for console.log() output
```

### 3. Error Tracking

**Set up Sentry (optional):**

```bash
# Install Sentry
npm install @sentry/nextjs

# Add initialization in app layout
```

### 4. Database Health

**Check Database Status:**

```sql
-- Connection count
SELECT datname, count(*) 
FROM pg_stat_activity 
GROUP BY datname;

-- Table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname = 'public'
ORDER BY pg_total_relation_size DESC;

-- Slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Supabase Dashboard:**
- Project → Database → Query Performance
- Real-time monitoring
- Slow query alerts

---

## Regular Maintenance Tasks

### Daily Tasks
- Monitor error logs
- Check application status
- Verify backups ran

### Weekly Tasks
```bash
# Update dependencies check
npm outdated

# Run linter
npm run lint

# Test critical paths manually
# - Homepage loads
# - Authentication works
# - File uploads work
```

### Monthly Tasks
```bash
# Security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Database maintenance
# - Check for unused indexes
# - Analyze query performance
# - Review storage usage
```

### Quarterly Tasks
- Full backup to external storage
- Security audit
- Performance review
- Dependency updates
- Documentation updates

### Annual Tasks
- Major version upgrades
- Database optimization
- Architecture review
- Capacity planning
- Disaster recovery drill

---

## Maintenance Checklist

### Pre-Deployment Checklist
- [ ] Code reviewed
- [ ] Tests passed
- [ ] No console errors
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Performance tested

### Post-Deployment Checklist
- [ ] Application loads
- [ ] Navigation works
- [ ] API endpoints respond
- [ ] Authentication works
- [ ] File uploads work
- [ ] Images display correctly
- [ ] Mobile responsive
- [ ] No JavaScript errors

### Monthly Checklist
- [ ] Review error logs
- [ ] Update dependencies
- [ ] Run security audit
- [ ] Backup database
- [ ] Test recovery procedure
- [ ] Update documentation
- [ ] Review performance metrics

---

## Emergency Procedures

### Site Down - Immediate Action

1. **Check status:**
   ```bash
   curl -I https://your-domain.com
   ```

2. **Check Supabase status:**
   - Visit https://status.supabase.com
   - Check if service is down

3. **Restart application:**
   - Vercel Dashboard → Deployments
   - Click last successful deployment
   - Click "Redeploy"

4. **Clear cache:**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Check CDN cache

5. **Verify connectivity:**
   - Test API endpoint directly
   - Check database connection

### Database Corrupted - Recovery Steps

1. **Stop application** (if needed)
2. **Restore from backup:**
   - Supabase Dashboard → Backups
   - Select recent backup
   - Click "Restore"
3. **Verify data integrity:**
   - Check table row counts
   - Spot-check data
4. **Resume application**
5. **Post-mortem analysis:**
   - What caused corruption?
   - How to prevent in future?

### Security Breach - Immediate Action

1. **Revoke compromised keys:**
   ```bash
   # In Supabase Settings → API
   # Regenerate anon key and service role key
   ```

2. **Update environment variables:**
   - Vercel → Settings → Environment Variables
   - Update all keys

3. **Audit logs:**
   ```sql
   -- Check who accessed what
   SELECT * FROM auth.audit_log_entries;
   ```

4. **Notify users** (if needed)

5. **Post-incident review:**
   - How was breach discovered?
   - What was exposed?
   - How to prevent future breaches?

---

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Community](https://discord.supabase.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/nextjs)

### Monitoring Tools
- [Vercel Analytics](https://vercel.com/analytics)
- [UptimeRobot](https://uptimerobot.com)
- [Sentry](https://sentry.io)

---

**Version History:**
- v1.0.0 - 2026-07-07 - Initial documentation
- Project: M. Taufiq Academic Portfolio
- Framework: Next.js 16.2.7
- Database: Supabase (PostgreSQL)
