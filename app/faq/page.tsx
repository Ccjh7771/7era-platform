import type { Metadata } from "next";

import { Footer, Header } from "@/components/layout";
import { FAQSection } from "@/components/sections/FAQSection";
import { getActiveFaq } from "@/lib/data/get-faq";

export const metadata: Metadata = {
  title: "FAQ | 7ERA Platform",
  description:
    "Find answers about downloads, promotions, accounts, technical support and platform security.",
};

export default async function FAQPage() {
  const faqItems = await getActiveFaq();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-black text-white">
        <FAQSection faqItems={faqItems} />
      </main>

      <Footer />
    </>
  );
}
