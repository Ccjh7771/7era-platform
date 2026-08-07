import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export const CHAT_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

type ChatSenderType = "member" | "admin";

type StoredMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: ChatSenderType;
  body: string;
  is_internal: boolean;
  attachment_path: string;
  attachment_mime_type: string;
  created_at: string;
};

type DetectedImage = {
  bytes: Uint8Array;
  extension: "jpg" | "png" | "webp" | "gif";
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
};

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

async function detectChatImage(file: File): Promise<DetectedImage> {
  if (file.size === 0 || file.size > CHAT_IMAGE_MAX_BYTES) {
    throw new Error("Photo must be smaller than 4MB.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return { bytes, extension: "jpg", mimeType: "image/jpeg" };
  }
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { bytes, extension: "png", mimeType: "image/png" };
  }
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { bytes, extension: "webp", mimeType: "image/webp" };
  }
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) {
    return { bytes, extension: "gif", mimeType: "image/gif" };
  }

  throw new Error("Only JPG, PNG, WebP or GIF photos are supported.");
}

export async function storeChatImageMessage(input: {
  conversationId: string;
  senderId: string;
  senderType: ChatSenderType;
  body: string;
  isInternal: boolean;
  file: File;
}): Promise<StoredMessage> {
  const image = await detectChatImage(input.file);
  const messageId = crypto.randomUUID();
  const attachmentPath = `${input.conversationId}/${messageId}.${image.extension}`;
  const adminClient = createAdminClient();
  const { error: uploadError } = await adminClient.storage
    .from("chat-attachments")
    .upload(attachmentPath, image.bytes, {
      cacheControl: "3600",
      contentType: image.mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Photo could not be uploaded.");
  }

  const { data: message, error: messageError } = await adminClient
    .from("chat_messages")
    .insert({
      id: messageId,
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      sender_type: input.senderType,
      body: input.body.trim(),
      is_internal: input.isInternal,
      attachment_path: attachmentPath,
      attachment_mime_type: image.mimeType,
    })
    .select("id, conversation_id, sender_id, sender_type, body, is_internal, attachment_path, attachment_mime_type, created_at")
    .single();

  if (messageError || !message) {
    await adminClient.storage.from("chat-attachments").remove([attachmentPath]);
    if (messageError?.message.includes("chat_photo_rate_limit")) {
      throw new Error("Too many photos were sent. Please wait before sending another photo.");
    }
    if (messageError?.message.includes("chat_message_rate_limit")) {
      throw new Error("Messages are being sent too quickly. Please wait a moment.");
    }
    throw new Error("Photo message could not be sent.");
  }

  return message as StoredMessage;
}
