alter table public.chat_conversations
add column reward_claim_id uuid
references public.reward_claims(id) on delete set null;

create unique index chat_conversations_reward_claim_unique
on public.chat_conversations (reward_claim_id)
where reward_claim_id is not null;

drop policy if exists "Members create conversations"
on public.chat_conversations;

create policy "Members create conversations"
on public.chat_conversations
for insert to authenticated
with check (
    member_id = (select auth.uid())
    and (select private.is_active_member())
    and assigned_admin_id is null
    and reward_claim_id is null
    and status = 'open'
);

create or replace function private.add_reward_claim_chat_message()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
    claim_row public.reward_claims%rowtype;
begin
    if new.reward_claim_id is null then
        return new;
    end if;

    select * into claim_row
    from public.reward_claims
    where id = new.reward_claim_id;

    if claim_row.id is null
       or claim_row.member_id <> new.member_id
       or claim_row.status <> 'pending' then
        raise exception 'A valid pending reward claim is required.';
    end if;

    insert into public.chat_messages (
        conversation_id,
        sender_id,
        sender_type,
        body,
        is_internal
    ) values (
        new.id,
        new.member_id,
        'system',
        'Prize claim request' || E'\n' ||
        'Reward: ' || claim_row.reward_name || E'\n' ||
        'Claim code: ' || claim_row.claim_code,
        false
    );

    return new;
end;
$$;

revoke all on function private.add_reward_claim_chat_message()
from public, anon, authenticated, service_role;

create trigger add_reward_claim_chat_message
after insert on public.chat_conversations
for each row
when (new.reward_claim_id is not null)
execute function private.add_reward_claim_chat_message();
