"use client";

import { useTOCSidebar } from "./useTOCSidebar";

export function TOCSidebar() {
  const {
    entries,
    activeUrls,
    indicatorStyle,
    listRef,
    scrollRef,
    setLinkRef,
  } = useTOCSidebar();

  if (entries.length === 0) return null;

  let h1Counter = 0;

  return (
    <aside
      id="toc-wrapper"
      className="hidden lg:block transition absolute top-0 -right-[var(--toc-width)] w-[var(--toc-width)]"
    >
      <div
        id="toc-inner-wrapper"
        ref={scrollRef}
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
                    setLinkRef(item.url, element);
                  }}
                  className={`relative flex min-h-9 w-full gap-2 rounded-xl px-2 py-2 transition hover:bg-[var(--color-toc-btn-hover)] active:bg-[var(--color-toc-btn-active)] ${activeUrls.includes(item.url) ? "visible" : ""}`}
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
