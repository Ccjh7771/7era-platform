export type PromotionStatus =
  | "active"
  | "upcoming"
  | "ended";

export interface PromotionCardProps {
  title: string;
  subtitle: string;
  description: string;

  category: string;
  validityLabel: string;

  image?: string;
  href: string;

  status?: PromotionStatus;
  featured?: boolean;
  disabled?: boolean;
  className?: string;
}