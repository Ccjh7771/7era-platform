import { Footer, Header } from "@/components/layout";
import { Hero } from "@/components/sections/Hero";
import { BrandSection } from "@/components/sections/BrandSection";
import { GameSection } from "@/components/sections/GameSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-black text-white">
        <Hero />

        <BrandSection />

        <GameSection />

        <ContactSection />
      </main>

      <Footer />
    </>
  );
}