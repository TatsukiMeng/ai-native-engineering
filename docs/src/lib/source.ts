import { docs } from "fumadocs-mdx:collections/server";
import { type InferPageType, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

type DocsPageTree = ReturnType<typeof source.getPageTree>;
type DocsPageTreeNode = DocsPageTree["children"][number];
type DocsPageTreeItem = Extract<DocsPageTreeNode, { type: "page" }>;
type DocsPageTreeFolder = Extract<DocsPageTreeNode, { type: "folder" }>;

export function getCanonicalPageUrl(url: string) {
  if (url === "/docs/00-preface") return "/docs";
  if (url.endsWith("/00-overview")) {
    return url.slice(0, -"/00-overview".length);
  }

  return url;
}

function isOverviewPage(node: DocsPageTreeNode): node is DocsPageTreeItem {
  return node.type === "page" && node.url.endsWith("/00-overview");
}

function normalizeFolderNode(node: DocsPageTreeFolder): DocsPageTreeFolder {
  const normalizedChildren = node.children.map((child) =>
    child.type === "folder" ? normalizeFolderNode(child) : child,
  );

  if (node.index) {
    return {
      ...node,
      children: normalizedChildren,
    };
  }

  const overviewIndex = normalizedChildren.findIndex(isOverviewPage);
  if (overviewIndex === -1) {
    return {
      ...node,
      children: normalizedChildren,
    };
  }

  const overview = normalizedChildren[overviewIndex] as DocsPageTreeItem;

  return {
    ...node,
    index: {
      ...overview,
      url: getCanonicalPageUrl(overview.url),
    },
    children: normalizedChildren.filter((_, index) => index !== overviewIndex),
  };
}

export function getDocsPageTree(): DocsPageTree {
  const tree = source.getPageTree();

  return {
    ...tree,
    children: tree.children.map((child) =>
      child.type === "folder" ? normalizeFolderNode(child) : child,
    ),
  };
}

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `/og/docs/${segments.join("/")}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const pageData = page.data as typeof page.data & {
    getText?: (type: "processed") => Promise<string>;
  };
  const processed = (await pageData.getText?.("processed")) ?? "";

  return `# ${page.data.title}

${processed}`;
}
