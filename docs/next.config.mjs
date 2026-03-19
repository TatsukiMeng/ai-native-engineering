import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
const isProduction = process.env.NODE_ENV === "production";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const configuredBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? (repoName ? `/${repoName}` : "");
const normalizedBasePath =
  configuredBasePath === "/" ? "" : configuredBasePath.replace(/\/$/, "");
const docsRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  output: isProduction ? "export" : undefined,
  reactStrictMode: true,
  outputFileTracingRoot: docsRoot,
  basePath: isProduction ? normalizedBasePath : "",
  assetPrefix:
    isProduction && normalizedBasePath ? `${normalizedBasePath}/` : undefined,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: docsRoot,
  },
};

export default withMDX(config);
