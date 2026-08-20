"use client";

import { CmsLogoUploadField } from "@/app/admin/_components/CmsLogoUploadField";

type LogoUploadFieldProps = {
    currentLogoUrl?: string;
    idPrefix: string;
    required?: boolean;
};

export function LogoUploadField({
    currentLogoUrl,
    idPrefix,
    required = false,
}: LogoUploadFieldProps) {
    return (
        <CmsLogoUploadField
            currentLogoUrl={currentLogoUrl}
            emptyHelpText={currentLogoUrl
                ? "Leave empty to keep the current logo."
                : "A logo is required for new brands."}
            emptyPreviewText="Logo preview"
            idPrefix={idPrefix}
            label="Brand logo"
            previewAlt="Selected brand logo preview"
            required={required}
        />
    );
}
