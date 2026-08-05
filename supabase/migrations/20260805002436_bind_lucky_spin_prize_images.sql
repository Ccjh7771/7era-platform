update public.spin_prizes as prize
set image_path = image_map.image_path,
    updated_at = timezone('utc', now())
from (
    values
        ('Free Credit RM3', '/assets/lucky-spin/prizes/free-credit-rm3.webp'),
        ('Free Credit RM5', '/assets/lucky-spin/prizes/free-credit-rm5.webp'),
        ('Free Credit RM8', '/assets/lucky-spin/prizes/free-credit-rm8.webp'),
        ('Daily Bonus 20%', '/assets/lucky-spin/prizes/daily-bonus-20.webp'),
        ('Welcome Bonus 50%', '/assets/lucky-spin/prizes/welcome-bonus-50.webp'),
        ('Free Credit RM88', '/assets/lucky-spin/prizes/free-credit-rm88.webp'),
        ('Free Credit RM1088', '/assets/lucky-spin/prizes/free-credit-rm1088.webp'),
        ('iPhone 17 Pro Max', '/assets/lucky-spin/prizes/iphone-17-pro-max.webp')
) as image_map(prize_name, image_path)
where prize.name = image_map.prize_name
  and prize.campaign_id in (
      select campaign.id
      from public.spin_campaigns as campaign
      where campaign.name = '7ERA Lucky Spin'
  );
