update public.spin_campaigns
set is_active = false,
    updated_at = now();

update public.spin_prizes as prize
set inventory_total = configured.inventory,
    inventory_remaining = configured.inventory,
    is_active = true,
    updated_at = now()
from (
    values
        ('Free Credit RM3', 1000),
        ('Free Credit RM5', 500),
        ('Free Credit RM8', 250),
        ('Daily Bonus 20%', 250),
        ('Welcome Bonus 50%', 250),
        ('Free Credit RM88', 100),
        ('Free Credit RM1088', 10),
        ('iPhone 17 Pro Max', 1)
) as configured(name, inventory)
where prize.name = configured.name
  and prize.is_thank_you = false;
