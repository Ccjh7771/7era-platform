"use client";

import { useEffect, useState } from "react";

export const MEMBER_POINTS_UPDATED_EVENT = "7era:member-points-updated";

export function MemberPointsBadge({ initialBalance }: { initialBalance: number }) {
  const [balance, setBalance] = useState(initialBalance);

  useEffect(() => {
    const updateBalance = (event: Event) => {
      const nextBalance = (event as CustomEvent<number>).detail;
      if (Number.isFinite(nextBalance)) setBalance(nextBalance);
    };

    window.addEventListener(MEMBER_POINTS_UPDATED_EVENT, updateBalance);
    return () => window.removeEventListener(MEMBER_POINTS_UPDATED_EVENT, updateBalance);
  }, []);

  return (
    <span className="shrink-0 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs font-black text-yellow-300 sm:px-4 sm:text-sm">
      {balance.toLocaleString()} PTS
    </span>
  );
}
