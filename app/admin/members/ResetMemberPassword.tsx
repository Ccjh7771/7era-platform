"use client";

import { useActionState, useEffect, useRef } from "react";

import { resetMemberPassword, type ResetMemberState } from "./actions";

const initialResetMemberState: ResetMemberState = { status: "idle", message: "" };

export function ResetMemberPassword({ memberId }: { memberId: string }) {
  const [state, action, pending] = useActionState(resetMemberPassword, initialResetMemberState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={action} className="rounded-xl border border-white/10 bg-black/30 p-3">
      <input type="hidden" name="memberId" value={memberId} />
      <label htmlFor={`member-password-${memberId}`} className="text-xs font-semibold text-zinc-400">New password</label>
      <input id={`member-password-${memberId}`} name="password" type="password" required minLength={6} maxLength={72} autoComplete="new-password" placeholder="At least 6 characters" className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-black/50 px-3 text-sm outline-none focus:border-yellow-400/50" />
      <label htmlFor={`member-password-confirm-${memberId}`} className="mt-3 block text-xs font-semibold text-zinc-400">Confirm password</label>
      <input id={`member-password-confirm-${memberId}`} name="confirmPassword" type="password" required minLength={6} maxLength={72} autoComplete="new-password" placeholder="Enter password again" className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-black/50 px-3 text-sm outline-none focus:border-yellow-400/50" />
      <button disabled={pending} className="mt-3 text-xs font-bold text-yellow-300">{pending ? "Updating…" : "Update member password"}</button>
      {state.message && <p className={`mt-2 text-xs ${state.status === "success" ? "text-emerald-300" : "text-red-300"}`}>{state.message}</p>}
    </form>
  );
}
