import "server-only";

import { cache } from "react";

import { createPublicClient } from "@/lib/supabase/public";

import {
  defaultWebsiteSettings,
  type WebsiteSettings,
} from "./website-settings";

type WebsiteSettingsRow = {
  site_name: string;
  short_name: string;
  brand_label: string;
  tagline: string;
  logo_path: string | null;
  primary_cta_label: string;
  primary_cta_url: string;
  support_heading: string;
  support_description: string;
  whatsapp_url: string;
  complaint_phone: string;
  heylink_url: string;
  support_email: string;
  seo_title: string;
  seo_description: string;
  site_url: string;
  copyright_text: string;
};

export const getWebsiteSettings = cache(
  async (): Promise<WebsiteSettings> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("website_settings")
        .select(
          "site_name, short_name, brand_label, tagline, logo_path, primary_cta_label, primary_cta_url, support_heading, support_description, whatsapp_url, complaint_phone, heylink_url, support_email, seo_title, seo_description, site_url, copyright_text",
        )
        .eq("id", 1)
        .single();

      if (error) {
        throw error;
      }

      const settings = data as WebsiteSettingsRow;

      return {
        siteName: settings.site_name,
        shortName: settings.short_name,
        brandLabel: settings.brand_label,
        tagline: settings.tagline,
        logoPath: settings.logo_path,
        primaryCtaLabel: settings.primary_cta_label,
        primaryCtaUrl: settings.primary_cta_url,
        supportHeading: settings.support_heading,
        supportDescription: settings.support_description,
        whatsappUrl: settings.whatsapp_url,
        complaintPhone: settings.complaint_phone,
        heylinkUrl: settings.heylink_url,
        supportEmail: settings.support_email,
        seoTitle: settings.seo_title,
        seoDescription: settings.seo_description,
        siteUrl: settings.site_url,
        copyrightText: settings.copyright_text,
      };
    } catch (error) {
      console.error(
        "Unable to load website settings:",
        error instanceof Error ? error.message : error,
      );

      return defaultWebsiteSettings;
    }
  },
);
