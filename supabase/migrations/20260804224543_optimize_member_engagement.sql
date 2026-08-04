create index if not exists chat_conversations_assigned_admin_idx
    on public.chat_conversations (assigned_admin_id)
    where assigned_admin_id is not null;
create index if not exists chat_messages_sender_idx
    on public.chat_messages (sender_id);
create index if not exists daily_reward_claims_reward_claim_idx
    on public.daily_reward_claims (reward_claim_id)
    where reward_claim_id is not null;
create index if not exists daily_reward_claims_reward_item_idx
    on public.daily_reward_claims (reward_item_id);
create index if not exists daily_reward_settings_updated_by_idx
    on public.daily_reward_settings (updated_by)
    where updated_by is not null;
create index if not exists point_transactions_created_by_idx
    on public.point_transactions (created_by)
    where created_by is not null;
create index if not exists reward_claims_fulfilled_by_idx
    on public.reward_claims (fulfilled_by)
    where fulfilled_by is not null;
create index if not exists spin_campaigns_created_by_idx
    on public.spin_campaigns (created_by)
    where created_by is not null;
create index if not exists spin_campaigns_updated_by_idx
    on public.spin_campaigns (updated_by)
    where updated_by is not null;
create index if not exists spin_results_prize_idx
    on public.spin_results (prize_id);
create index if not exists spin_results_reward_claim_idx
    on public.spin_results (reward_claim_id)
    where reward_claim_id is not null;

drop policy if exists "Members send own messages" on public.chat_messages;
drop policy if exists "Admins send support messages" on public.chat_messages;

create policy "Members or admins send permitted messages"
on public.chat_messages
for insert
to authenticated
with check (
    (
        sender_id = (select auth.uid())
        and (select private.is_active_member())
        and sender_type = 'member'
        and is_internal = false
        and exists (
            select 1 from public.chat_conversations c
            where c.id = conversation_id
              and c.member_id = (select auth.uid())
        )
    )
    or
    (
        (select private.is_active_admin())
        and sender_id = (select auth.uid())
        and sender_type in ('admin', 'system')
    )
);
