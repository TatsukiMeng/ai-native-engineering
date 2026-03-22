import { expect, test, type APIRequestContext } from "@playwright/test";

const fallbackDocPath = "/docs/02-foundation";
const maxInternalLinkChecksPerPage = 30;
const maxHorizontalOverflowPx = 2;

function normalizePath(path: string) {
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

function parseTargetDocPaths(raw: string | undefined) {
  if (!raw) return [fallbackDocPath];

  const paths = raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map(normalizePath)
    .filter((item) => item.startsWith("/docs"));

  return paths.length > 0 ? Array.from(new Set(paths)) : [fallbackDocPath];
}

function withConfiguredBase(baseURL: string | undefined, route: string) {
  if (!baseURL) return route;

  const pathname = new URL(baseURL).pathname;
  const basePath = pathname === "/" ? "" : pathname.replace(/\/$/, "");

  return `${basePath}${route}`;
}

function normalizeRouteForRequest(baseURL: string | undefined, route: string) {
  const raw = route.trim();
  if (!raw) return "/";

  let normalized = raw;

  if (/^https?:\/\//.test(normalized)) {
    const parsed = new URL(normalized);
    normalized = `${parsed.pathname}${parsed.search}`;
  }

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  if (!baseURL) return normalized;

  const basePath = new URL(baseURL).pathname.replace(/\/$/, "");
  if (basePath && normalized.startsWith(`${basePath}/`)) {
    return normalized.slice(basePath.length) || "/";
  }

  return normalized;
}

function shouldIgnoreConsoleError(message: string) {
  return /ERR_BLOCKED_BY_CLIENT|ResizeObserver loop limit exceeded/i.test(message);
}

async function requestWithRetry(request: APIRequestContext, url: string, maxAttempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await request.get(url);
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
  }

  throw lastError;
}

const docPaths = parseTargetDocPaths(process.env.E2E_TARGET_PATHS);
const requiredRoutes = ["/", "/docs", "/llms.mdx/docs/02-foundation/00-overview.mdx", ...docPaths];

