"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { generateTemporaryPassword } from "@/lib/member/password";
import { displayMalaysianPhone, normalizeMalaysianPhone } from "@/lib/member/phone";

export type RegistrationState = {
  status: "idle" | "error" | "success";
  message: string;
  phone?: string;
  temporaryPassword?: string;
};

export async function registerMember(
  previousState: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  void previousState;
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = normalizeMalaysianPhone(String(formData.get("phone") ?? ""));
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

  const temporaryPassword = generateTemporaryPassword();
  const { data: createdData, error: createError } = await adminClient.auth.admin.createUser({
    phone,
    password: temporaryPassword,
    phone_confirm: true,
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

  return {
    status: "success",
    message: "Your account is ready. Save the temporary password now; it is shown only once.",
    phone: displayMalaysianPhone(phone),
    temporaryPassword,
  };
}
