import "server-only";

import { createPublicClient } from "@/lib/supabase/public";

import { sortedFaq as fallbackFaq } from "./faq";
import type { FAQCategory, FAQItem } from "./faq";

type FAQRow = {
  id: number;
  slug: string;
  category: FAQCategory;
  question: string;
  answer: string;
  sort_order: number;
};

export async function getActiveFaq(): Promise<FAQItem[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("faq_items")
      .select("id, slug, category, question, answer, sort_order")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return (data as FAQRow[]).map((item) => ({
      id: item.slug,
      category: item.category,
      question: item.question,
      answer: item.answer,
      visible: true,
      order: item.sort_order,
    }));
  } catch (error) {
    console.error(
      "Unable to load active FAQ items:",
      error instanceof Error ? error.message : error,
    );

    return fallbackFaq;
  }
}
