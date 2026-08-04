do $$
begin
    create type public.admin_role as enum ('owner', 'editor', 'viewer');
exception
    when duplicate_object then null;
end
$$;

create table if not exists public.admin_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null default '',
    full_name text not null default 'Administrator',
    role public.admin_role not null default 'viewer',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    username text,
    must_change_password boolean not null default true,
    last_login_at timestamptz,
    constraint admin_profiles_username_format check (
        username is null
        or username ~ '^[a-z0-9][a-z0-9._-]{2,31}$'
    )
);

create unique index if not exists admin_profiles_username_lower_unique
    on public.admin_profiles (lower(username))
    where username is not null;

alter table public.admin_profiles enable row level security;

revoke all on table public.admin_profiles from anon, authenticated;
grant select on table public.admin_profiles to authenticated;
grant select, insert, update, delete
    on table public.admin_profiles
    to service_role;

drop policy if exists "Admins can view own profile"
    on public.admin_profiles;
drop policy if exists "Owners can manage admin profiles"
    on public.admin_profiles;
drop policy if exists "Admins can view permitted profiles"
    on public.admin_profiles;

create policy "Admins can view own profile"
    on public.admin_profiles
    for select
    to authenticated
    using (id = (select auth.uid()));

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.admin_profiles (
        id,
        email,
        full_name,
        username,
        must_change_password
    )
    values (
        new.id,
        coalesce(new.email, ''),
        coalesce(
            nullif(new.raw_user_meta_data ->> 'full_name', ''),
            nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
            'Administrator'
        ),
        nullif(lower(new.raw_user_meta_data ->> 'username'), ''),
        true
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

revoke all on function private.handle_new_admin_user() from public;
revoke all on function private.handle_new_admin_user()
    from anon, authenticated, service_role;

drop trigger if exists on_auth_user_created_admin_profile on auth.users;
create trigger on_auth_user_created_admin_profile
    after insert on auth.users
    for each row
    execute function private.handle_new_admin_user();

drop function if exists public.handle_new_admin_user();
drop function if exists public.current_admin_role();
