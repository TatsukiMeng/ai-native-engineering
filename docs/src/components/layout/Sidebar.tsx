"use client";

import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  SidebarSeparator,
  useSidebar,
} from "fumadocs-ui/components/sidebar/base";
import { createPageTreeRenderer } from "fumadocs-ui/components/sidebar/page-tree";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import { PanelLeftClose, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./ThemeToggle";

const archiveItemClass = cn(
  "group relative mb-0.5 flex min-h-9 min-w-0 items-center rounded-lg px-3",
  "text-black/75 transition-all duration-200 dark:text-white/75",
  "hover:bg-[var(--color-btn-plain-bg-hover)] hover:text-[var(--color-primary)] hover:translate-x-[2px]",
  "active:bg-[var(--color-btn-plain-bg-active)]",
  "data-[active=true]:bg-[var(--color-btn-regular-bg)] data-[active=true]:font-bold data-[active=true]:text-[var(--color-primary)]",
  "[&>[data-icon]]:ms-auto [&>[data-icon]]:h-3.5 [&>[data-icon]]:w-3.5 [&>[data-icon]]:shrink-0",
  "[&>[data-icon]]:text-black/50 dark:[&>[data-icon]]:text-white/50",
  "[&>[data-icon]]:transition-all [&>[data-icon]]:duration-300",
  "group-hover:[&>[data-icon]]:text-[var(--color-primary)]",
);

const archiveFolderContentClass =
  "ms-5 border-s-2 border-dashed border-fd-border/70 ps-2";

const archiveSeparatorClass =
  "mt-5 mb-2 px-2 text-xs font-bold uppercase tracking-wide text-black/50 dark:text-white/50";

function splitIconAndLabel(children: ReactNode) {
  const items = Children.toArray(children);
  const first = items[0];

  if (isValidElement(first)) {
    return {
      icon: first,
      label: items.slice(1),
    };
  }

  return {
    icon: undefined,
    label: items,
  };
}

function renderItemContent(children: ReactNode, iconFromProp?: ReactNode) {
  const { icon: iconFromChildren, label } = splitIconAndLabel(children);
  const icon = iconFromProp ?? iconFromChildren;

  return (
    <>
      <div className="sidebar-node-marker me-2 inline-flex h-4 w-4 shrink-0 items-center justify-center">
        {icon ? (
          <span className="sidebar-node-icon inline-flex items-center justify-center text-black/55 transition-colors duration-200 group-hover:text-(--color-primary) group-data-[active=true]:text-(--color-primary) dark:text-white/55 [&>svg]:h-3.5 [&>svg]:w-3.5">
            {icon}
          </span>
        ) : (
          <span className="sidebar-node-dot h-1 w-1 rounded bg-[oklch(0.5_0.05_var(--hue))] transition-all duration-200 group-hover:h-4 group-hover:bg-(--color-primary) group-data-[active=true]:h-4 group-data-[active=true]:bg-(--color-primary)" />
        )}
      </div>
      <span className="min-w-0 flex-1 truncate whitespace-nowrap">{label}</span>
    </>
  );
}

function ArchiveSidebarItem(props: ComponentProps<typeof SidebarItem>) {
  const { children, icon, ...rest } = props;

  return (
    <SidebarItem {...rest} className={cn(archiveItemClass, props.className)}>
      {renderItemContent(children, icon)}
    </SidebarItem>
  );
}

function ArchiveSidebarFolderLink(
  props: ComponentProps<typeof SidebarFolderLink>,
) {
  const { children, ...rest } = props;

  return (
    <SidebarFolderLink
      {...rest}
      className={cn(archiveItemClass, props.className)}
    >
      {renderItemContent(children)}
    </SidebarFolderLink>
  );
}

function ArchiveSidebarFolderTrigger(
  props: ComponentProps<typeof SidebarFolderTrigger>,
) {
  const { children, ...rest } = props;

  return (
    <SidebarFolderTrigger
      {...rest}
      className={cn(archiveItemClass, props.className)}
    >
      {renderItemContent(children)}
    </SidebarFolderTrigger>
  );
}

function ArchiveSidebarFolderContent(
  props: ComponentProps<typeof SidebarFolderContent>,
) {
  return (
    <SidebarFolderContent
      {...props}
      className={cn(archiveFolderContentClass, props.className)}
    />
  );
}

function ArchiveSidebarSeparator(
  props: ComponentProps<typeof SidebarSeparator>,
) {
  return (
    <SidebarSeparator
      {...props}
      className={cn(archiveSeparatorClass, props.className)}
    />
  );
}

type TreeFolderNode = {
  name: string;
  icon?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  index?: {
    url: string;
    external?: boolean;
  };
  children?: TreeFolderNode[];
};

type TreeNodeLike =
  | TreeFolderNode
  | {
      type?: string;
      url?: string;
      children?: TreeNodeLike[];
    };

function isUrlActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

function isUrlExactActive(pathname: string, url: string) {
  return pathname === url;
}

function hasActiveDescendant(pathname: string, node: TreeFolderNode): boolean {
  if (node.index?.url && isUrlActive(pathname, node.index.url)) return true;
  return (node.children ?? []).some((child) =>
    hasActiveDescendant(pathname, child),
  );
}

function findFirstPageUrl(node: TreeNodeLike): string | undefined {
  if (
    "type" in node &&
    node.type === "page" &&
    "url" in node &&
    typeof node.url === "string"
  ) {
    return node.url;
  }

  for (const child of node.children ?? []) {
    const matched = findFirstPageUrl(child);
    if (matched) return matched;
  }

  return undefined;
}

function NestedSidebarFolder({
  item,
  children,
}: {
  item: TreeFolderNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const hasActiveChild = hasActiveDescendant(pathname, item);
  const folderUrl = item.index?.url ?? findFirstPageUrl(item as TreeNodeLike);
  const hasChildren = (item.children?.length ?? 0) > 0;
  const folderItemActive = folderUrl
    ? isUrlExactActive(pathname, folderUrl)
    : false;

  return (
    <SidebarFolder
      collapsible={item.collapsible}
      active={hasActiveChild}
      defaultOpen={item.defaultOpen}
    >
      {folderUrl ? (
        <ArchiveSidebarFolderLink
          href={folderUrl}
          active={folderItemActive}
          external={item.index?.external}
          className={cn(hasChildren ? undefined : "pe-3")}
        >
          {item.icon}
          {item.name}
        </ArchiveSidebarFolderLink>
      ) : (
        <ArchiveSidebarFolderTrigger>
          {item.icon}
          {item.name}
        </ArchiveSidebarFolderTrigger>
      )}

      {hasChildren ? (
        <ArchiveSidebarFolderContent>{children}</ArchiveSidebarFolderContent>
      ) : null}
    </SidebarFolder>
  );
}

const SidebarPageTree = createPageTreeRenderer({
  SidebarFolder,
  SidebarFolderContent: ArchiveSidebarFolderContent,
  SidebarFolderLink: ArchiveSidebarFolderLink,
  SidebarFolderTrigger: ArchiveSidebarFolderTrigger,
  SidebarItem: ArchiveSidebarItem,
  SidebarSeparator: ArchiveSidebarSeparator,
});

type SidebarProps = {
  sidebar?: DocsLayoutProps["sidebar"];
};

export function Sidebar({ sidebar = {} }: SidebarProps) {
  const { collapsed, setCollapsed } = useSidebar();
  const { setOpenSearch } = useSearchContext();

  return (
    <aside
      id="sidebar-container"
      className={`mb-4 w-full ${collapsed ? "hidden" : "hidden lg:block"}`}
    >
      <div
        id="sidebar-sticky"
        className="sticky top-4 flex w-full flex-col gap-4 transition-all duration-700"
      >
        <div className="card-base flex min-h-[calc(100vh-9rem)] flex-col overflow-hidden p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-bold text-fd-foreground">目录</div>
            <div className="flex items-center gap-1">
              <Button
                size="smIcon"
                animated={false}
                aria-label="搜索文档"
                onClick={() => setOpenSearch(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
              <ThemeToggle size="smIcon" animated={false} />
              <Button
                size="smIcon"
                animated={false}
                aria-label="收起侧边栏"
                onClick={() => setCollapsed(true)}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-3 border-t border-dashed border-fd-border" />

          <div className="hide-scrollbar flex-1 overflow-y-auto">
            <SidebarPageTree
              {...sidebar.components}
              Folder={({ item, children }) => (
                <NestedSidebarFolder item={item as TreeFolderNode}>
                  {children}
                </NestedSidebarFolder>
              )}
            />
          </div>
          {sidebar.footer && (
            <div className="mt-auto border-t border-dashed border-fd-border pt-4 font-bold">
              {sidebar.footer}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
