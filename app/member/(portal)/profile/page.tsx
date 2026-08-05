import Link from "next/link";

import { requireMember } from "@/lib/member/access";
import { displayMalaysianPhone } from "@/lib/member/phone";

import { logoutMember } from "../../actions";

export default async function MemberProfilePage() {
  const member = await requireMember();

  return (
    <section className="mx-auto max-w-2xl">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">My account</p>
      <h1 className="mt-3 text-3xl font-black">Profile</h1>

      <article className="mt-8 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04]">
        <div className="flex flex-col items-center border-b border-white/10 bg-gradient-to-b from-yellow-400/10 to-transparent px-6 py-9 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/15 text-4xl font-black text-yellow-300">
            {member.fullName.trim().charAt(0).toUpperCase() || "7"}
          </span>
          <h2 className="mt-4 text-2xl font-black">{member.fullName}</h2>
          <p className="mt-1 text-zinc-500">7ERA Member</p>
        </div>

        <dl className="divide-y divide-white/10 px-6">
          <div className="flex items-center justify-between gap-5 py-5">
            <dt className="text-sm text-zinc-500">Full name</dt>
            <dd className="text-right font-bold">{member.fullName}</dd>
          </div>
          <div className="flex items-center justify-between gap-5 py-5">
            <dt className="text-sm text-zinc-500">Phone number</dt>
            <dd className="text-right font-bold">{displayMalaysianPhone(member.phone)}</dd>
          </div>
          <div className="flex items-center justify-between gap-5 py-5">
            <dt className="text-sm text-zinc-500">Points balance</dt>
            <dd className="text-right font-black text-yellow-300">{member.pointsBalance.toLocaleString()} PTS</dd>
          </div>
        </dl>
      </article>

      <div className="mt-5 grid gap-3">
        <Link href="/member/change-password" className="flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold hover:border-yellow-400/30 hover:text-yellow-300">
          Change password
        </Link>
        <form action={logoutMember}>
          <button className="min-h-14 w-full rounded-2xl border border-red-400/20 bg-red-400/10 px-5 text-sm font-bold text-red-200 hover:bg-red-400/15">
            Sign out
          </button>
        </form>
      </div>
    </section>
  );
}
