import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The chat API reads content/ at runtime; make sure Vercel bundles it.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/**/*"],
  },
  poweredByHeader: false,
};

export default nextConfig;
