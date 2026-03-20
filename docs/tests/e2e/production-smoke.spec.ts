import { expect, test } from "@playwright/test";

const fallbackDocPath = "/docs/02-foundation";

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

const docPaths = parseTargetDocPaths(process.env.E2E_TARGET_PATHS);
const requiredRoutes = [
  "/",
  "/docs",
  "/llms.mdx/docs/02-foundation/00-overview.mdx",
  ...docPaths,
];

test.describe("Production smoke", () => {
  test("core routes are reachable", async ({ request, baseURL }) => {
    for (const route of requiredRoutes) {
      const response = await request.get(withConfiguredBase(baseURL, route));
      expect(
        response.status(),
        `Route ${route} should return < 400`,
      ).toBeLessThan(400);
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
        await expect(
          article,
          `${docPath} should render article container`,
        ).toBeVisible();
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

  test("target docs metadata image links do not leak localhost", async ({
    page,
    baseURL,
  }) => {
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
        expect(hasOgMeta, `${docPath} og:image should exist on article page`).toBe(
          true,
        );
        expect(
          hasTwitterMeta,
          `${docPath} twitter:image should exist on article page`,
        ).toBe(true);
      }

      if (hasOgMeta) {
        const ogImage = await ogMeta.getAttribute("content");
        expect(ogImage, `${docPath} og:image content should be defined`).toBeTruthy();
        expect(ogImage ?? "").not.toContain("localhost");
      }

      if (hasTwitterMeta) {
        const twitterImage = await twitterMeta.getAttribute("content");
        expect(
          twitterImage,
          `${docPath} twitter:image content should be defined`,
        ).toBeTruthy();
        expect(twitterImage ?? "").not.toContain("localhost");
      }
    }
  });
});
