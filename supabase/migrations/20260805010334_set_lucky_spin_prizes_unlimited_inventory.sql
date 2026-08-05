update public.spin_prizes
set inventory_total = null,
    inventory_remaining = null,
    updated_at = timezone('utc', now());
