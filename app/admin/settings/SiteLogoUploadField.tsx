"use client";

import { CmsLogoUploadField } from "@/app/admin/_components/CmsLogoUploadField";

type SiteLogoUploadFieldProps = {
    currentLogoUrl: string | null;
};

export function SiteLogoUploadField({
    currentLogoUrl,
}: SiteLogoUploadFieldProps) {
    return (
        <div className="sm:col-span-2">
            <CmsLogoUploadField
                currentLogoUrl={currentLogoUrl}
                emptyHelpText="Leave empty to keep the current logo."
                emptyPreviewText="Default 7 icon"
                idPrefix="site"
                label="Website logo"
                previewAlt="Selected website logo preview"
            />

            {currentLogoUrl && (
                <label className="mt-3 flex items-center gap-3 text-xs font-semibold text-zinc-400">
                    <input
                        name="removeLogo"
                        type="checkbox"
                        className="h-4 w-4 accent-yellow-300"
                    />
                    Remove current logo and use the default 7 icon
                </label>
            )}
        </div>
    );
}
