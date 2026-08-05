update public.spin_campaigns
set
    is_active = true,
    starts_at = null,
    ends_at = null,
    points_per_spin = 50,
    daily_limit = 3,
    updated_at = now()
where name = '7ERA Lucky Spin';
