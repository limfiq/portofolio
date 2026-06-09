-- ============================================================
-- SQL Migration: Add Index & Status Columns to Publications
-- Run this script in the Supabase SQL Editor
-- ============================================================

-- 1. Create Enum for Publication Status (matching the Journal IGS statuses)
CREATE TYPE public.publication_status AS ENUM (
    'Draft',
    'Ready To Submit',
    'Submitted',
    'Under Review',
    'Revision Requested',
    'Accepted',
    'Rejected',
    'Published'
);

-- 2. Add columns to the publications table
ALTER TABLE public.publications 
ADD COLUMN index VARCHAR(100),
ADD COLUMN status public.publication_status DEFAULT 'Published',
ADD COLUMN status_changed TIMESTAMPTZ DEFAULT NOW();

-- 3. Populate existing rows with default values
UPDATE public.publications 
SET status = 'Published', 
    status_changed = created_at;
