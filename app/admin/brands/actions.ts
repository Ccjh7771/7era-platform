"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireContentEditor } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

type BrandInput = {
    name: string;
    description: string;
    rating: number;
    whatsapp_url: string;
    heylink_url: string;
    sort_order: number;
};

type UploadedLogo = {
    objectPath: string;
    publicUrl: string;
};

const logoBucket = "brand-logos";
const storageHostname =
    "imkfmynzsnjckdzctwpp.supabase.co";
const maximumLogoSize = 2 * 1024 * 1024;

const logoExtensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

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

function hasValidFileSignature(
    bytes: Uint8Array,
    mimeType: string,
) {
    if (mimeType === "image/png") {
        const signature = [
            0x89,
            0x50,
            0x4e,
            0x47,
            0x0d,
            0x0a,
            0x1a,
            0x0a,
        ];

        return signature.every(
            (value, index) =>
                bytes[index] === value,
        );
    }

    if (mimeType === "image/jpeg") {
        return (
            bytes[0] === 0xff &&
            bytes[1] === 0xd8 &&
            bytes[2] === 0xff
        );
    }

    if (mimeType === "image/webp") {
        return (
            String.fromCharCode(...bytes.slice(0, 4)) ===
                "RIFF" &&
            String.fromCharCode(...bytes.slice(8, 12)) ===
                "WEBP"
        );
    }

    return false;
}

async function uploadLogo(
    adminClient: ReturnType<typeof createAdminClient>,
    formData: FormData,
    required: boolean,
): Promise<
    | { error: "invalid_logo" | "upload_failed" }
    | { upload: UploadedLogo | null }
> {
    const logoFile = formData.get("logoFile");

    if (
        !(logoFile instanceof File) ||
        logoFile.size === 0
    ) {
        return required
            ? { error: "invalid_logo" }
            : { upload: null };
    }

    const extension = logoExtensions[logoFile.type];

    if (
        !extension ||
        logoFile.size > maximumLogoSize
    ) {
        return { error: "invalid_logo" };
    }

    const bytes = new Uint8Array(
        await logoFile.arrayBuffer(),
    );

    if (!hasValidFileSignature(bytes, logoFile.type)) {
        return { error: "invalid_logo" };
    }

    const objectPath =
        `brands/${randomUUID()}.${extension}`;

    const { error } = await adminClient.storage
        .from(logoBucket)
        .upload(objectPath, bytes, {
            cacheControl: "31536000",
            contentType: logoFile.type,
            upsert: false,
        });

    if (error) {
        console.error(
            "Unable to upload brand logo:",
            error.message,
        );

        return { error: "upload_failed" };
    }

    const { data } = adminClient.storage
        .from(logoBucket)
        .getPublicUrl(objectPath);

    return {
        upload: {
            objectPath,
            publicUrl: data.publicUrl,
        },
    };
}

function getManagedLogoPath(logoUrl: string) {
    try {
        const url = new URL(logoUrl);
        const marker =
            `/storage/v1/object/public/${logoBucket}/`;

        if (
            url.protocol !== "https:" ||
            url.hostname !== storageHostname ||
            !url.pathname.startsWith(marker)
        ) {
            return null;
        }

        return decodeURIComponent(
            url.pathname.slice(marker.length),
        );
    } catch {
        return null;
    }
}

async function removeLogo(
    adminClient: ReturnType<typeof createAdminClient>,
    objectPath: string,
) {
    const { error } = await adminClient.storage
        .from(logoBucket)
        .remove([objectPath]);

    if (error) {
        console.error(
            "Unable to remove brand logo:",
            error.message,
        );
    }
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

    const logoResult = await uploadLogo(
        adminClient,
        formData,
        true,
    );

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

        await removeLogo(
            adminClient,
            logo.objectPath,
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

    const logoResult = await uploadLogo(
        adminClient,
        formData,
        false,
    );

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
            await removeLogo(
                adminClient,
                nextLogo.objectPath,
            );
        }

        redirect(
            `/admin/brands?error=${getDatabaseErrorCode(error)}`,
        );
    }

    if (nextLogo) {
        const previousLogoPath = getManagedLogoPath(
            existingBrand.logo_path,
        );

        if (previousLogoPath) {
            await removeLogo(
                adminClient,
                previousLogoPath,
            );
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
