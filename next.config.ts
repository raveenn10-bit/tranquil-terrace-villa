import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./legacy-site/**/*", "./public/**/*"],
  },
};

export default nextConfig;
