import { expect, test } from "@playwright/test";

const pagePath = "/e2e/copy-markdown";
const markdownPath = "/ai-native-engineering/e2e/copy-markdown/source.mdx";
const expectedTitle = "# Copy Markdown Fixture";

test.describe("Copy Markdown", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("copies markdown from the built site with the production basePath", async ({
    page,
  }) => {
    await page.goto(pagePath);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Copy Markdown E2E",
      }),
    ).toBeVisible();

    const markdownResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith(markdownPath) && response.status() === 200,
    );

    await page.getByRole("button", { name: "Copy Markdown" }).click();

    await markdownResponse;

    await expect
      .poll(async () => page.evaluate(() => navigator.clipboard.readText()))
      .toContain(expectedTitle);

    await expect
      .poll(async () => page.evaluate(() => navigator.clipboard.readText()))
      .toContain("This fixture proves the built copy flow");
  });
});
