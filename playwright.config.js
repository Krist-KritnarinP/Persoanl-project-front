import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { channel: 'chromium', baseURL: 'http://127.0.0.1:5188', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5188 --strictPort',
    url: 'http://127.0.0.1:5188', reuseExistingServer: false,
    env: { VITE_GOOGLE_CLIENT_ID: 'test-client.apps.googleusercontent.com', VITE_API_URL: 'http://127.0.0.1:8899/api' },
  },
});
