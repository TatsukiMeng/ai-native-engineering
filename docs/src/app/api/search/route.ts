import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";
import { createTokenizer } from "@orama/tokenizers/mandarin";

export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
  tokenizer: createTokenizer(),
});
