"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

export function Comments() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="mt-12 pt-6">
      <Giscus
        id="comments"
        repo="TatsukiMeng/ai-native-engineering"
        repoId="R_kgDORasx4w"
        category="Announcements"
        categoryId="DIC_kwDORasx484C3ZvH"
        mapping="title"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={resolvedTheme === "dark" ? "transparent_dark" : "light"}
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}
