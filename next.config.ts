import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "3mb",
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname:
                    "imkfmynzsnjckdzctwpp.supabase.co",
                pathname:
                    "/storage/v1/object/public/brand-logos/**",
            },
            {
                protocol: "https",
                hostname:
                    "imkfmynzsnjckdzctwpp.supabase.co",
                pathname:
                    "/storage/v1/object/public/game-logos/**",
            },
        ],
    },
};

export default nextConfig;
