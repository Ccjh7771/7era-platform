import "server-only";

import { randomUUID } from "node:crypto";

import {
    cmsImageMaximumBytes,
    detectCmsImageType,
} from "@/lib/cms-image";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

type UploadedCmsLogo = {
    objectPath: string;
    publicUrl: string;
};

type UploadCmsLogoOptions = {
    adminClient: AdminClient;
    bucket: string;
    folder: string;
    formData: FormData;
    logLabel: string;
    required: boolean;
};

export type UploadCmsLogoResult =
    | {
          error:
              | "invalid_logo"
              | "logo_too_large"
              | "upload_failed";
      }
    | { upload: UploadedCmsLogo | null };

export async function uploadCmsLogo({
    adminClient,
    bucket,
    folder,
    formData,
    logLabel,
    required,
}: UploadCmsLogoOptions): Promise<UploadCmsLogoResult> {
    const logoFile = formData.get("logoFile");

    if (!(logoFile instanceof File) || logoFile.size === 0) {
        return required
            ? { error: "invalid_logo" }
            : { upload: null };
    }

    if (logoFile.size > cmsImageMaximumBytes) {
        return { error: "logo_too_large" };
    }

    let bytes: Uint8Array;

    try {
        bytes = new Uint8Array(await logoFile.arrayBuffer());
    } catch (error) {
        console.error(`Unable to read ${logLabel} logo:`, error);
        return { error: "upload_failed" };
    }

    const detectedType = detectCmsImageType(bytes);

    if (!detectedType) {
        return { error: "invalid_logo" };
    }

    const objectPath = `${folder}/${randomUUID()}.${detectedType.extension}`;

    try {
        const { error } = await adminClient.storage
            .from(bucket)
            .upload(objectPath, bytes, {
                cacheControl: "31536000",
                contentType: detectedType.contentType,
                upsert: false,
            });

        if (error) {
            console.error(
                `Unable to upload ${logLabel} logo:`,
                error.message,
            );
            return { error: "upload_failed" };
        }
    } catch (error) {
        console.error(`Unable to upload ${logLabel} logo:`, error);
        return { error: "upload_failed" };
    }

    const { data } = adminClient.storage
        .from(bucket)
        .getPublicUrl(objectPath);

    return {
        upload: {
            objectPath,
            publicUrl: data.publicUrl,
        },
    };
}

export function getManagedCmsLogoPath({
    bucket,
    logoUrl,
    storageHostname,
}: {
    bucket: string;
    logoUrl: string;
    storageHostname: string;
}) {
    try {
        const url = new URL(logoUrl);
        const marker = `/storage/v1/object/public/${bucket}/`;

        if (
            url.protocol !== "https:" ||
            url.hostname !== storageHostname ||
            !url.pathname.startsWith(marker)
        ) {
            return null;
        }

        const objectPath = decodeURIComponent(
            url.pathname.slice(marker.length),
        );

        return objectPath || null;
    } catch {
        return null;
    }
}

export async function removeCmsLogo({
    adminClient,
    bucket,
    logLabel,
    objectPath,
}: {
    adminClient: AdminClient;
    bucket: string;
    logLabel: string;
    objectPath: string;
}) {
    try {
        const { error } = await adminClient.storage
            .from(bucket)
            .remove([objectPath]);

        if (error) {
            console.error(
                `Unable to remove ${logLabel} logo:`,
                error.message,
            );
        }
    } catch (error) {
        console.error(`Unable to remove ${logLabel} logo:`, error);
    }
}
