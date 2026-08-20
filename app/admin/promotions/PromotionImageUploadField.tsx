"use client";

import { CmsLogoUploadField } from "@/app/admin/_components/CmsLogoUploadField";

type PromotionImageUploadFieldProps = {
    currentImageUrl?: string | null;
    idPrefix: string;
};

export function PromotionImageUploadField({
    currentImageUrl,
    idPrefix,
}: PromotionImageUploadFieldProps) {
    return (
        <CmsLogoUploadField
            currentLogoUrl={currentImageUrl}
            emptyHelpText={currentImageUrl
                ? "Leave empty to keep the current image."
                : "The card will show the 7ERA placeholder if empty."}
            emptyPreviewText="Optional image preview"
            fieldName="imageFile"
            idPrefix={idPrefix}
            label="Promotion image"
            objectFit="cover"
            previewAlt="Selected promotion image preview"
            previewVariant="wide"
        />
    );
}
