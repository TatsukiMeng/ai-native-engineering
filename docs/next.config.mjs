import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
const isProduction = process.env.NODE_ENV === "production";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const configuredBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? (repoName ? `/${repoName}` : "");
const normalizedBasePath =
  configuredBasePath === "/" ? "" : configuredBasePath.replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  reactStrictMode: true,
  basePath: isProduction ? normalizedBasePath : "",
  assetPrefix:
    isProduction && normalizedBasePath ? `${normalizedBasePath}/` : undefined,
  images: {
    unoptimized: true,
  },
};

export default withMDX(config);
