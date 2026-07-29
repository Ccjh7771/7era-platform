export const cardBaseStyles =
  "overflow-hidden rounded-2xl border bg-zinc-950 text-white transition-all duration-200";

export const cardVariantStyles = {
  default: "border-zinc-800",
  elevated: "border-zinc-800 shadow-xl shadow-black/30",
  outline: "border-yellow-500/40",
} as const;

export const cardPaddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export const cardHoverStyles =
  "hover:-translate-y-1 hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/10";

export const cardHeaderStyles =
  "border-b border-zinc-800 px-6 py-4";

export const cardFooterStyles =
  "border-t border-zinc-800 px-6 py-4";