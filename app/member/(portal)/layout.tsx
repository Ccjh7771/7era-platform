import type { ReactNode } from "react";

import { displayMalaysianPhone } from "@/lib/member/phone";
import { requireMember } from "@/lib/member/access";
import { createClient } from "@/lib/supabase/server";

import { MemberBottomNav } from "./MemberBottomNav";

export default async function MemberLayout({ children }: { children: ReactNode }) {
  const member = await requireMember();
  const supabase = await createClient();
  const { data: conversations } = await supabase
    .from("chat_conversations")
    .select("id, member_unread_count")
    .eq("member_id", member.id);
  const initialChatUnreadCounts = Object.fromEntries(
    (conversations ?? []).map((conversation) => [conversation.id, Number(conversation.member_unread_count)]),
  );

  return (
    <div className="min-h-dvh bg-[#08090b] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-lg font-black text-black shadow-[0_0_25px_rgba(250,204,21,0.2)]">7</span>
            <span className="min-w-0">
              <strong className="block truncate">{member.fullName}</strong>
              <small className="block truncate text-zinc-500">{displayMalaysianPhone(member.phone)}</small>
            </span>
          </div>
          <span className="shrink-0 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs font-black text-yellow-300 sm:px-4 sm:text-sm">{member.pointsBalance.toLocaleString()} PTS</span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-32 pt-7 sm:px-6 sm:pt-10">{children}</main>
      <MemberBottomNav memberId={member.id} initialChatUnreadCounts={initialChatUnreadCounts} />
    </div>
  );
}
