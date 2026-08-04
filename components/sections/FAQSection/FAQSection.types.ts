import type { FAQCategory, FAQItem } from "@/lib/data/faq";

export interface FAQCategoryOption {
  id: "all" | FAQCategory;
  label: string;
}

export interface FAQSectionProps {
  faqItems: FAQItem[];
}
