"use client";

import { useEffect, useRef, useState } from "react";

export type TocItem = {
  title: string;
  url: string;
  depth: number;
};

const headingSelector = "#nd-page .prose :is(h1,h2,h3)";

export function useTOCSidebar() {
  const [entries, setEntries] = useState<TocItem[]>([]);
  const [activeUrls, setActiveUrls] = useState<string[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    top: number;
    height: number;
  } | null>(null);
  const linksRef = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const listRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    let rafId = 0;

    const updateActiveUrlsByViewport = () => {
      const visibleUrls: string[] = [];

      const viewportTop = window.scrollY;
      const viewportBottom = viewportTop + window.innerHeight;

      const headingList = entries.map((entry) => {
        const id = decodeURIComponent(entry.url.replace("#", ""));
        return {
          entry,
          element: document.getElementById(id),
        };
      });

      for (let index = 0; index < headingList.length; index += 1) {
        const current = headingList[index];
        if (!current?.element) continue;

        const currentTop =
          current.element.getBoundingClientRect().top + window.scrollY;

        let nextTop = Number.POSITIVE_INFINITY;
        for (
          let nextIndex = index + 1;
          nextIndex < headingList.length;
          nextIndex += 1
        ) {
          const next = headingList[nextIndex];
          if (!next?.element) continue;
          nextTop = next.element.getBoundingClientRect().top + window.scrollY;
          break;
        }

        const sectionInViewport =
          currentTop < viewportBottom && nextTop > viewportTop;

        if (sectionInViewport) {
          visibleUrls.push(current.entry.url);
        }
      }

      if (visibleUrls.length > 0) {
        setActiveUrls(visibleUrls);
        return;
      }

      let fallbackUrl: string | null = null;
      entries.forEach((entry) => {
        const id = decodeURIComponent(entry.url.replace("#", ""));
        const heading = document.getElementById(id);
        if (!heading) return;

        const top = heading.getBoundingClientRect().top + window.scrollY;
        if (top <= viewportTop + window.innerHeight * 0.3) {
          fallbackUrl = entry.url;
        }
      });

      if (fallbackUrl) {
        setActiveUrls([fallbackUrl]);
        return;
      }

      setActiveUrls([]);
    };

    const requestUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveUrlsByViewport);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [entries]);

  useEffect(() => {
    if (activeUrls.length === 0 || !listRef.current || !scrollRef.current) {
      setIndicatorStyle(null);
      return;
    }

    const activeLinks = activeUrls
      .map((url) => linksRef.current.get(url))
      .filter((link): link is HTMLAnchorElement => !!link)
      .sort((a, b) => a.offsetTop - b.offsetTop);

    if (activeLinks.length === 0) {
      setIndicatorStyle(null);
      return;
    }

    const list = listRef.current;
    const scrollContainer = scrollRef.current;

    const topLink = activeLinks[0];
    const bottomLink = activeLinks[activeLinks.length - 1];
    const top = topLink.offsetTop;
    const height = bottomLink.offsetTop + bottomLink.offsetHeight - top;
    setIndicatorStyle({ top, height });

    const parentRect = scrollContainer.getBoundingClientRect();
    const topRect = topLink.getBoundingClientRect();
    const bottomRect = bottomLink.getBoundingClientRect();
    const outOfViewTop = topRect.top < parentRect.top + 16;
    const outOfViewBottom = bottomRect.bottom > parentRect.bottom - 16;

    if (outOfViewTop || outOfViewBottom) {
      const linkTopInList = topLink.offsetTop;
      const listTop = list.offsetTop;
      const targetTop = Math.max(
        0,
        linkTopInList + listTop - scrollContainer.clientHeight * 0.35,
      );

      scrollContainer.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    }
  }, [activeUrls]);

  const setLinkRef = (url: string, element: HTMLAnchorElement | null) => {
    if (!element) {
      linksRef.current.delete(url);
      return;
    }
    linksRef.current.set(url, element);
  };

  return {
    entries,
    activeUrls,
    indicatorStyle,
    listRef,
    scrollRef,
    setLinkRef,
  };
}
