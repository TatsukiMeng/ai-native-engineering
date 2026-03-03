import { Tag } from "lucide-react";
import Link from "next/link";

type Item = {
  url: string;
  title: string;
};

interface DocsBreadcrumbMetaProps {
  items: Item[];
}

export function DocsBreadcrumbMeta({ items }: DocsBreadcrumbMetaProps) {
  if (items.length === 0) return null;

  return (
    <div className="items-center flex">
      <div className="meta-icon">
        <Tag width={18} />
      </div>
      <div className="flex flex-row flex-nowrap items-center">
        {items.map((item, index) => (
          <div
            key={item.url}
            className="flex flex-row flex-nowrap items-center"
          >
            <div
              className={`${index === 0 ? "hidden" : ""} mx-1.5 text-[var(--meta-divider)] text-sm`}
            >
              /
            </div>
            <Link
              href={item.url}
              className="link-lg transition text-50 text-sm font-medium hover:text-[var(--primary)] dark:hover:text-[var(--primary)] whitespace-nowrap"
            >
              {item.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
