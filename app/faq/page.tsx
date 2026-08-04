import type { Metadata } from "next";

import { Footer, Header } from "@/components/layout";
import { FAQSection } from "@/components/sections/FAQSection";

export const metadata: Metadata = {
  title: "FAQ | 7ERA Platform",
  description:
    "Find answers about downloads, promotions, accounts, technical support and platform security.",
};

export default function FAQPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-black text-white">
        <FAQSection />
      </main>

      <Footer />
    </>
  );
}