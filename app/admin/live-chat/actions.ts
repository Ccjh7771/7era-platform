"use server";

import { requireAdmin } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

export async function markAdminConversationRead(conversationId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return;

  await requireAdmin();
  await createAdminClient()
    .from("chat_conversations")
    .update({ admin_last_read_at: new Date().toISOString() })
    .eq("id", conversationId);
}
