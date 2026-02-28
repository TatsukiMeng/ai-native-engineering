export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="onload-animation col-span-full">
      <div className="mx-6 my-10 border-t border-dashed border-black/10 transition dark:border-white/15 md:mx-16 lg:mx-32" />
      <div className="mb-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[oklch(85%_0.01_var(--hue))] px-6 text-center transition dark:border-white/15">
        <div className="py-6 text-sm text-black/50 transition dark:text-white/50">
          © {currentYear} AI 原生工程（AI Native Engineering）
          <br />
          内容版权归对应作者与贡献者所有；项目汇编与品牌归项目维护方所有。
          <br />
          文稿默认采用{" "}
          <a
            className="font-medium text-fd-primary underline"
            target="_blank"
            rel="noreferrer"
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          >
            CC BY-NC-SA 4.0
          </a>
          ，示例代码采用 MIT License。
          <br />
          Powered by{" "}
          <a
            className="font-medium text-fd-primary underline"
            target="_blank"
            rel="noreferrer"
            href="https://nextjs.org"
          >
            Next.js
          </a>{" "}
          &{" "}
          <a
            className="font-medium text-fd-primary underline"
            target="_blank"
            rel="noreferrer"
            href="https://fumadocs.dev"
          >
            Fumadocs
          </a>
          <br />
          Theme inspired by{" "}
          <a
            className="font-medium text-fd-primary underline"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/saicaca/fuwari"
          >
            Fuwari
          </a>
        </div>
      </div>
    </footer>
  );
}
