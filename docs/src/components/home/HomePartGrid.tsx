import {
  ArrowRight,
  Bot,
  type LucideIcon,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { HomePart } from "@/lib/home";
import styles from "./home.module.css";
import { withContentDelay } from "./motion";

const partIcons: Record<string, LucideIcon> = {
  "01-breakthrough": Sparkles,
  "02-foundation": ShieldCheck,
  "03-development": Bot,
  "04-delivery": Workflow,
  "05-scale": Network,
};

type HomePartGridProps = {
  parts: HomePart[];
};

export function HomePartGrid({ parts }: HomePartGridProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {parts.map((part, index) => {
        const Icon = partIcons[part.slug] ?? Sparkles;

        return (
          <Link
            key={part.url}
            href={part.url}
            className="group onload-animation block overflow-hidden rounded-2xl bg-(--color-card-bg) px-5 py-4 text-black/75 transition-colors hover:bg-(--color-btn-plain-bg-hover) hover:text-(--color-primary) active:bg-(--color-btn-plain-bg-active) dark:text-white/75 dark:hover:text-(--color-primary)"
            style={withContentDelay(320 + index * 55) as CSSProperties}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="meta-icon !mr-0 !h-8 !w-8">
                  <Icon className="h-4 w-4 opacity-75" />
                </div>
                <span className="truncate text-sm font-semibold text-fd-primary">
                  {part.highlight}
                </span>
              </div>
              <span className={styles.tag}>{part.chapterCount} 章</span>
            </div>

            <div className={styles.panelTitle}>{part.title}</div>
            <div className={styles.panelDescription}>{part.description}</div>

            <div className="mt-4 flex flex-wrap gap-2">
              {part.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-black/50 transition group-hover:text-(--color-primary) dark:text-white/50 dark:group-hover:text-(--color-primary)">
              进入这一部分
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
