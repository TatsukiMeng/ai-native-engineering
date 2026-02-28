import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

import {
  remarkDirectiveAdmonition,
  remarkMdxMermaid,
} from "fumadocs-core/mdx-plugins";
import remarkDirective from "remark-directive";

export default defineConfig({
  mdxOptions: {
    preset: "fumadocs",
    remarkPlugins: [
      remarkDirective,
      remarkDirectiveAdmonition,
      remarkMdxMermaid,
    ],
  },
  plugins: [lastModified()],
});
