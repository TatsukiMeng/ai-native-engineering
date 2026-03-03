"use client";

import { useSidebar } from "fumadocs-ui/components/sidebar/base";
import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import { useEffect, useRef, useState } from "react";
import styles from "./HoverRevealPanels.module.css";
import { SidebarFloatingPreview } from "./Sidebar";
import { TOCFloatingPreview } from "./TOCSidebar";

type HoverRevealPanelsProps = {
  sidebar?: DocsLayoutProps["sidebar"];
  onSidebarHoverChange?: (open: boolean) => void;
};

export function HoverRevealPanels({
  sidebar = {},
  onSidebarHoverChange,
}: HoverRevealPanelsProps) {
  const { collapsed } = useSidebar();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const sidebarCloseTimer = useRef<number | null>(null);
  const tocCloseTimer = useRef<number | null>(null);

  const clearSidebarTimer = () => {
    if (sidebarCloseTimer.current) {
      window.clearTimeout(sidebarCloseTimer.current);
      sidebarCloseTimer.current = null;
    }
  };

  const clearTocTimer = () => {
    if (tocCloseTimer.current) {
      window.clearTimeout(tocCloseTimer.current);
      tocCloseTimer.current = null;
    }
  };

  const openSidebar = () => {
    clearSidebarTimer();
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    clearSidebarTimer();
    sidebarCloseTimer.current = window.setTimeout(() => {
      setSidebarOpen(false);
    }, 120);
  };

  const openToc = () => {
    clearTocTimer();
    setTocOpen(true);
  };

  const closeToc = () => {
    clearTocTimer();
    tocCloseTimer.current = window.setTimeout(() => {
      setTocOpen(false);
    }, 120);
  };

  useEffect(() => {
    onSidebarHoverChange?.(sidebarOpen);
  }, [sidebarOpen, onSidebarHoverChange]);

  useEffect(() => {
    return () => {
      clearSidebarTimer();
      clearTocTimer();
    };
  }, []);

  return (
    <>
      {collapsed && (
        <>
          <div
            className={`${styles.leftTrigger} hidden lg:block`}
            onMouseEnter={openSidebar}
          />
          <div
            className={`${styles.leftPanel} hidden lg:block ${sidebarOpen ? styles.visibleLeft : styles.hiddenLeft}`}
            onMouseEnter={openSidebar}
            onMouseLeave={closeSidebar}
          >
            <SidebarFloatingPreview sidebar={sidebar} />
          </div>
        </>
      )}

      <div
        className={`${styles.rightTrigger} hidden lg:block 2xl:hidden`}
        onMouseEnter={openToc}
      />
      <div
        className={`${styles.rightPanel} hidden lg:block 2xl:hidden ${tocOpen ? styles.visibleRight : styles.hiddenRight}`}
        onMouseEnter={openToc}
        onMouseLeave={closeToc}
      >
        <TOCFloatingPreview />
      </div>
    </>
  );
}
