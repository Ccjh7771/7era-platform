"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function isValidPassword(password: string) {
    return (
        password.length >= 12 &&
        password.length <= 72 &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
}

export async function updateRequiredPassword(
    formData: FormData,
) {
    const newPassword = String(
        formData.get("newPassword") ?? "",
    );

    const confirmPassword = String(
        formData.get("confirmPassword") ?? "",
    );

    if (
        !isValidPassword(newPassword) ||
        newPassword !== confirmPassword
    ) {
        redirect(
            "/auth/update-password?required=1&error=invalid",
        );
    }

    const supabase = await createClient();

    const {
        data: claimsData,
        error: claimsError,
    } = await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
        redirect("/auth/login");
    }

    const { error: updatePasswordError } =
        await supabase.auth.updateUser({
            password: newPassword,
        });

    if (updatePasswordError) {
        console.error(
            "Unable to update password:",
            updatePasswordError.message,
        );

        redirect(
            "/auth/update-password?required=1&error=update_failed",
        );
    }

    const adminClient = createAdminClient();

    const { error: profileError } =
        await adminClient
            .from("admin_profiles")
            .update({
                must_change_password: false,
            })
            .eq("id", userId);

    if (profileError) {
        console.error(
            "Unable to clear password requirement:",
            profileError.message,
        );

        redirect(
            "/auth/update-password?required=1&error=profile_failed",
        );
    }

    redirect("/admin");
}
