do $$
begin
    if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'reward_claims'
    ) then
        alter publication supabase_realtime add table public.reward_claims;
    end if;
end $$;
