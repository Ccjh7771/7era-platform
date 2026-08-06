import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getWebsiteSettings } from "@/lib/data/get-website-settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return {
    metadataBase: new URL(settings.siteUrl),
    title: {
      default: settings.seoTitle,
      template: `%s | ${settings.shortName}`,
    },
    description: settings.seoDescription,
    applicationName: settings.siteName,
    keywords: [
      settings.shortName,
      "Gaming",
      "Gaming Platform",
      "Mobile Games",
      "Game Download",
      "Online Platform",
      "Customer Support",
    ],
    authors: [{ name: settings.siteName }],
    creator: settings.siteName,
    publisher: settings.siteName,
    robots: { index: true, follow: true },
    openGraph: {
      title: settings.seoTitle,
      description: settings.seoDescription,
      url: settings.siteUrl,
      siteName: settings.siteName,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seoTitle,
      description: settings.seoDescription,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black text-white antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
