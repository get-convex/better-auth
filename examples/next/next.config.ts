import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      conditionNames: ["@convex-dev/component-source", "..."],
    },
  }),
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination:
          process.env.NEXT_PUBLIC_CONVEX_SITE_URL + "/api/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
