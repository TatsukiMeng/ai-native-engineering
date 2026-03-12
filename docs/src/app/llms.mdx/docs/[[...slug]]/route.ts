import { notFound } from "next/navigation";
import { getLLMText, source } from "@/lib/source";

export const revalidate = false;

function getPageSlugFromMarkdownRoute(slug?: string[]) {
  if (!slug || slug.length === 0) return null;

  const last = slug.at(-1);
  if (!last) return null;

  return [...slug.slice(0, -1), last.replace(/\.mdx$/, "")];
}

export async function GET(
  _req: Request,
  { params }: RouteContext<"/llms.mdx/docs/[[...slug]]">,
) {
  const { slug } = await params;
  const pageSlug = getPageSlugFromMarkdownRoute(slug);
  if (!pageSlug) notFound();

  const page = source.getPage(pageSlug);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: [...page.slugs.slice(0, -1), `${page.slugs.at(-1)}.mdx`],
  }));
}