test.describe("Production smoke", () => {
  test.skip(
    !process.env.E2E_BASE_URL?.trim(),
    "E2E_BASE_URL is not set. Set a Netlify URL to run smoke checks.",
  );

  test("core routes are reachable", async ({ request, baseURL }) => {
    for (const route of requiredRoutes) {
      const response = await requestWithRetry(request, withConfiguredBase(baseURL, route));
      expect(response.status(), `Route ${route} should return < 400`).toBeLessThan(400);
    }
  });

  test("target docs pages render key structure", async ({ page, baseURL }) => {
    for (const docPath of docPaths) {
      await page.goto(withConfiguredBase(baseURL, docPath), {
        waitUntil: "domcontentloaded",
      });

      await expect(page.locator("main")).toBeVisible();

      const article = page.locator("article").first();
      const hasArticle = (await article.count()) > 0;

      if (hasArticle) {
        await expect(article, `${docPath} should render article container`).toBeVisible();
        await expect(
          page.locator("article h1").first(),
          `${docPath} should render article title`,
        ).toBeVisible();
      } else {
        await expect(
          page.locator("main h1, main h2, main [role='heading']").first(),
          `${docPath} should render at least one heading in main`,
        ).toBeVisible();
      }
    }
  });

  test("target docs metadata image links do not leak localhost", async ({ page, baseURL }) => {
    for (const docPath of docPaths) {
      await page.goto(withConfiguredBase(baseURL, docPath), {
        waitUntil: "domcontentloaded",
      });

      const hasArticle = (await page.locator("article").count()) > 0;
      const ogMeta = page.locator('meta[property="og:image"]').first();
      const twitterMeta = page.locator('meta[name="twitter:image"]').first();
      const hasOgMeta = (await ogMeta.count()) > 0;
      const hasTwitterMeta = (await twitterMeta.count()) > 0;

      if (hasArticle) {
        expect(hasOgMeta, `${docPath} og:image should exist on article page`).toBe(true);
        expect(hasTwitterMeta, `${docPath} twitter:image should exist on article page`).toBe(true);
      }

      if (hasOgMeta) {
        const ogImage = await ogMeta.getAttribute("content");
        expect(ogImage, `${docPath} og:image content should be defined`).toBeTruthy();
        expect(ogImage ?? "").not.toContain("localhost");
      }

      if (hasTwitterMeta) {
        const twitterImage = await twitterMeta.getAttribute("content");
        expect(twitterImage, `${docPath} twitter:image content should be defined`).toBeTruthy();
        expect(twitterImage ?? "").not.toContain("localhost");
      }
    }
  });

  test("target docs pages have no runtime console errors", async ({ page, baseURL }) => {
    for (const docPath of docPaths) {
      const consoleErrors: string[] = [];
      const runtimeErrors: string[] = [];

      const handleConsole = (message: { type: () => string; text: () => string }) => {
        if (message.type() !== "error") return;

        const text = message.text();
        if (shouldIgnoreConsoleError(text)) return;
        consoleErrors.push(text);
      };

      const handlePageError = (error: Error) => {
        runtimeErrors.push(error.message);
      };

      page.on("console", handleConsole);
      page.on("pageerror", handlePageError);

      await page.goto(withConfiguredBase(baseURL, docPath), {
        waitUntil: "domcontentloaded",
      });

      await page.waitForTimeout(300);

      page.off("console", handleConsole);
      page.off("pageerror", handlePageError);

      expect(consoleErrors, `${docPath} should not emit console errors`).toEqual([]);
      expect(runtimeErrors, `${docPath} should not emit uncaught runtime errors`).toEqual([]);
    }
  });

  test("target docs pages do not overflow viewport horizontally", async ({ page, baseURL }) => {
    for (const docPath of docPaths) {
      await page.goto(withConfiguredBase(baseURL, docPath), {
        waitUntil: "domcontentloaded",
      });

      const metrics = await page.evaluate(() => {
        const html = document.documentElement;
        const body = document.body;

        return {
          viewportWidth: window.innerWidth,
          htmlScrollWidth: html.scrollWidth,
          bodyScrollWidth: body?.scrollWidth ?? 0,
        };
      });

      const maxScrollWidth = Math.max(metrics.htmlScrollWidth, metrics.bodyScrollWidth);

      expect(
        maxScrollWidth,
        `${docPath} should not overflow horizontally (scrollWidth=${maxScrollWidth}, viewport=${metrics.viewportWidth})`,
      ).toBeLessThanOrEqual(metrics.viewportWidth + maxHorizontalOverflowPx);
    }
  });

  test("target docs pages internal links are not broken", async ({ page, request, baseURL }) => {
    for (const docPath of docPaths) {
      await page.goto(withConfiguredBase(baseURL, docPath), {
        waitUntil: "domcontentloaded",
      });

      const links = await page.evaluate((limit) => {
        const candidates = new Set<string>();

        const anchors = document.querySelectorAll<HTMLAnchorElement>("main a[href]");
        for (const anchor of anchors) {
          const href = anchor.getAttribute("href")?.trim();
          if (!href) continue;
          if (href.startsWith("#")) continue;
          if (/^(mailto:|tel:|javascript:)/i.test(href)) continue;

          try {
            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin) continue;

            if (!url.pathname.startsWith("/docs") && !url.pathname.startsWith("/llms.mdx/docs")) {
              continue;
            }

            candidates.add(`${url.pathname}${url.search}`);
            if (candidates.size >= limit) break;
          } catch {
            continue;
          }
        }

        return Array.from(candidates);
      }, maxInternalLinkChecksPerPage);

      for (const link of links) {
        const route = normalizeRouteForRequest(baseURL, link);
        const response = await requestWithRetry(request, withConfiguredBase(baseURL, route));
        expect(
          response.status(),
          `${docPath} internal link ${link} should return < 400`,
        ).toBeLessThan(400);
      }
    }
  });
});
