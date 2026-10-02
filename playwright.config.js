import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: './tests',
 use: { baseURL: 'http://127.0.0.1:4180', launchOptions: { executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] } },
 webServer: { command: 'npm run preview -- --port 4180 --strictPort', url: 'http://127.0.0.1:4180', reuseExistingServer: false },
});
