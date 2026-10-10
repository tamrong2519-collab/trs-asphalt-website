import { test, expect } from '@playwright/test';

const path = route => `${process.env.SITE_BASE || '/'}${route}`;
test.use({ reducedMotion: 'reduce' });

async function openMicrosite(page) {
 await page.goto(path('asphalt/'));
 await page.evaluate(() => document.fonts.ready);
}

async function expectViewerImage(page, filename) {
 const image = page.locator('#viewer-image');
 await expect(image).toHaveAttribute('src', `assets/images/${filename}`);
 await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
 await expect(image).toBeVisible();
}

for (const width of [1440, 768, 390, 320]) {
 test(`asphalt works remain prominent and contacts fit at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 950 });
  await openMicrosite(page);
  await expect(page.locator('.thumb')).toHaveCount(16);
  await expect(page.locator('#featured-image')).toHaveAttribute('src', 'assets/images/asphalt-project-main-clean-20261010.webp');
  await expect(page.locator('.site-header .brand-logo')).toHaveAttribute('src', 'assets/brand/trs-logo.jpg');
  const layout = await page.evaluate(() => {
   const grid = document.querySelector('.gallery-grid');
   return {
    overflow: document.documentElement.scrollWidth > innerWidth,
    columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
    buttons: [...document.querySelectorAll('.hero-actions .button')].map(element => {
     const rect = element.getBoundingClientRect();
     return { height: rect.height, clipped: element.scrollWidth > element.clientWidth + 1 };
    }),
   };
  });
  expect(layout.overflow).toBe(false);
  if (width === 1440) expect(layout.columns).toBe(4);
  if (width <= 390) expect(layout.columns).toBe(2);
  expect(layout.buttons).toHaveLength(2);
  expect(layout.buttons[0].height).toBeCloseTo(layout.buttons[1].height, 0);
  for (const button of layout.buttons) { expect(button.height).toBeGreaterThanOrEqual(44); expect(button.clipped).toBe(false); }
  await expect(page.locator('.hero-actions .phone')).toHaveAttribute('href', 'tel:0622484089');
  await expect(page.locator('.hero-actions .line')).toHaveAttribute('href', 'https://line.me/ti/p/%40138wlldt');
 });
}

test('asphalt shares the main homepage colors and component shapes', async ({ page }) => {
 await page.setViewportSize({ width: 1440, height: 950 });
 const readTheme = selectors => page.evaluate(entries => Object.fromEntries(entries.map(([name, selector, property]) => {
  const element = document.querySelector(selector);
  return [name, getComputedStyle(element)[property]];
 })), selectors);
 await page.goto(path(''));
 const mainTheme = await readTheme([
  ['brand', '.header-brand-band', 'backgroundColor'],
  ['menu', '.header-nav-band', 'backgroundColor'],
  ['contactBand', '.header-contact-band', 'backgroundImage'],
  ['canvas', '#main', 'backgroundImage'],
  ['call', '.hero-primary-actions .hero-call', 'backgroundColor'],
  ['line', '.hero-primary-actions .hero-line', 'backgroundColor'],
  ['buttonShape', '.hero-primary-actions .hero-call', 'borderRadius'],
  ['trust', '.trust-strip', 'backgroundImage'],
  ['portfolio', '.blue-section', 'backgroundImage'],
  ['cardShape', '.service-card', 'borderRadius'],
  ['footer', '.site-footer', 'backgroundImage'],
  ['footerShape', '.site-footer', 'borderRadius'],
  ['stripes', '.footer-stripes', 'backgroundImage'],
 ]);
 await openMicrosite(page);
 const asphaltTheme = await readTheme([
  ['brand', '.header-brand-band', 'backgroundColor'],
  ['menu', '.header-nav-band', 'backgroundColor'],
  ['contactBand', '.header-contact-band', 'backgroundImage'],
  ['canvas', 'body', 'backgroundImage'],
  ['call', '.hero-actions .phone', 'backgroundColor'],
  ['line', '.hero-actions .line', 'backgroundColor'],
  ['buttonShape', '.hero-actions .phone', 'borderRadius'],
  ['trust', '.trust-strip', 'backgroundImage'],
  ['portfolio', '.work-gallery', 'backgroundImage'],
  ['cardShape', '.process-card', 'borderRadius'],
  ['footer', '.site-footer', 'backgroundImage'],
  ['footerShape', '.site-footer', 'borderRadius'],
  ['stripes', '.footer-stripes', 'backgroundImage'],
 ]);
 expect(asphaltTheme).toEqual(mainTheme);
 await expect(page.locator('.hero-benefit')).toHaveCount(4);
 await expect(page.locator('.trust-grid > div')).toHaveCount(3);
 await expect(page.locator('.thumb-caption')).toHaveCount(16);
 await expect(page.locator('.thumb-number, .process-number')).toHaveCount(0);
 await page.locator('.site-nav a[href="#photos"]').click();
 await expect.poll(() => page.evaluate(() => document.querySelector('#photos').getBoundingClientRect().top >= document.querySelector('.site-header').getBoundingClientRect().bottom)).toBe(true);
});

test('full-size gallery supports keyboard navigation and restores focus and scroll', async ({ page }) => {
 await page.setViewportSize({ width: 1440, height: 950 });
 await openMicrosite(page);
 const trigger = page.locator('.thumb[data-index="8"]');
 await trigger.scrollIntoViewIfNeeded();
 const originalScroll = await page.evaluate(() => scrollY);
 await trigger.click();
 const viewer = page.locator('#photo-viewer');
 await expect(viewer).toBeVisible();
 await expect(page.locator('.viewer-close')).toBeFocused();
 await expectViewerImage(page, 'asphalt-project-gallery-08.jpg');
 const image = await page.locator('#viewer-image').evaluate(element => ({ width: element.naturalWidth, height: element.naturalHeight, fit: getComputedStyle(element).objectFit }));
 expect(image).toEqual({ width: 960, height: 1280, fit: 'contain' });
 await expect(page.locator('#viewer-caption')).toHaveText('ถนนลาดยางมะตอยข้างอาคารโครงสร้างสีขาว');
 await expect(page.locator('#viewer-credit')).toBeHidden();
 await page.keyboard.press('ArrowRight');
 await expectViewerImage(page, 'asphalt-project-gallery-09.jpg');
 await page.keyboard.press('ArrowLeft');
 await expectViewerImage(page, 'asphalt-project-gallery-08.jpg');
 await page.keyboard.press('Tab');
 await expect(page.locator('.viewer-prev')).toBeFocused();
 await page.keyboard.press('Shift+Tab');
 await expect(page.locator('.viewer-close')).toBeFocused();
 await page.keyboard.press('Shift+Tab');
 await expect(page.locator('.viewer-next')).toBeFocused();
 await page.keyboard.press('Tab');
 await expect(page.locator('.viewer-close')).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(viewer).toBeHidden();
 await expect(trigger).toBeFocused();
 expect(Math.abs(await page.evaluate(() => scrollY) - originalScroll)).toBeLessThanOrEqual(2);
 await expect(page.locator('#featured-image')).toHaveAttribute('src', 'assets/images/asphalt-project-main-clean-20261010.webp');
});

test('mobile viewer cycles through every gallery image and releases the page after closing', async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 844 });
 await openMicrosite(page);
 const errors = []; page.on('pageerror', error => errors.push(error.message));
 await page.locator('.thumb[data-index="16"]').click();
 await expectViewerImage(page, 'asphalt-project-gallery-18.jpg');
 await page.locator('.viewer-next').click();
 await expectViewerImage(page, 'asphalt-project-main-clean-20261010.webp');
 const photos = await page.locator('#photo-data').evaluate(element => JSON.parse(element.textContent));
 for (const photo of photos.slice(1)) {
  await page.locator('.viewer-next').click();
  await expectViewerImage(page, photo.src.split('/').pop());
 }
 const fits = await page.locator('#photo-viewer').evaluate(dialog => {
  const rect = dialog.getBoundingClientRect();
  const controls = [...dialog.querySelectorAll('button')].map(button => button.getBoundingClientRect());
  return rect.top >= -1 && rect.bottom <= innerHeight + 1 && rect.left >= -1 && rect.right <= innerWidth + 1 && controls.every(rect => rect.width >= 44 && rect.height >= 44);
 });
 expect(fits).toBe(true);
 await page.locator('.viewer-close').click();
 await expect(page.locator('#photo-viewer')).toBeHidden();
 expect(await page.evaluate(() => document.body.classList.contains('photo-viewer-open'))).toBe(false);
 expect(await page.evaluate(() => getComputedStyle(document.body).position)).not.toBe('fixed');
 await page.locator('.photo-open').click();
 await expectViewerImage(page, 'asphalt-project-main-clean-20261010.webp');
 await page.keyboard.press('Escape');
 await expect(page.locator('.photo-open')).toBeFocused();
 expect(errors).toEqual([]);
});

test('clicking the image keeps the viewer open and clicking the backdrop dismisses it', async ({ page }) => {
 await page.setViewportSize({ width: 1440, height: 950 });
 await openMicrosite(page);
 await page.locator('.photo-open').click();
 await expectViewerImage(page, 'asphalt-project-main-clean-20261010.webp');
 await page.locator('#viewer-image').click();
 await expect(page.locator('#photo-viewer')).toBeVisible();
 await page.mouse.click(4, 4);
 await expect(page.locator('#photo-viewer')).toBeHidden();
 await expect(page.locator('.photo-open')).toBeFocused();
});

test('a slow earlier photo cannot replace the image selected next', async ({ page }) => {
 await openMicrosite(page);
 let releasePhoto;
 const delayedPhoto = new Promise(resolve => { releasePhoto = resolve; });
 await page.route('**/asphalt/assets/images/asphalt-project-gallery-08.jpg', async route => {
  await delayedPhoto;
  await route.continue();
 });
 await page.locator('.thumb[data-index="8"]').click();
 await page.locator('.viewer-next').click();
 await expectViewerImage(page, 'asphalt-project-gallery-09.jpg');
 const earlierResponse = page.waitForResponse(response => response.url().endsWith('/asphalt-project-gallery-08.jpg'));
 releasePhoto();
 await (await earlierResponse).finished();
 await expectViewerImage(page, 'asphalt-project-gallery-09.jpg');
 await expect(page.locator('#viewer-caption')).toHaveText('ลานลาดยางมะตอยข้างอาคารสีเขียว');
 await page.keyboard.press('Escape');
 await expect(page.locator('.thumb[data-index="8"]')).toBeFocused();
});
