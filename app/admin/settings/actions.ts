"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type WebsiteSettingsInput = {
    site_name: string;
    short_name: string;
    brand_label: string;
    tagline: string;
    primary_cta_label: string;
    primary_cta_url: string;
    support_heading: string;
    support_description: string;
    whatsapp_url: string;
    heylink_url: string;
    support_email: string;
    seo_title: string;
    seo_description: string;
    site_url: string;
    copyright_text: string;
};

type UploadedLogo = {
    objectPath: string;
    publicUrl: string;
};

const logoBucket = "site-assets";
const storageHostname = "imkfmynzsnjckdzctwpp.supabase.co";
const maximumLogoSize = 2 * 1024 * 1024;
const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const logoExtensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

function isValidDestination(value: string) {
    if (
        value === "#" ||
        /^#[a-z0-9-]+$/i.test(value) ||
        (value.startsWith("/") && !value.startsWith("//"))
    ) {
        return true;
    }

    try {
        const url = new URL(value);
        return ["https:", "http:"].includes(url.protocol);
    } catch {
        return false;
    }
}

function isValidExternalUrl(value: string) {
    if (value === "#") {
        return true;
    }

    try {
        const url = new URL(value);
        return ["https:", "http:"].includes(url.protocol) && Boolean(url.hostname);
    } catch {
        return false;
    }
}

function parseSettingsInput(formData: FormData): WebsiteSettingsInput | null {
    const input = {
        site_name: String(formData.get("siteName") ?? "").trim(),
        short_name: String(formData.get("shortName") ?? "").trim(),
        brand_label: String(formData.get("brandLabel") ?? "").trim(),
        tagline: String(formData.get("tagline") ?? "").trim(),
        primary_cta_label: String(
            formData.get("primaryCtaLabel") ?? "",
        ).trim(),
        primary_cta_url: String(
            formData.get("primaryCtaUrl") ?? "",
        ).trim(),
        support_heading: String(
            formData.get("supportHeading") ?? "",
        ).trim(),
        support_description: String(
            formData.get("supportDescription") ?? "",
        ).trim(),
        whatsapp_url: String(formData.get("whatsappUrl") ?? "").trim(),
        heylink_url: String(formData.get("heylinkUrl") ?? "").trim(),
        support_email: String(formData.get("supportEmail") ?? "")
            .trim()
            .toLowerCase(),
        seo_title: String(formData.get("seoTitle") ?? "").trim(),
        seo_description: String(
            formData.get("seoDescription") ?? "",
        ).trim(),
        site_url: String(formData.get("siteUrl") ?? "").trim(),
        copyright_text: String(
            formData.get("copyrightText") ?? "",
        ).trim(),
    };

    if (
        input.site_name.length < 2 ||
        input.site_name.length > 100 ||
        input.short_name.length < 1 ||
        input.short_name.length > 30 ||
        input.brand_label.length < 1 ||
        input.brand_label.length > 40 ||
        input.tagline.length < 5 ||
        input.tagline.length > 240 ||
        input.primary_cta_label.length < 2 ||
        input.primary_cta_label.length > 40 ||
        input.primary_cta_url.length > 500 ||
        !isValidDestination(input.primary_cta_url) ||
        input.support_heading.length < 5 ||
        input.support_heading.length > 120 ||
        input.support_description.length < 10 ||
        input.support_description.length > 500 ||
        input.whatsapp_url.length > 500 ||
        !isValidExternalUrl(input.whatsapp_url) ||
        input.heylink_url.length > 500 ||
        !isValidExternalUrl(input.heylink_url) ||
        input.support_email.length > 254 ||
        !emailPattern.test(input.support_email) ||
        input.seo_title.length < 5 ||
        input.seo_title.length > 70 ||
        input.seo_description.length < 20 ||
        input.seo_description.length > 180 ||
        input.site_url.length > 500 ||
        !isValidExternalUrl(input.site_url) ||
        input.site_url === "#" ||
        input.copyright_text.length < 5 ||
        input.copyright_text.length > 160
    ) {
        return null;
    }

    return input;
}

