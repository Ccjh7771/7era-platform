import { BrandCard } from "@/components/ui/BrandCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getActiveBrands } from "@/lib/data/get-brands";

import {
  gridStyles,
  sectionStyles,
} from "./BrandSection.styles";

export async function BrandSection() {
  const brands = await getActiveBrands();

  return (
    <section
      id="brands"
      className={sectionStyles}
    >
      <Reveal>
        <SectionHeader
          badge="OUR BRANDS"
          title="Trusted Gaming Brands"
          description="Explore our premium gaming ecosystem, built to deliver secure, reliable and seamless entertainment experiences."
        />
      </Reveal>

      <div className={gridStyles}>
        {brands.map((brand, index) => (
          <Reveal
            key={brand.id}
            delay={index * 100}
            className="h-full"
          >
            <BrandCard brand={brand} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
