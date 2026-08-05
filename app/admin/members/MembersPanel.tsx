"use client";

import Link from "next/link";
import { Fragment, useDeferredValue, useMemo, useState } from "react";

import { formatMalaysiaDateTime } from "@/lib/member/time";

import { adjustMemberPoints, setMemberStatus, updateMemberBusinessProfile } from "./actions";
import { ResetMemberPassword } from "./ResetMemberPassword";

type MemberFilter = "all" | "active" | "suspended" | "never_logged_in";
type MemberSortKey = "createdAt" | "fullName" | "phone" | "status" | "pointsBalance";
type MemberSort = { key: MemberSortKey; direction: "asc" | "desc" };

export type AdminMemberRecord = {
  id: string;
  fullName: string;
  phone: string;
  status: "active" | "suspended";
  mustChangePassword: boolean;
  pointsBalance: number;
  bankAccount: string;
  bankName: string;
  referrerName: string;
  topReferrerName: string;
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
  const [sort, setSort] = useState<MemberSort>({ key: "createdAt", direction: "desc" });
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredMembers = useMemo(() => {
    const filtered = members.filter((member) => {
      const matchesSearch = deferredSearch.length === 0 || [member.fullName, member.phone, member.bankAccount, member.bankName, member.referrerName, member.topReferrerName].some((value) => value.toLowerCase().includes(deferredSearch));
      if (!matchesSearch) return false;
      if (filter === "never_logged_in") return member.lastLoginAt === null;
      if (filter === "active" || filter === "suspended") return member.status === filter;
      return true;
    });
    return [...filtered].sort((a, b) => {
      const first = sort.key === "createdAt" ? Date.parse(a.createdAt) : sort.key === "pointsBalance" ? a.pointsBalance : a[sort.key];
      const second = sort.key === "createdAt" ? Date.parse(b.createdAt) : sort.key === "pointsBalance" ? b.pointsBalance : b[sort.key];
      const comparison = typeof first === "number" && typeof second === "number" ? first - second : String(first).localeCompare(String(second), "en-MY", { numeric: true, sensitivity: "base" });
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [deferredSearch, filter, members, sort]);

  function changeSort(key: MemberSortKey) {
    setSort((current) => current.key === key
      ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
      : { key, direction: key === "createdAt" || key === "pointsBalance" ? "desc" : "asc" });
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <SummaryCard label="Total Members" value={summary.total} />
        <SummaryCard label="Active" value={summary.active} tone="success" />
        <SummaryCard label="Suspended" value={summary.suspended} tone="danger" />
        <SummaryCard label="Never Logged In" value={summary.neverLoggedIn} tone="warning" />
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-t-xl border border-white/10 bg-zinc-900 p-3 lg:flex-row lg:items-center lg:justify-between">
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

      <div className="overflow-x-auto rounded-b-xl border-x border-b border-white/10 bg-zinc-950">
        <table className="w-full table-fixed border-collapse text-[11px] text-zinc-200">
          <thead className="bg-zinc-800 text-left text-[10px] font-bold uppercase tracking-wide text-zinc-300">
            <tr>
              <SortableHeading label="Register Date" sortKey="createdAt" sort={sort} onSort={changeSort} className="hidden w-[125px] xl:table-cell" />
              <SortableHeading label="Name" sortKey="fullName" sort={sort} onSort={changeSort} className="w-[140px]" />
              <SortableHeading label="Mobile" sortKey="phone" sort={sort} onSort={changeSort} className="w-[120px]" />
              <TableHeading className="hidden w-[135px] 2xl:table-cell">Bank Account</TableHeading>
              <TableHeading className="hidden w-[90px] 2xl:table-cell">Bank</TableHeading>
              <TableHeading className="hidden w-[130px] 2xl:table-cell">Referrer</TableHeading>
              <TableHeading className="hidden w-[130px] 2xl:table-cell">Top Referrer</TableHeading>
              <SortableHeading label="Status" sortKey="status" sort={sort} onSort={changeSort} className="w-[75px]" />
              <SortableHeading label="Points" sortKey="pointsBalance" sort={sort} onSort={changeSort} className="w-[70px]" align="right" />
              <TableHeading className="w-[155px]">Action</TableHeading>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member, index) => (
              <Fragment key={member.id}>
                <tr className={`${index % 2 === 0 ? "bg-zinc-950" : "bg-white/[0.025]"} transition hover:bg-yellow-400/[0.05]`}>
                  <TableCell className="hidden whitespace-nowrap text-zinc-500 xl:table-cell">{formatMalaysiaDateTime(member.createdAt)}</TableCell>
                  <TableCell className="truncate font-bold uppercase" title={member.fullName}>{member.fullName}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-zinc-300">{member.phone}</TableCell>
                  <TableCell className="hidden truncate font-mono 2xl:table-cell" title={member.bankAccount}>{member.bankAccount || "-"}</TableCell>
                  <TableCell className="hidden truncate uppercase 2xl:table-cell" title={member.bankName}>{member.bankName || "-"}</TableCell>
                  <TableCell className="hidden truncate uppercase 2xl:table-cell" title={member.referrerName}>{member.referrerName || "-"}</TableCell>
                  <TableCell className="hidden truncate uppercase 2xl:table-cell" title={member.topReferrerName}>{member.topReferrerName || "-"}</TableCell>
                  <TableCell><span className={`font-bold uppercase ${member.status === "active" ? "text-emerald-300" : "text-red-300"}`}>{member.status}</span></TableCell>
                  <TableCell className="text-right font-mono font-bold text-yellow-300">{member.pointsBalance.toLocaleString("en-MY")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/live-chat?member=${member.id}`} prefetch={false} className="rounded border border-white/15 bg-white/[0.05] px-2 py-1 text-[9px] font-bold text-zinc-300 hover:border-yellow-400/40 hover:text-yellow-300">CHAT</Link>
                      <Link href={`/admin/members/${member.id}`} prefetch={false} className="rounded border border-white/15 bg-white/[0.05] px-2 py-1 text-[9px] font-bold text-zinc-300 hover:border-yellow-400/40 hover:text-yellow-300">PROFILE</Link>
                      {(canEditPoints || isOwner) && <button type="button" onClick={() => setOpenMemberId((current) => current === member.id ? null : member.id)} aria-expanded={openMemberId === member.id} className="rounded border border-yellow-400/30 bg-yellow-400/10 px-2 py-1 text-[9px] font-bold text-yellow-300 hover:bg-yellow-400/20">MANAGE</button>}
                    </div>
                  </TableCell>
                </tr>
                {openMemberId === member.id && (
                  <tr className="bg-zinc-950 text-white">
                    <td colSpan={10} className="border border-white/10 p-4">
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
  return <th scope="col" className={`border-b border-r border-white/10 px-3 py-3 last:border-r-0 ${className}`}>{children}</th>;
}

function SortableHeading({ label, sortKey, sort, onSort, className = "", align = "left" }: { label: string; sortKey: MemberSortKey; sort: MemberSort; onSort: (key: MemberSortKey) => void; className?: string; align?: "left" | "right" }) {
  const active = sort.key === sortKey;
  return (
    <th scope="col" aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"} className={`border-b border-r border-white/10 p-0 last:border-r-0 ${className}`}>
      <button type="button" onClick={() => onSort(sortKey)} className={`flex w-full items-center gap-1 px-3 py-3 hover:bg-white/[0.04] hover:text-white ${align === "right" ? "justify-end" : "justify-start"}`}>
        <span>{label}</span>
        <span aria-hidden="true" className={active ? "text-yellow-300" : "text-zinc-600"}>{active ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span>
      </button>
    </th>
  );
}

function TableCell({ children, className = "", title }: { children: React.ReactNode; className?: string; title?: string }) {
  return <td className={`h-11 border-b border-r border-white/[0.07] px-3 py-2 last:border-r-0 ${className}`} title={title}>{children}</td>;
}

function MemberControls({ member, canEditPoints, isOwner }: { member: AdminMemberRecord; canEditPoints: boolean; isOwner: boolean }) {
  return (
    <div className="space-y-4">
      {canEditPoints ? (
        <form action={updateMemberBusinessProfile} className="grid gap-2 border border-zinc-700 bg-black p-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <input type="hidden" name="memberId" value={member.id} />
          <label><span className="mb-1 block text-[10px] font-bold uppercase text-zinc-500">Bank Account</span><input name="bankAccount" defaultValue={member.bankAccount} maxLength={50} autoComplete="off" className="h-10 w-full border border-zinc-700 bg-zinc-950 px-3 text-xs outline-none focus:border-yellow-400" /></label>
          <label><span className="mb-1 block text-[10px] font-bold uppercase text-zinc-500">Bank</span><input name="bankName" defaultValue={member.bankName} maxLength={80} autoComplete="off" className="h-10 w-full border border-zinc-700 bg-zinc-950 px-3 text-xs outline-none focus:border-yellow-400" /></label>
          <label><span className="mb-1 block text-[10px] font-bold uppercase text-zinc-500">Referrer</span><input name="referrerName" defaultValue={member.referrerName} maxLength={100} autoComplete="off" className="h-10 w-full border border-zinc-700 bg-zinc-950 px-3 text-xs outline-none focus:border-yellow-400" /></label>
          <label><span className="mb-1 block text-[10px] font-bold uppercase text-zinc-500">Top Referrer</span><input name="topReferrerName" defaultValue={member.topReferrerName} maxLength={100} autoComplete="off" className="h-10 w-full border border-zinc-700 bg-zinc-950 px-3 text-xs outline-none focus:border-yellow-400" /></label>
          <button className="h-10 self-end bg-yellow-400 px-4 text-xs font-black text-black">Save profile</button>
        </form>
      ) : null}
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
    </div>
  );
}
