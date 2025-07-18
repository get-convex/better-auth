import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      conditionNames: ["@convex-dev/component-source", "..."],
    },
  }),
  // Allows this example to use other components without importing
  // them via @convex-dev/component-source. Not necessary for real
  // apps.
  transpilePackages: ["@convex-dev/resend"],
};

export default nextConfig;
