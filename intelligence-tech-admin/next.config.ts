import type { NextConfig } from "next";

const webApiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  /** Proxy /api/* to the main Intelligence Tech web app so admin can call the same routes on any port. */
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${webApiBase}/api/:path*` }];
  },
};

export default nextConfig;
