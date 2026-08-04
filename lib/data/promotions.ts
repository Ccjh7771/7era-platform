import type { PromotionCardProps } from "@/components/ui/PromotionCard";

export interface PromotionItem
  extends Omit<PromotionCardProps, "className"> {
  id: string;
  priority: number;
}

export const promotions: PromotionItem[] = [
  {
    id: "welcome-reward",
    title: "Welcome Reward",
    subtitle: "Exclusive New Member Package",
    description:
      "New members can enjoy a premium welcome reward after completing the required registration steps.",
    category: "New Member",
    validityLabel: "Limited-time campaign",
    image: undefined,
    href: "#",
    status: "active",
    featured: true,
    priority: 1,
  },
  {
    id: "weekly-cashback",
    title: "Weekly Cashback",
    subtitle: "Rewards Every Week",
    description:
      "Eligible members can enjoy weekly cashback rewards based on the applicable campaign requirements.",
    category: "Cashback",
    validityLabel: "Available weekly",
    image: undefined,
    href: "#",
    status: "active",
    priority: 2,
  },
  {
    id: "vip-upgrade",
    title: "VIP Upgrade",
    subtitle: "Unlock Premium Membership Benefits",
    description:
      "Upgrade your membership level and unlock additional rewards, priority support and exclusive privileges.",
    category: "VIP",
    validityLabel: "Ongoing",
    image: undefined,
    href: "#",
    status: "active",
    featured: true,
    priority: 3,
  },
  {
    id: "referral-reward",
    title: "Referral Reward",
    subtitle: "Invite Friends and Earn Rewards",
    description:
      "Invite eligible friends to join and receive rewards when the campaign requirements are completed.",
    category: "Referral",
    validityLabel: "Limited-time campaign",
    image: undefined,
    href: "#",
    status: "upcoming",
    priority: 4,
  },
  {
    id: "birthday-reward",
    title: "Birthday Reward",
    subtitle: "A Special Reward for Your Celebration",
    description:
      "Eligible members may receive a special birthday reward during their birthday month.",
    category: "Member Reward",
    validityLabel: "Birthday month",
    image: undefined,
    href: "#",
    status: "active",
    priority: 5,
  },
  {
    id: "seasonal-campaign",
    title: "Seasonal Campaign",
    subtitle: "Limited Seasonal Benefits",
    description:
      "Enjoy selected seasonal rewards and special campaign benefits during the promotional period.",
    category: "Seasonal",
    validityLabel: "Campaign ended",
    image: undefined,
    href: "#",
    status: "ended",
    disabled: true,
    priority: 6,
  },
];

export const sortedPromotions = [...promotions].sort(
  (firstPromotion, secondPromotion) =>
    firstPromotion.priority - secondPromotion.priority,
);