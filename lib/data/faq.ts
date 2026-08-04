export type FAQCategory =
  | "download"
  | "promotion"
  | "account"
  | "technical"
  | "security";

export interface FAQItem {
  id: string;

  category: FAQCategory;

  question: string;

  answer: string;

  visible: boolean;

  order: number;
}

export const faq: FAQItem[] = [
  {
    id: "download-install",

    category: "download",

    question: "How do I install the application?",

    answer:
      "Download the latest application from the Download Center and follow the installation guide provided on the page.",

    visible: true,

    order: 1,
  },

  {
    id: "download-update",

    category: "download",

    question: "How do I update my application?",

    answer:
      "Simply download the latest version and install it over your existing application.",

    visible: true,

    order: 2,
  },

  {
    id: "promotion-claim",

    category: "promotion",

    question: "How do I claim a promotion?",

    answer:
      "Open the Promotions page and follow the campaign requirements before contacting customer support if needed.",

    visible: true,

    order: 3,
  },

  {
    id: "account-register",

    category: "account",

    question: "How do I create an account?",

    answer:
      "Contact our official customer support team to begin the registration process.",

    visible: true,

    order: 4,
  },

  {
    id: "technical-app",

    category: "technical",

    question: "The application won't open. What should I do?",

    answer:
      "Restart your device, install the latest version and ensure your internet connection is stable.",

    visible: true,

    order: 5,
  },

  {
    id: "security-safe",

    category: "security",

    question: "How do I know the download is safe?",

    answer:
      "Only download applications from the official 7ERA Platform Download Center.",

    visible: true,

    order: 6,
  },
];

export const sortedFaq = [...faq].sort(
  (a, b) => a.order - b.order,
);