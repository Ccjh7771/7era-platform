import "server-only";

import {
  getManagedCmsImagePath,
  removeCmsImage,
  uploadCmsImage,
} from "@/lib/admin/cms-logo-storage";
import { createAdminClient } from "@/lib/supabase/admin";

const bucket = "engagement-assets";
const storageHostname = "imkfmynzsnjckdzctwpp.supabase.co";
export const engagementImageMaximumBytes = 3 * 1024 * 1024;

export async function uploadEngagementImage(formData: FormData, folder: string) {
  const client = createAdminClient();
  const result = await uploadCmsImage({
    adminClient: client,
    bucket,
    folder,
    formData,
    logLabel: `engagement ${folder}`,
    maximumBytes: engagementImageMaximumBytes,
    required: false,
  });

  if ("error" in result) {
    return { url: null, objectPath: null, error: result.error };
  }

  return {
    url: result.upload?.publicUrl ?? null,
    objectPath: result.upload?.objectPath ?? null,
    error: null,
  };
}

export function getManagedEngagementImagePath(imageUrl: string) {
  return getManagedCmsImagePath({
    bucket,
    imageUrl,
    storageHostname,
  });
}

export async function removeEngagementImage(objectPath: string) {
  return removeCmsImage({
    adminClient: createAdminClient(),
    bucket,
    logLabel: "engagement",
    objectPath,
  });
}
