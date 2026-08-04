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
        select 1 from public.daily_reward_claims drc
        where drc.member_id = claim_daily_reward.member_id and drc.claim_date = malaysia_date
    ) then
        raise exception 'Today''s reward has already been claimed.';
    end if;

    select count(*) into prior_claim_count
    from public.daily_reward_claims drc
    where drc.member_id = claim_daily_reward.member_id;
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
    from public.spin_results sr
    where sr.member_id = spin_lucky_wheel.member_id
      and sr.campaign_id = campaign.id
      and sr.spin_date = malaysia_date;
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
