create index if not exists chat_messages_sender_created_idx
    on public.chat_messages (sender_id, created_at desc);

create or replace function private.enforce_chat_message_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    message_limit integer;
    photo_limit integer;
    recent_message_count integer;
    recent_photo_count integer;
begin
    if new.sender_type = 'system' then
        return new;
    end if;

    -- Serialize inserts from the same sender so parallel requests cannot bypass
    -- the count check.
    perform pg_advisory_xact_lock(hashtextextended(new.sender_id::text, 0));

    message_limit := case when new.sender_type = 'member' then 20 else 120 end;

    select count(*)
    into recent_message_count
    from public.chat_messages
    where sender_id = new.sender_id
      and created_at >= now() - interval '1 minute';

    if recent_message_count >= message_limit then
        raise exception 'chat_message_rate_limit'
            using errcode = 'P0001',
                  detail = 'Too many Live Chat messages were sent in one minute.';
    end if;

    if new.attachment_path is not null then
        photo_limit := case when new.sender_type = 'member' then 5 else 30 end;

        select count(*)
        into recent_photo_count
        from public.chat_messages
        where sender_id = new.sender_id
          and attachment_path is not null
          and created_at >= now() - interval '10 minutes';

        if recent_photo_count >= photo_limit then
            raise exception 'chat_photo_rate_limit'
                using errcode = 'P0001',
                      detail = 'Too many Live Chat photos were sent in ten minutes.';
        end if;
    end if;

    return new;
end;
$$;

revoke all on function private.enforce_chat_message_rate_limit()
from public, anon, authenticated, service_role;

drop trigger if exists enforce_chat_message_rate_limit
on public.chat_messages;

create trigger enforce_chat_message_rate_limit
before insert on public.chat_messages
for each row execute function private.enforce_chat_message_rate_limit();
