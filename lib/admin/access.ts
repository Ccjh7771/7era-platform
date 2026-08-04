import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AdminRole = "owner" | "editor" | "viewer";

export type AdminProfile = {
    id: string;
    fullName: string;
    role: AdminRole;
};

const adminRoles = new Set<AdminRole>([
    "owner",
    "editor",
    "viewer",
]);

function isAdminRole(role: string): role is AdminRole {
    return adminRoles.has(role as AdminRole);
}

export const requireAdmin = cache(async (): Promise<AdminProfile> => {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } =
        await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
        redirect("/auth/login");
    }

    const { data: profile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("full_name, role, is_active, must_change_password")
        .eq("id", userId)
        .single();

    if (
        profileError ||
        !profile ||
        !profile.is_active ||
        !isAdminRole(profile.role)
    ) {
        redirect("/auth/login?error=unauthorized");
    }

    if (profile.must_change_password) {
        redirect("/auth/update-password?required=1");
    }

    return {
        id: userId,
        fullName: profile.full_name,
        role: profile.role,
    };
});

export async function requireContentEditor(forbiddenPath: string) {
    const admin = await requireAdmin();

    if (admin.role === "viewer") {
        redirect(forbiddenPath);
    }

    return admin;
}

export async function requireOwner(
    forbiddenPath = "/admin?error=forbidden",
) {
    const admin = await requireAdmin();

    if (admin.role !== "owner") {
        redirect(forbiddenPath);
    }

    return admin;
}
