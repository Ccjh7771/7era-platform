create or replace function private.can_manage_admin_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.admin_profiles
        where id = (select auth.uid())
          and is_active = true
          and role in ('owner', 'editor')
    );
$$;

revoke all on function private.can_manage_admin_content()
from public, anon, authenticated;
grant execute on function private.can_manage_admin_content()
to authenticated;

drop policy if exists "Admins update conversations"
on public.chat_conversations;

create policy "Content admins update conversations"
on public.chat_conversations
for update to authenticated
using ((select private.can_manage_admin_content()))
with check ((select private.can_manage_admin_content()));

drop policy if exists "Admins send support messages"
on public.chat_messages;

create policy "Content admins send support messages"
on public.chat_messages
for insert to authenticated
with check (
    (select private.can_manage_admin_content())
    and sender_id = (select auth.uid())
    and sender_type in ('admin', 'system')
);
