import fs from "node:fs";

function toDocsRoutePath(relativePath) {
  const normalized = relativePath.replace(/\.mdx$/, "");

  if (normalized === "preface") return "/docs";

  return `/docs/${normalized}`;
}

function readChangedFiles() {
  const args = process.argv.slice(2);
  const fromFileFlagIndex = args.indexOf("--from-file");

  if (fromFileFlagIndex >= 0) {
    const filePath = args[fromFileFlagIndex + 1];
    if (!filePath) return [];

    return fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return args.map((line) => line.trim()).filter(Boolean);
}

function deriveFirstPageRouteFromMeta(metaDir) {
  const metaPath = `docs/content/docs/${metaDir}/meta.json`;

  try {
    const raw = fs.readFileSync(metaPath, "utf8");
    const parsed = JSON.parse(raw);
    const pages = Array.isArray(parsed?.pages) ? parsed.pages : [];
    const firstPage = pages.find((page) => typeof page === "string" && page.trim().length > 0);

    if (!firstPage) return null;

    return toDocsRoutePath(`${metaDir}/${firstPage.trim()}`);
  } catch {
    return null;
  }
}

function collectDocTargets(changedFiles) {
  const targets = new Set();

  for (const file of changedFiles) {
    const mdxMatch = file.match(/^docs\/content\/docs\/(.+)\.mdx$/);
    if (mdxMatch) {
      targets.add(toDocsRoutePath(mdxMatch[1]));
      continue;
    }

    const metaMatch = file.match(/^docs\/content\/docs\/(.+)\/meta\.json$/);
    if (metaMatch) {
      const metaDir = metaMatch[1];
      targets.add(deriveFirstPageRouteFromMeta(metaDir) ?? `/docs/${metaDir}`);
      continue;
    }

    if (file === "docs/content/docs/meta.json") {
      targets.add("/docs");
      continue;
    }

    if (
      file.startsWith("docs/src/app/docs/") ||
      file === "docs/src/lib/source.ts" ||
      file === "docs/source.config.ts"
    ) {
      targets.add("/docs");
    }
  }

  if (targets.size === 0) {
    targets.add("/docs/02-foundation");
  }

  return Array.from(targets).sort();
}

const changedFiles = readChangedFiles();
const targets = collectDocTargets(changedFiles);

process.stdout.write(targets.join(","));
