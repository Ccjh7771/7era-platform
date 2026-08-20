"use server";

import { revalidatePath } from "next/cache";

import { cmsImageMaximumBytes, detectCmsImageType } from "@/lib/cms-image";
import { requireMember } from "@/lib/member/access";
import { createAdminClient } from "@/lib/supabase/admin";

const avatarBucket = "member-avatars";

export async function uploadMemberAvatar(formData: FormData) {
  const member = await requireMember();
  const avatarFile = formData.get("avatarFile");

  if (!(avatarFile instanceof File) || avatarFile.size === 0) {
    return { ok: false as const, message: "Choose a JPG, PNG or WebP photo." };
  }
  if (avatarFile.size > cmsImageMaximumBytes) {
    return { ok: false as const, message: "Choose a profile photo up to 2MB." };
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await avatarFile.arrayBuffer());
  } catch {
    return { ok: false as const, message: "This photo could not be read. Choose another file." };
  }

  const detectedType = detectCmsImageType(bytes);
  if (!detectedType) {
    return { ok: false as const, message: "Choose a genuine JPG, PNG or WebP photo." };
  }

  const avatarPath = `${member.id}/${crypto.randomUUID()}.${detectedType.extension}`;
  const adminClient = createAdminClient();
  const { error: uploadError } = await adminClient.storage
    .from(avatarBucket)
    .upload(avatarPath, bytes, {
      upsert: false,
      contentType: detectedType.contentType,
      cacheControl: "31536000",
    });

  if (uploadError) {
    console.error("Member avatar upload failed:", uploadError.message);
    return { ok: false as const, message: "Unable to upload the profile photo. Please try again." };
  }

  const { error: profileError } = await adminClient
    .from("member_profiles")
    .update({ avatar_path: avatarPath, updated_at: new Date().toISOString() })
    .eq("id", member.id);

  if (profileError) {
    await adminClient.storage.from(avatarBucket).remove([avatarPath]);
    return { ok: false as const, message: "Unable to save the profile photo." };
  }

  if (member.avatarPath?.startsWith(`${member.id}/`) && member.avatarPath !== avatarPath) {
    const { error: removeError } = await adminClient.storage
      .from(avatarBucket)
      .remove([member.avatarPath]);
    if (removeError) {
      console.error("Old member avatar cleanup failed:", removeError.message);
    }
  }

  revalidatePath("/member", "layout");
  return { ok: true as const, message: "Profile photo updated." };
}

export async function removeMemberAvatar() {
  const member = await requireMember();
  const avatarPath = `${member.id}/avatar`;
  const adminClient = createAdminClient();
  const { error: profileError } = await adminClient
    .from("member_profiles")
    .update({ avatar_path: null, updated_at: new Date().toISOString() })
    .eq("id", member.id);

  if (profileError) {
    return { ok: false, message: "Unable to update the profile." };
  }

  await adminClient.storage.from(avatarBucket).remove([avatarPath]);

  revalidatePath("/member", "layout");
  return { ok: true as const, message: "Profile photo removed." };
}
