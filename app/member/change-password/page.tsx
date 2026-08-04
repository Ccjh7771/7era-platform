import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { changeMemberPassword } from "./actions";

type ChangePasswordProps = { searchParams: Promise<{ error?: string | string[] }> };

export default async function ChangeMemberPasswordPage({ searchParams }: ChangePasswordProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/member/login");

  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-16 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">Account security</p>
          <h1 className="mt-3 text-3xl font-black">Create a new password</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Your temporary password must be replaced before you continue.</p>
        </div>
        <form action={changeMemberPassword} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <label htmlFor="new-member-password" className="text-sm font-semibold">New password</label>
          <input id="new-member-password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={72} required className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 outline-none focus:border-yellow-400/50" />
          <label htmlFor="confirm-member-password" className="mt-6 block text-sm font-semibold">Confirm password</label>
          <input id="confirm-member-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={10} maxLength={72} required className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 outline-none focus:border-yellow-400/50" />
          <p className="mt-3 text-xs leading-5 text-zinc-500">Use 10–72 characters with uppercase, lowercase and a number.</p>
          {error && <p role="alert" className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">The passwords do not meet the requirements or could not be updated.</p>}
          <button className="mt-7 h-14 w-full rounded-2xl bg-yellow-400 font-black text-black">Save new password</button>
        </form>
      </div>
    </main>
  );
}
