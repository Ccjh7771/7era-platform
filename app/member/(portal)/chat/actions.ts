"use server";

import { requireMember } from "@/lib/member/access";
import { createAdminClient } from "@/lib/supabase/admin";

export async function markMemberConversationRead(conversationId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return;

  const member = await requireMember();
  await createAdminClient()
    .from("chat_conversations")
    .update({ member_last_read_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("member_id", member.id);
}
