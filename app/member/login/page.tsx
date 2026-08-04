import Link from "next/link";

import { loginMember } from "./actions";

type LoginPageProps = { searchParams: Promise<{ error?: string | string[] }> };

export default async function MemberLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorMessage = error === "inactive"
    ? "This member account is suspended. Please contact support."
    : error
      ? "Invalid mobile number or password."
      : "";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white">
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[150px]" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10 text-2xl font-black text-yellow-300">7</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-yellow-300">Member Access</p>
          <h1 className="mt-3 text-3xl font-black">Member Login</h1>
          <p className="mt-3 text-sm text-zinc-400">Use your registered mobile number and password.</p>
        </div>
        <form action={loginMember} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8">
          <label htmlFor="member-phone" className="text-sm font-semibold text-zinc-200">Mobile number</label>
          <input id="member-phone" name="phone" type="tel" inputMode="tel" autoComplete="username" required placeholder="01X-XXX-XXXX" className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none focus:border-yellow-400/50" />
          <label htmlFor="member-password" className="mt-6 block text-sm font-semibold text-zinc-200">Password</label>
          <input id="member-password" name="password" type="password" autoComplete="current-password" required minLength={6} maxLength={72} className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none focus:border-yellow-400/50" />
          {errorMessage && <p role="alert" className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{errorMessage}</p>}
          <button className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 font-black text-black">Sign in</button>
          <p className="mt-5 text-center text-xs leading-5 text-zinc-500">Forgot your password? Contact our support team. An administrator will issue a new temporary password.</p>
        </form>
        <p className="mt-7 text-center text-sm text-zinc-500">New member? <Link href="/register" className="font-bold text-yellow-300">Register now</Link></p>
      </div>
    </main>
  );
}
