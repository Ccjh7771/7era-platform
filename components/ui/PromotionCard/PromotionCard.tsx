import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { isActionableHref } from "@/lib/links";
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
  disabledActionStyles,
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
  validityLabelStyles,
  validityStyles,
  validityValueStyles,
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
  validityLabel,
  image,
  href,
  status = "active",
  featured = false,
  disabled = false,
  className,
}: PromotionCardProps) {
  const hasDestination = isActionableHref(href);
  const isUnavailable =
    disabled || status === "ended" || !hasDestination;

  return (
    <Card
      variant="default"
      padding="lg"
      hoverable={!isUnavailable}
      className={cn(
        promotionCardStyles,
        isUnavailable && "opacity-70",
        className,
      )}
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

        <div className={validityStyles}>
          <span className={validityLabelStyles}>
            Validity
          </span>

          <span className={validityValueStyles}>
            {validityLabel}
          </span>
        </div>

        <div className={actionsStyles}>
          {isUnavailable ? (
            <span
              className={cn(
                actionLinkStyles,
                disabledActionStyles,
              )}
              aria-disabled="true"
            >
              <span>
                {status === "ended"
                  ? "Promotion Ended"
                  : hasDestination
                    ? "Unavailable"
                    : "Coming Soon"}
              </span>
            </span>
          ) : (
            <Link
              href={href}
              className={`group ${actionLinkStyles}`}
              aria-label={`View details for ${title}`}
            >
              <span>View Promotion</span>

              <span
                className={arrowStyles}
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          )}
        </div>
      </article>
    </Card>
  );
}
