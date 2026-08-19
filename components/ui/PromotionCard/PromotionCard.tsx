import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

import {
  actionLinkStyles,
  actionsStyles,
  activeStatusStyles,
  arrowStyles,
  badgeRowStyles,
  categoryBadgeStyles,
  contentStyles,
  descriptionStyles,
  endedStatusStyles,
  featuredBadgeStyles,
  featuredGlowStyles,
  imagePlaceholderStyles,
  imageStyles,
  imageWrapperStyles,
  promotionCardStyles,
  statusBadgeBaseStyles,
  subtitleStyles,
  titleStyles,
  upcomingStatusStyles,
} from "./PromotionCard.styles";

import type {
  PromotionCardProps,
  PromotionStatus,
} from "./PromotionCard.types";

const statusLabels: Record<PromotionStatus, string> = {
  active: "Active",
  upcoming: "Upcoming",
  ended: "Ended",
};

const statusStyles: Record<PromotionStatus, string> = {
  active: activeStatusStyles,
  upcoming: upcomingStatusStyles,
  ended: endedStatusStyles,
};

export function PromotionCard({
  title,
  subtitle,
  description,
  category,
  image,
  status = "active",
  featured = false,
  className,
}: PromotionCardProps) {
  return (
    <Card
      variant="default"
      padding="lg"
      hoverable
      className={cn(promotionCardStyles, className)}
    >
      {featured && (
        <div
          className={featuredGlowStyles}
          aria-hidden="true"
        />
      )}

      <article className={contentStyles}>
        <div className={imageWrapperStyles}>
          {image ? (
            <Image
              src={image}
              alt={`${title} promotion`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className={imageStyles}
            />
          ) : (
            <div className={imagePlaceholderStyles}>
              7
            </div>
          )}
        </div>

        <div className={badgeRowStyles}>
          <span className={categoryBadgeStyles}>
            {category}
          </span>

          <span
            className={cn(
              statusBadgeBaseStyles,
              statusStyles[status],
            )}
          >
            {statusLabels[status]}
          </span>

          {featured && (
            <span className={featuredBadgeStyles}>
              Featured
            </span>
          )}
        </div>

        <h2 className={titleStyles}>
          {title}
        </h2>

        <p className={subtitleStyles}>
          {subtitle}
        </p>

        <p className={descriptionStyles}>
          {description}
        </p>

        <div className={actionsStyles}>
          <Link
            href="/#brands"
            className={`group ${actionLinkStyles}`}
            aria-label={`Claim ${title} through a 7ERA brand`}
          >
            <span>Claim Now</span>

            <span
              className={arrowStyles}
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>
      </article>
    </Card>
  );
}
