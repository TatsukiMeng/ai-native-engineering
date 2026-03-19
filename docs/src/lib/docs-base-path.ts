export function getDocsBasePath() {
  if (process.env.NODE_ENV !== "production") return "";

  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const configuredBasePath =
    process.env.NEXT_PUBLIC_BASE_PATH ?? (repoName ? `/${repoName}` : "");

  if (configuredBasePath === "/") return "";

  return configuredBasePath.replace(/\/$/, "");
}

export function withDocsBasePath(path: string) {
  const docsBasePath = getDocsBasePath();
  if (!docsBasePath) return path;

  return path.startsWith("/")
    ? `${docsBasePath}${path}`
    : `${docsBasePath}/${path}`;
}
