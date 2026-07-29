import type { HTMLAttributes, ReactNode } from "react";

export type CardVariant = "default" | "elevated" | "outline";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
}