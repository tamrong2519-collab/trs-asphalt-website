import { test, expect } from '@playwright/test';

const path = route => `${process.env.SITE_BASE || '/'}${route}.html`;
const routes = ['index', 'services', 'projects', 'contact'];

for (const width of [320, 375, 390, 430]) {
 test(`real mobile browser keeps all four pages readable and usable at ${width}px`, async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width, height: 900 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  try {
   const page = await context.newPage();
   const errors = []; page.on('pageerror', error => errors.push(error.message));
   for (const route of routes) {
    await page.goto(path(route)); await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
     const visible = element => { const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden'; };
     const rectangles = selector => [...document.querySelectorAll(selector)].filter(visible).map(element => {
      const rect = element.getBoundingClientRect(); return { text: element.textContent.trim(), left: rect.left, right: rect.right, width: rect.width, height: rect.height, font: parseFloat(getComputedStyle(element).fontSize), overflow: element.scrollWidth > element.clientWidth };
     });
     return {
      inner: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, visual: visualViewport.width, scale: visualViewport.scale,
      heading: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
      paragraphs: [...document.querySelectorAll('main p')].filter(visible).map(element => ({ text: element.textContent.trim(), font: parseFloat(getComputedStyle(element).fontSize) })),
      actions: rectangles('main .button'), navigation: rectangles('#main-nav a'), contacts: rectangles('.header-contact a'),
      photoCards: rectangles('main .service-card, main .sample-card, main .project-card, main .info-card, main .contact-photo, main .scene, main .hero-image, main .hero-scene'),
     };
    });
    expect(layout.inner).toBe(width); expect(layout.client).toBe(width); expect(layout.scroll).toBeLessThanOrEqual(width);
    expect(layout.visual).toBeCloseTo(width, 1); expect(layout.scale).toBeCloseTo(1, 3);
    expect(layout.heading).toBeGreaterThanOrEqual(34); expect(layout.heading).toBeLessThanOrEqual(44);
    for (const paragraph of layout.paragraphs) expect(paragraph.font, paragraph.text).toBeGreaterThanOrEqual(16);
    for (const action of layout.actions) expect(action.height, action.text).toBeGreaterThanOrEqual(52);
    expect(layout.navigation).toHaveLength(4);
    for (const link of layout.navigation) { expect(link.font).toBeGreaterThanOrEqual(14); expect(link.height).toBeGreaterThanOrEqual(44); expect(link.overflow).toBe(false); }
    expect(layout.contacts).toHaveLength(2);
    expect(layout.contacts[0].width).toBeCloseTo(layout.contacts[1].width, 1);
    expect(layout.contacts[0].left).toBeCloseTo(width - layout.contacts[1].right, 0);
    for (const contact of layout.contacts) { expect(contact.height).toBeGreaterThanOrEqual(44); expect(contact.overflow).toBe(false); }
    expect(layout.photoCards.length).toBeGreaterThan(0);
    for (const photo of layout.photoCards) { expect(photo.left).toBeGreaterThanOrEqual(-1); expect(photo.right).toBeLessThanOrEqual(width + 1); }
    await expect(page.locator('#main-nav a')).toHaveText(['หน้าแรก', 'บริการของเรา', 'ผลงานของเรา', 'ติดต่อเรา']);
    await expect(page.locator('.header-call')).toHaveAttribute('href', 'tel:0622484089');
    await expect(page.locator('.header-call')).toHaveAccessibleName('โทร 062-248-4089');
    await expect(page.locator('.header-line')).toHaveAttribute('href', 'https://line.me/ti/p/%40138wlldt');
    await expect(page.locator('.header-line')).toHaveAccessibleName('LINE @138wlldt');
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportMeta).toMatch(/width\s*=\s*device-width/); expect(viewportMeta).toMatch(/initial-scale\s*=\s*1/);
    expect(viewportMeta).not.toMatch(/user-scalable\s*=\s*(?:no|0)|maximum-scale\s*=/i);
    await expect(page.locator('.floating-contact')).toBeVisible();
    const floating = await page.locator('.floating-contact').evaluate(element => {
     const rect = element.getBoundingClientRect();
     return { right: rect.right, bottom: rect.bottom, width: rect.width, buttons: [...element.querySelectorAll('a')].map(button => {
      const box = button.getBoundingClientRect(), face = button.querySelector('.float-face').getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height, faceHeight: face.height, overflow: button.scrollWidth > button.clientWidth };
     }) };
    });
    expect(floating.width).toBe(160); expect(floating.right).toBeCloseTo(width - 12, 1); expect(900 - floating.bottom).toBeGreaterThanOrEqual(12);
    expect(floating.buttons).toHaveLength(2);
    for (const button of floating.buttons) { expect(button.height).toBe(44); expect(button.width).toBe(160); expect(button.faceHeight).toBe(30); expect(button.left).toBeGreaterThanOrEqual(12); expect(button.right).toBeLessThanOrEqual(width - 12); expect(button.overflow).toBe(false); }
    expect(floating.buttons[0].left).toBeCloseTo(floating.buttons[1].left, 1); expect(floating.buttons[1].top - floating.buttons[0].bottom).toBeCloseTo(4, 1);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    const clearFooter = await page.evaluate(() => document.querySelector('.site-footer').getBoundingClientRect().bottom <= document.querySelector('.floating-contact').getBoundingClientRect().top);
    expect(clearFooter).toBe(true);
   }
   expect(errors).toEqual([]);
  } finally { await context.close(); }
 });
}

test('real mobile browser keeps automatic slides, swipe and browser zoom working without slider buttons', async ({ browser, baseURL }) => {
 const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 900 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
 try {
  const page = await context.newPage(); await page.clock.install(); await page.goto(path('index'));
  await page.evaluate(() => document.fonts.ready);
  const hero = page.locator('.hero-home');
  await expect(hero.locator('.slider-controls')).toBeHidden();
  await expect(hero.getByRole('button')).toHaveCount(0);
  for (const index of [1, 2, 3, 4, 0]) {
   await page.clock.runFor(6001); await expect(hero).toHaveAttribute('data-active-slide', String(index));
   await expect(page.locator('.slide-count')).toHaveText(`${String(index + 1).padStart(2, '0')} / 05`);
  }
  const session = await context.newCDPSession(page);
  const photo = await hero.locator('.hero-image').boundingBox();
  const swipe = async (startX, endX) => {
   const y = photo.y + photo.height / 2;
   await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y }] });
   await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: endX, y }] });
   await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await swipe(280, 100); await expect(hero).toHaveAttribute('data-active-slide', '1');
  await page.clock.runFor(6001); await expect(hero).toHaveAttribute('data-active-slide', '2');
  await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 }); await page.clock.runFor(50);
  await expect.poll(() => page.evaluate(() => visualViewport.scale)).toBeCloseTo(2, 3);
  expect(await page.evaluate(() => innerWidth)).toBe(390);
  expect(await page.evaluate(() => visualViewport.width)).toBeCloseTo(195, 0);
  await session.detach();
 } finally { await context.close(); }
});
