import { test, expect } from '@playwright/test';

const path = route => `${process.env.SITE_BASE || '/'}${route}.html`;
const routes = ['index', 'services', 'projects', 'contact'];
const desktopWidth = 1280;
const sharedLayouts = ['.site-header', '.header-inner', '#main-nav', '#main-nav a', '.header-contact', 'main > .hero', 'footer', '.footer-top', '.footer-nav'];
const pageLayouts = {
 index: ['.home-services', '.sample-grid', '.sample-card'],
 services: ['.feature-services', '.service-details'],
 projects: ['.project-grid', '.project-card'],
 contact: ['.contact-grid', '.contact-photo', '.contact-panel', '.info-grid'],
};

async function geometry(page, selectors) {
 return page.evaluate(selectors => Object.fromEntries(selectors.map(selector => [selector,
  [...document.querySelectorAll(selector)].map(element => {
   const rect = element.getBoundingClientRect();
   return { left: rect.left + scrollX, top: rect.top + scrollY, width: rect.width, height: rect.height };
  }),
 ])), selectors);
}

for (const width of [320, 375, 390, 430]) {
 test(`real mobile browser fits the same desktop layout on all four pages at ${width}px`, async ({ browser, baseURL }) => {
  const desktop = await browser.newContext({ baseURL, viewport: { width: desktopWidth, height: 900 }, reducedMotion: 'reduce' });
  const mobile = await browser.newContext({ baseURL, viewport: { width, height: 900 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  try {
   const desktopPage = await desktop.newPage(), mobilePage = await mobile.newPage();
   for (const route of routes) {
    await Promise.all([desktopPage.goto(path(route)), mobilePage.goto(path(route))]);
    await Promise.all([desktopPage.evaluate(() => document.fonts.ready), mobilePage.evaluate(() => document.fonts.ready)]);
    const viewport = await mobilePage.evaluate(() => ({ layout: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, visual: visualViewport.width, scale: visualViewport.scale }));
    expect(Math.abs(viewport.layout - desktopWidth)).toBeLessThanOrEqual(1); expect(viewport.client).toBe(desktopWidth); expect(viewport.scroll).toBeLessThanOrEqual(desktopWidth);
    expect(viewport.visual).toBeCloseTo(desktopWidth, 1); expect(viewport.scale).toBeCloseTo(width / desktopWidth, 3);

    const selectors = [...sharedLayouts, ...pageLayouts[route]];
    const [expected, actual] = await Promise.all([geometry(desktopPage, selectors), geometry(mobilePage, selectors)]);
    for (const selector of selectors) {
     expect(actual[selector].length, `${route}: ${selector} exists`).toBeGreaterThan(0);
     expect(actual[selector]).toHaveLength(expected[selector].length);
     for (let index = 0; index < actual[selector].length; index++) {
      for (const key of ['left', 'top', 'width', 'height']) {
       expect(Math.abs(actual[selector][index][key] - expected[selector][index][key]), `${route}: ${selector}[${index}] ${key}`).toBeLessThanOrEqual(1);
      }
     }
    }
    await expect(mobilePage.locator('#main-nav a')).toHaveText(['หน้าแรก', 'บริการของเรา', 'ผลงานของเรา', 'ติดต่อเรา']);
    await expect(mobilePage.locator('.header-call')).toHaveAttribute('href', 'tel:0622484089');
    await expect(mobilePage.locator('.header-call')).toHaveAccessibleName('โทร 062-248-4089');
    await expect(mobilePage.locator('.header-line')).toHaveAttribute('href', 'https://line.me/ti/p/%40138wlldt');
    await expect(mobilePage.locator('.header-line')).toHaveAccessibleName('@138wlldt');
    await expect(mobilePage.locator('.header-call')).toBeVisible(); await expect(mobilePage.locator('.header-line')).toBeVisible();
    const viewportMeta = await mobilePage.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportMeta).toMatch(/width\s*=\s*1280/); expect(viewportMeta).not.toMatch(/user-scalable\s*=\s*(?:no|0)|maximum-scale\s*=/i);
    await mobilePage.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect(mobilePage.locator('.floating-contact')).not.toBeVisible();
   }
  } finally { await Promise.all([desktop.close(), mobile.close()]); }
 });
}

test('real mobile browser keeps automatic slides, touch controls and browser zoom working', async ({ browser, baseURL }) => {
 const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 900 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
 try {
  const page = await context.newPage(); await page.clock.install(); await page.goto(path('index'));
  await page.evaluate(() => document.fonts.ready);
  const hero = page.locator('.hero-home');
  for (const index of [1, 2, 3, 4, 0]) {
   await page.clock.runFor(6001); await expect(hero).toHaveAttribute('data-active-slide', String(index));
   await expect(page.locator('.slide-count')).toHaveText(`${String(index + 1).padStart(2, '0')} / 05`);
  }
  await page.getByRole('button', { name: 'หยุดสไลด์อัตโนมัติ' }).tap();
  await page.clock.runFor(12000); await expect(hero).toHaveAttribute('data-active-slide', '0');
  await page.getByRole('button', { name: 'สไลด์ถัดไป', exact: true }).tap(); await expect(hero).toHaveAttribute('data-active-slide', '1');
  await page.getByRole('button', { name: 'สไลด์ก่อนหน้า', exact: true }).tap(); await expect(hero).toHaveAttribute('data-active-slide', '0');

  const originalScale = await page.evaluate(() => visualViewport.scale);
  const session = await context.newCDPSession(page);
  await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: originalScale * 2 });
  await page.clock.runFor(50);
  await expect.poll(() => page.evaluate(() => visualViewport.scale)).toBeCloseTo(originalScale * 2, 3);
  expect(await page.evaluate(() => innerWidth)).toBe(desktopWidth);
  expect(await page.evaluate(() => visualViewport.width)).toBeCloseTo(desktopWidth / 2, 0);
  await session.detach();
 } finally { await context.close(); }
});
