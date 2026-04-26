import type { NextConfig } from "next";

// GitHub project pages are served from /<repo-name>/; user/org site (repo named <owner>.github.io) uses /.
// Set NEXT_PUBLIC_BASE_PATH when building for GitHub Pages (see .github/workflows/deploy-github-pages.yml).
const rawBase = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath =
  rawBase === "" || rawBase === "/"
    ? undefined
    : rawBase.startsWith("/")
      ? rawBase.replace(/\/$/, "")
      : `/${rawBase.replace(/\/$/, "")}`;

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