function hasValidFileSignature(bytes: Uint8Array, mimeType: string) {
    if (mimeType === "image/png") {
        const signature = [
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        ];
        return signature.every((value, index) => bytes[index] === value);
    }

    if (mimeType === "image/jpeg") {
        return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    }

    if (mimeType === "image/webp") {
        return (
            String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
            String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
        );
    }

    return false;
}

async function uploadLogo(
    adminClient: ReturnType<typeof createAdminClient>,
    formData: FormData,
): Promise<
    | { error: "invalid_logo" | "upload_failed" }
    | { upload: UploadedLogo | null }
> {
    const logoFile = formData.get("logoFile");

    if (!(logoFile instanceof File) || logoFile.size === 0) {
        return { upload: null };
    }

    const extension = logoExtensions[logoFile.type];

    if (!extension || logoFile.size > maximumLogoSize) {
        return { error: "invalid_logo" };
    }

    const bytes = new Uint8Array(await logoFile.arrayBuffer());

    if (!hasValidFileSignature(bytes, logoFile.type)) {
        return { error: "invalid_logo" };
    }

    const objectPath = `logos/${randomUUID()}.${extension}`;
    const { error } = await adminClient.storage
        .from(logoBucket)
        .upload(objectPath, bytes, {
            cacheControl: "31536000",
            contentType: logoFile.type,
            upsert: false,
        });

    if (error) {
        console.error("Unable to upload website logo:", error.message);
        return { error: "upload_failed" };
    }

    const { data } = adminClient.storage
        .from(logoBucket)
        .getPublicUrl(objectPath);

    return {
        upload: { objectPath, publicUrl: data.publicUrl },
    };
}

function getManagedLogoPath(logoUrl: string) {
    try {
        const url = new URL(logoUrl);
        const marker = `/storage/v1/object/public/${logoBucket}/`;

        if (
            url.protocol !== "https:" ||
            url.hostname !== storageHostname ||
            !url.pathname.startsWith(marker)
        ) {
            return null;
        }

        return decodeURIComponent(url.pathname.slice(marker.length));
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
        console.error("Unable to remove website logo:", error.message);
    }
}

async function requireOwner() {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } =
        await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
        redirect("/auth/login");
    }

    const { data: adminProfile, error: profileError } =
        await supabase
            .from("admin_profiles")
            .select("role, is_active")
            .eq("id", userId)
            .single();

    if (
        profileError ||
        !adminProfile ||
        !adminProfile.is_active ||
        adminProfile.role !== "owner"
    ) {
        redirect("/admin?error=forbidden");
    }
}

export async function updateWebsiteSettings(formData: FormData) {
    const input = parseSettingsInput(formData);

    if (!input) {
        redirect("/admin/settings?error=invalid");
    }

    await requireOwner();
    const adminClient = createAdminClient();
    const { data: existing, error: existingError } = await adminClient
        .from("website_settings")
        .select("id, logo_path")
        .eq("id", 1)
        .maybeSingle();

    if (existingError || !existing) {
        redirect("/admin/settings?error=server");
    }

    const logoResult = await uploadLogo(adminClient, formData);

    if ("error" in logoResult) {
        redirect(`/admin/settings?error=${logoResult.error}`);
    }

    const uploadedLogo = logoResult.upload;
    const removeRequested = formData.get("removeLogo") === "on";
    const nextLogoPath = uploadedLogo
        ? uploadedLogo.publicUrl
        : removeRequested
          ? null
          : existing.logo_path;
    const { data, error } = await adminClient
        .from("website_settings")
        .update({
            ...input,
            logo_path: nextLogoPath,
            updated_at: new Date().toISOString(),
        })
        .eq("id", 1)
        .select("id")
        .maybeSingle();

    if (error || !data) {
        console.error(
            "Unable to update website settings:",
            error?.message ?? "Settings row not found",
        );

        if (uploadedLogo) {
            await removeLogo(adminClient, uploadedLogo.objectPath);
        }

        redirect("/admin/settings?error=server");
    }

    if (
        existing.logo_path &&
        (uploadedLogo || removeRequested) &&
        existing.logo_path !== nextLogoPath
    ) {
        const previousLogoPath = getManagedLogoPath(existing.logo_path);

        if (previousLogoPath) {
            await removeLogo(adminClient, previousLogoPath);
        }
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    redirect("/admin/settings?success=updated");
}
