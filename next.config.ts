import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Resolve CMS metadata before sending headers so missing projects return 404.
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
    ],
  },
};
export default nextConfig;
