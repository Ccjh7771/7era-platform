"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import { createManualMember, type CreateMemberState } from "./actions";

const initialState: CreateMemberState = { status: "idle", message: "" };

export function ManualMemberForm() {
  const [state, action, pending] = useActionState(createManualMember, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <details className="mt-6 border border-yellow-400/20 bg-yellow-400/[0.04]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-black text-yellow-300 marker:content-none">
        <span>＋ Create Member Manually</span>
        <span className="text-[10px] font-bold uppercase text-zinc-500">Open form</span>
      </summary>
    <form ref={formRef} action={action} className="border-t border-yellow-400/20 p-5 sm:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">Manual registration</p>
        <h2 className="mt-2 text-xl font-black">Create a member</h2>
        <p className="mt-2 text-sm text-zinc-500">Enter the customer&apos;s full name, Malaysian mobile number and a password of at least 6 characters.</p>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label><span className="text-xs font-semibold text-zinc-400">Customer full name</span><input name="fullName" required minLength={2} maxLength={100} autoComplete="name" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 outline-none focus:border-yellow-400/50" /></label>
        <label><span className="text-xs font-semibold text-zinc-400">Mobile number</span><input name="phone" required inputMode="tel" autoComplete="tel" placeholder="01X-XXX-XXXX" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 outline-none focus:border-yellow-400/50" /></label>
        <label><span className="text-xs font-semibold text-zinc-400">Password</span><input name="password" type="password" required minLength={6} maxLength={72} autoComplete="new-password" placeholder="At least 6 characters" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 outline-none focus:border-yellow-400/50" /></label>
        <label><span className="text-xs font-semibold text-zinc-400">Confirm password</span><input name="confirmPassword" type="password" required minLength={6} maxLength={72} autoComplete="new-password" placeholder="Enter the same password" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 outline-none focus:border-yellow-400/50" /></label>
        <label><span className="text-xs font-semibold text-zinc-400">Bank account <span className="text-zinc-600">(optional)</span></span><input name="bankAccount" maxLength={50} autoComplete="off" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 outline-none focus:border-yellow-400/50" /></label>
        <label><span className="text-xs font-semibold text-zinc-400">Bank <span className="text-zinc-600">(optional)</span></span><input name="bankName" maxLength={80} autoComplete="off" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 outline-none focus:border-yellow-400/50" /></label>
        <label><span className="text-xs font-semibold text-zinc-400">Referrer <span className="text-zinc-600">(optional)</span></span><input name="referrerName" maxLength={100} autoComplete="off" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 outline-none focus:border-yellow-400/50" /></label>
        <label><span className="text-xs font-semibold text-zinc-400">Top referrer <span className="text-zinc-600">(optional)</span></span><input name="topReferrerName" maxLength={100} autoComplete="off" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 outline-none focus:border-yellow-400/50" /></label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button disabled={pending} className="h-12 rounded-xl bg-yellow-400 px-6 text-sm font-black text-black disabled:cursor-wait disabled:opacity-60">{pending ? "Creating member…" : "Create member"}</button>
        {state.message ? <p role={state.status === "error" ? "alert" : "status"} className={`text-sm ${state.status === "success" ? "text-emerald-300" : "text-red-300"}`}>{state.message}</p> : null}
        {state.status === "success" && state.memberId ? <Link href={`/admin/members/${state.memberId}`} prefetch={false} className="text-sm font-bold text-yellow-300">Open member profile →</Link> : null}
      </div>
    </form>
    </details>
  );
}
