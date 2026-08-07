create table if not exists public.member_registration_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

create index if not exists member_registration_attempts_ip_created_idx
  on public.member_registration_attempts (ip_hash, created_at desc);

alter table public.member_registration_attempts enable row level security;

revoke all on table public.member_registration_attempts from public, anon, authenticated;
grant select, insert, delete on table public.member_registration_attempts to service_role;

comment on table public.member_registration_attempts is
  'Short-lived, hashed request identifiers used to rate-limit public member registration.';
