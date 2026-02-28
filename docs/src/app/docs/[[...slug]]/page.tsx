import { getPageImage, source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { LLMCopyButton, ViewOptions } from '@/components/ai/page-actions';
import { gitConfig } from '@/lib/layout.shared';
import { Comments } from '@/components/Giscus';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = `/llms.mdx/docs/${[...page.slugs, 'index.mdx'].join('/')}`;

  const text = (await page.data.getText?.('processed')) || '';
  const wordCount = text.replace(/\s/g, '').length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 300));

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-4 items-center text-sm text-muted-foreground mt-2">
        {wordCount > 0 && <span>约 {wordCount} 字</span>}
        {wordCount > 0 && <span>阅读时间 {readingTime} 分钟</span>}
      </div>
      <div className="flex flex-row gap-2 items-center border-b pb-6 mt-4">
        <LLMCopyButton markdownUrl={markdownUrl} />
        <ViewOptions
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/docs/content/docs/${page.slugs.join('/')}.mdx`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      {!!page.data.lastModified && (
        <div className="mt-12 text-sm text-muted-foreground border-b pb-4">
          最后修改时间：{new Date(page.data.lastModified as string | number | Date).toLocaleDateString('zh-CN')}
        </div>
      )}
      <Comments />
      <div className="pt-6 text-sm text-muted-foreground flex flex-col gap-1">
        <p>
          ⚖️ 本书内容采用{' '}
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer" className="underline hover:text-foreground">
            CC BY-NC-SA 4.0
          </a>
          {' '}协议授权。包含的所有工程代码和示例采用 <strong>MIT</strong> 协议。
        </p>
        <p>遵循『谁编写，谁拥有』原则，贡献者对其原创部分享有主权。</p>
      </div>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
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
