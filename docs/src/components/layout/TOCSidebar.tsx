"use client";

import { useEffect, useRef, useState } from "react";

type TocItem = {
  title: string;
  url: string;
  depth: number;
};

const headingSelector = "#nd-page .prose :is(h1,h2,h3)";

export function TOCSidebar() {
  const [entries, setEntries] = useState<TocItem[]>([]);
  const [activeUrl, setActiveUrl] = useState<string>("");
  const [indicatorStyle, setIndicatorStyle] = useState<{
    top: number;
    height: number;
  } | null>(null);
  const linksRef = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const listRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const collectHeadings = () => {
      const headingElements = Array.from(
        document.querySelectorAll<HTMLElement>(headingSelector),
      );
      const mapped: TocItem[] = headingElements
        .filter((element) => !!element.id && !!element.textContent?.trim())
        .map((element) => {
          const tag = element.tagName.toLowerCase();
          const depth = tag === "h1" ? 1 : tag === "h2" ? 2 : 3;
          return {
            title: (element.textContent || "").trim(),
            url: `#${encodeURIComponent(element.id)}`,
            depth,
          };
        });
      setEntries(mapped);
    };

    const rafId = requestAnimationFrame(collectHeadings);
    const root = document.getElementById("content-wrapper");
    const observer = new MutationObserver(collectHeadings);
    if (root) observer.observe(root, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (entries.length === 0) return;

    const headingMap = new Map<string, number>();
    entries.forEach((entry, index) => {
      const id = decodeURIComponent(entry.url.replace("#", ""));
      headingMap.set(id, index);
    });

    const visible = new Set<number>();

    const observer = new IntersectionObserver(
      (observerEntries) => {
        observerEntries.forEach((entry) => {
          const id = entry.target.getAttribute("id");
          if (!id) return;
          const idx = headingMap.get(id);
          if (idx === undefined) return;
          if (entry.isIntersecting) visible.add(idx);
          else visible.delete(idx);
        });

        if (visible.size > 0) {
          const sorted = Array.from(visible).sort((a, b) => a - b);
          const active = entries[sorted[sorted.length - 1]];
          if (active) setActiveUrl(active.url);
          return;
        }

        let fallbackIdx = -1;
        entries.forEach((entry, index) => {
          const id = decodeURIComponent(entry.url.replace("#", ""));
          const heading = document.getElementById(id);
          if (!heading) return;
          if (heading.getBoundingClientRect().top <= window.innerHeight * 0.3)
            fallbackIdx = index;
        });

        if (fallbackIdx >= 0) setActiveUrl(entries[fallbackIdx].url);
      },
      { threshold: 0, rootMargin: "0px 0px -70% 0px" },
    );

    entries.forEach((entry) => {
      const id = decodeURIComponent(entry.url.replace("#", ""));
      const heading = document.getElementById(id);
      if (heading) observer.observe(heading);
    });

    return () => observer.disconnect();
  }, [entries]);

  useEffect(() => {
    if (!activeUrl || !listRef.current) {
      setIndicatorStyle(null);
      return;
    }

    const activeLink = linksRef.current.get(activeUrl);
    if (!activeLink) {
      setIndicatorStyle(null);
      return;
    }

    const parent = listRef.current;
    const top = activeLink.offsetTop;
    const height = activeLink.offsetHeight;
    setIndicatorStyle({ top, height });
    parent.scrollTo({
      top: Math.max(0, top - parent.clientHeight * 0.35),
      behavior: "smooth",
    });
  }, [activeUrl]);

  if (entries.length === 0) return null;

  let h1Counter = 0;

  return (
    <aside
      id="toc-wrapper"
      className="hidden lg:block transition absolute top-0 -right-[var(--toc-width)] w-[var(--toc-width)]"
    >
      <div
        id="toc-inner-wrapper"
        className="fixed top-14 w-[var(--toc-width)] h-[calc(100vh_-_20rem)] overflow-y-scroll overflow-x-hidden hide-scrollbar"
      >
        <nav id="toc" className="w-full transition" ref={listRef}>
          <div className="h-8 w-full" />
          <div className="relative flex flex-col gap-1">
            {indicatorStyle && (
              <div
                className="pointer-events-none absolute left-0 right-0 -z-10 rounded-xl border-2 border-dashed border-[var(--color-toc-btn-active)] bg-[var(--color-toc-btn-hover)] transition-all"
                style={{
                  top: indicatorStyle.top,
                  height: indicatorStyle.height,
                }}
              />
            )}
            {entries.map((item) => {
              const depth = Math.max(1, item.depth ?? 1);
              const badgeIndent =
                depth === 1 ? "" : depth === 2 ? "ml-4" : "ml-8";
              if (depth === 1) h1Counter += 1;

              return (
                <a
                  key={item.url}
                  href={item.url}
                  ref={(element) => {
                    if (!element) {
                      linksRef.current.delete(item.url);
                      return;
                    }
                    linksRef.current.set(item.url, element);
                  }}
                  className="relative flex min-h-9 w-full gap-2 rounded-xl px-2 py-2 transition hover:bg-[var(--color-toc-btn-hover)] active:bg-[var(--color-toc-btn-active)]"
                >
                  <div className={`w-5 shrink-0 ${badgeIndent}`}>
                    {depth === 1 && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-[var(--color-toc-badge-bg)] text-xs font-bold text-[var(--color-btn-content)]">
                        {h1Counter}
                      </div>
                    )}
                    {depth === 2 && (
                      <div className="mt-1.5 h-2 w-2 rounded-[0.1875rem] bg-[var(--color-toc-badge-bg)]" />
                    )}
                    {depth >= 3 && (
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-sm bg-black/10 dark:bg-white/20" />
                    )}
                  </div>
                  <div
                    className={`min-w-0 flex-1 whitespace-normal break-words text-sm leading-5 transition ${depth === 1 ? "text-black/60 dark:text-white/60" : depth === 2 ? "text-black/50 dark:text-white/50" : "text-black/35 dark:text-white/35"}`}
                  >
                    {item.title.replace(/#$/, "")}
                  </div>
                </a>
              );
            })}
          </div>
          <div className="h-8 w-full" />
        </nav>
      </div>
    </aside>
  );
}
