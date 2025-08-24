import type { NextConfig } from "next";
import packageJson from "../package.json";

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    VERSION: packageJson.version,
    VERSION_BRANCH: packageJson.versionMetadata.branch,
    VERSION_LABEL: packageJson.versionMetadata.label,
  },
};

export default nextConfig;
