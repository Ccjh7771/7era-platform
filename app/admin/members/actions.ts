"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireContentEditor, requireOwner } from "@/lib/admin/access";
import { isValidMemberPassword } from "@/lib/member/password";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ResetMemberState = { status: "idle" | "success" | "error"; message: string };
export async function resetMemberPassword(previousState: ResetMemberState, formData: FormData): Promise<ResetMemberState> {
  void previousState;
  const memberId = String(formData.get("memberId") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(memberId)) return { status: "error", message: "Invalid member." };
  await requireOwner("/admin/members?error=forbidden");
  if (!isValidMemberPassword(password) || password !== confirmPassword) return { status: "error", message: "Enter the same password twice using at least 6 characters." };
  const client = createAdminClient();
  const { error: authError } = await client.auth.admin.updateUserById(memberId, { password });
  if (authError) return { status: "error", message: "Password reset failed." };
  const { error: profileError } = await client.from("member_profiles").update({ must_change_password: false, updated_at: new Date().toISOString() }).eq("id", memberId);
  if (profileError) return { status: "error", message: "Password changed, but the member flag could not be updated." };
  revalidatePath("/admin/members");
  return { status: "success", message: "Password updated. The member can sign in with the new password immediately." };
}

export async function setMemberStatus(formData: FormData) {
  const memberId = String(formData.get("memberId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(memberId) || !["active", "suspended"].includes(status)) redirect("/admin/members?error=invalid");
  await requireOwner("/admin/members?error=forbidden");
  const client = createAdminClient();
  const { error } = await client.from("member_profiles").update({ status, updated_at: new Date().toISOString() }).eq("id", memberId);
  if (error) redirect("/admin/members?error=server");
  revalidatePath("/admin/members");
  redirect("/admin/members?success=status");
}

export async function adjustMemberPoints(formData: FormData) {
  const memberId = String(formData.get("memberId") ?? "");
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(memberId) || !Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 1000000 || note.length < 3 || note.length > 200) redirect("/admin/members?error=invalid_points");
  await requireContentEditor("/admin/members?error=forbidden");
  const client = await createClient();
  const { error } = await client.rpc("admin_adjust_member_points", { target_member_id: memberId, point_delta: amount, entry_note: note });
  if (error) { console.error("Point adjustment failed:", error.message); redirect("/admin/members?error=points_failed"); }
  revalidatePath("/admin/members"); revalidatePath("/member");
  redirect("/admin/members?success=points");
}
