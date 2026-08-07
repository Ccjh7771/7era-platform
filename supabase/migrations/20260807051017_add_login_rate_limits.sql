create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  login_scope text not null check (login_scope in ('member', 'admin')),
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

create index if not exists login_attempts_scope_ip_created_idx
  on public.login_attempts (login_scope, ip_hash, created_at desc);

alter table public.login_attempts enable row level security;

revoke all on table public.login_attempts from public, anon, authenticated;
grant select, insert, delete on table public.login_attempts to service_role;

comment on table public.login_attempts is
  'Short-lived hashed request identifiers for member and administrator login rate limits.';
