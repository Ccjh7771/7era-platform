"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { claimDailyReward, type DailyClaimState } from "./daily-actions";
import { MEMBER_POINTS_UPDATED_EVENT } from "./MemberPointsBadge";

const initialDailyClaimState: DailyClaimState = { status: "idle", message: "" };

export function DailyClaimButton({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(claimDailyReward, initialDailyClaimState);
  const router = useRouter();

  useEffect(() => {
    if (state.status !== "success") return;

    if (Number.isFinite(state.balance)) {
      window.dispatchEvent(new CustomEvent(MEMBER_POINTS_UPDATED_EVENT, {
        detail: {
          balance: Number(state.balance),
          spinsRemaining: 0,
        },
      }));
    }

    router.refresh();
  }, [router, state.balance, state.status]);

  return (
    <div>
      <form action={action}>
        <button disabled={disabled || pending || state.status === "success"} className="h-12 rounded-2xl bg-yellow-400 px-6 text-sm font-black text-black disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400">
          {pending ? "Claiming…" : disabled || state.status === "success" ? "Claimed today" : "Claim today's reward"}
        </button>
      </form>
      {state.message && <p role="status" className={`mt-3 text-sm ${state.status === "success" ? "text-emerald-300" : "text-red-300"}`}>{state.message}</p>}
    </div>
  );
}
