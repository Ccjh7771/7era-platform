"use client";

import { CmsLogoUploadField } from "@/app/admin/_components/CmsLogoUploadField";

const engagementImageMaximumBytes = 3 * 1024 * 1024;

export function ImageUploadField({
  id,
  label,
  currentUrl,
}: {
  id: string;
  label: string;
  currentUrl?: string | null;
}) {
  return (
    <CmsLogoUploadField
      currentLogoUrl={currentUrl}
      emptyHelpText={currentUrl
        ? "Leave empty to keep the current image."
        : "The image is optional."}
      emptyPreviewText="No image"
      fieldName="imageFile"
      idPrefix={id}
      label={label}
      maximumBytes={engagementImageMaximumBytes}
      previewAlt={`${label} preview`}
      previewVariant="wide"
    />
  );
}
