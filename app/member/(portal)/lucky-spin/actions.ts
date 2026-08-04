"use server";

import { createClient } from "@/lib/supabase/server";

export type SpinState = {
  status: "idle" | "success" | "error";
  message: string;
  resultId?: string;
  prizeId?: string;
  prizeName?: string;
  isWinner?: boolean;
  claimCode?: string | null;
  balance?: number;
  spinsRemaining?: number;
};

export async function spinLuckyWheel(previousState: SpinState): Promise<SpinState> {
  void previousState;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("spin_lucky_wheel");

  if (error) {
    const message = error.message.includes("Insufficient points")
      ? "You do not have enough points."
      : error.message.includes("limit reached")
        ? "You have reached today's spin limit."
        : error.message.includes("unavailable")
          ? "Lucky Spin is not active right now."
          : "The spin could not be completed. Please try again.";
    return { status: "error", message };
  }

  const result = data as Omit<SpinState, "status" | "message">;
  return {
    status: "success",
    message: result.isWinner ? `You won ${result.prizeName}!` : "Thank you for participating.",
    ...result,
  };
}
