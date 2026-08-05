"use server";

import { revalidatePath } from "next/cache";

import { requireMember } from "@/lib/member/access";
import { createAdminClient } from "@/lib/supabase/admin";

const avatarBucket = "member-avatars";

export async function saveMemberAvatar() {
  const member = await requireMember();
  const avatarPath = `${member.id}/avatar`;
  const adminClient = createAdminClient();
  const { data: files, error: storageError } = await adminClient.storage
    .from(avatarBucket)
    .list(member.id, { limit: 10, search: "avatar" });

  if (storageError || !files?.some((file) => file.name === "avatar")) {
    return { ok: false, message: "The uploaded photo could not be verified." };
  }

  const { error: profileError } = await adminClient
    .from("member_profiles")
    .update({ avatar_path: avatarPath, updated_at: new Date().toISOString() })
    .eq("id", member.id);

  if (profileError) {
    return { ok: false, message: "Unable to save the profile photo." };
  }

  revalidatePath("/member", "layout");
  return { ok: true, message: "Profile photo updated." };
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
  return { ok: true, message: "Profile photo removed." };
}
