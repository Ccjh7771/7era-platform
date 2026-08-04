export type WebsiteSettings = {
  siteName: string;
  shortName: string;
  brandLabel: string;
  tagline: string;
  logoPath: string | null;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  supportHeading: string;
  supportDescription: string;
  whatsappUrl: string;
  heylinkUrl: string;
  supportEmail: string;
  seoTitle: string;
  seoDescription: string;
  siteUrl: string;
  copyrightText: string;
};

export const defaultWebsiteSettings: WebsiteSettings = {
  siteName: "7ERA Platform",
  shortName: "7ERA",
  brandLabel: "Platform",
  tagline:
    "Premium gaming platform providing trusted brands, premium experiences and reliable customer support.",
  logoPath: null,
  primaryCtaLabel: "Join Now",
  primaryCtaUrl: "/#contact",
  supportHeading: "Need assistance with our platform?",
  supportDescription:
    "Our support team is available to help with account enquiries, platform access, game downloads and general assistance.",
  whatsappUrl: "#",
  heylinkUrl: "#",
  supportEmail: "support@7era.com",
  seoTitle: "7ERA Platform",
  seoDescription:
    "Premium gaming platform featuring trusted brands, mobile game downloads and 24/7 customer support.",
  siteUrl: "https://7era-platform.vercel.app",
  copyrightText: "© 2018 7ERA Platform. All Rights Reserved.",
};
