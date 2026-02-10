import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "cdn.kamino.com", pathname: "/assets/**" },
      { hostname: "assets.coingecko.com", pathname: "/coins/images/**" },
      { hostname: "icons.llamao.fi", pathname: "/icons/**" },
    ],
  },
};

export default nextConfig;
