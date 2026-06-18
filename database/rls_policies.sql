-- ============================================================
-- Consolidated Row Level Security (RLS) Policies
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" 
  ON public.users FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated Access profiles" 
  ON public.users FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- EDUCATIONS
-- ============================================================
ALTER TABLE public.educations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to educations" 
  ON public.educations FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated Access educations" 
  ON public.educations FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- TEACHING
-- ============================================================
ALTER TABLE public.teaching ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read teaching" 
  ON public.teaching FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated Access teaching" 
  ON public.teaching FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- PUBLICATIONS
-- ============================================================
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read publications" 
  ON public.publications FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated Access publications" 
  ON public.publications FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- RESEARCH PROJECTS
-- ============================================================
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read research_projects" 
  ON public.research_projects FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated Access research_projects" 
  ON public.research_projects FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- COMMUNITY SERVICES (Activities)
-- ============================================================
ALTER TABLE public.community_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read community_services" 
  ON public.community_services FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated Access community_services" 
  ON public.community_services FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- AWARDS
-- ============================================================
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to awards" 
  ON public.awards FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated Access awards" 
  ON public.awards FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- PROJECTS
-- ============================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read projects" 
  ON public.projects FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated Access projects" 
  ON public.projects FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- GALLERY
-- ============================================================
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read gallery" 
  ON public.gallery FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated Access gallery" 
  ON public.gallery FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- BLOGS
-- ============================================================
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" 
  ON public.blogs FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Enable all access for authenticated users" 
  ON public.blogs FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- ============================================================
-- BLOG COMMENTS
-- ============================================================
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" 
  ON public.blog_comments FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert access for all users" 
  ON public.blog_comments FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" 
  ON public.blog_comments FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- ============================================================
-- CONTACTS
-- ============================================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts" 
  ON public.contacts FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users only" 
  ON public.contacts FOR SELECT 
  TO authenticated 
  USING (true);

-- ============================================================
-- PAGE VIEWS
-- ============================================================
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" 
  ON public.page_views FOR SELECT 
  USING (true);

CREATE POLICY "Enable update access for all users" 
  ON public.page_views FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

-- ============================================================
-- STORAGE OBJECTS (portfolio-images bucket)
-- ============================================================
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'portfolio-images' );

CREATE POLICY "Authenticated Upload"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'portfolio-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated Update"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'portfolio-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated Delete"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'portfolio-images' AND auth.role() = 'authenticated' );
