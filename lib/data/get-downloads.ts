import "server-only";

import { createPublicClient } from "@/lib/supabase/public";

import { downloads as fallbackDownloads } from "./downloads";
import type { DownloadItem } from "./downloads";

type DownloadRow = {
  id: number;
  slug: string;
  title: string;
  description: string;
  logo_path: string;
  platform: "android" | "ios" | "windows";
  version: string;
  release_date: string;
  file_size: string;
  download_url: string;
  guide_url: string | null;
  is_latest: boolean;
  is_disabled: boolean;
};

export async function getActiveDownloads(): Promise<DownloadItem[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("downloads")
      .select(
        "id, slug, title, description, logo_path, platform, version, release_date, file_size, download_url, guide_url, is_latest, is_disabled",
      )
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return (data as DownloadRow[]).map((download) => ({
      id: download.slug,
      title: download.title,
      description: download.description,
      logo: download.logo_path,
      platform: download.platform,
      version: download.version,
      updatedAt: download.release_date,
      size: download.file_size,
      downloadUrl: download.download_url,
      guideUrl: download.guide_url ?? undefined,
      isLatest: download.is_latest,
      disabled: download.is_disabled,
    }));
  } catch (error) {
    console.error(
      "Unable to load active downloads:",
      error instanceof Error ? error.message : error,
    );

    return fallbackDownloads;
  }
}
