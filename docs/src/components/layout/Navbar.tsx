"use client";

import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { renderTitleNav } from "fumadocs-ui/layouts/shared";
import { Github } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";

type NavbarProps = {
  nav?: BaseLayoutProps["nav"];
  githubUrl?: string;
};

export function Navbar({ nav = {}, githubUrl }: NavbarProps) {
  return (
    <div id="navbar" className="z-50 onload-animation">
      <div className="absolute -top-8 right-0 left-0 h-8 bg-fd-card transition" />
      <header className="card-base overflow-visible! mx-auto flex h-(--nav-height) items-center justify-between px-4 rounded-t-none! border-none backdrop-blur-md">
        <div className="flex items-center gap-4">
          {renderTitleNav(nav, {
            className: buttonStyles({ variant: "plain", size: "navTitle" }),
          })}
        </div>

        <div className="flex items-center">
          {nav.children}
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
