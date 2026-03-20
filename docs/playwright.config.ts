import { defineConfig, devices } from "@playwright/test";

const remoteBaseURL = process.env.E2E_BASE_URL;
const useRemoteBaseURL = Boolean(remoteBaseURL);

export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
        ["junit", { outputFile: "test-results/junit.xml" }],
      ]
    : "list",
  use: {
    baseURL: remoteBaseURL ?? "http://127.0.0.1:3000/ai-native-engineering",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: useRemoteBaseURL
    ? undefined
    : {
        command: "bun run start:e2e",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        url: "http://127.0.0.1:3000/ai-native-engineering/e2e/copy-markdown",
      },
});
