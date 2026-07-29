import type { ButtonSize, ButtonVariant } from "./Button.types";

export const buttonBaseStyles = [
  "inline-flex",
  "items-center",
  "justify-center",
  "gap-2",
  "whitespace-nowrap",
  "rounded-xl",
  "font-semibold",
  "transition-colors",
  "duration-200",
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-yellow-500",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-gray-950",
  "disabled:pointer-events-none",
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
].join(" ");

export const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-yellow-500",
    "text-gray-950",
    "hover:bg-yellow-400",
    "active:bg-yellow-600",
  ].join(" "),

  secondary: [
    "bg-gray-800",
    "text-white",
    "hover:bg-gray-700",
    "active:bg-gray-900",
  ].join(" "),

  outline: [
    "border",
    "border-gray-700",
    "bg-transparent",
    "text-white",
    "hover:border-yellow-500",
    "hover:bg-gray-900",
    "active:bg-gray-800",
  ].join(" "),

  ghost: [
    "bg-transparent",
    "text-gray-300",
    "hover:bg-gray-800",
    "hover:text-white",
    "active:bg-gray-900",
  ].join(" "),

  danger: [
    "bg-red-600",
    "text-white",
    "hover:bg-red-500",
    "active:bg-red-700",
  ].join(" "),
};

export const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 py-2 text-sm",
  md: "min-h-11 px-6 py-2.5 text-base",
  lg: "min-h-12 px-8 py-3 text-base",
};

export const buttonLoadingSpinnerStyles = [
  "h-4",
  "w-4",
  "animate-spin",
  "rounded-full",
  "border-2",
  "border-current",
  "border-r-transparent",
].join(" ");