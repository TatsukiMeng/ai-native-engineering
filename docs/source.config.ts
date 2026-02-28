import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
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

import remarkDirective from "remark-directive";
import {
	remarkDirectiveAdmonition,
	remarkMdxMermaid,
} from "fumadocs-core/mdx-plugins";

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
