"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const usernamePattern =
    /^[a-z0-9][a-z0-9._-]{2,31}$/;

export async function loginAdmin(
    formData: FormData,
) {
    const username = String(
        formData.get("username") ?? "",
    )
        .trim()
        .toLowerCase();

    const password = String(
        formData.get("password") ?? "",
    );

    if (
        !usernamePattern.test(username) ||
        password.length < 6
    ) {
        console.error(
            "Admin login failed: invalid input format.",
        );

        redirect(
            "/auth/login?error=invalid",
        );
    }

    const adminClient =
        createAdminClient();

    const {
        data: profile,
        error: profileError,
    } = await adminClient
        .from("admin_profiles")
        .select(
            "id, email, is_active, must_change_password",
        )
        .eq("username", username)
        .maybeSingle();

    if (profileError) {
        console.error(
            "Admin profile lookup failed:",
            profileError.message,
        );

        redirect(
            "/auth/login?error=invalid",
        );
    }

    if (!profile || !profile.is_active) {
        console.error(
            "Admin profile is missing or inactive.",
        );

        redirect(
            "/auth/login?error=invalid",
        );
    }

    const supabase = await createClient();

    const { error: signInError } =
        await supabase.auth.signInWithPassword({
            email: profile.email,
            password,
        });

    if (signInError) {
        console.error(
            "Admin sign-in failed:",
            signInError.message,
        );

        redirect(
            "/auth/login?error=invalid",
        );
    }

    const { error: updateError } =
        await adminClient
            .from("admin_profiles")
            .update({
                last_login_at:
                    new Date().toISOString(),
            })
            .eq("id", profile.id);

    if (updateError) {
        console.error(
            "Unable to update last login:",
            updateError.message,
        );
    }

    if (profile.must_change_password) {
        redirect(
            "/auth/update-password?required=1",
        );
    }

    redirect("/admin");
}