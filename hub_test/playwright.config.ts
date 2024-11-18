import type { PlaywrightTestConfig } from "@playwright/test";

import { devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: process.env.DEVROOT + "/hub_test",
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  /* Run tests in files in parallel */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "line",
  use: {
    actionTimeout: 0,
    baseURL: "https://localhost:5000",
    ignoreHTTPSErrors: true, // look like mkcert not accepted by playwright

    trace: "on-first-retry",

    permissions: ["clipboard-read", "clipboard-write"],
  },

  projects: [
    { name: "setup", testMatch: "global.setup.ts" },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.cookie",
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    cwd: process.env.DEVROOT,
    command: "go run ./cmd/devserver -conf hub_test/testconf.toml",
    url: "http://localhost:5000",
    reuseExistingServer: true,
  },
};

export default config;
