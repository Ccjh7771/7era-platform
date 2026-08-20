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

type UploadCmsImageOptions = {
    adminClient: AdminClient;
    bucket: string;
    fileField?: string;
    folder: string;
    formData: FormData;
    logLabel: string;
    maximumBytes?: number;
    required: boolean;
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

export type UploadCmsImageResult =
    | {
          error:
              | "invalid_image"
              | "image_too_large"
              | "upload_failed";
      }
    | { upload: UploadedCmsLogo | null };

export async function uploadCmsImage({
    adminClient,
    bucket,
    fileField = "imageFile",
    folder,
    formData,
    logLabel,
    maximumBytes = cmsImageMaximumBytes,
    required,
}: UploadCmsImageOptions): Promise<UploadCmsImageResult> {
    const imageFile = formData.get(fileField);

    if (!(imageFile instanceof File) || imageFile.size === 0) {
        return required
            ? { error: "invalid_image" }
            : { upload: null };
    }

    if (imageFile.size > maximumBytes) {
        return { error: "image_too_large" };
    }

    let bytes: Uint8Array;

    try {
        bytes = new Uint8Array(await imageFile.arrayBuffer());
    } catch (error) {
        console.error(`Unable to read ${logLabel} image:`, error);
        return { error: "upload_failed" };
    }

    const detectedType = detectCmsImageType(bytes);

    if (!detectedType) {
        return { error: "invalid_image" };
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
                `Unable to upload ${logLabel} image:`,
                error.message,
            );
            return { error: "upload_failed" };
        }
    } catch (error) {
        console.error(`Unable to upload ${logLabel} image:`, error);
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

export async function uploadCmsLogo({
    adminClient,
    bucket,
    folder,
    formData,
    logLabel,
    required,
}: UploadCmsLogoOptions): Promise<UploadCmsLogoResult> {
    const result = await uploadCmsImage({
        adminClient,
        bucket,
        fileField: "logoFile",
        folder,
        formData,
        logLabel,
        required,
    });

    if (!("error" in result)) {
        return result;
    }

    if (result.error === "invalid_image") {
        return { error: "invalid_logo" };
    }

    if (result.error === "image_too_large") {
        return { error: "logo_too_large" };
    }

    return { error: "upload_failed" };
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

export function getManagedCmsImagePath({
    bucket,
    imageUrl,
    storageHostname,
}: {
    bucket: string;
    imageUrl: string;
    storageHostname: string;
}) {
    return getManagedCmsLogoPath({
        bucket,
        logoUrl: imageUrl,
        storageHostname,
    });
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

export async function removeCmsImage({
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
    return removeCmsLogo({
        adminClient,
        bucket,
        logLabel,
        objectPath,
    });
}
