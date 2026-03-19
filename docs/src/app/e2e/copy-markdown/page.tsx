import { LLMCopyButton } from "@/components/ai/page-actions";
import { withDocsBasePath } from "@/lib/docs-base-path";

const markdownUrl = withDocsBasePath("/e2e/copy-markdown/source.mdx");

export default function CopyMarkdownE2EPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-16">
      <div className="card-base w-full max-w-xl space-y-4 px-6 py-8">
        <p className="text-sm font-medium text-fd-primary">
          Playwright Fixture
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Copy Markdown E2E</h1>
        <p className="text-sm text-muted-foreground">
          This fixture validates the production basePath copy flow against a
          built static export.
        </p>
        <LLMCopyButton markdownUrl={markdownUrl} />
      </div>
    </main>
  );
}
