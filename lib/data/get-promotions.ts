import "server-only";

import { createPublicClient } from "@/lib/supabase/public";

import { sortedPromotions as fallbackPromotions } from "./promotions";
import type { PromotionItem } from "./promotions";

type PromotionRow = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  validity_label: string;
  image_path: string | null;
  href: string;
  status: "active" | "upcoming" | "ended";
  is_featured: boolean;
  is_disabled: boolean;
  sort_order: number;
};

export async function getActivePromotions(): Promise<PromotionItem[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("promotions")
      .select(
        "id, slug, title, subtitle, description, category, validity_label, image_path, href, status, is_featured, is_disabled, sort_order",
      )
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return (data as PromotionRow[]).map((promotion) => ({
      id: promotion.slug,
      title: promotion.title,
      subtitle: promotion.subtitle,
      description: promotion.description,
      category: promotion.category,
      validityLabel: promotion.validity_label,
      image: promotion.image_path ?? undefined,
      href: promotion.href,
      status: promotion.status,
      featured: promotion.is_featured,
      disabled: promotion.is_disabled,
      priority: promotion.sort_order,
    }));
  } catch (error) {
    console.error(
      "Unable to load active promotions:",
      error instanceof Error ? error.message : error,
    );

    return fallbackPromotions;
  }
}
