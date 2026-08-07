"use client";

import { useEffect, useState } from "react";

import { MEMBER_POINTS_UPDATED_EVENT, type MemberPointsUpdate } from "../MemberPointsBadge";

export function LuckySpinSummary({ pointsPerSpin, initialSpinsRemaining, dailyLimit }: { pointsPerSpin: number; initialSpinsRemaining: number; dailyLimit: number }) {
  const [spinsRemaining, setSpinsRemaining] = useState(initialSpinsRemaining);

  useEffect(() => {
    const updateSpins = (event: Event) => {
      const nextSpinsRemaining = (event as CustomEvent<MemberPointsUpdate>).detail.spinsRemaining;
      if (Number.isFinite(nextSpinsRemaining)) setSpinsRemaining(nextSpinsRemaining);
    };

    window.addEventListener(MEMBER_POINTS_UPDATED_EVENT, updateSpins);
    return () => window.removeEventListener(MEMBER_POINTS_UPDATED_EVENT, updateSpins);
  }, []);

  return <p className="mt-4 text-zinc-400">{pointsPerSpin} points per spin · {spinsRemaining} of {dailyLimit} spins remaining today</p>;
}
