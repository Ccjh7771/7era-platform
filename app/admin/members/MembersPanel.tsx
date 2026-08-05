"use client";

import Link from "next/link";
import { Fragment, useDeferredValue, useMemo, useState } from "react";

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
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredMembers = useMemo(() => members.filter((member) => {
    const matchesSearch = deferredSearch.length === 0 || [member.fullName, member.phone].some((value) => value.toLowerCase().includes(deferredSearch));
    if (!matchesSearch) return false;
    if (filter === "never_logged_in") return member.lastLoginAt === null;
    if (filter === "active" || filter === "suspended") return member.status === filter;
    return true;
  }), [deferredSearch, filter, members]);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <SummaryCard label="Total Members" value={summary.total} />
        <SummaryCard label="Active" value={summary.active} tone="success" />
        <SummaryCard label="Suspended" value={summary.suspended} tone="danger" />
        <SummaryCard label="Never Logged In" value={summary.neverLoggedIn} tone="warning" />
      </div>

      <div className="mt-4 flex flex-col gap-3 border border-white/10 bg-zinc-900 p-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="min-w-0 flex-1 lg:max-w-md">
          <span className="sr-only">Search members</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or mobile number" className="h-9 w-full border border-zinc-600 bg-black px-3 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400" />
        </label>
        <div className="flex gap-1 overflow-x-auto" role="group" aria-label="Member filters">
          {memberFilters.map((item) => (
            <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={`shrink-0 border px-3 py-2 text-[10px] font-black uppercase ${filter === item.id ? "border-yellow-300 bg-yellow-300 text-black" : "border-zinc-600 bg-zinc-800 text-zinc-300 hover:border-zinc-400"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border-x border-b border-zinc-600 bg-white">
        <table className="w-full min-w-[1080px] table-fixed border-collapse text-[11px] text-black">
          <thead className="bg-zinc-600 text-left text-[10px] font-bold uppercase text-white">
            <tr>
              <TableHeading className="w-[150px]">Register Date ▼</TableHeading>
              <TableHeading className="w-[190px]">Name</TableHeading>
              <TableHeading className="w-[135px]">Mobile</TableHeading>
              <TableHeading className="w-[95px]">Status</TableHeading>
              <TableHeading className="w-[100px] text-right">Points</TableHeading>
              <TableHeading className="w-[160px]">Last Login</TableHeading>
              <TableHeading className="w-[135px]">Password</TableHeading>
              <TableHeading className="w-[190px]">Action</TableHeading>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member, index) => (
              <Fragment key={member.id}>
                <tr className={index % 2 === 0 ? "bg-white" : "bg-zinc-100"}>
                  <TableCell className="whitespace-nowrap">{formatMalaysiaDateTime(member.createdAt)}</TableCell>
                  <TableCell className="truncate font-bold uppercase" title={member.fullName}>{member.fullName}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono">{member.phone}</TableCell>
                  <TableCell><span className={`font-bold uppercase ${member.status === "active" ? "text-emerald-700" : "text-red-600"}`}>{member.status}</span></TableCell>
                  <TableCell className="text-right font-mono font-bold text-blue-700">{member.pointsBalance.toLocaleString("en-MY")}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.lastLoginAt ? formatMalaysiaDateTime(member.lastLoginAt) : <span className="text-zinc-500">Never</span>}</TableCell>
                  <TableCell>{member.mustChangePassword ? <span className="font-bold text-amber-700">Update required</span> : <span className="text-emerald-700">Normal</span>}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href="/admin/live-chat" prefetch={false} className="border border-zinc-400 bg-zinc-100 px-2 py-1 text-[9px] font-bold hover:bg-zinc-200">CHAT</Link>
                      <Link href={`/admin/members/${member.id}`} prefetch={false} className="border border-zinc-400 bg-zinc-100 px-2 py-1 text-[9px] font-bold hover:bg-zinc-200">PROFILE</Link>
                      {(canEditPoints || isOwner) && <button type="button" onClick={() => setOpenMemberId((current) => current === member.id ? null : member.id)} aria-expanded={openMemberId === member.id} className="border border-zinc-400 bg-zinc-100 px-2 py-1 text-[9px] font-bold hover:bg-zinc-200">MANAGE</button>}
                    </div>
                  </TableCell>
                </tr>
                {openMemberId === member.id && (
                  <tr className="bg-zinc-950 text-white">
                    <td colSpan={8} className="border border-zinc-600 p-4">
                      <MemberControls member={member} canEditPoints={canEditPoints} isOwner={isOwner} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {filteredMembers.length === 0 && <p className="p-10 text-center text-sm text-zinc-500">No matching members.</p>}
      </div>
      <p className="mt-2 text-right text-[10px] text-zinc-600">Showing {filteredMembers.length} of {members.length} loaded members</p>
    </div>
  );
}

function SummaryCard({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "success" | "danger" | "warning" }) {
  const toneClass = tone === "success" ? "text-emerald-300" : tone === "danger" ? "text-red-300" : tone === "warning" ? "text-yellow-300" : "text-white";
  return <div className="border border-white/10 bg-zinc-900 px-4 py-3"><p className="text-[10px] font-bold uppercase text-zinc-500">{label}</p><strong className={`mt-1 block text-xl ${toneClass}`}>{value.toLocaleString("en-MY")}</strong></div>;
}

function TableHeading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th scope="col" className={`border border-zinc-400 px-2 py-2 ${className}`}>{children}</th>;
}

function TableCell({ children, className = "", title }: { children: React.ReactNode; className?: string; title?: string }) {
  return <td className={`h-9 border border-zinc-400 px-2 py-1 ${className}`} title={title}>{children}</td>;
}

function MemberControls({ member, canEditPoints, isOwner }: { member: AdminMemberRecord; canEditPoints: boolean; isOwner: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
      {canEditPoints ? (
        <form action={adjustMemberPoints} className="grid content-start gap-2 sm:grid-cols-[120px_1fr_auto]">
          <input type="hidden" name="memberId" value={member.id} />
          <label><span className="sr-only">Points adjustment</span><input name="amount" type="number" required placeholder="+100 / -50" className="h-10 w-full border border-zinc-700 bg-black px-3 text-xs outline-none focus:border-yellow-400" /></label>
          <label><span className="sr-only">Reason for adjustment</span><input name="note" required minLength={3} maxLength={200} placeholder="Reason for adjustment" className="h-10 w-full border border-zinc-700 bg-black px-3 text-xs outline-none focus:border-yellow-400" /></label>
          <button className="h-10 bg-yellow-400 px-4 text-xs font-black text-black">Apply points</button>
        </form>
      ) : <div />}
      {isOwner ? <ResetMemberPassword memberId={member.id} /> : null}
      {isOwner ? (
        <form action={setMemberStatus} className="border border-zinc-700 bg-black p-3">
          <input type="hidden" name="memberId" value={member.id} />
          <input type="hidden" name="status" value={member.status === "active" ? "suspended" : "active"} />
          <p className="text-xs text-zinc-500">Account access</p>
          <button className={`mt-2 text-xs font-bold ${member.status === "active" ? "text-red-300" : "text-emerald-300"}`}>{member.status === "active" ? "Suspend member" : "Reactivate member"}</button>
        </form>
      ) : null}
    </div>
  );
}
