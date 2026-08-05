drop policy if exists "Members or admins send permitted messages"
on public.chat_messages;

create policy "Members send own messages"
on public.chat_messages
for insert to authenticated
with check (
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
);
