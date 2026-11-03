import type { NextConfig } from "next";
import dns from "node:dns";

if (typeof window === "undefined") {
  try {
    dns.setDefaultResultOrder("ipv4first");
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  } catch {
    // Graceful fallback
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;

