import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://7era.com"),

  title: {
    default: "7ERA Platform",
    template: "%s | 7ERA Platform",
  },

  description:
    "Premium gaming platform featuring trusted brands, mobile game downloads and 24/7 customer support.",

  applicationName: "7ERA Platform",

  keywords: [
    "7ERA",
    "Gaming",
    "Gaming Platform",
    "Mobile Games",
    "Game Download",
    "Online Platform",
    "Customer Support",
  ],

  authors: [
    {
      name: "7ERA Platform",
    },
  ],

  creator: "7ERA Platform",

  publisher: "7ERA Platform",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "7ERA Platform",
    description:
      "Premium gaming platform featuring trusted brands, mobile game downloads and 24/7 customer support.",
    url: "https://7era.com",
    siteName: "7ERA Platform",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "7ERA Platform",
    description:
      "Premium gaming platform featuring trusted brands, mobile game downloads and 24/7 customer support.",
  },
};

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
      </body>
    </html>
  );
}
