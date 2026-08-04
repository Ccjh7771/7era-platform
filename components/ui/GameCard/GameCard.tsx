import Image from "next/image";

import { Card } from "@/components/ui/Card";
import { isActionableHref } from "@/lib/links";

import type { GameCardProps } from "./GameCard.types";

import {
  actionsStyles,
  descriptionStyles,
  downloadButtonStyles,
  gameCardStyles,
  gameContentStyles,
  gameNameStyles,
  imageStyles,
  imageWrapperStyles,
  ratingStyles,
  ratingWrapperStyles,
  starsStyles,
} from "./GameCard.styles";

export function GameCard({
  game,
}: GameCardProps) {
  const normalizedRating = Math.max(
    0,
    Math.min(5, Math.round(game.rating)),
  );
  const hasDownload = isActionableHref(game.download);

  return (
    <Card
      className={gameCardStyles}
      padding="lg"
      hoverable
    >
      <div className={gameContentStyles}>
        <div className={imageWrapperStyles}>
          <Image
            src={game.logo}
            alt={game.name}
            width={120}
            height={120}
            className={imageStyles}
          />
        </div>

        <h3 className={gameNameStyles}>
          {game.name}
        </h3>

        <p className={descriptionStyles}>
          {game.description}
        </p>

        <div
          className={ratingWrapperStyles}
          aria-label={`${game.rating} out of 5 stars`}
        >
          <span className={starsStyles}>
            {"★".repeat(normalizedRating)}
            {"☆".repeat(5 - normalizedRating)}
          </span>

          <span className={ratingStyles}>
            {game.rating.toFixed(1)}
          </span>
        </div>

        <div className={actionsStyles}>
          {hasDownload ? (
            <a
              href={game.download}
              className={downloadButtonStyles}
            >
              Download Game
            </a>
          ) : (
            <span
              className={`${downloadButtonStyles} cursor-not-allowed opacity-50 grayscale`}
              aria-disabled="true"
            >
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
