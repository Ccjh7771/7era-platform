alter table public.member_profiles
    drop constraint if exists member_phone_format;

alter table public.member_profiles
    add constraint member_phone_format
    check (phone ~ '^\+60[0-9]{8,10}$');
