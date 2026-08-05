update public.daily_reward_items
set inventory_total = null,
    inventory_remaining = null,
    updated_at = timezone('utc', now());
