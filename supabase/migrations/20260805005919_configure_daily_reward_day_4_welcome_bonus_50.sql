update public.daily_reward_items
set reward_type = 'welcome_bonus',
    label = 'Day 4 Welcome Bonus 50%',
    description = 'Welcome Bonus 50%',
    points_amount = 0,
    inventory_total = null,
    inventory_remaining = null,
    image_path = '/assets/lucky-spin/prizes/welcome-bonus-50.webp',
    is_active = true,
    updated_at = timezone('utc', now())
where day_number = 4;
