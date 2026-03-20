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
      await expect(page.locator("article")).toBeVisible();
      await expect(page.locator("article h1").first()).toBeVisible();
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

      const ogImage = await page
        .locator('meta[property="og:image"]')
        .getAttribute("content");
      const twitterImage = await page
        .locator('meta[name="twitter:image"]')
        .getAttribute("content");

      expect(ogImage, `${docPath} og:image should be defined`).toBeTruthy();
      expect(
        twitterImage,
        `${docPath} twitter:image should be defined`,
      ).toBeTruthy();
      expect(ogImage ?? "").not.toContain("localhost");
      expect(twitterImage ?? "").not.toContain("localhost");
    }
  });
});
