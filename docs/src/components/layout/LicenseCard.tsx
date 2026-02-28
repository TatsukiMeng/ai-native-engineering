"use client";

import { Check, Copy, CreativeCommons, Share2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type LicenseCardProps = {
  title: string;
  updatedAt?: string | number | Date;
};

export function LicenseCard({ title, updatedAt }: LicenseCardProps) {
  const pathname = usePathname();
  const [fullUrl, setFullUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setFullUrl(`${window.location.origin}${pathname}`);
  }, [pathname]);

  const updated = updatedAt
    ? (() => {
        const date = new Date(updatedAt);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })()
    : "长期维护";
  const linkText = useMemo(() => fullUrl || pathname, [fullUrl, pathname]);

  const share = async () => {
    const shareUrl = fullUrl || pathname;
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `分享文章：${title}`,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // user cancelled or denied permissions
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-fd-border bg-license-block-bg px-6 py-5 transition">
      <div className="font-bold text-black/75 transition dark:text-white/75">
        {title}
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm pr-22">
        <a
          href={fullUrl || pathname}
          className="max-w-full truncate text-fd-primary underline"
          target="_blank"
          rel="noreferrer"
        >
          {linkText}
        </a>
      </div>

      <div className="mt-2 flex flex-wrap gap-6">
        <div>
          <div className="text-sm text-black/30 transition dark:text-white/30">
            更新于
          </div>
          <div className="text-black/75 transition dark:text-white/75">
            {updated}
          </div>
        </div>
        <div>
          <div className="text-sm text-black/30 transition dark:text-white/30">
            许可
          </div>
          <div className="text-black/75 transition dark:text-white/75">
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noreferrer"
              className="text-fd-primary underline"
            >
              CC BY-NC-SA 4.0
            </a>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
        <Button
          size="smText"
          animated={false}
          onClick={share}
          aria-label="分享本文"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Share2 className="h-3.5 w-3.5" />
          )}
          <span className="ml-1">{copied ? "已复制" : "分享"}</span>
        </Button>
        <Button
          size="smText"
          animated={false}
          onClick={async () => {
            const shareUrl = fullUrl || pathname;
            try {
              await navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              // ignore clipboard error
            }
          }}
          aria-label="复制链接"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>

      <CreativeCommons className="pointer-events-none absolute top-1/2 right-6 h-56 w-56 -translate-y-1/2 text-black/5 transition dark:text-white/5" />
    </div>
  );
}
