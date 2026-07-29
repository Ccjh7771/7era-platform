import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";

import {
  heroBackgroundGlowStyles,
  heroBadgeStyles,
  heroBrandCardStyles,
  heroBrandGridStyles,
  heroBrandImageStyles,
  heroBrandItemStyles,
  heroButtonGroupStyles,
  heroContentStyles,
  heroDescriptionStyles,
  heroHighlightStyles,
  heroLeftStyles,
  heroRightStyles,
  heroSectionStyles,
  heroTitleStyles,
  heroVisualCardStyles,
  heroVisualDescriptionStyles,
  heroVisualHeaderStyles,
  heroVisualLogoStyles,
  heroVisualTitleStyles,
} from "./Hero.styles";

import type { HeroProps } from "./Hero.types";

const heroBrands = [
  {
    name: "SC Club",
    logo: "/brands/scclub.png",
  },
  {
    name: "ShopPay",
    logo: "/brands/shoppay.png",
  },
  {
    name: "TNG30",
    logo: "/brands/tng30.png",
  },
];

export function Hero({
  title = "7ERA Ultimate Platform",
  subtitle = "Build Once. Scale Forever.",
}: HeroProps) {
  return (
    <section className={heroSectionStyles}>
      <div
        className={heroBackgroundGlowStyles}
        aria-hidden="true"
      />

      <Container>
        <div className={heroContentStyles}>
          <div className={heroLeftStyles}>
            <p className={heroBadgeStyles}>
              ✦ Premium Gaming Platform
            </p>

            <h1 className={heroTitleStyles}>
              <span className={heroHighlightStyles}>
                7ERA
              </span>

              <br />

              Ultimate Gaming Platform
            </h1>

            <p className={heroDescriptionStyles}>
              Premium Gaming • VIP Rewards • Multi Brands
            </p>

            <p className={heroDescriptionStyles}>
              One platform for gaming, rewards, memberships, campaigns and
              customer engagement.
            </p>

            <div className={heroButtonGroupStyles}>
              <Link
                href="#contact"
                className="
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-r
                  from-yellow-300
                  via-yellow-400
                  to-amber-300
                  px-7
                  py-3
                  text-sm
                  font-bold
                  text-black
                  shadow-[0_0_30px_rgba(250,204,21,0.25)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:scale-[1.02]
                  hover:shadow-[0_0_45px_rgba(250,204,21,0.4)]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-yellow-400
                "
              >
                Join Now
              </Link>

              <Link
                href="#brands"
                className="
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-yellow-400/30
                  bg-white/5
                  px-7
                  py-3
                  text-sm
                  font-bold
                  text-yellow-300
                  backdrop-blur-md
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-yellow-300/60
                  hover:bg-yellow-400/10
                  hover:shadow-[0_0_30px_rgba(250,204,21,0.16)]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-yellow-400
                "
              >
                Explore Brands
              </Link>
            </div>
          </div>

          <div className={heroRightStyles}>
            <div className={heroVisualCardStyles}>
              <div className={heroVisualHeaderStyles}>
                <div className={heroVisualLogoStyles}>
                  <Image
                    src="/brands/7era.png"
                    alt="7ERA"
                    width={150}
                    height={150}
                    priority
                    className="h-auto w-full object-contain"
                  />
                </div>

                <p className={heroVisualTitleStyles}>
                  Premium Platform
                </p>

                <p className={heroVisualDescriptionStyles}>
                  One connected experience across trusted brands.
                </p>
              </div>

              <div className={heroBrandGridStyles}>
                {heroBrands.map((brand) => (
                  <div
                    key={brand.name}
                    className={heroBrandCardStyles}
                  >
                    <div className={heroBrandItemStyles}>
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={120}
                        height={70}
                        className={heroBrandImageStyles}
                      />
                    </div>

                    <span className="text-sm font-semibold text-zinc-200">
                      {brand.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300/80">
                <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.8)]" />

                Trusted Multi-Brand Experience
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}