import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        // Habilita Server Actions e outras features Next.js 15
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.supabase.co",
            },
        ],
    },
};

export default nextConfig;
