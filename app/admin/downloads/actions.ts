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

type DownloadInput = {
    slug: string;
    title: string;
    description: string;
    platform: "android" | "ios" | "windows";
    version: string;
    release_date: string;
    file_size: string;
    download_url: string;
    guide_url: string | null;
    is_latest: boolean;
    is_disabled: boolean;
    sort_order: number;
};

const logoBucket = "download-logos";
const storageHostname =
    "imkfmynzsnjckdzctwpp.supabase.co";
const allowedPlatforms = new Set(["android", "ios", "windows"]);

function isValidDestination(value: string, allowEmpty = false) {
    if (allowEmpty && value === "") {
        return true;
    }

    if (value === "#" || /^#[a-z0-9-]+$/i.test(value)) {
        return true;
    }

    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

function isValidDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value
        .split("-")
        .map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function parseDownloadInput(
    formData: FormData,
): DownloadInput | null {
    const slug = String(formData.get("slug") ?? "")
        .trim()
        .toLowerCase();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(
        formData.get("description") ?? "",
    ).trim();
    const platform = String(formData.get("platform") ?? "");
    const version = String(formData.get("version") ?? "").trim();
    const releaseDate = String(
        formData.get("releaseDate") ?? "",
    ).trim();
    const fileSize = String(formData.get("fileSize") ?? "").trim();
    const downloadUrl = String(
        formData.get("downloadUrl") ?? "",
    ).trim();
    const guideUrl = String(
        formData.get("guideUrl") ?? "",
    ).trim();
    const sortOrder = Number(formData.get("sortOrder"));

    if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
        slug.length > 100 ||
        title.length < 2 ||
        title.length > 80 ||
        description.length > 300 ||
        !allowedPlatforms.has(platform) ||
        version.length < 1 ||
        version.length > 40 ||
        !isValidDate(releaseDate) ||
        fileSize.length < 1 ||
        fileSize.length > 40 ||
        !isValidDestination(downloadUrl) ||
        !isValidDestination(guideUrl, true) ||
        !Number.isInteger(sortOrder) ||
        sortOrder < 0 ||
        sortOrder > 9999
    ) {
        return null;
    }

    return {
        slug,
        title,
        description,
        platform: platform as DownloadInput["platform"],
        version,
        release_date: releaseDate,
        file_size: fileSize,
        download_url: downloadUrl,
        guide_url: guideUrl || null,
        is_latest: formData.get("isLatest") === "on",
        is_disabled: formData.get("isDisabled") === "on",
        sort_order: sortOrder,
    };
}

async function uploadLogo(
    adminClient: ReturnType<typeof createAdminClient>,
    formData: FormData,
    required: boolean,
) {
    return uploadCmsLogo({
        adminClient,
        bucket: logoBucket,
        folder: "downloads",
        formData,
        logLabel: "download",
        required,
    });
}

function getManagedLogoPath(logoUrl: string) {
    return getManagedCmsLogoPath({
        bucket: logoBucket,
        logoUrl,
        storageHostname,
    });
}

async function removeLogo(
    adminClient: ReturnType<typeof createAdminClient>,
    objectPath: string,
) {
    await removeCmsLogo({
        adminClient,
        bucket: logoBucket,
        logLabel: "download",
        objectPath,
    });
}

async function requireDownloadEditor() {
    await requireContentEditor("/admin/downloads?error=forbidden");
}

function refreshDownloadPages() {
    revalidatePath("/download");
    revalidatePath("/admin");
    revalidatePath("/admin/downloads");
}

function getDatabaseErrorCode(
    error: { code?: string } | null,
) {
    return error?.code === "23505" ? "duplicate" : "server";
}

export async function createDownload(formData: FormData) {
    const input = parseDownloadInput(formData);

    if (!input) {
        redirect("/admin/downloads?error=invalid");
    }

    await requireDownloadEditor();
    const adminClient = createAdminClient();
    const logoResult = await uploadLogo(adminClient, formData, true);

    if ("error" in logoResult) {
        redirect(`/admin/downloads?error=${logoResult.error}`);
    }

    const logo = logoResult.upload;

    if (!logo) {
        redirect("/admin/downloads?error=invalid_logo");
    }

    const { error } = await adminClient.from("downloads").insert({
        ...input,
        logo_path: logo.publicUrl,
        is_active: true,
    });

    if (error) {
        console.error("Unable to create download:", error.message);
        await removeLogo(adminClient, logo.objectPath);
        redirect(
            `/admin/downloads?error=${getDatabaseErrorCode(error)}`,
        );
    }

    refreshDownloadPages();
    redirect("/admin/downloads?success=created");
}

export async function updateDownload(formData: FormData) {
    const downloadId = Number(formData.get("downloadId"));
    const input = parseDownloadInput(formData);

    if (
        !Number.isSafeInteger(downloadId) ||
        downloadId <= 0 ||
        !input
    ) {
        redirect("/admin/downloads?error=invalid");
    }

    await requireDownloadEditor();
    const adminClient = createAdminClient();
    const { data: existingDownload, error: existingDownloadError } =
        await adminClient
            .from("downloads")
            .select("id, logo_path")
            .eq("id", downloadId)
            .maybeSingle();

    if (existingDownloadError || !existingDownload) {
        redirect("/admin/downloads?error=server");
    }

    const logoResult = await uploadLogo(adminClient, formData, false);

    if ("error" in logoResult) {
        redirect(`/admin/downloads?error=${logoResult.error}`);
    }

    const nextLogo = logoResult.upload;
    const { data, error } = await adminClient
        .from("downloads")
        .update({
            ...input,
            ...(nextLogo ? { logo_path: nextLogo.publicUrl } : {}),
            updated_at: new Date().toISOString(),
        })
        .eq("id", downloadId)
        .select("id")
        .maybeSingle();

    if (error || !data) {
        console.error(
            "Unable to update download:",
            error?.message ?? "Download not found",
        );

        if (nextLogo) {
            await removeLogo(adminClient, nextLogo.objectPath);
        }

        redirect(
            `/admin/downloads?error=${getDatabaseErrorCode(error)}`,
        );
    }

    if (nextLogo) {
        const previousLogoPath = getManagedLogoPath(
            existingDownload.logo_path,
        );

        if (previousLogoPath) {
            await removeLogo(adminClient, previousLogoPath);
        }
    }

    refreshDownloadPages();
    redirect("/admin/downloads?success=updated");
}

export async function setDownloadStatus(formData: FormData) {
    const downloadId = Number(formData.get("downloadId"));
    const requestedStatus = String(
        formData.get("requestedStatus") ?? "",
    );

    if (
        !Number.isSafeInteger(downloadId) ||
        downloadId <= 0 ||
        !["active", "inactive"].includes(requestedStatus)
    ) {
        redirect("/admin/downloads?error=invalid");
    }

    await requireDownloadEditor();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
        .from("downloads")
        .update({
            is_active: requestedStatus === "active",
            updated_at: new Date().toISOString(),
        })
        .eq("id", downloadId)
        .select("id")
        .maybeSingle();

    if (error || !data) {
        console.error(
            "Unable to update download status:",
            error?.message ?? "Download not found",
        );
        redirect("/admin/downloads?error=server");
    }

    refreshDownloadPages();
    redirect("/admin/downloads?success=status_updated");
}
