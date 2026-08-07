create index if not exists admin_audit_logs_actor_id_idx
  on public.admin_audit_logs (actor_id)
  where actor_id is not null;
