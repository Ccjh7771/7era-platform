update public.spin_campaigns
set is_active = false,
    updated_at = now();

update public.spin_prizes
set name = 'TQ Try For Next Time',
    weight = 70,
    position = 0,
    is_active = true,
    inventory_total = null,
    inventory_remaining = null,
    updated_at = now()
where is_thank_you = true;

insert into public.spin_prizes (
    campaign_id,
    name,
    inventory_total,
    inventory_remaining,
    weight,
    is_thank_you,
    is_active,
    position
)
select
    campaign.id,
    prize.name,
    0,
    0,
    prize.weight,
    false,
    false,
    prize.position
from public.spin_campaigns as campaign
cross join (
    values
        ('Free Credit RM3', 12::numeric, 1::smallint),
        ('Free Credit RM5', 7::numeric, 2::smallint),
        ('Free Credit RM8', 4::numeric, 3::smallint),
        ('Daily Bonus 20%', 3::numeric, 4::smallint),
        ('Welcome Bonus 50%', 2::numeric, 5::smallint),
        ('Free Credit RM88', 1::numeric, 6::smallint),
        ('Free Credit RM1088', 0.7::numeric, 7::smallint),
        ('iPhone 17 Pro Max', 0.3::numeric, 8::smallint)
) as prize(name, weight, position)
where not exists (
    select 1
    from public.spin_prizes as existing_prize
    where existing_prize.campaign_id = campaign.id
      and existing_prize.name = prize.name
);
