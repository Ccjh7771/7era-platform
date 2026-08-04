import Image from "next/image";

import { Card } from "@/components/ui/Card";
import { isActionableHref } from "@/lib/links";
import { cn } from "@/lib/utils";

import {
  actionsStyles,
  badgeRowStyles,
  contentStyles,
  descriptionStyles,
  detailLabelStyles,
  detailRowStyles,
  detailsStyles,
  detailValueStyles,
  disabledLinkStyles,
  downloadCardStyles,
  downloadLinkStyles,
  guideLinkStyles,
  latestBadgeStyles,
  logoStyles,
  logoWrapperStyles,
  platformBadgeStyles,
  titleStyles,
} from "./DownloadCard.styles";

import type {
  DownloadCardProps,
  DownloadPlatform,
} from "./DownloadCard.types";

const platformLabels: Record<
  DownloadPlatform,
  string
> = {
  android: "Android",
  ios: "iOS",
  windows: "Windows",
};

export function DownloadCard({
  title,
  description,
  logo,
  platform,
  version,
  updatedAt,
  size,
  downloadUrl,
  guideUrl,
  isLatest = false,
  disabled = false,
  className,
}: DownloadCardProps) {
  const platformLabel =
    platformLabels[platform];
  const isDownloadUnavailable =
    disabled || !isActionableHref(downloadUrl);

  return (
    <Card
      variant="default"
      padding="lg"
      hoverable
      className={cn(
        downloadCardStyles,
        className,
      )}
    >
      <div className={contentStyles}>
        <div className={logoWrapperStyles}>
          <Image
            src={logo}
            alt={`${title} logo`}
            width={112}
            height={112}
            sizes="112px"
            className={logoStyles}
          />
        </div>

        <h3 className={titleStyles}>
          {title}
        </h3>

        <p className={descriptionStyles}>
          {description}
        </p>

        <div className={badgeRowStyles}>
          <span className={platformBadgeStyles}>
            {platformLabel}
          </span>

          {isLatest && (
            <span className={latestBadgeStyles}>
              Latest
            </span>
          )}
        </div>

        <dl className={detailsStyles}>
          <div className={detailRowStyles}>
            <dt className={detailLabelStyles}>
              Version
            </dt>

            <dd className={detailValueStyles}>
              {version}
            </dd>
          </div>

          <div className={detailRowStyles}>
            <dt className={detailLabelStyles}>
              Updated
            </dt>

            <dd className={detailValueStyles}>
              {updatedAt}
            </dd>
          </div>

          <div className={detailRowStyles}>
            <dt className={detailLabelStyles}>
              File Size
            </dt>

            <dd className={detailValueStyles}>
              {size}
            </dd>
          </div>
        </dl>

        <div className={actionsStyles}>
          {isDownloadUnavailable ? (
            <span
              className={cn(
                downloadLinkStyles,
                disabledLinkStyles,
              )}
              aria-disabled="true"
            >
              Coming Soon
            </span>
          ) : (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={downloadLinkStyles}
            >
              Download Now
            </a>
          )}

          {guideUrl && (
            <a
              href={guideUrl}
              className={guideLinkStyles}
            >
              Installation Guide
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
