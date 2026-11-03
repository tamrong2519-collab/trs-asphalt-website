import { test, expect } from '@playwright/test';

const path = route => `${process.env.SITE_BASE || '/'}${route}`;

for (const deviceScaleFactor of [1, 3]) {
 test(`mobile hero, cards and slides use lighter photos at DPR ${deviceScaleFactor}`, async ({ browser, baseURL }) => {
  const context = await browser.newContext({
   baseURL, viewport: { width: 390, height: 844 },
   isMobile: true, hasTouch: true, deviceScaleFactor, reducedMotion: 'reduce',
  });
  try {
   const page = await context.newPage();
   await page.goto(path('index.html'));
   const hero = page.locator('.hero-image');
   await expect(hero).toHaveAttribute('src', path('images/hero-asphalt-paving-20261025.jpg'));
   const imageBytes = async image => {
    await image.evaluate(element => element.decode());
    const currentSrc = await image.evaluate(element => element.currentSrc);
    expect(currentSrc).toContain('/images/responsive/');
    const response = await page.request.get(currentSrc);
    expect(response.ok()).toBe(true);
    return (await response.body()).byteLength;
   };
   // Budget the hero and first two service photos that mobile browsers load
   // before scrolling, including high-density screens that used originals.
   let firstPhotos = await imageBytes(hero);
   const cards = page.locator('.home-services .service-card img');
   for (let index = 0; index < 2; index++) firstPhotos += await imageBytes(cards.nth(index));
   expect(firstPhotos).toBeLessThan(850_000);
   for (let index = 1; index < 5; index++) {
    await page.locator('.slide-next').evaluate(button => button.click());
    await expect(page.locator('.hero-home')).toHaveAttribute('data-active-slide', String(index));
    expect(await imageBytes(page.locator('.hero-scene img'))).toBeLessThan(420_000);
   }
  } finally { await context.close(); }
 });
}

for (const { width, budget } of [{ width: 390, budget: 350_000 }, { width: 1440, budget: 1_000_000 }]) {
test(`opening a large album photo at ${width}px avoids downloading its multi-megabyte original`, async ({ browser, baseURL }) => {
 const context = await browser.newContext({
  baseURL, viewport: { width, height: 900 },
  isMobile: width < 760, hasTouch: width < 760, deviceScaleFactor: 2, reducedMotion: 'reduce',
 });
 try {
  const page = await context.newPage();
  const requested = [];
  page.on('request', request => requested.push(request.url()));
  await page.goto(path('index.html'));
  await page.locator('[data-home-category="stone-yard"]').click();
  const original = path('images/home-stone-chips-garden-path-20261031.jpg');
  await page.locator('.home-portfolio-photo').filter({ has: page.locator(`img[src="${original}"]`) }).click();
  const image = page.locator('#home-gallery-image img');
  await expect(image).toBeVisible();
  await image.evaluate(element => element.decode());
  await expect(image).toHaveAttribute('src', new URL(original, page.url()).href);
  await expect(image).toHaveCSS('object-fit', 'contain');
  const selected = await image.evaluate(element => element.currentSrc);
  expect(selected).toContain('/images/responsive/');
  const response = await page.request.get(selected);
  expect(response.ok()).toBe(true);
  expect((await response.body()).byteLength).toBeLessThan(budget);
  expect(requested).not.toContain(new URL(original, page.url()).href);
 } finally { await context.close(); }
});
}
