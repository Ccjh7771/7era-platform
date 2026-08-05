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
    '谢谢参与',
    null,
    null,
    50,
    true,
    true,
    0
from public.spin_campaigns as campaign
where not exists (
    select 1
    from public.spin_prizes as prize
    where prize.campaign_id = campaign.id
      and prize.is_thank_you = true
);
