"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/admin/access";
import {
    getManagedCmsLogoPath,
    removeCmsLogo,
    uploadCmsLogo,
} from "@/lib/admin/cms-logo-storage";
import { createAdminClient } from "@/lib/supabase/admin";

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
    complaint_phone: string;
    heylink_url: string;
    support_email: string;
    seo_title: string;
    seo_description: string;
    site_url: string;
    copyright_text: string;
};

const logoBucket = "site-assets";
const storageHostname = "imkfmynzsnjckdzctwpp.supabase.co";
const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

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

function normalizeMalaysianMobile(value: string) {
    const digits = value.replace(/\D/g, "");
    const localNumber = digits.startsWith("60")
        ? `0${digits.slice(2)}`
        : digits;

    return /^01\d{8,9}$/.test(localNumber) ? localNumber : null;
}

function parseSettingsInput(formData: FormData): WebsiteSettingsInput | null {
    const complaintPhone = normalizeMalaysianMobile(
        String(formData.get("complaintPhone") ?? "").trim(),
    );

    if (!complaintPhone) {
        return null;
    }

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
        complaint_phone: complaintPhone,
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

    const logoResult = await uploadCmsLogo({
        adminClient,
        bucket: logoBucket,
        folder: "logos",
        formData,
        logLabel: "website",
        required: false,
    });

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
            await removeCmsLogo({
                adminClient,
                bucket: logoBucket,
                logLabel: "website",
                objectPath: uploadedLogo.objectPath,
            });
        }

        redirect("/admin/settings?error=server");
    }

    if (
        existing.logo_path &&
        (uploadedLogo || removeRequested) &&
        existing.logo_path !== nextLogoPath
    ) {
        const previousLogoPath = getManagedCmsLogoPath({
            bucket: logoBucket,
            logoUrl: existing.logo_path,
            storageHostname,
        });

        if (previousLogoPath) {
            await removeCmsLogo({
                adminClient,
                bucket: logoBucket,
                logLabel: "website",
                objectPath: previousLogoPath,
            });
        }
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    redirect("/admin/settings?success=updated");
}
