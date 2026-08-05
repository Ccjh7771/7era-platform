alter table public.member_profiles
    add column bank_account text,
    add column bank_name text,
    add column referrer_name text,
    add column top_referrer_name text,
    add constraint member_bank_account_length check (bank_account is null or char_length(bank_account) <= 50),
    add constraint member_bank_name_length check (bank_name is null or char_length(bank_name) <= 80),
    add constraint member_referrer_name_length check (referrer_name is null or char_length(referrer_name) <= 100),
    add constraint member_top_referrer_name_length check (top_referrer_name is null or char_length(top_referrer_name) <= 100);

comment on column public.member_profiles.bank_account is 'Optional bank account reference managed by authorized staff.';
comment on column public.member_profiles.bank_name is 'Optional bank name managed by authorized staff.';
comment on column public.member_profiles.referrer_name is 'Optional direct referrer display name.';
comment on column public.member_profiles.top_referrer_name is 'Optional top referrer display name.';
