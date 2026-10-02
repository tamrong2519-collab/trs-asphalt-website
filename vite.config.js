import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: process.env.SITE_BASE || '/',
  build: { rollupOptions: { input: {
    home: resolve('index.html'), services: resolve('services.html'),
    projects: resolve('projects.html'), contact: resolve('contact.html')
  } } }
});
