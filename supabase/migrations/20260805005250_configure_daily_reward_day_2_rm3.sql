update public.daily_reward_items
set reward_type = 'prize',
    label = 'Day 2 Free Credit RM3',
    description = 'Free Credit RM3',
    points_amount = 0,
    inventory_total = 500,
    inventory_remaining = 500,
    image_path = '/assets/lucky-spin/prizes/free-credit-rm3.webp',
    is_active = true,
    updated_at = timezone('utc', now())
where day_number = 2;
