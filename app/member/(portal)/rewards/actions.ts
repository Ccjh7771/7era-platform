"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireMember } from "@/lib/member/access";
import { createAdminClient } from "@/lib/supabase/admin";

export async function claimRewardViaLiveChat(formData: FormData) {
  const claimId = String(formData.get("claimId") ?? "");

  if (!/^[0-9a-f-]{36}$/i.test(claimId)) {
    redirect("/member/rewards?error=invalid_claim");
  }

  const member = await requireMember();
  const client = createAdminClient();
  const { data: claim, error: claimError } = await client
    .from("reward_claims")
    .select("id, reward_name, status")
    .eq("id", claimId)
    .eq("member_id", member.id)
    .maybeSingle();

  if (claimError || !claim || claim.status !== "pending") {
    redirect("/member/rewards?error=claim_unavailable");
  }

  const { data: conversation, error: conversationError } = await client
    .from("chat_conversations")
    .insert({
      member_id: member.id,
      reward_claim_id: claim.id,
      subject: `Prize Claim: ${claim.reward_name}`.slice(0, 100),
      status: "open",
    })
    .select("id")
    .single();

  let conversationId = conversation?.id;

  if (conversationError?.code === "23505") {
    const { data: existingConversation } = await client
      .from("chat_conversations")
      .select("id")
      .eq("reward_claim_id", claim.id)
      .eq("member_id", member.id)
      .maybeSingle();

    conversationId = existingConversation?.id;
  } else if (conversationError) {
    console.error("Unable to open reward claim chat:", conversationError.message);
  }

  if (!conversationId) {
    redirect("/member/rewards?error=chat_failed");
  }

  revalidatePath("/member/chat");
  redirect(`/member/chat?conversation=${conversationId}`);
}
