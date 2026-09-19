import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  reporter: "list",
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-webgl"],
        }
      : {},
  },
  webServer: {
    command:
      "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      CONTACT_EMAIL: "studio@example.test",
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.SANITY_INTEGRATION_TEST
        ? "webuildertest"
        : "",
      NEXT_PUBLIC_SANITY_DATASET: "production",
      SANITY_API_READ_TOKEN: "",
      NODE_OPTIONS: process.env.SANITY_INTEGRATION_TEST
        ? "--require ./tests/fixtures/sanity.cjs"
        : "",
      // Always overwrite inherited credentials so tests cannot reach the live automation.
      GOOGLE_APPS_SCRIPT_URL: process.env.BOOKING_INTEGRATION_TEST
        ? "https://script.google.com/macros/s/webuilder-test/exec"
        : "",
      BOOKING_API_SECRET: process.env.BOOKING_INTEGRATION_TEST
        ? "booking-test-secret-no-live-access"
        : "",
      ...(process.env.BOOKING_INTEGRATION_TEST
        ? { NODE_OPTIONS: "--require ./tests/fixtures/apps-script.cjs" }
        : {}),
    },
  },
});
