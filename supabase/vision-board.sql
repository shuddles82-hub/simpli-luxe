-- Vision board storage (Phase 4, final piece).
-- Run this once in Supabase: open your project, click "SQL Editor"
-- in the left sidebar, paste this whole file, press "Run".
--
-- It creates a private image area where each member can only ever
-- see, add, and remove her own pictures.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vision-board',
  'vision-board',
  false,
  10485760, -- 10 MB per image
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Each member's files live in a folder named by her user id; the
-- policies only allow access to your own folder.
drop policy if exists "Members upload own vision images" on storage.objects;
create policy "Members upload own vision images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'vision-board' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Members read own vision images" on storage.objects;
create policy "Members read own vision images"
  on storage.objects for select to authenticated
  using (bucket_id = 'vision-board' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Members delete own vision images" on storage.objects;
create policy "Members delete own vision images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'vision-board' and (storage.foldername(name))[1] = auth.uid()::text);
