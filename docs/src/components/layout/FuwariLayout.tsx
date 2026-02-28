"use client";

import {
  SidebarProvider,
  useSidebar,
} from "fumadocs-ui/components/sidebar/base";
import { TreeContextProvider } from "fumadocs-ui/contexts/tree";
import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import { FloatingSidebarPanel } from "./FloatingSidebarPanel";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { TOCSidebar } from "./TOCSidebar";

function FuwariLayoutContent({
  children,
  nav,
  sidebar,
  githubUrl,
}: Omit<DocsLayoutProps, "tree">) {
  const { collapsed } = useSidebar();

  return (
    <div
      id="fuwari-layout-root"
      className="min-h-screen bg-fd-background pb-10 font-sans transition-colors duration-700"
    >
      <div
        id="top-row"
        className="pointer-events-none relative z-50 mx-auto w-full max-w-(--page-width) px-0 transition-all duration-700 md:px-(--layout-inline-gutter)"
      >
        <div
          id="navbar-wrapper"
          className="pointer-events-auto sticky top-0 transition-all"
        >
          <Navbar nav={nav} githubUrl={githubUrl} />
        </div>
      </div>

      <div
        id="main-panel"
        className="relative z-30 mt-4 w-full pointer-events-none"
      >
        <div className="pointer-events-auto relative mx-auto max-w-(--page-width)">
          <div
            id="main-grid"
            className={`mx-auto grid w-full grid-cols-1 gap-4 px-0 transition duration-700 md:px-(--layout-inline-gutter) ${collapsed ? "lg:grid-cols-1" : "lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"}`}
          >
            <Sidebar sidebar={sidebar} />

            <main
              id="swup-container"
              className="col-span-1 min-w-0 overflow-visible"
            >
              <div id="content-wrapper" className="onload-animation w-full">
                {children}
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </div>

      <FloatingSidebarPanel collapsed={collapsed} />

      <div className="absolute z-0 hidden w-full 2xl:block">
        <div className="relative mx-auto max-w-(--page-width) px-0 md:px-(--layout-inline-gutter)">
          <TOCSidebar />
        </div>
      </div>
    </div>
  );
}

export function FuwariLayout({
  children,
  tree,
  nav = {},
  sidebar = {},
  githubUrl,
}: DocsLayoutProps) {
  return (
    <TreeContextProvider tree={tree}>
      <SidebarProvider>
        <FuwariLayoutContent nav={nav} sidebar={sidebar} githubUrl={githubUrl}>
          {children}
        </FuwariLayoutContent>
      </SidebarProvider>
    </TreeContextProvider>
  );
}
