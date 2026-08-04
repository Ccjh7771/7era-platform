"use server";

import { redirect } from "next/navigation";

import { normalizeMalaysianPhone } from "@/lib/member/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function loginMember(formData: FormData) {
  const phone = normalizeMalaysianPhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!phone || password.length < 6 || password.length > 72) {
    redirect("/member/login?error=invalid");
  }

  const supabase = await createClient();
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    phone,
    password,
  });

  if (signInError || !signInData.user) {
    redirect("/member/login?error=invalid");
  }

  const { data: profile, error: profileError } = await supabase
    .from("member_profiles")
    .select("status, must_change_password")
    .eq("id", signInData.user.id)
    .single();

  if (profileError || !profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirect("/member/login?error=inactive");
  }

  const adminClient = createAdminClient();
  await adminClient
    .from("member_profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", signInData.user.id);

  if (profile.must_change_password) {
    redirect("/member/change-password?required=1");
  }

  redirect("/member");
}
