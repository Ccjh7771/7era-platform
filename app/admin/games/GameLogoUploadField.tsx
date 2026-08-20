import { CmsLogoUploadField } from "@/app/admin/_components/CmsLogoUploadField";

type GameLogoUploadFieldProps = {
    currentLogoUrl?: string;
    idPrefix: string;
    required?: boolean;
};

export function GameLogoUploadField({
    currentLogoUrl,
    idPrefix,
    required = false,
}: GameLogoUploadFieldProps) {
    return (
        <CmsLogoUploadField
            currentLogoUrl={currentLogoUrl}
            emptyHelpText={
                currentLogoUrl
                    ? "Leave empty to keep the current logo."
                    : "A logo is required for new games."
            }
            idPrefix={idPrefix}
            label="Game logo"
            previewAlt="Selected game logo preview"
            required={required}
        />
    );
}
