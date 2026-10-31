import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page here is per-user and behind login, so nothing is prerendered.
  // The Real Estate route reads its HTML from disk; make sure it ships with the deployment.
  outputFileTracingIncludes: {
    "/real-estate/app": ["./src/modules/real-estate/**/*"],
  },
};

export default nextConfig;
