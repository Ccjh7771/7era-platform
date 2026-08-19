export type PromotionStatus =
  | "active"
  | "upcoming"
  | "ended";

export interface PromotionCardProps {
  title: string;
  subtitle: string;
  description: string;

  category: string;

  image?: string;

  status?: PromotionStatus;
  featured?: boolean;
  className?: string;
}
