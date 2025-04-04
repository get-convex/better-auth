import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      conditionNames: ["@convex-dev/component-source", "..."],
    },
  }),
};

export default nextConfig;
