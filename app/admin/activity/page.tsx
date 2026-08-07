import { requireOwner } from "@/lib/admin/access";
import { formatMalaysiaDateTime } from "@/lib/member/time";
import { createAdminClient } from "@/lib/supabase/admin";

type AuditLog = {
  id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string | null;
  summary: string;
  created_at: string;
};

export default async function AdminActivityPage() {
  await requireOwner();

  const { data, error } = await createAdminClient()
    .from("admin_audit_logs")
    .select("id, actor_name, actor_role, action, target_type, target_id, summary, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Unable to load administrator audit events:", error.message);
  }

  const logs = (data ?? []) as AuditLog[];
  const staffCount = new Set(logs.map((entry) => entry.actor_name)).size;
  const categoryCount = new Set(logs.map((entry) => entry.target_type)).size;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">Security &amp; Accountability</p>
        <h1 className="mt-3 text-3xl font-black">Admin Activity Log</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">A permanent record of sensitive staff actions. Password values and private credentials are never stored here.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Loaded events" value={logs.length} />
        <Stat label="Staff recorded" value={staffCount} />
        <Stat label="Operation areas" value={categoryCount} />
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        {error ? (
          <p className="p-6 text-sm text-red-300">Unable to load the activity log.</p>
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">No administrator operations have been recorded yet.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {logs.map((entry) => (
              <article key={entry.id} className="grid gap-3 p-5 md:grid-cols-[180px_180px_1fr] md:items-center">
                <div>
                  <p className="font-bold text-white">{entry.actor_name}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">{entry.actor_role}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{entry.target_type.replaceAll("_", " ")}</p>
                  <time dateTime={entry.created_at} className="mt-1 block text-xs text-zinc-600">{formatMalaysiaDateTime(entry.created_at)}</time>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{entry.summary}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-zinc-700">{entry.action}{entry.target_id ? ` · ${entry.target_id.slice(0, 8)}` : ""}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <strong className="mt-2 block text-2xl text-yellow-300">{value}</strong>
    </div>
  );
}
