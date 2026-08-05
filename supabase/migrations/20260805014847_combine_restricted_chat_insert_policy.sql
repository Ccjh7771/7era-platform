drop policy if exists "Members send own messages"
on public.chat_messages;
drop policy if exists "Content admins send support messages"
on public.chat_messages;

create policy "Members or content admins send permitted messages"
on public.chat_messages
for insert to authenticated
with check (
    (
        sender_id = (select auth.uid())
        and (select private.is_active_member())
        and sender_type = 'member'
        and is_internal = false
        and exists (
            select 1
            from public.chat_conversations c
            where c.id = conversation_id
              and c.member_id = (select auth.uid())
        )
    )
    or
    (
        (select private.can_manage_admin_content())
        and sender_id = (select auth.uid())
        and sender_type in ('admin', 'system')
    )
);
