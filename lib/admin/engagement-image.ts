import "server-only";

import { randomUUID } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

const bucket = "engagement-assets";
const maxSize = 3 * 1024 * 1024;
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function hasValidSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function uploadEngagementImage(formData: FormData, folder: string) {
  const file = formData.get("imageFile");
  if (!(file instanceof File) || file.size === 0) return { url: null, error: null };
  const extension = extensions[file.type];
  if (!extension || file.size > maxSize) return { url: null, error: "invalid_image" as const };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidSignature(bytes, file.type)) return { url: null, error: "invalid_image" as const };

  const client = createAdminClient();
  const path = `${folder}/${randomUUID()}.${extension}`;
  const { error } = await client.storage.from(bucket).upload(path, bytes, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error("Engagement image upload failed:", error.message);
    return { url: null, error: "upload_failed" as const };
  }
  return { url: client.storage.from(bucket).getPublicUrl(path).data.publicUrl, error: null };
}
