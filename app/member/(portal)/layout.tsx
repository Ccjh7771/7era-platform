import Link from "next/link";
import type { ReactNode } from "react";

import { displayMalaysianPhone } from "@/lib/member/phone";
import { requireMember } from "@/lib/member/access";

import { logoutMember } from "../actions";

const navigation = [
  { href: "/member", label: "Dashboard" },
  { href: "/member/lucky-spin", label: "Lucky Spin" },
  { href: "/member/rewards", label: "My Rewards" },
  { href: "/member/chat", label: "Live Chat" },
];

export default async function MemberLayout({ children }: { children: ReactNode }) {
  const member = await requireMember();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/member" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 font-black text-black">7</span>
            <span><strong className="block">7ERA Member</strong><small className="text-zinc-500">{displayMalaysianPhone(member.phone)}</small></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm font-black text-yellow-300">{member.pointsBalance.toLocaleString()} PTS</span>
            <form action={logoutMember}><button className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:text-white">Sign out</button></form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 pb-4" aria-label="Member navigation">
          {navigation.map((item) => <Link key={item.href} href={item.href} prefetch={false} className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-zinc-300 hover:border-yellow-400/30 hover:text-yellow-300">{item.label}</Link>)}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10">{children}</main>
    </div>
  );
}
