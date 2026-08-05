import { requireAdmin } from "@/lib/admin/access";
import { displayMalaysianPhone } from "@/lib/member/phone";
import { createAdminClient } from "@/lib/supabase/admin";

import { MembersPanel, type AdminMemberRecord } from "./MembersPanel";

type MembersPageProps = { searchParams: Promise<{ success?: string | string[]; error?: string | string[] }> };

export default async function AdminMembersPage({ searchParams }: MembersPageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const success = Array.isArray(params.success) ? params.success[0] : params.success;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const client = createAdminClient();
  const [membersResult, activeResult, suspendedResult, neverLoggedInResult] = await Promise.all([
    client.from("member_profiles").select("id, full_name, phone, status, must_change_password, points_balance, last_login_at, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(500),
    client.from("member_profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
    client.from("member_profiles").select("id", { count: "exact", head: true }).eq("status", "suspended"),
    client.from("member_profiles").select("id", { count: "exact", head: true }).is("last_login_at", null),
  ]);
  const members = (membersResult.data ?? []).map((member) => ({
    id: member.id,
    fullName: member.full_name,
    phone: displayMalaysianPhone(member.phone),
    status: member.status,
    mustChangePassword: member.must_change_password,
    pointsBalance: Number(member.points_balance),
    lastLoginAt: member.last_login_at,
    createdAt: member.created_at,
  } satisfies AdminMemberRecord));
  const summary = {
    total: membersResult.count ?? 0,
    active: activeResult.count ?? 0,
    suspended: suspendedResult.count ?? 0,
    neverLoggedIn: neverLoggedInResult.count ?? 0,
  };

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">Membership</p>
      <h1 className="mt-3 text-3xl font-black">Members</h1>
      <p className="mt-2 text-sm text-zinc-500">Search member profiles, manage points, suspend access and update forgotten passwords.</p>
      {success ? <p className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">Member account updated successfully.</p> : null}
      {error || membersResult.error ? <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">The requested member operation could not be completed.</p> : null}
      <MembersPanel members={members} summary={summary} canEditPoints={admin.role !== "viewer"} isOwner={admin.role === "owner"} />
    </section>
  );
}
