import Link from "next/link";

import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white">
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[150px]" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10 text-2xl font-black text-yellow-300">7</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-yellow-300">7ERA Membership</p>
          <h1 className="mt-3 text-3xl font-black">Register</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Create your account using your full name and mobile number.</p>
        </div>
        <RegisterForm />
        <p className="mt-7 text-center text-sm text-zinc-500">Already registered? <Link href="/member/login" className="font-bold text-yellow-300">Member login</Link></p>
      </div>
    </main>
  );
}
