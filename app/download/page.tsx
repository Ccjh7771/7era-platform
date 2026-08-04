import type { Metadata } from "next";

import { Footer, Header } from "@/components/layout";
import { DownloadSection } from "@/components/sections/DownloadSection";
import { getActiveDownloads } from "@/lib/data/get-downloads";

export const metadata: Metadata = {
  title: "Download Center | 7ERA Platform",
  description:
    "Download the latest official applications from 7ERA Platform.",
};

export default async function DownloadPage() {
  const downloads = await getActiveDownloads();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-black text-white">
        <DownloadSection downloads={downloads} />
      </main>

      <Footer />
    </>
  );
}
