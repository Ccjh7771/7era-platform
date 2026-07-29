import {
  badgeDotStyles,
  badgeStyles,
  centerAlignmentStyles,
  descriptionStyles,
  leftAlignmentStyles,
  titleStyles,
  wrapperBaseStyles,
} from "./SectionHeader.styles";

import type { SectionHeaderProps } from "./SectionHeader.types";

export function SectionHeader({
  badge,
  title,
  description,
  align = "center",
  showDot = false,
}: SectionHeaderProps) {
  const alignmentStyles =
    align === "left"
      ? leftAlignmentStyles
      : centerAlignmentStyles;

  return (
    <div
      className={`${wrapperBaseStyles} ${alignmentStyles}`}
    >
      <span className={badgeStyles}>
        {showDot && (
          <span
            className={badgeDotStyles}
            aria-hidden="true"
          />
        )}

        {badge}
      </span>

      <h2 className={titleStyles}>
        {title}
      </h2>

      {description && (
        <p className={descriptionStyles}>
          {description}
        </p>
      )}
    </div>
  );
}