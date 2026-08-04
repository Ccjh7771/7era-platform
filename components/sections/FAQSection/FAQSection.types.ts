import type { FAQCategory } from "@/lib/data/faq";

export interface FAQCategoryOption {
  id: "all" | FAQCategory;
  label: string;
}