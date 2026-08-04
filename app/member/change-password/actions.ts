"use server";

import { redirect } from "next/navigation";

import { isStrongMemberPassword } from "@/lib/member/password";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function changeMemberPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!isStrongMemberPassword(password) || password !== confirmPassword) {
    redirect("/member/change-password?required=1&error=invalid");
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/member/login");
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password });
  if (passwordError) {
    redirect("/member/change-password?required=1&error=failed");
  }

  const adminClient = createAdminClient();
  const { error: profileError } = await adminClient
    .from("member_profiles")
    .update({ must_change_password: false, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (profileError) {
    redirect("/member/change-password?required=1&error=failed");
  }

  redirect("/member");
}
