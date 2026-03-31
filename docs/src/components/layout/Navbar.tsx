"use client";

import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Github } from "lucide-react";
import { ButtonLink, buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ThemeColorSettings } from "./ThemeColorSettings";

type NavLinkItem = NonNullable<BaseLayoutProps["links"]>[number];

type NavbarProps = {
  nav?: BaseLayoutProps["nav"];
  links?: BaseLayoutProps["links"];
  githubUrl?: string;
};

function renderTitle(nav: NonNullable<BaseLayoutProps["nav"]>) {
  const { title, url = "/" } = nav;
  const className = buttonStyles({ variant: "plain", size: "navTitle" });

  if (!title) return null;
  if (typeof title === "function") {
    const Title = title;
    return <Title href={url} className={className} />;
  }
  return (
    <ButtonLink href={url} variant="plain" size="navTitle">
      {title}
    </ButtonLink>
  );
}

function renderNavLink(item: NavLinkItem, key: string) {
  if (item.type === "custom") {
    return <div key={key}>{item.children}</div>;
  }

  if (!("url" in item) || !item.url) return null;

  const content =
    item.type === "icon" ? (
      item.icon
    ) : (
      <>
        {item.icon}
        {item.text}
      </>
    );

  return (
    <ButtonLink
      key={key}
      href={item.url}
      external={item.external}
      aria-label={item.type === "icon" ? item.label : undefined}
      variant="plain"
      size="navItem"
      className={cn("text-fd-foreground/60")}
    >
      {content}
    </ButtonLink>
  );
}

export function Navbar({ nav = {}, links = [], githubUrl }: NavbarProps) {
  return (
    <div id="navbar" className="z-50 onload-animation">
      <div className="absolute -top-8 right-0 left-0 h-8 bg-fd-card transition" />
      <header className="card-base overflow-visible! mx-auto grid h-(--nav-height) grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-t-none! border-none px-4 backdrop-blur-md">
        <div className="flex min-w-0 items-center justify-self-start">
          {renderTitle(nav)}
        </div>

        {links.length > 0 ? (
          <nav
            aria-label="主导航"
            className="hide-scrollbar flex min-w-0 items-center justify-center gap-1 overflow-x-auto justify-self-center"
          >
            {links.map((item, index) =>
              renderNavLink(
                item,
                ("url" in item && item.url) || `nav-${index}`,
              ),
            )}
          </nav>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1 justify-self-end">
          {nav.children}
          <ThemeColorSettings />
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({
                variant: "plain",
                size: "icon",
                className: "flex",
              })}
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
        </div>
      </header>
    </div>
  );
}
