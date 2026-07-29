export const colors = {
  brand: {
    primary: "#EAB308",
    primaryHover: "#CA8A04",
    primaryActive: "#A16207",
    secondary: "#111827",
    accent: "#FACC15",
  },

  background: {
    default: "#030712",
    surface: "#111827",
    elevated: "#1F2937",
    overlay: "rgba(0, 0, 0, 0.72)",
  },

  text: {
    primary: "#F9FAFB",
    secondary: "#D1D5DB",
    muted: "#9CA3AF",
    disabled: "#6B7280",
    inverse: "#111827",
  },

  border: {
    default: "#374151",
    strong: "#4B5563",
    focus: "#EAB308",
  },

  status: {
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  },
} as const;

export const typography = {
  fontFamily: {
    sans: "Arial, Helvetica, sans-serif",
  },

  fontSize: {
    displayLarge: "4rem",
    displayMedium: "3rem",
    heading1: "2.25rem",
    heading2: "1.875rem",
    heading3: "1.5rem",
    bodyLarge: "1.125rem",
    body: "1rem",
    bodySmall: "0.875rem",
    caption: "0.75rem",
  },

  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const radius = {
  none: "0",
  small: "0.375rem",
  medium: "0.5rem",
  large: "0.75rem",
  extraLarge: "1rem",
  full: "9999px",
} as const;

export const shadows = {
  small: "0 1px 2px rgba(0, 0, 0, 0.25)",
  medium: "0 4px 12px rgba(0, 0, 0, 0.3)",
  large: "0 12px 30px rgba(0, 0, 0, 0.35)",
  floating: "0 20px 50px rgba(0, 0, 0, 0.45)",
} as const;

export const motion = {
  duration: {
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
  },

  easing: {
    standard: "ease",
    enter: "ease-out",
    exit: "ease-in",
  },
} as const;

export const breakpoints = {
  small: "640px",
  medium: "768px",
  large: "1024px",
  extraLarge: "1280px",
  wide: "1536px",
} as const;

export const designTokens = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  motion,
  breakpoints,
} as const;

export type DesignTokens = typeof designTokens;