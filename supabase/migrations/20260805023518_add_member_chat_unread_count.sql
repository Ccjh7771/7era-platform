alter table public.chat_conversations
add column member_unread_count integer not null default 0
check (member_unread_count >= 0);

update public.chat_conversations as conversation
set member_unread_count = unread.count
from (
    select
        message.conversation_id,
        count(*)::integer as count
    from public.chat_messages as message
    join public.chat_conversations as current_conversation
      on current_conversation.id = message.conversation_id
    where message.sender_type in ('admin', 'system')
      and message.is_internal = false
      and (
          current_conversation.member_last_read_at is null
          or message.created_at > current_conversation.member_last_read_at
      )
    group by message.conversation_id
) as unread
where conversation.id = unread.conversation_id;

create or replace function private.touch_chat_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.chat_conversations
    set last_message_at = new.created_at,
        updated_at = new.created_at,
        status = case when status = 'closed' then 'open'::public.chat_status else status end,
        member_unread_count = case
            when new.sender_type in ('admin', 'system') and new.is_internal = false
                then member_unread_count + 1
            else member_unread_count
        end
    where id = new.conversation_id;
    return new;
end;
$$;

revoke all on function private.touch_chat_conversation()
from public, anon, authenticated, service_role;
