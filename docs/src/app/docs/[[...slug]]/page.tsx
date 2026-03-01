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
import { DocsPrevNextNav } from "@/components/layout/DocsPrevNextNav";
import { LicenseCard } from "@/components/layout/LicenseCard";
import { gitConfig } from "@/lib/layout.shared";
import { getPageImage, source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = `/llms.mdx/docs/${[...page.slugs, "index.mdx"].join("/")}`;

  const text = (await page.data.getText?.("processed")) || "";
  const wordCount = text.replace(/\s/g, "").length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 300));

  const pages = source.getPages();
  const currentIndex = pages.findIndex((item) => item.url === page.url);
  const previousPage = currentIndex > 0 ? pages[currentIndex - 1] : undefined;
  const nextPage =
    currentIndex >= 0 && currentIndex < pages.length - 1
      ? pages[currentIndex + 1]
      : undefined;
  const previousItem = previousPage
    ? { url: previousPage.url, title: previousPage.data.title }
    : undefined;
  const nextItem = nextPage
    ? { url: nextPage.url, title: nextPage.data.title }
    : undefined;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContentPopover={{ enabled: false }}
      tableOfContent={{ enabled: false }}
      footer={{ enabled: false }}
      className="!mx-0 !w-full !max-w-none !gap-0 !px-0 !py-0"
    >
      <div className="relative">
        <div className="card-base relative mb-4 mx-auto w-full px-6 pt-6 pb-6 md:px-9">
          {/* word count and reading time */}
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

          {/* title */}
          <div className="relative z-10">
            <DocsTitle className="mb-3 block w-full font-bold transition md:before:absolute md:before:top-[0.75rem] md:before:left-[-1.125rem] md:before:h-5 md:before:w-1 md:before:rounded-md md:before:bg-fd-primary">
              {page.data.title}
            </DocsTitle>
          </div>

          <DocsDescription className="mb-0">
            {page.data.description}
          </DocsDescription>

          {/* metadata buttons */}
          <div className="mt-4 mb-5 flex flex-row items-center gap-2 border-b border-dashed border-fd-border pb-5">
            <LLMCopyButton markdownUrl={markdownUrl} />
            <ViewOptions
              markdownUrl={markdownUrl}
              githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/docs/content/docs/${page.slugs.join("/")}.mdx`}
            />
          </div>

          {/* markdown content */}
          <DocsBody className="mb-6">
            <MDX
              components={getMDXComponents({
                a: createRelativeLink(source, page),
              })}
            />
          </DocsBody>

          <div className="pt-6">
            <LicenseCard
              title={page.data.title}
              updatedAt={
                page.data.lastModified as string | number | Date | undefined
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
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
