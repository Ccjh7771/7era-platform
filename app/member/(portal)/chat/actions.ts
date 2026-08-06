"use server";

import { requireMember } from "@/lib/member/access";
import { storeChatImageMessage } from "@/lib/chat/image-attachment";
import { createAdminClient } from "@/lib/supabase/admin";

export async function markMemberConversationRead(conversationId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return;

  const member = await requireMember();
  await createAdminClient()
    .from("chat_conversations")
    .update({
      member_last_read_at: new Date().toISOString(),
      member_unread_count: 0,
    })
    .eq("id", conversationId)
    .eq("member_id", member.id);
}

export async function uploadMemberChatImage(formData: FormData) {
  const member = await requireMember();
  const requestedConversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "").slice(0, 4000);
  const file = formData.get("photo");

  if (!(file instanceof File)) {
    return { ok: false as const, error: "Choose a photo to upload." };
  }

  const adminClient = createAdminClient();
  let conversationId = requestedConversationId;
  let conversation = null;

  if (conversationId) {
    if (!/^[0-9a-f-]{36}$/i.test(conversationId)) {
      return { ok: false as const, error: "Invalid Live Chat conversation." };
    }
    const { data } = await adminClient
      .from("chat_conversations")
      .select("id, subject, status, last_message_at, member_last_read_at")
      .eq("id", conversationId)
      .eq("member_id", member.id)
      .maybeSingle();
    conversation = data;
    if (!conversation) {
      return { ok: false as const, error: "Live Chat conversation not found." };
    }
  } else {
    const { data, error } = await adminClient
      .from("chat_conversations")
      .insert({ member_id: member.id, subject: "Live Chat", status: "open" })
      .select("id, subject, status, last_message_at, member_last_read_at")
      .single();
    if (error || !data) {
      return { ok: false as const, error: "Unable to start Live Chat." };
    }
    conversation = data;
    conversationId = data.id;
  }

  try {
    const message = await storeChatImageMessage({
      conversationId,
      senderId: member.id,
      senderType: "member",
      body,
      isInternal: false,
      file,
    });
    return { ok: true as const, conversation, message };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Photo could not be sent." };
  }
}
