"use server";

import { createClient } from "@/lib/supabase/server";

export type DailyClaimState = {
  status: "idle" | "success" | "error";
  message: string;
  balance?: number;
};

export async function claimDailyReward(
  previousState: DailyClaimState,
): Promise<DailyClaimState> {
  void previousState;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_daily_reward");

  if (error) {
    const knownMessage = error.message.includes("already been claimed")
      ? "You have already claimed today's reward."
      : error.message.includes("out of stock")
        ? "Today's reward is out of stock. Please contact support."
        : "Daily Reward is not available right now.";
    return { status: "error", message: knownMessage };
  }

  const result = data as {
    label?: string;
    pointsAwarded?: number;
    balance?: number;
    claimCode?: string | null;
  };
  const details = result.pointsAwarded
    ? ` You received ${result.pointsAwarded} points.`
    : result.claimCode
      ? ` Claim code: ${result.claimCode}.`
      : "";

  return {
    status: "success",
    message: `${result.label ?? "Reward claimed"}.${details}`,
    balance: Number(result.balance ?? 0),
  };
}
