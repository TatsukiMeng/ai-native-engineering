import { FuwariLayout } from "@/components/layout/FuwariLayout";
import { baseOptions } from "@/lib/layout.shared";
import { getDocsPageTree } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <FuwariLayout tree={getDocsPageTree()} {...baseOptions()}>
      {children}
    </FuwariLayout>
  );
}
