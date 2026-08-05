"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { formatMalaysiaDateTime } from "@/lib/member/time";

import { updateClaimStatus } from "./actions";

type ClaimStatus = "pending" | "fulfilled" | "cancelled";
type ClaimFilter = "all" | ClaimStatus;

export type DailyRewardClaimRecord = {
  id: string;
  memberName: string;
  memberPhone: string;
  rewardName: string;
  claimCode: string;
  status: ClaimStatus;
  createdAt: string;
};

export type DailyRewardSummary = {
  checkIns: number;
  participants: number;
  pointsAwarded: number;
  pendingClaims: number;
};

const claimFilters: Array<{ id: ClaimFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "fulfilled", label: "Fulfilled" },
  { id: "cancelled", label: "Cancelled" },
];

export function RewardClaimsPanel({ claims, summary, editable }: { claims: DailyRewardClaimRecord[]; summary: DailyRewardSummary; editable: boolean }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ClaimFilter>("all");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredClaims = useMemo(() => claims.filter((claim) => {
    const matchesSearch = deferredSearch.length === 0 || [
      claim.memberName,
      claim.memberPhone,
      claim.rewardName,
      claim.claimCode,
    ].some((value) => value.toLowerCase().includes(deferredSearch));
    return matchesSearch && (filter === "all" || claim.status === filter);
  }), [claims, deferredSearch, filter]);

  return (
    <div className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">Daily Reward activity</h2>
          <p className="mt-1 text-sm text-zinc-500">Review check-ins and manage prize claims from Daily Rewards.</p>
        </div>
        <span className="text-xs text-zinc-600">Malaysia time</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Check-ins" value={summary.checkIns} />
        <SummaryCard label="Participants" value={summary.participants} />
        <SummaryCard label="Points awarded" value={summary.pointsAwarded} tone="success" />
        <SummaryCard label="Pending claims" value={summary.pendingClaims} tone="warning" />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto]">
        <label>
          <span className="sr-only">Search Daily Reward claims</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search member, phone, reward or claim code" className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-sm outline-none placeholder:text-zinc-700 focus:border-yellow-400/40" />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Daily Reward claim filters">
          {claimFilters.map((item) => (
            <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-black transition ${filter === item.id ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300" : "border-white/10 text-zinc-500 hover:text-zinc-300"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-600">Showing {filteredClaims.length} of {claims.length} prize claims</p>

      <div className="mt-4 divide-y divide-white/10">
        {filteredClaims.length === 0 ? <p className="rounded-2xl border border-white/10 p-8 text-center text-sm text-zinc-500">No matching Daily Reward claims.</p> : null}
        {filteredClaims.map((claim) => (
          <article key={claim.id} className="grid gap-3 py-5 lg:grid-cols-[1.2fr_1fr_0.75fr_1.2fr_auto] lg:items-center">
            <div>
              <strong className="block">{claim.memberName}</strong>
              <span className="mt-1 block text-xs text-zinc-600">{claim.memberPhone}</span>
            </div>
            <strong className="text-sm text-zinc-200">{claim.rewardName}</strong>
            <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${claim.status === "fulfilled" ? "bg-emerald-400/10 text-emerald-300" : claim.status === "cancelled" ? "bg-red-400/10 text-red-300" : "bg-yellow-400/10 text-yellow-300"}`}>{claim.status}</span>
            <div>
              <span className="block font-mono text-xs text-emerald-300">{claim.claimCode}</span>
              <time dateTime={claim.createdAt} className="mt-1 block text-xs text-zinc-600">{formatMalaysiaDateTime(claim.createdAt)}</time>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {editable && claim.status === "pending" ? (
                <>
                  <ClaimStatusButton claimId={claim.id} status="fulfilled" label="Fulfill" />
                  <ClaimStatusButton claimId={claim.id} status="cancelled" label="Cancel" tone="danger" />
                </>
              ) : null}
              {editable && claim.status !== "pending" ? <ClaimStatusButton claimId={claim.id} status="pending" label="Reopen" /> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "success" | "warning" }) {
  const toneClass = tone === "success" ? "text-emerald-300" : tone === "warning" ? "text-yellow-300" : "";
  return <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><p className="text-xs text-zinc-500">{label}</p><strong className={`mt-2 block text-2xl ${toneClass}`}>{value.toLocaleString("en-MY")}</strong></div>;
}

function ClaimStatusButton({ claimId, status, label, tone = "default" }: { claimId: string; status: ClaimStatus; label: string; tone?: "default" | "danger" }) {
  return (
    <form action={updateClaimStatus}>
      <input type="hidden" name="claimId" value={claimId} />
      <input type="hidden" name="status" value={status} />
      <button className={`rounded-xl border px-3 py-2 text-xs font-bold ${tone === "danger" ? "border-red-400/20 text-red-300" : "border-yellow-400/20 text-yellow-300"}`}>{label}</button>
    </form>
  );
}
