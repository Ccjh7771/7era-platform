"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { formatMalaysiaDateTime } from "@/lib/member/time";

import { adjustMemberPoints, setMemberStatus } from "./actions";
import { ResetMemberPassword } from "./ResetMemberPassword";

type MemberFilter = "all" | "active" | "suspended" | "never_logged_in";

export type AdminMemberRecord = {
  id: string;
  fullName: string;
  phone: string;
  status: "active" | "suspended";
  mustChangePassword: boolean;
  pointsBalance: number;
  lastLoginAt: string | null;
  createdAt: string;
};

export type MemberSummary = {
  total: number;
  active: number;
  suspended: number;
  neverLoggedIn: number;
};

const memberFilters: Array<{ id: MemberFilter; label: string }> = [
  { id: "all", label: "All members" },
  { id: "active", label: "Active" },
  { id: "suspended", label: "Suspended" },
  { id: "never_logged_in", label: "Never logged in" },
];

export function MembersPanel({ members, summary, canEditPoints, isOwner }: { members: AdminMemberRecord[]; summary: MemberSummary; canEditPoints: boolean; isOwner: boolean }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MemberFilter>("all");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredMembers = useMemo(() => members.filter((member) => {
    const matchesSearch = deferredSearch.length === 0 || [member.fullName, member.phone].some((value) => value.toLowerCase().includes(deferredSearch));
    if (!matchesSearch) return false;
    if (filter === "never_logged_in") return member.lastLoginAt === null;
    if (filter === "active" || filter === "suspended") return member.status === filter;
    return true;
  }), [deferredSearch, filter, members]);

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total members" value={summary.total} />
        <SummaryCard label="Active" value={summary.active} tone="success" />
        <SummaryCard label="Suspended" value={summary.suspended} tone="danger" />
        <SummaryCard label="Never logged in" value={summary.neverLoggedIn} tone="warning" />
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto]">
          <label>
            <span className="sr-only">Search members</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search full name or phone number" className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-sm outline-none placeholder:text-zinc-700 focus:border-yellow-400/40" />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Member filters">
            {memberFilters.map((item) => (
              <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-black transition ${filter === item.id ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300" : "border-white/10 text-zinc-500 hover:text-zinc-300"}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-600">Showing {filteredMembers.length} of {members.length} loaded members</p>
      </div>

      <div className="mt-5 space-y-5">
        {filteredMembers.length === 0 ? <p className="rounded-2xl border border-white/10 p-10 text-center text-zinc-500">No matching members.</p> : null}
        {filteredMembers.map((member) => <MemberCard key={member.id} member={member} canEditPoints={canEditPoints} isOwner={isOwner} />)}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "success" | "danger" | "warning" }) {
  const toneClass = tone === "success" ? "text-emerald-300" : tone === "danger" ? "text-red-300" : tone === "warning" ? "text-yellow-300" : "";
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-zinc-500">{label}</p><strong className={`mt-2 block text-2xl ${toneClass}`}>{value.toLocaleString("en-MY")}</strong></div>;
}

function MemberCard({ member, canEditPoints, isOwner }: { member: AdminMemberRecord; canEditPoints: boolean; isOwner: boolean }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black">{member.fullName}</h2>
            {member.mustChangePassword ? <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[10px] font-black uppercase text-amber-300">Password update required</span> : null}
          </div>
          <p className="mt-1 text-sm text-zinc-400">{member.phone}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-600">
            <span>Joined {formatMalaysiaDateTime(member.createdAt)}</span>
            <span>Last login {member.lastLoginAt ? formatMalaysiaDateTime(member.lastLoginAt) : "Never"}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-yellow-300">{member.pointsBalance.toLocaleString("en-MY")} PTS</p>
          <p className={`mt-1 text-xs font-black uppercase ${member.status === "active" ? "text-emerald-300" : "text-red-300"}`}>{member.status}</p>
          <Link href={`/admin/members/${member.id}`} prefetch={false} className="mt-3 inline-flex rounded-xl border border-yellow-400/20 px-3 py-2 text-xs font-bold text-yellow-300">View full activity</Link>
        </div>
      </div>

      {canEditPoints || isOwner ? (
        <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 lg:grid-cols-[1.4fr_1fr_1fr]">
          {canEditPoints ? (
            <form action={adjustMemberPoints} className="grid gap-2 sm:grid-cols-[120px_1fr_auto]">
              <input type="hidden" name="memberId" value={member.id} />
              <label><span className="sr-only">Points adjustment</span><input name="amount" type="number" required placeholder="+100 / -50" className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 outline-none" /></label>
              <label><span className="sr-only">Reason for adjustment</span><input name="note" required minLength={3} maxLength={200} placeholder="Reason for adjustment" className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 outline-none" /></label>
              <button className="h-11 rounded-xl bg-yellow-400 px-4 text-xs font-black text-black">Apply points</button>
            </form>
          ) : <div />}
          {isOwner ? <ResetMemberPassword memberId={member.id} /> : null}
          {isOwner ? (
            <form action={setMemberStatus} className="rounded-xl border border-white/10 bg-black/30 p-3">
              <input type="hidden" name="memberId" value={member.id} />
              <input type="hidden" name="status" value={member.status === "active" ? "suspended" : "active"} />
              <p className="text-xs text-zinc-600">Account access</p>
              <button className={`mt-2 text-xs font-bold ${member.status === "active" ? "text-red-300" : "text-emerald-300"}`}>{member.status === "active" ? "Suspend member" : "Reactivate member"}</button>
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
