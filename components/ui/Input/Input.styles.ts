export const inputBaseStyles =
  "w-full rounded-xl border bg-black text-white outline-none transition-colors duration-200 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50";

export const inputVariantStyles = {
  default:
    "border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20",
  error:
    "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
} as const;

export const inputSizeStyles = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-base",
  lg: "h-14 px-5 text-lg",
} as const;