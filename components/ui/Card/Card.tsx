import { cn } from "@/lib/utils";

import {
  cardBaseStyles,
  cardFooterStyles,
  cardHeaderStyles,
  cardHoverStyles,
  cardPaddingStyles,
  cardVariantStyles,
} from "./Card.styles";
import type { CardProps } from "./Card.types";

export function Card({
  children,
  header,
  footer,
  variant = "default",
  padding = "md",
  hoverable = false,
  className,
  ...cardProps
}: CardProps) {
  return (
    <div
      className={cn(
        cardBaseStyles,
        cardVariantStyles[variant],
        hoverable && cardHoverStyles,
        className,
      )}
      {...cardProps}
    >
      {header && <div className={cardHeaderStyles}>{header}</div>}

      <div className={cardPaddingStyles[padding]}>{children}</div>

      {footer && <div className={cardFooterStyles}>{footer}</div>}
    </div>
  );
}