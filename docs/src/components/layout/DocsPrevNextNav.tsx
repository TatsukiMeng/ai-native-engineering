import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

type NavItem = {
  url: string;
  title: string;
};

type DocsPrevNextNavProps = {
  previous?: NavItem;
  next?: NavItem;
};

export function DocsPrevNextNav({ previous, next }: DocsPrevNextNavProps) {
  if (!previous && !next) return null;

  return (
    <div className="mb-4 flex w-full flex-col justify-between gap-4 overflow-hidden md:flex-row">
      {previous ? (
        <Link
          href={previous.url}
          className="w-full overflow-hidden"
          aria-label={`上一篇文章：${previous.title}`}
        >
          <span
            className={buttonStyles({
              variant: "plain",
              size: "icon",
              animated: false,
              className:
                "flex h-15 w-full max-w-full items-center justify-start gap-4 rounded-2xl bg-(--color-card-bg) px-4 font-bold text-black/75 transition-colors hover:bg-(--color-btn-plain-bg-hover) hover:text-(--color-primary) active:scale-95 active:bg-(--color-btn-plain-bg-active) dark:text-white/75 dark:hover:text-(--color-primary)",
            })}
          >
            <ChevronLeft className="text-(--color-primary) text-[2rem]" />
            <div className="max-w-[calc(100%-3rem)] overflow-hidden text-ellipsis whitespace-nowrap transition">
              {previous.title}
            </div>
          </span>
        </Link>
      ) : (
        <div className="hidden w-full md:block" />
      )}

      {next ? (
        <Link
          href={next.url}
          className="w-full overflow-hidden"
          aria-label={`下一篇文章：${next.title}`}
        >
          <span
            className={buttonStyles({
              variant: "plain",
              size: "icon",
              animated: false,
              className:
                "flex h-15 w-full max-w-full items-center justify-end gap-4 rounded-2xl bg-(--color-card-bg) px-4 font-bold text-black/75 transition-colors hover:bg-(--color-btn-plain-bg-hover) hover:text-(--color-primary) active:scale-95 active:bg-(--color-btn-plain-bg-active) dark:text-white/75 dark:hover:text-(--color-primary)",
            })}
          >
            <div className="max-w-[calc(100%-3rem)] overflow-hidden text-ellipsis whitespace-nowrap transition">
              {next.title}
            </div>
            <ChevronRight className="text-(--color-primary) text-[2rem]" />
          </span>
        </Link>
      ) : (
        <div className="hidden w-full md:block" />
      )}
    </div>
  );
}
