-- 7ERA member engagement platform
-- All timestamps are stored in UTC. Daily boundaries use Asia/Kuala_Lumpur.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;

do $$
begin
    create type public.member_status as enum ('active', 'suspended');
exception when duplicate_object then null;
end $$;

do $$
begin
    create type public.point_transaction_type as enum (
        'admin_adjustment',
        'daily_reward',
        'lucky_spin',
        'campaign',
        'system'
    );
exception when duplicate_object then null;
end $$;

do $$
begin
    create type public.daily_reward_type as enum (
        'points',
        'prize',
        'welcome_bonus',
        'double_points',
        'free_spin',
        'custom'
    );
exception when duplicate_object then null;
end $$;

do $$
begin
    create type public.reward_claim_status as enum (
        'pending',
        'fulfilled',
        'cancelled'
    );
exception when duplicate_object then null;
end $$;

do $$
begin
    create type public.chat_status as enum ('open', 'in_progress', 'closed');
exception when duplicate_object then null;
end $$;

do $$
begin
    create type public.chat_sender_type as enum ('member', 'admin', 'system');
exception when duplicate_object then null;
end $$;

-- Existing Auth users only become administrators when explicitly created as staff.
create or replace function private.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if coalesce(new.raw_app_meta_data ->> 'account_type', '') <> 'admin' then
        return new;
    end if;

    insert into public.admin_profiles (
        id, email, full_name, username, must_change_password
    )
    values (
        new.id,
        coalesce(new.email, ''),
        coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Administrator'),
        nullif(lower(new.raw_user_meta_data ->> 'username'), ''),
        true
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

revoke all on function private.handle_new_admin_user() from public, anon, authenticated, service_role;

create or replace function private.is_active_admin()
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
    );
$$;

revoke all on function private.is_active_admin() from public, anon, authenticated;
grant execute on function private.is_active_admin() to authenticated;

create table public.member_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    phone text not null,
    full_name text not null,
    status public.member_status not null default 'active',
    must_change_password boolean not null default true,
    points_balance bigint not null default 0 check (points_balance >= 0),
    last_login_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint member_phone_format check (phone ~ '^\+60[0-9]{8,10}$'),
    constraint member_full_name_length check (char_length(full_name) between 2 and 100)
);

create unique index member_profiles_phone_unique on public.member_profiles (phone);
create index member_profiles_created_at_idx on public.member_profiles (created_at desc);

create or replace function private.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.member_profiles
        where id = (select auth.uid())
          and status = 'active'
    );
$$;

revoke all on function private.is_active_member() from public, anon, authenticated;
grant execute on function private.is_active_member() to authenticated;

