import type { Metadata } from "next";

import { Footer, Header } from "@/components/layout";
import { PromotionSection } from "@/components/sections/PromotionSection";

export const metadata: Metadata = {
  title: "Promotions | 7ERA Platform",
  description:
    "Discover exclusive member rewards, limited-time campaigns and premium benefits available across the 7ERA Platform.",
};

export default function PromotionsPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-black text-white">
        <PromotionSection />
      </main>

      <Footer />
    </>
  );
}