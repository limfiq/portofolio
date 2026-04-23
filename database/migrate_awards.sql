-- Migration: BigInt to UUID for awards table
ALTER TABLE public.awards 
ALTER COLUMN user_id TYPE uuid USING (
  CASE 
    WHEN user_id IS NULL THEN NULL 
    ELSE NULL -- We set to NULL first because old BIGINT IDs won't match UUIDs
  END
)::uuid;

-- Add foreign key back to auth.users if needed
-- ALTER TABLE public.awards ADD CONSTRAINT awards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
