"use client";

import { SidebarCollapseTrigger } from "fumadocs-ui/components/sidebar/base";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { PanelLeftOpen, Search } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import styles from "./FloatingSidebarPanel.module.css";
import { ThemeToggle } from "./ThemeToggle";

type FloatingSidebarPanelProps = {
  collapsed: boolean;
};

export function FloatingSidebarPanel({ collapsed }: FloatingSidebarPanelProps) {
  const { setOpenSearch } = useSearchContext();

  return (
    <div
      className={`${styles.anchor} pointer-events-none z-60 hidden lg:block`}
    >
      <div
        className={`${styles.panel} ${collapsed ? styles.open : styles.closed} pointer-events-auto`}
      >
        <SidebarCollapseTrigger
          className={buttonStyles({
            variant: "plain",
            size: "smIcon",
            animated: false,
            className: "rounded-xl",
          })}
          aria-label="展开侧边栏"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </SidebarCollapseTrigger>
        <ThemeToggle size="smIcon" animated={false} className="rounded-xl" />
        <Button
          variant="plain"
          size="smIcon"
          animated={false}
          className="rounded-xl"
          onClick={() => setOpenSearch(true)}
          aria-label="打开搜索"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
