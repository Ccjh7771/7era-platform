"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { isValidMemberPassword } from "@/lib/member/password";
import { checkMemberRegistrationRateLimit } from "@/lib/member/registration-rate-limit";
import {
  displayMalaysianPhone,
  memberEmailForPhone,
  normalizeMalaysianPhone,
} from "@/lib/member/phone";
import { createClient } from "@/lib/supabase/server";

export type RegistrationState = {
  status: "idle" | "error" | "success";
  message: string;
  phone?: string;
};

export async function registerMember(
  previousState: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  void previousState;
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = normalizeMalaysianPhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const website = String(formData.get("website") ?? "");

  if (website) {
    return { status: "success", message: "Registration received." };
  }

  if (!phone || fullName.length < 2 || fullName.length > 100) {
    return {
      status: "error",
      message: "Enter your full name and a valid Malaysian mobile number.",
    };
  }

  if (!isValidMemberPassword(password) || password !== confirmPassword) {
    return {
      status: "error",
      message: "Enter the same password in both fields. Use at least 6 characters.",
    };
  }

  const registrationLimit = await checkMemberRegistrationRateLimit();
  if (!registrationLimit.allowed) {
    return {
      status: "error",
      message: "Too many registration attempts. Please try again in one hour.",
    };
  }

  const adminClient = createAdminClient();
  const { data: existingMember, error: lookupError } = await adminClient
    .from("member_profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (lookupError) {
    console.error("Member lookup failed:", lookupError.message);
    return { status: "error", message: "Registration is temporarily unavailable." };
  }

  if (existingMember) {
    return {
      status: "error",
      message: "This mobile number is already registered. Contact support if you cannot sign in.",
    };
  }

  const { data: createdData, error: createError } = await adminClient.auth.admin.createUser({
    email: memberEmailForPhone(phone),
    password,
    email_confirm: true,
    app_metadata: { account_type: "member" },
    user_metadata: { full_name: fullName, phone },
  });

  if (createError || !createdData.user) {
    console.error("Member registration failed:", createError?.message);
    return {
      status: "error",
      message: createError?.message.toLowerCase().includes("registered")
        ? "This mobile number is already registered."
        : "Unable to create the account. Please try again.",
    };
  }

  const { error: profileError } = await adminClient.from("member_profiles").upsert(
    {
      id: createdData.user.id,
      phone,
      full_name: fullName,
      status: "active",
      must_change_password: false,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("Member profile creation failed:", profileError.message);
    await adminClient.auth.admin.deleteUser(createdData.user.id);
    return {
      status: "error",
      message: "Unable to create the account. Please try again.",
    };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: memberEmailForPhone(phone),
    password,
  });

  if (!signInError) {
    await adminClient
      .from("member_profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", createdData.user.id);

    redirect("/member");
  }

  console.error("Automatic member sign-in failed:", signInError.message);

  return {
    status: "success",
    message: "Your account is ready. Sign in with your mobile number and the password you created.",
    phone: displayMalaysianPhone(phone),
  };
}
