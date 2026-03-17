import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { Clock, FileText } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { Comments } from "@/components/Giscus";
import { DocsBreadcrumbMeta } from "@/components/layout/DocsBreadcrumbMeta";
import { DocsPrevNextNav } from "@/components/layout/DocsPrevNextNav";
import { LicenseCard } from "@/components/layout/LicenseCard";
import { gitConfig } from "@/lib/layout.shared";
import { getCanonicalPageUrl, getPageImage, source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import styles from "./page.module.css";

const aliasSlugs = [
  ["01-breakthrough"],
  ["02-foundation"],
  ["03-development"],
  ["04-delivery"],
  ["05-scale"],
] as const;

function resolvePageFromSlug(slug?: string[]) {
  if (!slug || slug.length === 0) {
    return source.getPage(["preface"]);
  }

  return (
    source.getPage(slug) ??
    source.getPage([...slug, "00-overview"]) ??
    source.getPage([...slug, "overview"])
  );
}

function getMarkdownSegments(slugs: string[]) {
  const last = slugs.at(-1);
  if (!last) return ["preface.mdx"];

  return [...slugs.slice(0, -1), `${last}.mdx`];
}

function getDocsBasePath() {
  if (process.env.NODE_ENV !== "production") return "";

  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const configuredBasePath =
    process.env.NEXT_PUBLIC_BASE_PATH ?? (repoName ? `/${repoName}` : "");

  if (configuredBasePath === "/") return "";

  return configuredBasePath.replace(/\/$/, "");
}

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = resolvePageFromSlug(params.slug);
  if (!page) notFound();

  const pageData = page.data as typeof page.data & {
    body?: (props: { components?: Record<string, unknown> }) => React.ReactNode;
    load?: () => Promise<{
      body: (props: {
        components?: Record<string, unknown>;
      }) => React.ReactNode;
    }>;
  };

  const MDX = pageData.body ?? (await pageData.load?.())?.body;
  if (!MDX) notFound();

  const docsBasePath = getDocsBasePath();
  const markdownSegments = getMarkdownSegments(page.slugs);
  const markdownPath = markdownSegments.join("/");
  const markdownUrl = `${docsBasePath}/llms.mdx/docs/${markdownPath}`;

  const text = (await pageData.getText?.("processed")) || "";
  const wordCount = text.replace(/\s/g, "").length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 300));

  const pages = source.getPages();
  const currentIndex = pages.findIndex((item) => item.url === page.url);
  const previousPage = currentIndex > 0 ? pages[currentIndex - 1] : undefined;
  const nextPage =
    currentIndex >= 0 && currentIndex < pages.length - 1
      ? pages[currentIndex + 1]
      : undefined;
  const previousItem = previousPage?.data.title
    ? {
        url: getCanonicalPageUrl(previousPage.url),
        title: previousPage.data.title,
      }
    : undefined;
  const nextItem = nextPage?.data.title
    ? { url: getCanonicalPageUrl(nextPage.url), title: nextPage.data.title }
    : undefined;

  const sectionItems = page.slugs
    .map((_, index) => {
      const target = resolvePageFromSlug(page.slugs.slice(0, index + 1));
      if (!target?.url || !target?.data?.title) return null;

      return {
        url: getCanonicalPageUrl(target.url),
        title: target.data.title,
      };
    })
    .filter((item): item is { url: string; title: string } => item !== null);

  const displayItems =
    sectionItems.length > 1 ? sectionItems.slice(0, -1) : sectionItems;

  return (
    <DocsPage
      toc={pageData.toc}
      full={pageData.full}
      breadcrumb={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
      tableOfContent={{ enabled: false }}
      footer={{ enabled: false }}
      className="!mx-0 !w-full !max-w-none !gap-0 !px-0 !py-0"
    >
      <div className="relative">
        <div className="card-base relative mb-4 mx-auto w-full px-6 pt-6 pb-6 md:px-9">
          <div className="mb-3 flex flex-row gap-5 text-muted-foreground transition">
            {wordCount > 0 && (
              <div className="flex flex-row items-center">
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/5 transition dark:bg-white/10">
                  <FileText className="h-4 w-4 opacity-75" />
                </div>
                <div className="text-sm">约 {wordCount} 字</div>
              </div>
            )}
            {wordCount > 0 && (
              <div className="flex flex-row items-center">
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/5 transition dark:bg-white/10">
                  <Clock className="h-4 w-4 opacity-75" />
                </div>
                <div className="text-sm">阅读时间 {readingTime} 分钟</div>
              </div>
            )}
          </div>

          <div className="relative z-10">
            <DocsTitle className="mb-3 block w-full font-bold transition md:before:absolute md:before:top-[0.75rem] md:before:left-[-1.125rem] md:before:h-5 md:before:w-1 md:before:rounded-md md:before:bg-fd-primary">
              {page.data.title}
            </DocsTitle>
          </div>

          <DocsDescription className={styles.pageDescription}>
            {page.data.description}
          </DocsDescription>

          <div className="mt-4 mb-5 flex flex-row items-center justify-between gap-3 border-b border-dashed border-fd-border pb-5">
            <div className="min-w-0">
              <DocsBreadcrumbMeta items={displayItems} />
            </div>
            <div className="flex flex-row items-center gap-2 shrink-0">
              <LLMCopyButton markdownUrl={markdownUrl} />
              <ViewOptions
                markdownUrl={markdownUrl}
                githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/docs/content/docs/${markdownPath}`}
              />
            </div>
          </div>

          <DocsBody className={`${styles.customMd} mb-6`}>
            <MDX
              components={getMDXComponents({
                a: createRelativeLink(source, page),
              })}
            />
          </DocsBody>

          <div className="pt-6">
            <LicenseCard
              title={pageData.title}
              updatedAt={
                pageData.lastModified as string | number | Date | undefined
              }
            />
          </div>

          <Comments />
        </div>

        <DocsPrevNextNav previous={previousItem} next={nextItem} />
      </div>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return [
    { slug: [] },
    ...aliasSlugs.map((slug) => ({ slug: [...slug] })),
    ...source.generateParams(),
  ];
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = resolvePageFromSlug(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: getCanonicalPageUrl(page.url),
    },
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
