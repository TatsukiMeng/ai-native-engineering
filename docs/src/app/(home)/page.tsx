import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center px-4 py-20">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
        AI 原生工程
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
        Vibe Coding 进阶与全域自动化落地。
        <br />
        从“入门实战避坑”逐渐过渡到“高级全域自动化集群（Swarm）”的技术专著。
      </p>
      <div className="flex flex-row gap-4 justify-center">
        <Link
          href="/docs"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full font-semibold transition-colors"
        >
          开始阅读
        </Link>
        <a
          href="https://github.com/TatsukiMeng/ai-native-engineering"
          target="_blank"
          rel="noreferrer"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-3 rounded-full font-semibold transition-colors"
        >
          前往 GitHub
        </a>
      </div>
    </main>
  );
}
