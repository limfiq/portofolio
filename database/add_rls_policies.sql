-- ============================================================
-- RLS Policies for Publications
-- ============================================================
-- Allow public read access
create policy "Public Read publications"
  on public.publications for select
  using ( true );

-- Allow authenticated users to insert/update/delete
create policy "Authenticated Access publications"
  on public.publications for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );


-- ============================================================
-- RLS Policies for Research Projects
-- ============================================================
create policy "Public Read research_projects"
  on public.research_projects for select
  using ( true );

create policy "Authenticated Access research_projects"
  on public.research_projects for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );


-- ============================================================
-- RLS Policies for Community Services
-- ============================================================
create policy "Public Read community_services"
  on public.community_services for select
  using ( true );

create policy "Authenticated Access community_services"
  on public.community_services for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );


-- ============================================================
-- RLS Policies for Awards
-- ============================================================
-- Note: "Allow public read access to awards" already exists in db.sql, so we just add write access
create policy "Authenticated Access awards"
  on public.awards for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );


-- ============================================================
-- RLS Policies for Projects
-- ============================================================
create policy "Public Read projects"
  on public.projects for select
  using ( true );

create policy "Authenticated Access projects"
  on public.projects for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );


-- ============================================================
-- RLS Policies for Gallery
-- ============================================================
create policy "Public Read gallery"
  on public.gallery for select
  using ( true );

create policy "Authenticated Access gallery"
  on public.gallery for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );

-- ============================================================
-- RLS Policies for Teaching
-- ============================================================
create policy "Public Read teaching"
  on public.teaching for select
  using ( true );

create policy "Authenticated Access teaching"
  on public.teaching for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );
