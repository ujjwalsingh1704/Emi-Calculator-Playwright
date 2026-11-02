import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/api",
  fullyParallel: true,
  reporter: [["list"], ["html", { outputFolder: "artifacts/api-report", open: "never" }]],
  use: { baseURL: "https://jsonplaceholder.typicode.com", trace: "retain-on-failure" },
  timeout: 30_000
});
