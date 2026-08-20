"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireContentEditor } from "@/lib/admin/access";
import {
    getManagedCmsLogoPath,
    removeCmsLogo,
    uploadCmsLogo,
} from "@/lib/admin/cms-logo-storage";
import { createAdminClient } from "@/lib/supabase/admin";

type BrandInput = {
    name: string;
    description: string;
    rating: number;
    whatsapp_url: string;
    heylink_url: string;
    sort_order: number;
};

const logoBucket = "brand-logos";
const storageHostname =
    "imkfmynzsnjckdzctwpp.supabase.co";

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
        !isValidLink(heylinkUrl)
    ) {
        return null;
    }

    return {
        name,
        description,
        rating,
        whatsapp_url: whatsappUrl,
        heylink_url: heylinkUrl,
        sort_order: sortOrder,
    };
}

async function requireBrandEditor() {
    await requireContentEditor("/admin/brands?error=forbidden");
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

    const logoResult = await uploadCmsLogo({
        adminClient,
        bucket: logoBucket,
        folder: "brands",
        formData,
        logLabel: "brand",
        required: true,
    });

    if ("error" in logoResult) {
        redirect(
            `/admin/brands?error=${logoResult.error}`,
        );
    }

    const logo = logoResult.upload;

    if (!logo) {
        redirect("/admin/brands?error=invalid_logo");
    }

    const { error } = await adminClient
        .from("brands")
        .insert({
            ...input,
            logo_path: logo.publicUrl,
            is_active: true,
        });

    if (error) {
        console.error(
            "Unable to create brand:",
            error.message,
        );

        await removeCmsLogo({
            adminClient,
            bucket: logoBucket,
            logLabel: "brand",
            objectPath: logo.objectPath,
        });

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

    const {
        data: existingBrand,
        error: existingBrandError,
    } = await adminClient
        .from("brands")
        .select("id, logo_path")
        .eq("id", brandId)
        .maybeSingle();

    if (existingBrandError || !existingBrand) {
        redirect("/admin/brands?error=server");
    }

    const logoResult = await uploadCmsLogo({
        adminClient,
        bucket: logoBucket,
        folder: "brands",
        formData,
        logLabel: "brand",
        required: false,
    });

    if ("error" in logoResult) {
        redirect(
            `/admin/brands?error=${logoResult.error}`,
        );
    }

    const nextLogo = logoResult.upload;

    const { data, error } = await adminClient
        .from("brands")
        .update({
            ...input,
            ...(nextLogo
                ? { logo_path: nextLogo.publicUrl }
                : {}),
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

        if (nextLogo) {
            await removeCmsLogo({
                adminClient,
                bucket: logoBucket,
                logLabel: "brand",
                objectPath: nextLogo.objectPath,
            });
        }

        redirect(
            `/admin/brands?error=${getDatabaseErrorCode(error)}`,
        );
    }

    if (nextLogo) {
        const previousLogoPath = getManagedCmsLogoPath({
            bucket: logoBucket,
            logoUrl: existingBrand.logo_path,
            storageHostname,
        });

        if (previousLogoPath) {
            await removeCmsLogo({
                adminClient,
                bucket: logoBucket,
                logLabel: "brand",
                objectPath: previousLogoPath,
            });
        }
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
