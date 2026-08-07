"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireContentEditor, requireOwner } from "@/lib/admin/access";
import { recordAdminAudit } from "@/lib/admin/audit";
import { isValidMemberPassword } from "@/lib/member/password";
import { displayMalaysianPhone, memberEmailForPhone, normalizeMalaysianPhone } from "@/lib/member/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type CreateMemberState = { status: "idle" | "success" | "error"; message: string; memberId?: string };

export async function createManualMember(previousState: CreateMemberState, formData: FormData): Promise<CreateMemberState> {
  void previousState;
  const admin = await requireContentEditor("/admin/members?error=forbidden");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = normalizeMalaysianPhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const bankAccount = String(formData.get("bankAccount") ?? "").trim();
  const bankName = String(formData.get("bankName") ?? "").trim();
  const referrerName = String(formData.get("referrerName") ?? "").trim();
  const topReferrerName = String(formData.get("topReferrerName") ?? "").trim();

  if (!phone || fullName.length < 2 || fullName.length > 100) {
    return { status: "error", message: "Enter a full name and a valid Malaysian mobile number." };
  }
  if (!isValidMemberPassword(password) || password !== confirmPassword) {
    return { status: "error", message: "Enter the same password twice using at least 6 characters." };
  }
  if (bankAccount.length > 50 || bankName.length > 80 || referrerName.length > 100 || topReferrerName.length > 100) {
    return { status: "error", message: "One of the optional profile fields is too long." };
  }

  const client = createAdminClient();
  const { data: existingMember, error: lookupError } = await client.from("member_profiles").select("id").eq("phone", phone).maybeSingle();
  if (lookupError) {
    console.error("Manual member lookup failed:", lookupError.message);
    return { status: "error", message: "Unable to check this mobile number. Please try again." };
  }
  if (existingMember) return { status: "error", message: "This mobile number is already registered." };

  const { data: createdData, error: createError } = await client.auth.admin.createUser({
    email: memberEmailForPhone(phone),
    password,
    email_confirm: true,
    app_metadata: { account_type: "member" },
    user_metadata: { full_name: fullName, phone },
  });
  if (createError || !createdData.user) {
    console.error("Manual member creation failed:", createError?.message);
    return { status: "error", message: createError?.message.toLowerCase().includes("registered") ? "This mobile number is already registered." : "Unable to create the member account." };
  }

  const { error: profileError } = await client.from("member_profiles").upsert({
    id: createdData.user.id,
    phone,
    full_name: fullName,
    status: "active",
    must_change_password: false,
    bank_account: bankAccount || null,
    bank_name: bankName || null,
    referrer_name: referrerName || null,
    top_referrer_name: topReferrerName || null,
  }, { onConflict: "id" });
  if (profileError) {
    console.error("Manual member profile creation failed:", profileError.message);
    await client.auth.admin.deleteUser(createdData.user.id);
    return { status: "error", message: "Unable to create the member profile." };
  }

  await recordAdminAudit({
    actor: admin,
    action: "member_created",
    targetType: "member",
    targetId: createdData.user.id,
    summary: "Created a member account manually.",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/members");
  return { status: "success", message: `Member ${displayMalaysianPhone(phone)} created. They can sign in immediately.`, memberId: createdData.user.id };
}

export type ResetMemberState = { status: "idle" | "success" | "error"; message: string };
export async function resetMemberPassword(previousState: ResetMemberState, formData: FormData): Promise<ResetMemberState> {
  void previousState;
  const memberId = String(formData.get("memberId") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(memberId)) return { status: "error", message: "Invalid member." };
  const admin = await requireOwner("/admin/members?error=forbidden");
  if (!isValidMemberPassword(password) || password !== confirmPassword) return { status: "error", message: "Enter the same password twice using at least 6 characters." };
  const client = createAdminClient();
  const { error: authError } = await client.auth.admin.updateUserById(memberId, { password });
  if (authError) return { status: "error", message: "Password reset failed." };
  const { error: profileError } = await client.from("member_profiles").update({ must_change_password: false, updated_at: new Date().toISOString() }).eq("id", memberId);
  if (profileError) return { status: "error", message: "Password changed, but the member flag could not be updated." };
  await recordAdminAudit({
    actor: admin,
    action: "member_password_reset",
    targetType: "member",
    targetId: memberId,
    summary: "Reset a member password. Password content was not recorded.",
  });
  revalidatePath("/admin/members");
  return { status: "success", message: "Password updated. The member can sign in with the new password immediately." };
}

export async function setMemberStatus(formData: FormData) {
  const memberId = String(formData.get("memberId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(memberId) || !["active", "suspended"].includes(status)) redirect("/admin/members?error=invalid");
  const admin = await requireOwner("/admin/members?error=forbidden");
  const client = createAdminClient();
  const { error } = await client.from("member_profiles").update({ status, updated_at: new Date().toISOString() }).eq("id", memberId);
  if (error) redirect("/admin/members?error=server");
  await recordAdminAudit({
    actor: admin,
    action: "member_status_changed",
    targetType: "member",
    targetId: memberId,
    summary: `Changed member status to ${status}.`,
    metadata: { status },
  });
  revalidatePath("/admin/members");
  redirect("/admin/members?success=status");
}

export async function updateMemberBusinessProfile(formData: FormData) {
  const memberId = String(formData.get("memberId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(memberId)) redirect("/admin/members?error=invalid");
  const admin = await requireContentEditor("/admin/members?error=forbidden");

  const cleanOptional = (field: string, maximum: number) => {
    const value = String(formData.get(field) ?? "").trim();
    if (value.length > maximum) redirect("/admin/members?error=invalid_profile");
    return value || null;
  };
  const bankAccount = cleanOptional("bankAccount", 50);
  const bankName = cleanOptional("bankName", 80);
  const referrerName = cleanOptional("referrerName", 100);
  const topReferrerName = cleanOptional("topReferrerName", 100);

  const client = createAdminClient();
  const { error } = await client.from("member_profiles").update({
    bank_account: bankAccount,
    bank_name: bankName,
    referrer_name: referrerName,
    top_referrer_name: topReferrerName,
    updated_at: new Date().toISOString(),
  }).eq("id", memberId);
  if (error) {
    console.error("Member business profile update failed:", error.message);
    redirect("/admin/members?error=profile_failed");
  }
  await recordAdminAudit({
    actor: admin,
    action: "member_profile_updated",
    targetType: "member",
    targetId: memberId,
    summary: "Updated member bank or referral profile fields.",
  });
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
  redirect("/admin/members?success=profile");
}

export async function adjustMemberPoints(formData: FormData) {
  const memberId = String(formData.get("memberId") ?? "");
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(memberId) || !Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 1000000 || note.length < 3 || note.length > 200) redirect("/admin/members?error=invalid_points");
  const admin = await requireContentEditor("/admin/members?error=forbidden");
  const client = await createClient();
  const { error } = await client.rpc("admin_adjust_member_points", { target_member_id: memberId, point_delta: amount, entry_note: note });
  if (error) { console.error("Point adjustment failed:", error.message); redirect("/admin/members?error=points_failed"); }
  await recordAdminAudit({
    actor: admin,
    action: "member_points_adjusted",
    targetType: "member",
    targetId: memberId,
    summary: `Adjusted member points by ${amount > 0 ? "+" : ""}${amount}.`,
    metadata: { amount },
  });
  revalidatePath("/admin/members"); revalidatePath("/member");
  redirect("/admin/members?success=points");
}
