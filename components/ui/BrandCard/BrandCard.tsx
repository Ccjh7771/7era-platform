import Image from "next/image";

import { Card } from "@/components/ui/Card";

import {
  actionsStyles,
  brandCardStyles,
  brandContentStyles,
  brandNameStyles,
  descriptionStyles,
  heylinkStyles,
  logoStyles,
  logoWrapperStyles,
  ratingStyles,
  ratingWrapperStyles,
  starsStyles,
  whatsappLinkStyles,
} from "./BrandCard.styles";
import type { BrandCardProps } from "./BrandCard.types";

export function BrandCard({ brand }: BrandCardProps) {
  const normalizedRating = Math.max(
    0,
    Math.min(5, Math.round(brand.rating)),
  );

  return (
    <Card
      className={brandCardStyles}
      padding="lg"
      hoverable
    >
      <div className={brandContentStyles}>
        <div className={logoWrapperStyles}>
          <Image
            src={brand.logo}
            alt={`${brand.name} logo`}
            width={96}
            height={96}
            className={logoStyles}
          />
        </div>

        <h3 className={brandNameStyles}>
          {brand.name}
        </h3>

        <p className={descriptionStyles}>
          {brand.description}
        </p>

        <div
          className={ratingWrapperStyles}
          aria-label={`${brand.rating} out of 5 stars`}
        >
          <span className={starsStyles} aria-hidden="true">
            {"★".repeat(normalizedRating)}
            {"☆".repeat(5 - normalizedRating)}
          </span>

          <span className={ratingStyles}>
            {brand.rating.toFixed(1)}
          </span>
        </div>

        <div className={actionsStyles}>
          <a
            href={brand.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={whatsappLinkStyles}
          >
            WhatsApp
          </a>

          <a
            href={brand.heylink}
            target="_blank"
            rel="noopener noreferrer"
            className={heylinkStyles}
          >
            HeyLink
          </a>
        </div>
      </div>
    </Card>
  );
}