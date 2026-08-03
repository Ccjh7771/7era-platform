import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "7ERA Platform",
    short_name: "7ERA",

    description:
      "Premium gaming platform featuring trusted brands, mobile game downloads and customer support.",

    start_url: "/",

    display: "standalone",

    background_color: "#09090B",

    theme_color: "#09090B",

    orientation: "portrait",

    lang: "en",

    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}