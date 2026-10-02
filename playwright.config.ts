import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173/itzfizz-assignment/',
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'laptop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'short-laptop', use: { viewport: { width: 1440, height: 650 } } },
    { name: 'tablet', use: { viewport: { width: 1024, height: 768 }, hasTouch: true } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
    { name: 'small-mobile', use: { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true } },
    { name: 'landscape', use: { viewport: { width: 844, height: 390 }, hasTouch: true } },
  ],
  webServer: {
    command: 'node scripts/serve-build.mjs',
    url: 'http://127.0.0.1:4173/itzfizz-assignment/',
    reuseExistingServer: !process.env.CI,
  },
});