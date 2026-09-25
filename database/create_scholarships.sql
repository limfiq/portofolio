-- SQL Migration: Create scholarships table

CREATE TABLE IF NOT EXISTS public.scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    deadline DATE,
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Scholarships are viewable by everyone." 
    ON public.scholarships FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert scholarships." 
    ON public.scholarships FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update scholarships." 
    ON public.scholarships FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can delete scholarships." 
    ON public.scholarships FOR DELETE USING (auth.uid() IS NOT NULL);
