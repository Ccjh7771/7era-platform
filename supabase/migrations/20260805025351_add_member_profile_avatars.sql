alter table public.member_profiles
add column avatar_path text
check (
    avatar_path is null
    or avatar_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/avatar$'
);

insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'member-avatars',
    'member-avatars',
    false,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Members view own avatar"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'member-avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Members upload own avatar"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'member-avatars'
    and name = (select auth.uid()::text) || '/avatar'
);

create policy "Members replace own avatar"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'member-avatars'
    and name = (select auth.uid()::text) || '/avatar'
)
with check (
    bucket_id = 'member-avatars'
    and name = (select auth.uid()::text) || '/avatar'
);

create policy "Members delete own avatar"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'member-avatars'
    and name = (select auth.uid()::text) || '/avatar'
);
