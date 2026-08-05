"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type IconName = "check-in" | "spin" | "history" | "chat" | "profile";

const navigation: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/member", label: "Daily Check-in", icon: "check-in" },
  { href: "/member/lucky-spin", label: "Lucky Spin", icon: "spin" },
  { href: "/member/rewards", label: "History", icon: "history" },
  { href: "/member/chat", label: "Live Chat", icon: "chat" },
  { href: "/member/profile", label: "Profile", icon: "profile" },
];

function NavIcon({ name }: { name: IconName }) {
  if (name === "check-in") {
    return <path d="M7 3v3m10-3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 9 2 2 4-5" />;
  }

  if (name === "spin") {
    return <path d="M12 2v3m0 14v3M4.93 4.93l2.12 2.12m9.9 9.9 2.12 2.12M2 12h3m14 0h3M4.93 19.07l2.12-2.12m9.9-9.9 2.12-2.12M12 8a4 4 0 1 1-4 4 4 4 0 0 1 4-4Z" />;
  }

  if (name === "history") {
    return <path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5m4-1v5l3 2" />;
  }

  if (name === "chat") {
    return <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.8 9.8 0 0 1-4-.9L3 21l1.7-4.1A8.4 8.4 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8.5 8.4 8.4 0 0 1 9 8.5Z" />;
  }

  return <path d="M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />;
}

type ConversationUnreadUpdate = {
  id: string;
  member_unread_count: number;
};

type RewardClaimUpdate = {
  id: string;
  status: "pending" | "fulfilled" | "cancelled";
};

type MemberBottomNavProps = {
  memberId: string;
  initialChatUnreadCounts: Record<string, number>;
  initialPendingRewardIds: string[];
};

export function MemberBottomNav({ memberId, initialChatUnreadCounts, initialPendingRewardIds }: MemberBottomNavProps) {
  const pathname = usePathname();
  const [chatUnreadCounts, setChatUnreadCounts] = useState(initialChatUnreadCounts);
  const [rewardStatusOverrides, setRewardStatusOverrides] = useState<Record<string, RewardClaimUpdate["status"]>>({});
  const supabase = useMemo(() => createClient(), []);
  const totalChatUnread = Object.values(chatUnreadCounts).reduce((total, count) => total + count, 0);
  const pendingRewardIds = new Set(initialPendingRewardIds);
  for (const [rewardId, status] of Object.entries(rewardStatusOverrides)) {
    if (status === "pending") pendingRewardIds.add(rewardId);
    else pendingRewardIds.delete(rewardId);
  }
  const totalPendingRewards = pendingRewardIds.size;

  useEffect(() => {
    const channel = supabase
      .channel(`member-nav-${memberId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_conversations", filter: `member_id=eq.${memberId}` },
        (payload) => {
          const updated = payload.new as ConversationUnreadUpdate;
          if (!updated.id) return;
          setChatUnreadCounts((current) => ({
            ...current,
            [updated.id]: Number(updated.member_unread_count ?? 0),
          }));
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reward_claims", filter: `member_id=eq.${memberId}` },
        (payload) => {
          const reward = payload.new as RewardClaimUpdate;
          if (!reward.id) return;
          setRewardStatusOverrides((current) => ({ ...current, [reward.id]: reward.status }));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reward_claims", filter: `member_id=eq.${memberId}` },
        (payload) => {
          const reward = payload.new as RewardClaimUpdate;
          if (!reward.id) return;
          setRewardStatusOverrides((current) => ({ ...current, [reward.id]: reward.status }));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [memberId, supabase]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" aria-label="Member navigation">
      <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1 rounded-[28px] border border-white/10 bg-zinc-900/95 p-2 shadow-[0_-12px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {navigation.map((item) => {
          const active = item.href === "/member" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-[20px] px-1 text-center transition ${active ? "bg-white/10 text-yellow-300" : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 stroke-current" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <NavIcon name={item.icon} />
              </svg>
              {item.icon === "chat" && totalChatUnread > 0 && (
                <span className="absolute right-2 top-1 flex min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1.5 py-0.5 text-[10px] font-black leading-none text-black sm:right-3">
                  {totalChatUnread > 99 ? "99+" : totalChatUnread}
                </span>
              )}
              {item.icon === "history" && totalPendingRewards > 0 && (
                <span className="absolute right-2 top-1 flex min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1.5 py-0.5 text-[10px] font-black leading-none text-black sm:right-3">
                  {totalPendingRewards > 99 ? "99+" : totalPendingRewards}
                </span>
              )}
              <span className="text-[10px] font-bold leading-tight sm:text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
