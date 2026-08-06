"use server";

import { requireAdmin } from "@/lib/admin/access";
import { storeChatImageMessage } from "@/lib/chat/image-attachment";
import { createAdminClient } from "@/lib/supabase/admin";

export async function markAdminConversationRead(conversationId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return;

  await requireAdmin();
  await createAdminClient()
    .from("chat_conversations")
    .update({ admin_last_read_at: new Date().toISOString() })
    .eq("id", conversationId);
}

export async function uploadAdminChatImage(formData: FormData) {
  const admin = await requireAdmin();
  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "").slice(0, 4000);
  const isInternal = formData.get("internal") === "true";
  const file = formData.get("photo");

  if (admin.role === "viewer") {
    return { ok: false as const, error: "Your account cannot reply to Live Chat." };
  }
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) {
    return { ok: false as const, error: "Invalid Live Chat conversation." };
  }
  if (!(file instanceof File)) {
    return { ok: false as const, error: "Choose a photo to upload." };
  }

  const { data: conversation } = await createAdminClient()
    .from("chat_conversations")
    .select("id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conversation) {
    return { ok: false as const, error: "Live Chat conversation not found." };
  }

  try {
    const message = await storeChatImageMessage({
      conversationId,
      senderId: admin.id,
      senderType: "admin",
      body,
      isInternal,
      file,
    });
    return { ok: true as const, message };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Photo could not be sent." };
  }
}
