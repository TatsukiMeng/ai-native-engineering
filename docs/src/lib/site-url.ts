function parseUrl(input?: string): URL | undefined {
  if (!input) return undefined;

  try {
    return new URL(input);
  } catch {
    return undefined;
  }
}

function getGitHubPagesOrigin(repository?: string): URL | undefined {
  if (!repository?.includes("/")) return undefined;

  const [owner] = repository.split("/");
  if (!owner) return undefined;

  return parseUrl(`https://${owner}.github.io`);
}

export function resolveSiteOrigin(): URL | undefined {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.DEPLOY_URL,
  ];

  for (const candidate of candidates) {
    const parsed = parseUrl(candidate);
    if (parsed) return parsed;
  }

  return getGitHubPagesOrigin(process.env.GITHUB_REPOSITORY);
}
