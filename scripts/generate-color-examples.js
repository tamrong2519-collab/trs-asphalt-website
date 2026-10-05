// Run after building and starting the local production preview on port 4182.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const blueExamples = process.env.COLOR_EXAMPLES_SET === 'blue';
const { colorThemes, themeStyles } = await import(blueExamples ? '../public/blue-themes.js' : '../public/color-themes.js');
const imageFolder = blueExamples ? 'blue-examples-white' : 'color-examples';

const base = process.env.COLOR_EXAMPLES_BASE || 'http://127.0.0.1:4182/trs-asphalt-website/';
await mkdir(`public/images/${imageFolder}`, { recursive: true });
const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox'] });
try {
 const page = await browser.newPage({ viewport:{width:1200,height:1150}, reducedMotion:'reduce' });
 for (const theme of colorThemes) {
  await page.goto(new URL('services.html',base).href);
  await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:themeStyles(theme)});
  await page.locator('.paired-service').first().locator('img').evaluate(image=>image.decode());
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:`public/images/${imageFolder}/theme-${theme.id}.jpg`,type:'jpeg',quality:86});
  console.log(`Captured ${theme.id}: ${theme.name}`);
 }
} finally { await browser.close(); }
