import type {
  DownloadCardProps,
  DownloadPlatform,
} from "@/components/ui/DownloadCard";

export interface DownloadItem
  extends Omit<DownloadCardProps, "className"> {
  id: string;
}

export interface DownloadPlatformOption {
  id: "all" | DownloadPlatform;
  label: string;
}

export const downloadPlatforms: DownloadPlatformOption[] = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "android",
    label: "Android",
  },
  {
    id: "ios",
    label: "iOS",
  },
  {
    id: "windows",
    label: "Windows",
  },
];

export const downloads: DownloadItem[] = [
  {
    id: "mega888-android",
    title: "Mega888",
    description:
      "Download the latest official Mega888 application for Android devices.",
    logo: "/games/mega888.png",
    platform: "android",
    version: "Latest",
    updatedAt: "2026-07-30",
    size: "Check download",
    downloadUrl: "#",
    guideUrl: "#installation-guide",
    isLatest: true,
  },
  {
    id: "pussy888-android",
    title: "Pussy888",
    description:
      "Download the official Pussy888 application with a smooth mobile experience.",
    logo: "/games/pussy888.png",
    platform: "android",
    version: "Latest",
    updatedAt: "2026-07-30",
    size: "Check download",
    downloadUrl: "#",
    guideUrl: "#installation-guide",
    isLatest: true,
  },
  {
    id: "918kiss-android",
    title: "918Kiss",
    description:
      "Get the latest official 918Kiss application for Android devices.",
    logo: "/games/918kiss.png",
    platform: "android",
    version: "Latest",
    updatedAt: "2026-07-30",
    size: "Check download",
    downloadUrl: "#",
    guideUrl: "#installation-guide",
    isLatest: true,
  },
  {
    id: "918kaya-android",
    title: "918Kaya",
    description:
      "Download the latest official 918Kaya mobile application.",
    logo: "/games/918kaya.png",
    platform: "android",
    version: "Latest",
    updatedAt: "2026-07-30",
    size: "Check download",
    downloadUrl: "#",
    guideUrl: "#installation-guide",
    isLatest: true,
  },
  {
    id: "evo888-android",
    title: "Evo888",
    description:
      "Access the latest official Evo888 application for Android.",
    logo: "/games/evo888.png",
    platform: "android",
    version: "Latest",
    updatedAt: "2026-07-30",
    size: "Check download",
    downloadUrl: "#",
    guideUrl: "#installation-guide",
    isLatest: true,
  },
  {
    id: "newtown-android",
    title: "Newtown",
    description:
      "Download the latest Newtown mobile application for Android devices.",
    logo: "/games/newtown.png",
    platform: "android",
    version: "Latest",
    updatedAt: "2026-07-30",
    size: "Check download",
    downloadUrl: "#",
    guideUrl: "#installation-guide",
    isLatest: true,
  },
];