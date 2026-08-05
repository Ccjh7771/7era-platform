"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

const usernamePattern =
    /^[a-z0-9][a-z0-9._-]{2,31}$/;

const allowedRoles = new Set([
    "owner",
    "editor",
    "viewer",
]);

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

export async function createAdminAccount(
    formData: FormData,
) {
    const username = String(
        formData.get("username") ?? "",
    )
        .trim()
        .toLowerCase();

    const fullName = String(
        formData.get("fullName") ?? "",
    ).trim();

    const role = String(
        formData.get("role") ?? "",
    );

    const temporaryPassword = String(
        formData.get("temporaryPassword") ?? "",
    );

    if (
        !usernamePattern.test(username) ||
        fullName.length < 2 ||
        fullName.length > 80 ||
        !allowedRoles.has(role) ||
        !isValidPassword(temporaryPassword)
    ) {
        redirect(
            "/admin/accounts?error=invalid",
        );
    }

    await requireOwner();

    const adminClient =
        createAdminClient();

    const {
        data: existingProfile,
        error: lookupError,
    } = await adminClient
        .from("admin_profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

    if (lookupError) {
        console.error(
            "Unable to check username:",
            lookupError.message,
        );

        redirect(
            "/admin/accounts?error=server",
        );
    }

    if (existingProfile) {
        redirect(
            "/admin/accounts?error=username_exists",
        );
    }

    const internalEmail =
        `${randomUUID()}@staff.7era.example.com`;

    const {
        data: createdUserData,
        error: createUserError,
    } =
        await adminClient.auth.admin.createUser({
            email: internalEmail,
            password: temporaryPassword,
            email_confirm: true,
            app_metadata: {
                account_type: "admin",
            },
            user_metadata: {
                username,
                full_name: fullName,
            },
        });

    const createdUser =
        createdUserData.user;

    if (createUserError || !createdUser) {
        console.error(
            "Unable to create Auth user:",
            createUserError?.message,
        );

        redirect(
            "/admin/accounts?error=create_failed",
        );
    }

    const { error: profileError } =
        await adminClient
            .from("admin_profiles")
            .upsert(
                {
                    id: createdUser.id,
                    email: internalEmail,
                    username,
                    full_name: fullName,
                    role,
                    is_active: true,
                    must_change_password: true,
                },
                {
                    onConflict: "id",
                },
            );

    if (profileError) {
        console.error(
            "Unable to create admin profile:",
            profileError.message,
        );

        const { error: rollbackError } =
            await adminClient.auth.admin.deleteUser(
                createdUser.id,
            );

        if (rollbackError) {
            console.error(
                "Unable to roll back Auth user:",
                rollbackError.message,
            );
        }

        redirect(
            "/admin/accounts?error=profile_failed",
        );
    }

    revalidatePath("/admin/accounts");

    redirect(
        "/admin/accounts?success=created",
    );
}

export async function resetAdminPassword(
    formData: FormData,
) {
    const targetUserId = String(
        formData.get("targetUserId") ?? "",
    );

    const temporaryPassword = String(
        formData.get("temporaryPassword") ?? "",
    );

    if (
        !targetUserId ||
        !isValidPassword(temporaryPassword)
    ) {
        redirect(
            "/admin/accounts?error=invalid_reset",
        );
    }

    const currentAdmin =
        await requireOwner();

    if (targetUserId === currentAdmin.id) {
        redirect(
            "/admin/accounts?error=reset_not_allowed",
        );
    }

    const adminClient =
        createAdminClient();

    const {
        data: targetProfile,
        error: targetProfileError,
    } = await adminClient
        .from("admin_profiles")
        .select("id, role")
        .eq("id", targetUserId)
        .maybeSingle();

    if (
        targetProfileError ||
        !targetProfile ||
        targetProfile.role === "owner"
    ) {
        redirect(
            "/admin/accounts?error=reset_not_allowed",
        );
    }

    const { error: passwordResetError } =
        await adminClient.auth.admin.updateUserById(
            targetUserId,
            {
                password: temporaryPassword,
            },
        );

    if (passwordResetError) {
        console.error(
            "Unable to reset staff password:",
            passwordResetError.message,
        );

        redirect(
            "/admin/accounts?error=reset_failed",
        );
    }

    const { error: profileUpdateError } =
        await adminClient
            .from("admin_profiles")
            .update({
                must_change_password: true,
            })
            .eq("id", targetUserId);

    if (profileUpdateError) {
        console.error(
            "Unable to require password change:",
            profileUpdateError.message,
        );

        redirect(
            "/admin/accounts?error=profile_failed",
        );
    }

    revalidatePath("/admin/accounts");

    redirect(
        "/admin/accounts?success=password_reset",
    );
}
export async function setAdminAccountStatus(
    formData: FormData,
) {
    const targetUserId = String(
        formData.get("targetUserId") ?? "",
    );

    const requestedStatus = String(
        formData.get("requestedStatus") ?? "",
    );

    if (
        !targetUserId ||
        !["active", "suspended"].includes(
            requestedStatus,
        )
    ) {
        redirect(
            "/admin/accounts?error=invalid_status",
        );
    }

    const currentAdmin =
        await requireOwner();

    if (targetUserId === currentAdmin.id) {
        redirect(
            "/admin/accounts?error=status_not_allowed",
        );
    }

    const adminClient =
        createAdminClient();

    const {
        data: targetProfile,
        error: targetProfileError,
    } = await adminClient
        .from("admin_profiles")
        .select("id, role")
        .eq("id", targetUserId)
        .maybeSingle();

    if (
        targetProfileError ||
        !targetProfile ||
        targetProfile.role === "owner"
    ) {
        redirect(
            "/admin/accounts?error=status_not_allowed",
        );
    }

    const shouldBeActive =
        requestedStatus === "active";

    const { error: updateStatusError } =
        await adminClient
            .from("admin_profiles")
            .update({
                is_active: shouldBeActive,
            })
            .eq("id", targetUserId);

    if (updateStatusError) {
        console.error(
            "Unable to update account status:",
            updateStatusError.message,
        );

        redirect(
            "/admin/accounts?error=status_failed",
        );
    }

    revalidatePath("/admin/accounts");

    redirect(
        "/admin/accounts?success=status_updated",
    );
}
