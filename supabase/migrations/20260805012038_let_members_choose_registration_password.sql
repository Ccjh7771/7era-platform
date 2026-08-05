alter table public.member_profiles
alter column must_change_password set default false;

create or replace function private.handle_new_member_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if coalesce(new.raw_app_meta_data ->> 'account_type', '') <> 'member' then
        return new;
    end if;

    insert into public.member_profiles (id, phone, full_name, must_change_password)
    values (
        new.id,
        coalesce(new.phone, new.raw_user_meta_data ->> 'phone'),
        coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Member'),
        false
    )
    on conflict (id) do nothing;

    return new;
end;
$$;
