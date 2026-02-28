import { FuwariLayout } from "@/components/layout/FuwariLayout";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <FuwariLayout tree={source.getPageTree()} {...baseOptions()}>
      {children}
    </FuwariLayout>
  );
}
