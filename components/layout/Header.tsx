import { getWebsiteSettings } from "@/lib/data/get-website-settings";

import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const settings = await getWebsiteSettings();

  return (
    <HeaderClient
      siteName={settings.siteName}
      shortName={settings.shortName}
      brandLabel={settings.brandLabel}
      logoPath={settings.logoPath}
      primaryCtaLabel={settings.primaryCtaLabel}
      primaryCtaUrl={settings.primaryCtaUrl}
    />
  );
}
