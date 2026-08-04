"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type BrandInput = {
    name: string;
    description: string;
    rating: number;
    whatsapp_url: string;
    heylink_url: string;
    logo_path: string;
    sort_order: number;
};

const editableRoles = new Set([
    "owner",
    "editor",
]);

function isValidLink(value: string) {
    if (value === "#") {
        return true;
    }

    try {
        const url = new URL(value);

        return (
            url.protocol === "https:" ||
            url.protocol === "http:"
        );
    } catch {
        return false;
    }
}

function parseBrandInput(
    formData: FormData,
): BrandInput | null {
    const name = String(
        formData.get("name") ?? "",
    ).trim();

    const description = String(
        formData.get("description") ?? "",
    ).trim();

    const rating = Number(
        formData.get("rating"),
    );

    const whatsappUrl = String(
        formData.get("whatsappUrl") ?? "",
    ).trim();

    const heylinkUrl = String(
        formData.get("heylinkUrl") ?? "",
    ).trim();

    const logoPath = String(
        formData.get("logoPath") ?? "",
    ).trim();

    const sortOrder = Number(
        formData.get("sortOrder"),
    );

    if (
        name.length < 2 ||
        name.length > 80 ||
        description.length > 300 ||
        !Number.isFinite(rating) ||
        rating < 1 ||
        rating > 5 ||
        !Number.isInteger(sortOrder) ||
        sortOrder < 0 ||
        sortOrder > 9999 ||
        !isValidLink(whatsappUrl) ||
        !isValidLink(heylinkUrl) ||
        !logoPath.startsWith("/") ||
        logoPath.startsWith("//") ||
        logoPath.length > 500
    ) {
        return null;
    }

    return {
        name,
        description,
        rating,
        whatsapp_url: whatsappUrl,
        heylink_url: heylinkUrl,
        logo_path: logoPath,
        sort_order: sortOrder,
    };
}

async function requireBrandEditor() {
    const supabase = await createClient();

    const {
        data: claimsData,
        error: claimsError,
    } = await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
        redirect("/auth/login");
    }

    const {
        data: adminProfile,
        error: profileError,
    } = await supabase
        .from("admin_profiles")
        .select("role, is_active")
        .eq("id", userId)
        .single();

    if (
        profileError ||
        !adminProfile ||
        !adminProfile.is_active ||
        !editableRoles.has(adminProfile.role)
    ) {
        redirect("/admin/brands?error=forbidden");
    }
}

function refreshBrandPages() {
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/brands");
}

function getDatabaseErrorCode(
    error: { code?: string } | null,
) {
    return error?.code === "23505"
        ? "duplicate"
        : "server";
}

export async function createBrand(
    formData: FormData,
) {
    const input = parseBrandInput(formData);

    if (!input) {
        redirect("/admin/brands?error=invalid");
    }

    await requireBrandEditor();

    const adminClient = createAdminClient();

    const { error } = await adminClient
        .from("brands")
        .insert({
            ...input,
            is_active: true,
        });

    if (error) {
        console.error(
            "Unable to create brand:",
            error.message,
        );

        redirect(
            `/admin/brands?error=${getDatabaseErrorCode(error)}`,
        );
    }

    refreshBrandPages();
    redirect("/admin/brands?success=created");
}

export async function updateBrand(
    formData: FormData,
) {
    const brandId = Number(
        formData.get("brandId"),
    );

    const input = parseBrandInput(formData);

    if (
        !Number.isSafeInteger(brandId) ||
        brandId <= 0 ||
        !input
    ) {
        redirect("/admin/brands?error=invalid");
    }

    await requireBrandEditor();

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
        .from("brands")
        .update({
            ...input,
            updated_at: new Date().toISOString(),
        })
        .eq("id", brandId)
        .select("id")
        .maybeSingle();

    if (error || !data) {
        console.error(
            "Unable to update brand:",
            error?.message ?? "Brand not found",
        );

        redirect(
            `/admin/brands?error=${getDatabaseErrorCode(error)}`,
        );
    }

    refreshBrandPages();
    redirect("/admin/brands?success=updated");
}

export async function setBrandStatus(
    formData: FormData,
) {
    const brandId = Number(
        formData.get("brandId"),
    );

    const requestedStatus = String(
        formData.get("requestedStatus") ?? "",
    );

    if (
        !Number.isSafeInteger(brandId) ||
        brandId <= 0 ||
        !["active", "inactive"].includes(
            requestedStatus,
        )
    ) {
        redirect("/admin/brands?error=invalid");
    }

    await requireBrandEditor();

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
        .from("brands")
        .update({
            is_active:
                requestedStatus === "active",
            updated_at: new Date().toISOString(),
        })
        .eq("id", brandId)
        .select("id")
        .maybeSingle();

    if (error || !data) {
        console.error(
            "Unable to update brand status:",
            error?.message ?? "Brand not found",
        );

        redirect("/admin/brands?error=server");
    }

    refreshBrandPages();
    redirect("/admin/brands?success=status_updated");
}
