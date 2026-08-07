revoke all privileges on table
    public.member_profiles,
    public.chat_conversations,
    public.chat_messages,
    public.daily_reward_claims,
    public.daily_reward_items,
    public.daily_reward_settings,
    public.point_transactions,
    public.reward_claims,
    public.spin_campaigns,
    public.spin_prizes,
    public.spin_results
from authenticated;

grant select on table
    public.member_profiles,
    public.daily_reward_claims,
    public.daily_reward_items,
    public.daily_reward_settings,
    public.point_transactions,
    public.reward_claims,
    public.spin_campaigns,
    public.spin_prizes,
    public.spin_results
to authenticated;

grant select, insert, update on table public.chat_conversations to authenticated;
grant select, insert on table public.chat_messages to authenticated;

revoke usage, select, update on sequence
    public.brands_id_seq,
    public.downloads_id_seq,
    public.faq_items_id_seq,
    public.games_id_seq,
    public.promotions_id_seq
from anon, authenticated;
