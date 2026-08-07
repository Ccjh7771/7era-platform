create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.admin_profiles(id) on delete set null,
  actor_name text not null check (char_length(actor_name) between 1 and 80),
  actor_role text not null check (actor_role in ('owner', 'editor', 'viewer')),
  action text not null check (action ~ '^[a-z0-9_]{3,80}$'),
  target_type text not null check (target_type ~ '^[a-z0-9_]{3,50}$'),
  target_id text check (target_id is null or char_length(target_id) <= 100),
  summary text not null check (char_length(summary) between 3 and 300),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_idx
  on public.admin_audit_logs (created_at desc);

alter table public.admin_audit_logs enable row level security;

revoke all on table public.admin_audit_logs from public, anon, authenticated;
revoke all on table public.admin_audit_logs from service_role;
grant select, insert on table public.admin_audit_logs to service_role;

comment on table public.admin_audit_logs is
  'Immutable application audit trail for privileged 7ERA administrator operations.';
