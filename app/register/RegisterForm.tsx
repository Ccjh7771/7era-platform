"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerMember, type RegistrationState } from "./actions";

const initialRegistrationState: RegistrationState = { status: "idle", message: "" };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerMember, initialRegistrationState);

  if (state.status === "success" && state.temporaryPassword) {
    return (
      <div className="rounded-[28px] border border-emerald-400/25 bg-emerald-400/10 p-6 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">Account created</p>
        <h2 className="mt-3 text-2xl font-black text-white">Save your login details</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{state.message}</p>
        <dl className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-black/40 p-5">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-500">Username</dt>
            <dd className="mt-1 font-mono text-lg font-bold text-white">{state.phone}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-500">6-digit temporary password</dt>
            <dd className="mt-1 break-all font-mono text-lg font-bold text-yellow-300">{state.temporaryPassword}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-5 text-amber-200">You must create a new 6-digit password after your first sign-in.</p>
        <Link href="/member/login" className="mt-6 flex h-14 items-center justify-center rounded-2xl bg-yellow-400 font-black text-black">
          Continue to member login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="absolute -left-[10000px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label htmlFor="full-name" className="text-sm font-semibold text-zinc-200">Full name</label>
      <input id="full-name" name="fullName" required minLength={2} maxLength={100} autoComplete="name" placeholder="Enter your full name" className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none focus:border-yellow-400/50" />
      <label htmlFor="mobile-number" className="mt-6 block text-sm font-semibold text-zinc-200">Malaysian mobile number</label>
      <input id="mobile-number" name="phone" required inputMode="tel" autoComplete="tel" placeholder="01X-XXX-XXXX" className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none focus:border-yellow-400/50" />
      <p className="mt-2 text-xs leading-5 text-zinc-500">This number becomes your username. SMS verification will be introduced later.</p>
      {state.status === "error" && <p role="alert" className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{state.message}</p>}
      <button disabled={pending} className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 font-black text-black disabled:opacity-60">
        {pending ? "Creating account…" : "Create member account"}
      </button>
    </form>
  );
}
