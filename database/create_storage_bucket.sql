-- Create the storage bucket
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

-- Set up security policies

-- Allow public read access to all files in the bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'portfolio-images' );

-- Allow authenticated users to upload files
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'portfolio-images' and auth.role() = 'authenticated' );

-- Allow authenticated users to update their own files (optional, but good for edits)
create policy "Authenticated Update"
  on storage.objects for update
  using ( bucket_id = 'portfolio-images' and auth.role() = 'authenticated' );

-- Allow authenticated users to delete files
create policy "Authenticated Delete"
  on storage.objects for delete
  using ( bucket_id = 'portfolio-images' and auth.role() = 'authenticated' );
