-- ============================================================
-- FlagCounter / Country Views Table for Supabase (Optional)
-- Note: The application automatically persists country views
-- into the existing `page_views` table with prefix 'country:<CODE>',
-- but this script can be executed if you prefer a dedicated table.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.country_views (
    country_code VARCHAR(10) PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    view_count INT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.country_views ENABLE ROW LEVEL SECURITY;

-- Read policy for all visitors
CREATE POLICY "Enable read access for all users" 
  ON public.country_views FOR SELECT 
  USING (true);

-- Update policy for all visitors
CREATE POLICY "Enable update access for all users" 
  ON public.country_views FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

-- Insert policy for all visitors
CREATE POLICY "Enable insert access for all users" 
  ON public.country_views FOR INSERT 
  WITH CHECK (true);

-- Seed initial popular visitor countries
INSERT INTO public.country_views (country_code, country_name, view_count)
VALUES 
    ('ID', 'Indonesia', 980),
    ('US', 'United States', 145),
    ('SG', 'Singapura', 72),
    ('MY', 'Malaysia', 54),
    ('JP', 'Jepang', 36),
    ('AU', 'Australia', 22),
    ('GB', 'United Kingdom', 18),
    ('DE', 'Jerman', 12)
ON CONFLICT (country_code) DO NOTHING;
