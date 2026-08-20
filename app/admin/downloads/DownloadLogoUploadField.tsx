import { CmsLogoUploadField } from "@/app/admin/_components/CmsLogoUploadField";

type DownloadLogoUploadFieldProps = {
    currentLogoUrl?: string;
    idPrefix: string;
    required?: boolean;
};

export function DownloadLogoUploadField({
    currentLogoUrl,
    idPrefix,
    required = false,
}: DownloadLogoUploadFieldProps) {
    return (
        <CmsLogoUploadField
            currentLogoUrl={currentLogoUrl}
            emptyHelpText={
                currentLogoUrl
                    ? "Leave empty to keep the current logo."
                    : "A logo is required for new downloads."
            }
            idPrefix={idPrefix}
            label="Application logo"
            previewAlt="Selected application logo preview"
            required={required}
        />
    );
}
