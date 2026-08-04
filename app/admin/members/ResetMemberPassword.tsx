"use client";

import { useActionState } from "react";

import { resetMemberPassword, type ResetMemberState } from "./actions";

const initialResetMemberState: ResetMemberState = { status: "idle", message: "" };

export function ResetMemberPassword({ memberId }: { memberId: string }) {
  const [state, action, pending] = useActionState(resetMemberPassword, initialResetMemberState);
  return (
    <form action={action} className="rounded-xl border border-white/10 bg-black/30 p-3">
      <input type="hidden" name="memberId" value={memberId} />
      <button disabled={pending} className="text-xs font-bold text-yellow-300">{pending ? "Resetting…" : "Generate 6-digit password"}</button>
      {state.message && <p className={`mt-2 text-xs ${state.status === "success" ? "text-emerald-300" : "text-red-300"}`}>{state.message}</p>}
      {state.password && <p className="mt-2 break-all rounded-lg bg-yellow-400/10 p-2 font-mono text-sm font-black text-yellow-300">{state.password}</p>}
    </form>
  );
}
