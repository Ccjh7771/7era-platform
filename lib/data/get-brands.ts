import "server-only";

import { createPublicClient } from "@/lib/supabase/public";

import { brands as fallbackBrands } from "./brands";
import type { BrandData } from "./brands";

type BrandRow = {
  id: number;
  name: string;
  description: string;
  rating: number | string;
  whatsapp_url: string;
  heylink_url: string;
  logo_path: string;
};

export async function getActiveBrands(): Promise<BrandData[]> {
  try {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("brands")
      .select(
        "id, name, description, rating, whatsapp_url, heylink_url, logo_path",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return (data as BrandRow[]).map((brand) => ({
      id: brand.id,
      name: brand.name,
      description: brand.description,
      rating: Number(brand.rating),
      whatsapp: brand.whatsapp_url,
      heylink: brand.heylink_url,
      logo: brand.logo_path,
    }));
  } catch (error) {
    console.error(
      "Unable to load active brands:",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );

    return fallbackBrands;
  }
}
