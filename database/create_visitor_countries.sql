-- ============================================================
-- 14. VISITOR COUNTRIES (Flag Counter Storage)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.visitor_countries (
    country_code VARCHAR(10) PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    flag_emoji VARCHAR(10) NOT NULL,
    view_count INT DEFAULT 1,
    first_visited TIMESTAMPTZ DEFAULT NOW(),
    last_visited TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.visitor_countries ENABLE ROW LEVEL SECURITY;

-- Allow public read access to list of visited countries
CREATE POLICY "Enable public read on visitor_countries" 
  ON public.visitor_countries FOR SELECT 
  USING (true);

-- Allow public insert access when a visitor from a new country visits
CREATE POLICY "Enable public insert on visitor_countries" 
  ON public.visitor_countries FOR INSERT 
  WITH CHECK (true);

-- Allow public update access to increment view count on subsequent visits
CREATE POLICY "Enable public update on visitor_countries" 
  ON public.visitor_countries FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

-- Also ensure public insert is permitted on page_views table for backwards compatibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'page_views' AND policyname = 'Enable insert access for all users'
  ) THEN
    CREATE POLICY "Enable insert access for all users" 
      ON public.page_views FOR INSERT 
      WITH CHECK (true);
  END IF;
END $$;
