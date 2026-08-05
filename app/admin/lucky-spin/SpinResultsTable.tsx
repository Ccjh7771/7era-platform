"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { formatMalaysiaDateTime } from "@/lib/member/time";

import { updateSpinClaimStatus } from "./actions";

type ClaimStatus = "pending" | "fulfilled" | "cancelled";
type ResultFilter = "all" | "winners" | "thank_you" | "pending";

export type SpinResultRecord = {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  prizeName: string;
  isWinner: boolean;
  pointsSpent: number;
  createdAt: string;
  claim: { id: string; code: string; status: ClaimStatus } | null;
};

const resultFilters: Array<{ id: ResultFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "winners", label: "Winners" },
  { id: "thank_you", label: "Thank You" },
  { id: "pending", label: "Pending claims" },
];

export function SpinResultsTable({ results, editable }: { results: SpinResultRecord[]; editable: boolean }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ResultFilter>("all");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredResults = useMemo(() => results.filter((result) => {
    const matchesSearch = deferredSearch.length === 0 || [
      result.memberName,
      result.memberPhone,
      result.prizeName,
      result.claim?.code ?? "",
    ].some((value) => value.toLowerCase().includes(deferredSearch));
    if (!matchesSearch) return false;
    if (filter === "winners") return result.isWinner;
    if (filter === "thank_you") return !result.isWinner;
    if (filter === "pending") return result.claim?.status === "pending";
    return true;
  }), [deferredSearch, filter, results]);

  const summary = useMemo(() => {
    const participantIds = new Set<string>();
    let winners = 0;
    let pendingClaims = 0;
    for (const result of results) {
      participantIds.add(result.memberId);
      if (result.isWinner) winners += 1;
      if (result.claim?.status === "pending") pendingClaims += 1;
    }
    return { participants: participantIds.size, winners, pendingClaims };
  }, [results]);

  return (
    <div className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">Spin activity</h2>
          <p className="mt-1 text-sm text-zinc-500">Search the latest {results.length} spin records and manage winner claims.</p>
        </div>
        <span className="text-xs text-zinc-600">Malaysia time</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><p className="text-xs text-zinc-500">Spins loaded</p><strong className="mt-2 block text-2xl">{results.length}</strong></div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><p className="text-xs text-zinc-500">Participants</p><strong className="mt-2 block text-2xl">{summary.participants}</strong></div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><p className="text-xs text-zinc-500">Winners</p><strong className="mt-2 block text-2xl text-emerald-300">{summary.winners}</strong></div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><p className="text-xs text-zinc-500">Pending claims</p><strong className="mt-2 block text-2xl text-yellow-300">{summary.pendingClaims}</strong></div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto]">
        <label>
          <span className="sr-only">Search spin activity</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search member, phone, prize or claim code" className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-sm outline-none placeholder:text-zinc-700 focus:border-yellow-400/40" />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Spin activity filters">
          {resultFilters.map((item) => (
            <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-black transition ${filter === item.id ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300" : "border-white/10 text-zinc-500 hover:text-zinc-300"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-600">Showing {filteredResults.length} records</p>

      <div className="mt-4 divide-y divide-white/10">
        {filteredResults.length === 0 && <p className="rounded-2xl border border-white/10 p-8 text-center text-sm text-zinc-500">No matching spin records.</p>}
        {filteredResults.map((result) => (
          <article key={result.id} className="grid gap-3 py-5 lg:grid-cols-[1.3fr_1fr_0.7fr_1.2fr_auto] lg:items-center">
            <div>
              <strong className="block">{result.memberName}</strong>
              <span className="mt-1 block text-xs text-zinc-600">{result.memberPhone}</span>
            </div>
            <div>
              <span className={`text-sm font-bold ${result.isWinner ? "text-emerald-300" : "text-zinc-500"}`}>{result.prizeName}</span>
              <span className="mt-1 block text-xs text-zinc-600">-{result.pointsSpent} points</span>
            </div>
            <div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${result.claim?.status === "fulfilled" ? "bg-emerald-400/10 text-emerald-300" : result.claim?.status === "cancelled" ? "bg-red-400/10 text-red-300" : result.claim ? "bg-yellow-400/10 text-yellow-300" : "bg-white/[0.04] text-zinc-600"}`}>
                {result.claim?.status ?? "No claim"}
              </span>
            </div>
            <div>
              <span className="block font-mono text-xs text-zinc-300">{result.claim?.code ?? "—"}</span>
              <time dateTime={result.createdAt} className="mt-1 block text-xs text-zinc-600">{formatMalaysiaDateTime(result.createdAt)}</time>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {editable && result.claim?.status === "pending" && (
                <>
                  <ClaimStatusButton claimId={result.claim.id} status="fulfilled" label="Fulfill" />
                  <ClaimStatusButton claimId={result.claim.id} status="cancelled" label="Cancel" tone="danger" />
                </>
              )}
              {editable && result.claim && result.claim.status !== "pending" && <ClaimStatusButton claimId={result.claim.id} status="pending" label="Reopen" />}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ClaimStatusButton({ claimId, status, label, tone = "default" }: { claimId: string; status: ClaimStatus; label: string; tone?: "default" | "danger" }) {
  return (
    <form action={updateSpinClaimStatus}>
      <input type="hidden" name="claimId" value={claimId} />
      <input type="hidden" name="status" value={status} />
      <button className={`rounded-xl border px-3 py-2 text-xs font-bold ${tone === "danger" ? "border-red-400/20 text-red-300" : "border-yellow-400/20 text-yellow-300"}`}>{label}</button>
    </form>
  );
}
