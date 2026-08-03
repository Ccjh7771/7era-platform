export type DownloadPlatform =
  | "android"
  | "ios"
  | "windows";

export interface DownloadCardProps {
  title: string;
  description: string;
  logo: string;
  platform: DownloadPlatform;
  version: string;
  updatedAt: string;
  size: string;
  downloadUrl: string;
  guideUrl?: string;
  isLatest?: boolean;
  disabled?: boolean;
  className?: string;
}