create or replace function private.handle_new_member_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if coalesce(new.raw_app_meta_data ->> 'account_type', '') <> 'member' then
        return new;
    end if;

    insert into public.member_profiles (id, phone, full_name, must_change_password)
    values (
        new.id,
        coalesce(new.phone, new.raw_user_meta_data ->> 'phone'),
        coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Member'),
        true
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

revoke all on function private.handle_new_member_user() from public, anon, authenticated, service_role;

drop trigger if exists on_auth_user_created_member_profile on auth.users;
create trigger on_auth_user_created_member_profile
    after insert on auth.users
    for each row execute function private.handle_new_member_user();

create table public.point_transactions (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.member_profiles(id) on delete cascade,
    amount integer not null check (amount <> 0),
    balance_after bigint not null check (balance_after >= 0),
    transaction_type public.point_transaction_type not null,
    reference_type text,
    reference_id uuid,
    note text not null default '',
    created_by uuid references public.admin_profiles(id) on delete set null,
    created_at timestamptz not null default now()
);

create index point_transactions_member_created_idx
    on public.point_transactions (member_id, created_at desc);

create table public.daily_reward_settings (
    id smallint primary key default 1 check (id = 1),
    is_enabled boolean not null default true,
    cycle_length smallint not null default 7 check (cycle_length between 1 and 31),
    timezone text not null default 'Asia/Kuala_Lumpur' check (timezone = 'Asia/Kuala_Lumpur'),
    title text not null default 'Daily Reward',
    subtitle text not null default 'Check in every day and keep progressing through your reward cycle.',
    updated_by uuid references public.admin_profiles(id) on delete set null,
    updated_at timestamptz not null default now()
);

insert into public.daily_reward_settings (id) values (1) on conflict (id) do nothing;

create table public.daily_reward_items (
    id uuid primary key default gen_random_uuid(),
    day_number smallint not null unique check (day_number between 1 and 31),
    reward_type public.daily_reward_type not null,
    label text not null,
    description text not null default '',
    points_amount integer not null default 0 check (points_amount >= 0),
    image_path text,
    inventory_total integer check (inventory_total is null or inventory_total >= 0),
    inventory_remaining integer check (inventory_remaining is null or inventory_remaining >= 0),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint daily_inventory_bounds check (
        inventory_total is null
        or inventory_remaining is null
        or inventory_remaining <= inventory_total
    )
);

insert into public.daily_reward_items
    (day_number, reward_type, label, description, points_amount)
values
    (1, 'points', 'Day 1 Points', 'Start the cycle with member points.', 10),
    (2, 'prize', 'Day 2 Prize', 'A configurable member prize.', 0),
    (3, 'points', 'Day 3 Points', 'Keep checking in to earn more.', 15),
    (4, 'welcome_bonus', 'Welcome Bonus', 'A configurable welcome bonus reward.', 20),
    (5, 'points', 'Day 5 Points', 'Daily member points.', 20),
    (6, 'double_points', 'Double Points', 'A larger points reward.', 40),
    (7, 'free_spin', 'Spin Points', 'Points that can be used for Lucky Spin.', 50)
on conflict (day_number) do nothing;

create table public.reward_claims (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.member_profiles(id) on delete cascade,
    source_type text not null check (source_type in ('daily_reward', 'lucky_spin', 'admin')),
    source_id uuid,
    reward_name text not null,
    image_path text,
    claim_code text not null unique,
    status public.reward_claim_status not null default 'pending',
    fulfilled_by uuid references public.admin_profiles(id) on delete set null,
    fulfilled_at timestamptz,
    created_at timestamptz not null default now()
);

create index reward_claims_member_created_idx on public.reward_claims (member_id, created_at desc);
create index reward_claims_status_created_idx on public.reward_claims (status, created_at desc);

create table public.daily_reward_claims (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.member_profiles(id) on delete cascade,
    reward_item_id uuid not null references public.daily_reward_items(id),
    claim_date date not null,
    cycle_day smallint not null,
    points_awarded integer not null default 0,
    reward_claim_id uuid references public.reward_claims(id) on delete set null,
    created_at timestamptz not null default now(),
    unique (member_id, claim_date)
);

create index daily_reward_claims_member_idx
    on public.daily_reward_claims (member_id, created_at desc);

create table public.spin_campaigns (
    id uuid primary key default gen_random_uuid(),
    name text not null default '7ERA Lucky Spin',
    is_active boolean not null default false,
    points_per_spin integer not null default 50 check (points_per_spin > 0),
    daily_limit smallint not null default 3 check (daily_limit between 1 and 3),
    starts_at timestamptz,
    ends_at timestamptz,
    primary_color text not null default '#facc15',
    secondary_color text not null default '#f59e0b',
    background_color text not null default '#050505',
    logo_path text,
    background_image_path text,
    created_by uuid references public.admin_profiles(id) on delete set null,
    updated_by uuid references public.admin_profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint spin_campaign_dates check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create unique index spin_campaigns_one_active_idx on public.spin_campaigns ((is_active)) where is_active;

insert into public.spin_campaigns (
    name, is_active, points_per_spin, daily_limit, logo_path, background_image_path
)
values (
    '7ERA Lucky Spin', false, 50, 3,
    '/assets/lucky-spin/lucky-spin-logo.svg',
    '/assets/lucky-spin/lucky-spin-background.webp'
)
on conflict do nothing;

create table public.spin_prizes (
    id uuid primary key default gen_random_uuid(),
    campaign_id uuid not null references public.spin_campaigns(id) on delete cascade,
    name text not null,
    image_path text,
    inventory_total integer check (inventory_total is null or inventory_total >= 0),
    inventory_remaining integer check (inventory_remaining is null or inventory_remaining >= 0),
    weight numeric(12, 4) not null check (weight > 0),
    is_thank_you boolean not null default false,
    is_active boolean not null default true,
    position smallint not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint spin_prize_inventory_bounds check (
        inventory_total is null
        or inventory_remaining is null
        or inventory_remaining <= inventory_total
    ),
    constraint thank_you_has_no_inventory check (
        not is_thank_you or (inventory_total is null and inventory_remaining is null)
    )
);

create unique index spin_prizes_one_thank_you_idx
    on public.spin_prizes (campaign_id) where is_thank_you;
create index spin_prizes_campaign_position_idx
    on public.spin_prizes (campaign_id, position, created_at);

create or replace function private.enforce_spin_prize_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    actual_prize_count integer;
begin
    if new.is_thank_you then
        return new;
    end if;

    select count(*) into actual_prize_count
    from public.spin_prizes
    where campaign_id = new.campaign_id
      and is_thank_you = false
      and id <> new.id;

    if actual_prize_count >= 12 then
        raise exception 'A campaign can contain at most 12 prizes.';
    end if;

    return new;
end;
$$;

revoke all on function private.enforce_spin_prize_limit() from public, anon, authenticated, service_role;

create trigger enforce_spin_prize_limit
    before insert or update of campaign_id, is_thank_you on public.spin_prizes
    for each row execute function private.enforce_spin_prize_limit();

create table public.spin_results (
    id uuid primary key default gen_random_uuid(),
    campaign_id uuid not null references public.spin_campaigns(id),
    member_id uuid not null references public.member_profiles(id) on delete cascade,
    prize_id uuid not null references public.spin_prizes(id),
    spin_date date not null,
    points_spent integer not null check (points_spent > 0),
    is_winner boolean not null,
    reward_claim_id uuid references public.reward_claims(id) on delete set null,
    created_at timestamptz not null default now()
);

create index spin_results_member_date_idx on public.spin_results (member_id, spin_date, created_at desc);
create index spin_results_campaign_created_idx on public.spin_results (campaign_id, created_at desc);

create table public.chat_conversations (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.member_profiles(id) on delete cascade,
    subject text not null default 'Support request',
    status public.chat_status not null default 'open',
    assigned_admin_id uuid references public.admin_profiles(id) on delete set null,
    last_message_at timestamptz not null default now(),
    member_last_read_at timestamptz,
    admin_last_read_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index chat_conversations_member_idx on public.chat_conversations (member_id, last_message_at desc);
create index chat_conversations_status_idx on public.chat_conversations (status, last_message_at desc);

create table public.chat_messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
    sender_id uuid not null references auth.users(id) on delete cascade,
    sender_type public.chat_sender_type not null,
    body text not null check (char_length(trim(body)) between 1 and 4000),
    is_internal boolean not null default false,
    created_at timestamptz not null default now(),
    constraint member_messages_not_internal check (sender_type <> 'member' or is_internal = false)
);

create index chat_messages_conversation_created_idx
    on public.chat_messages (conversation_id, created_at);

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
        status = case when status = 'closed' then 'open'::public.chat_status else status end
    where id = new.conversation_id;
    return new;
end;
$$;

revoke all on function private.touch_chat_conversation() from public, anon, authenticated, service_role;

create trigger touch_chat_conversation
    after insert on public.chat_messages
    for each row execute function private.touch_chat_conversation();

-- Row Level Security
alter table public.member_profiles enable row level security;
alter table public.point_transactions enable row level security;
alter table public.daily_reward_settings enable row level security;
alter table public.daily_reward_items enable row level security;
alter table public.daily_reward_claims enable row level security;
alter table public.reward_claims enable row level security;
alter table public.spin_campaigns enable row level security;
alter table public.spin_prizes enable row level security;
alter table public.spin_results enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

revoke all on public.member_profiles, public.point_transactions,
    public.daily_reward_settings, public.daily_reward_items,
    public.daily_reward_claims, public.reward_claims,
    public.spin_campaigns, public.spin_prizes, public.spin_results,
    public.chat_conversations, public.chat_messages from anon;

grant select on public.member_profiles, public.point_transactions,
    public.daily_reward_settings, public.daily_reward_items,
    public.daily_reward_claims, public.reward_claims,
    public.spin_campaigns, public.spin_prizes, public.spin_results,
    public.chat_conversations, public.chat_messages to authenticated;
grant insert, update on public.chat_conversations to authenticated;
grant insert on public.chat_messages to authenticated;
grant all on public.member_profiles, public.point_transactions,
    public.daily_reward_settings, public.daily_reward_items,
    public.daily_reward_claims, public.reward_claims,
    public.spin_campaigns, public.spin_prizes, public.spin_results,
    public.chat_conversations, public.chat_messages to service_role;

create policy "Members and admins view member profiles" on public.member_profiles
for select to authenticated
using (id = (select auth.uid()) or (select private.is_active_admin()));

create policy "Members and admins view point transactions" on public.point_transactions
for select to authenticated
using (member_id = (select auth.uid()) or (select private.is_active_admin()));

create policy "Authenticated users view reward settings" on public.daily_reward_settings
for select to authenticated using (true);
create policy "Authenticated users view reward items" on public.daily_reward_items
for select to authenticated using (true);

create policy "Members and admins view daily claims" on public.daily_reward_claims
for select to authenticated
using (member_id = (select auth.uid()) or (select private.is_active_admin()));

create policy "Members and admins view reward claims" on public.reward_claims
for select to authenticated
using (member_id = (select auth.uid()) or (select private.is_active_admin()));

create policy "Authenticated users view spin campaigns" on public.spin_campaigns
for select to authenticated using (true);
create policy "Authenticated users view spin prizes" on public.spin_prizes
for select to authenticated using (true);
create policy "Members and admins view spin results" on public.spin_results
for select to authenticated
using (member_id = (select auth.uid()) or (select private.is_active_admin()));

create policy "Members and admins view conversations" on public.chat_conversations
for select to authenticated
using (member_id = (select auth.uid()) or (select private.is_active_admin()));

create policy "Members create conversations" on public.chat_conversations
for insert to authenticated
with check (
    member_id = (select auth.uid())
    and (select private.is_active_member())
    and assigned_admin_id is null
    and status = 'open'
);

create policy "Admins update conversations" on public.chat_conversations
for update to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy "Members and admins view messages" on public.chat_messages
for select to authenticated
using (
    (select private.is_active_admin())
    or (
        is_internal = false
        and exists (
            select 1 from public.chat_conversations c
            where c.id = conversation_id and c.member_id = (select auth.uid())
        )
    )
);

create policy "Members send own messages" on public.chat_messages
for insert to authenticated
with check (
    sender_id = (select auth.uid())
    and (select private.is_active_member())
    and sender_type = 'member'
    and is_internal = false
    and exists (
        select 1 from public.chat_conversations c
        where c.id = conversation_id and c.member_id = (select auth.uid())
    )
);

create policy "Admins send support messages" on public.chat_messages
for insert to authenticated
with check (
    (select private.is_active_admin())
    and sender_id = (select auth.uid())
    and sender_type in ('admin', 'system')
);

-- Private atomic points helper. It is never exposed through the Data API.
create or replace function private.apply_member_points(
    target_member_id uuid,
    point_delta integer,
    entry_type public.point_transaction_type,
    entry_reference_type text default null,
    entry_reference_id uuid default null,
    entry_note text default '',
    entry_admin_id uuid default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_balance bigint;
    next_balance bigint;
begin
    if point_delta = 0 then
        raise exception 'Point amount cannot be zero.';
    end if;

    select points_balance into current_balance
    from public.member_profiles
    where id = target_member_id and status = 'active'
    for update;

    if current_balance is null then
        raise exception 'Active member not found.';
    end if;

    next_balance := current_balance + point_delta;
    if next_balance < 0 then
        raise exception 'Insufficient points.';
    end if;

    update public.member_profiles
    set points_balance = next_balance, updated_at = now()
    where id = target_member_id;

    insert into public.point_transactions (
        member_id, amount, balance_after, transaction_type,
        reference_type, reference_id, note, created_by
    ) values (
        target_member_id, point_delta, next_balance, entry_type,
        entry_reference_type, entry_reference_id, coalesce(entry_note, ''), entry_admin_id
    );

    return next_balance;
end;
$$;

revoke all on function private.apply_member_points(uuid, integer, public.point_transaction_type, text, uuid, text, uuid)
from public, anon, authenticated;

create or replace function public.admin_adjust_member_points(
    target_member_id uuid,
    point_delta integer,
    entry_note text
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
    admin_id uuid := (select auth.uid());
    admin_role public.admin_role;
begin
    select role into admin_role
    from public.admin_profiles
    where id = admin_id and is_active = true;

    if admin_role is null or admin_role = 'viewer' then
        raise exception 'Administrator permission required.';
    end if;

    if point_delta = 0 or abs(point_delta) > 1000000 then
        raise exception 'Invalid point adjustment.';
    end if;

    if char_length(trim(coalesce(entry_note, ''))) < 3 then
        raise exception 'An adjustment reason is required.';
    end if;

    return private.apply_member_points(
        target_member_id,
        point_delta,
        'admin_adjustment',
        'admin_adjustment',
        null,
        trim(entry_note),
        admin_id
    );
end;
$$;

revoke all on function public.admin_adjust_member_points(uuid, integer, text) from public, anon;
grant execute on function public.admin_adjust_member_points(uuid, integer, text) to authenticated;

create or replace function public.claim_daily_reward()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    member_id uuid := (select auth.uid());
    malaysia_date date := (clock_timestamp() at time zone 'Asia/Kuala_Lumpur')::date;
    settings_row public.daily_reward_settings%rowtype;
    reward_row public.daily_reward_items%rowtype;
    claim_id uuid := gen_random_uuid();
    reward_claim_id uuid;
    prior_claim_count integer;
    cycle_day_number smallint;
    updated_balance bigint;
    generated_claim_code text;
begin
    if member_id is null then raise exception 'Authentication required.'; end if;

    perform 1 from public.member_profiles
    where id = member_id and status = 'active'
    for update;
    if not found then raise exception 'Active member not found.'; end if;

    select * into settings_row from public.daily_reward_settings where id = 1;
    if settings_row.id is null or settings_row.is_enabled = false then
        raise exception 'Daily Reward is currently unavailable.';
    end if;

    if exists (
        select 1 from public.daily_reward_claims
        where member_id = claim_daily_reward.member_id and claim_date = malaysia_date
    ) then
        raise exception 'Today''s reward has already been claimed.';
    end if;

    select count(*) into prior_claim_count
    from public.daily_reward_claims
    where member_id = claim_daily_reward.member_id;
    cycle_day_number := (prior_claim_count % settings_row.cycle_length) + 1;

    select * into reward_row
    from public.daily_reward_items
    where day_number = cycle_day_number and is_active = true
    for update;
    if reward_row.id is null then raise exception 'Today''s reward is not configured.'; end if;

    if reward_row.inventory_remaining is not null then
        if reward_row.inventory_remaining <= 0 then raise exception 'Today''s reward is out of stock.'; end if;
        update public.daily_reward_items
        set inventory_remaining = inventory_remaining - 1, updated_at = now()
        where id = reward_row.id;
    end if;

    if reward_row.points_amount > 0 then
        updated_balance := private.apply_member_points(
            member_id, reward_row.points_amount, 'daily_reward',
            'daily_reward_claim', claim_id, reward_row.label, null
        );
    else
        select points_balance into updated_balance from public.member_profiles where id = member_id;
    end if;

    if reward_row.reward_type in ('prize', 'welcome_bonus', 'custom') then
        generated_claim_code := 'DR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
        insert into public.reward_claims (
            member_id, source_type, source_id, reward_name, image_path, claim_code
        ) values (
            member_id, 'daily_reward', claim_id, reward_row.label, reward_row.image_path, generated_claim_code
        ) returning id into reward_claim_id;
    end if;

    insert into public.daily_reward_claims (
        id, member_id, reward_item_id, claim_date, cycle_day,
        points_awarded, reward_claim_id
    ) values (
        claim_id, member_id, reward_row.id, malaysia_date, cycle_day_number,
        reward_row.points_amount, reward_claim_id
    );

    return jsonb_build_object(
        'claimId', claim_id,
        'day', cycle_day_number,
        'label', reward_row.label,
        'rewardType', reward_row.reward_type,
        'pointsAwarded', reward_row.points_amount,
        'balance', updated_balance,
        'claimCode', generated_claim_code
    );
end;
$$;

revoke all on function public.claim_daily_reward() from public, anon;
grant execute on function public.claim_daily_reward() to authenticated;

create or replace function public.spin_lucky_wheel()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    member_id uuid := (select auth.uid());
    malaysia_date date := (clock_timestamp() at time zone 'Asia/Kuala_Lumpur')::date;
    campaign public.spin_campaigns%rowtype;
    selected_prize public.spin_prizes%rowtype;
    spins_today integer;
    total_weight numeric;
    random_target numeric;
    running_weight numeric := 0;
    prize_record record;
    result_id uuid := gen_random_uuid();
    reward_claim_id uuid;
    generated_claim_code text;
    updated_balance bigint;
begin
    if member_id is null then raise exception 'Authentication required.'; end if;

    perform 1 from public.member_profiles
    where id = member_id and status = 'active'
    for update;
    if not found then raise exception 'Active member not found.'; end if;

    select * into campaign
    from public.spin_campaigns
    where is_active = true
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
    for update;
    if campaign.id is null then raise exception 'Lucky Spin is currently unavailable.'; end if;

    select count(*) into spins_today
    from public.spin_results
    where member_id = spin_lucky_wheel.member_id
      and campaign_id = campaign.id
      and spin_date = malaysia_date;
    if spins_today >= campaign.daily_limit then raise exception 'Daily spin limit reached.'; end if;

    perform 1 from public.spin_prizes
    where campaign_id = campaign.id and is_active = true
    order by id for update;

    select sum(weight) into total_weight
    from public.spin_prizes
    where campaign_id = campaign.id
      and is_active = true
      and (is_thank_you or inventory_remaining is null or inventory_remaining > 0);
    if total_weight is null or total_weight <= 0 then raise exception 'No prizes are available.'; end if;

    random_target := random() * total_weight;
    for prize_record in
        select * from public.spin_prizes
        where campaign_id = campaign.id
          and is_active = true
          and (is_thank_you or inventory_remaining is null or inventory_remaining > 0)
        order by position, id
    loop
        running_weight := running_weight + prize_record.weight;
        if random_target <= running_weight then
            selected_prize := prize_record;
            exit;
        end if;
    end loop;

    if selected_prize.id is null then raise exception 'Unable to select a prize.'; end if;

    updated_balance := private.apply_member_points(
        member_id, -campaign.points_per_spin, 'lucky_spin',
        'spin_result', result_id, campaign.name, null
    );

    if selected_prize.is_thank_you = false then
        if selected_prize.inventory_remaining is not null then
            update public.spin_prizes
            set inventory_remaining = inventory_remaining - 1, updated_at = now()
            where id = selected_prize.id;
        end if;

        generated_claim_code := 'LS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
        insert into public.reward_claims (
            member_id, source_type, source_id, reward_name, image_path, claim_code
        ) values (
            member_id, 'lucky_spin', result_id, selected_prize.name,
            selected_prize.image_path, generated_claim_code
        ) returning id into reward_claim_id;
    end if;

    insert into public.spin_results (
        id, campaign_id, member_id, prize_id, spin_date,
        points_spent, is_winner, reward_claim_id
    ) values (
        result_id, campaign.id, member_id, selected_prize.id, malaysia_date,
        campaign.points_per_spin, not selected_prize.is_thank_you, reward_claim_id
    );

    return jsonb_build_object(
        'resultId', result_id,
        'prizeId', selected_prize.id,
        'prizeName', selected_prize.name,
        'isWinner', not selected_prize.is_thank_you,
        'claimCode', generated_claim_code,
        'balance', updated_balance,
        'spinsRemaining', campaign.daily_limit - spins_today - 1
    );
end;
$$;

revoke all on function public.spin_lucky_wheel() from public, anon;
grant execute on function public.spin_lucky_wheel() to authenticated;

-- Realtime chat tables.
do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'chat_conversations'
    ) then
        alter publication supabase_realtime add table public.chat_conversations;
    end if;
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'chat_messages'
    ) then
        alter publication supabase_realtime add table public.chat_messages;
    end if;
end $$;

-- Public prize artwork uploaded only through authenticated server-side admin actions.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'engagement-assets', 'engagement-assets', true, 3145728,
    array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view engagement assets" on storage.objects;
create policy "Public can view engagement assets"
on storage.objects for select to public
using (bucket_id = 'engagement-assets');

-- Admin/server APIs retain complete access; clients receive only the grants above.
grant usage on schema public to authenticated, service_role;
