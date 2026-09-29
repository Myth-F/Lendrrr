import { defineConfig, devices } from '@playwright/test';

const dev = process.env.LENDRR_DEV === '1';
const baseURL = dev ? 'http://localhost:4321' : 'http://127.0.0.1:4323';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL,
    browserName: 'chromium',
    locale: 'fr-FR',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: dev ? 'npm run dev' : 'npm run preview -- --host 127.0.0.1',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
