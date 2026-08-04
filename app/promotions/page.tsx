import type { Metadata } from "next";

import { Footer, Header } from "@/components/layout";
import { PromotionSection } from "@/components/sections/PromotionSection";
import { getActivePromotions } from "@/lib/data/get-promotions";

export const metadata: Metadata = {
  title: "Promotions | 7ERA Platform",
  description:
    "Discover exclusive member rewards, limited-time campaigns and premium benefits available across the 7ERA Platform.",
};

export default async function PromotionsPage() {
  const promotions = await getActivePromotions();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-black text-white">
        <PromotionSection promotions={promotions} />
      </main>

      <Footer />
    </>
  );
}
