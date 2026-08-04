import { requireAdmin } from "@/lib/admin/access";
import { displayMalaysianPhone } from "@/lib/member/phone";
import { formatMalaysiaDateTime } from "@/lib/member/time";
import { createAdminClient } from "@/lib/supabase/admin";

import { adjustMemberPoints, setMemberStatus } from "./actions";
import { ResetMemberPassword } from "./ResetMemberPassword";

type MembersPageProps = { searchParams: Promise<{ success?: string | string[]; error?: string | string[] }> };

export default async function AdminMembersPage({ searchParams }: MembersPageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const success = Array.isArray(params.success) ? params.success[0] : params.success;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const client = createAdminClient();
  const { data: members, error: membersError } = await client.from("member_profiles").select("id, full_name, phone, status, must_change_password, points_balance, last_login_at, created_at").order("created_at", { ascending: false }).limit(250);

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">Membership</p>
      <h1 className="mt-3 text-3xl font-black">Members</h1>
      <p className="mt-2 text-sm text-zinc-500">View profiles, manage points, suspend access and issue temporary passwords.</p>
      {success && <p className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">Member account updated successfully.</p>}
      {(error || membersError) && <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">The requested member operation could not be completed.</p>}
      <div className="mt-8 space-y-5">
        {(members ?? []).map((member) => (
          <article key={member.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h2 className="text-lg font-black">{member.full_name}</h2><p className="mt-1 text-sm text-zinc-500">{displayMalaysianPhone(member.phone)}</p><p className="mt-2 text-xs text-zinc-600">Joined {formatMalaysiaDateTime(member.created_at)} · Last login {member.last_login_at ? formatMalaysiaDateTime(member.last_login_at) : "Never"}</p></div>
              <div className="text-right"><p className="text-2xl font-black text-yellow-300">{Number(member.points_balance).toLocaleString()} PTS</p><p className={`mt-1 text-xs font-black uppercase ${member.status === "active" ? "text-emerald-300" : "text-red-300"}`}>{member.status}</p></div>
            </div>
            <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 lg:grid-cols-[1.4fr_1fr_1fr]">
              {admin.role !== "viewer" && <form action={adjustMemberPoints} className="grid gap-2 sm:grid-cols-[120px_1fr_auto]"><input type="hidden" name="memberId" value={member.id} /><input name="amount" type="number" required placeholder="+100 / -50" className="h-11 rounded-xl border border-white/10 bg-black/40 px-3 outline-none" /><input name="note" required minLength={3} maxLength={200} placeholder="Reason for adjustment" className="h-11 rounded-xl border border-white/10 bg-black/40 px-3 outline-none" /><button className="h-11 rounded-xl bg-yellow-400 px-4 text-xs font-black text-black">Apply points</button></form>}
              {admin.role === "owner" && <ResetMemberPassword memberId={member.id} />}
              {admin.role === "owner" && <form action={setMemberStatus} className="rounded-xl border border-white/10 bg-black/30 p-3"><input type="hidden" name="memberId" value={member.id} /><input type="hidden" name="status" value={member.status === "active" ? "suspended" : "active"} /><button className={`text-xs font-bold ${member.status === "active" ? "text-red-300" : "text-emerald-300"}`}>{member.status === "active" ? "Suspend member" : "Reactivate member"}</button></form>}
            </div>
          </article>
        ))}
        {!membersError && (members ?? []).length === 0 && <p className="rounded-2xl border border-white/10 p-10 text-center text-zinc-500">No members have registered yet.</p>}
      </div>
    </section>
  );
}
