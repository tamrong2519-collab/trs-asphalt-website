import { test, expect } from '@playwright/test';

const path = route => `${process.env.SITE_BASE || '/'}${route}`;
const imageURL = (page, file) => new URL(path(`images/${file}`), page.url()).href;

test('portfolio groups all five services with asphalt first and identifies its illustration', async ({ page }) => {
 await page.goto(path('projects.html'));
 const rows = page.locator('.project-row');
 await expect(rows).toHaveCount(5);
 expect(await rows.evaluateAll(items => items.map(element => element.dataset.category))).toEqual(['asphalt', 'gravel', 'stone', 'speed-bump', 'marking']);
 await expect(rows.first().locator('.project-cover img')).toHaveAttribute('src', path('images/hero-daylight.webp'));
 await expect(rows.first().locator('.project-cover img')).toHaveAttribute('alt', 'ภาพประกอบงานลาดยางมะตอย');
 await expect(rows.first().locator('.project-copy')).toContainText('ภาพประกอบงานลาดยางมะตอย');
 for (const category of ['gravel', 'stone', 'speed-bump', 'marking']) {
  const row = page.locator(`.project-row[data-category="${category}"]`);
  await expect(row.locator('.project-cover img')).toHaveAttribute('alt', /ภาพหน้างาน/);
  await expect(row.locator('.project-gallery-open')).toBeVisible();
  await expect(row.locator(`a[href="${path(`contact.html?service=${category}#estimate`)}"]`)).toBeVisible();
 }
 await expect(page.locator('#empty-projects')).not.toBeVisible();
});

test('grouped project gallery changes photos with buttons and keyboard and restores focus', async ({ page }) => {
 await page.goto(path('projects.html'));
 const trigger = page.locator('.project-row[data-category="gravel"] .project-gallery-open');
 await trigger.click();
 await expect(page.locator('#lightbox')).toBeVisible();
 await expect(page.locator('#lightbox-title')).toContainText('หินคลุก');
 await expect(page.locator('#image-count')).toHaveAttribute('role', 'status');
 await expect(page.locator('#image-count')).toHaveText('1 / 2');
 await expect(page.locator('#lightbox-image img')).toHaveAttribute('src', imageURL(page, 'gravel-job.webp'));
 await expect(page.locator('#image-caption')).toHaveText('ภาพหน้างานลานจอดรถหินคลุก');
 await page.getByRole('button', { name: 'ภาพถัดไป', exact: true }).click();
 await expect(page.locator('#image-count')).toHaveText('2 / 2');
 await expect(page.locator('#lightbox-image img')).toHaveAttribute('src', imageURL(page, 'gravel-slide.webp'));
 await page.keyboard.press('ArrowLeft');
 await expect(page.locator('#image-count')).toHaveText('1 / 2');
 await expect(page.locator('#lightbox-image img')).toHaveAttribute('src', imageURL(page, 'gravel-job.webp'));
 await page.keyboard.press('ArrowRight');
 await expect(page.locator('#image-count')).toHaveText('2 / 2');
 await page.keyboard.press('Tab');
 expect(await page.locator('#lightbox').evaluate(dialog => dialog.contains(document.activeElement))).toBe(true);
 await page.keyboard.press('Escape');
 await expect(page.locator('#lightbox')).not.toBeVisible();
 await expect(trigger).toBeFocused();
 const cover = page.locator('.project-row[data-category="gravel"] .project-cover');
 await cover.click(); await expect(page.locator('#image-count')).toHaveText('1 / 2');
 await page.getByRole('button', { name: 'ปิดภาพ', exact: true }).click(); await expect(cover).toBeFocused();
});

test('mobile project gallery supports touch swipes without overflowing the screen', async ({ browser, baseURL }) => {
 const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 900 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
 try {
  const page = await context.newPage(); await page.goto(path('projects.html'));
  const trigger = page.locator('.project-row[data-category="gravel"] .project-gallery-open');
  await trigger.tap(); await expect(page.locator('#lightbox')).toBeVisible();
  const dialog = await page.locator('#lightbox').boundingBox();
  expect(dialog.x).toBeGreaterThanOrEqual(0); expect(dialog.x + dialog.width).toBeLessThanOrEqual(390);
  for (const name of ['ภาพก่อนหน้า', 'ภาพถัดไป', 'ปิดภาพ']) {
   const button = page.getByRole('button', { name, exact: true }), box = await button.boundingBox();
   expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
  }
  const session = await context.newCDPSession(page);
  const swipe = async direction => {
   const photo = await page.locator('#lightbox-image').boundingBox();
   const start = photo.x + photo.width * (direction === 'left' ? .8 : .2);
   const end = photo.x + photo.width * (direction === 'left' ? .2 : .8);
   const y = photo.y + photo.height / 2;
   // Let Chromium generate the complete trusted touch gesture sequence.
   await session.send('Input.synthesizeScrollGesture', { x: start, y, xDistance: end - start, yDistance: 0, gestureSourceType: 'touch', speed: 600 });
  };
  await swipe('left'); await expect(page.locator('#image-count')).toHaveText('2 / 2');
  await expect(page.locator('#lightbox-image img')).toHaveAttribute('src', imageURL(page, 'gravel-slide.webp'));
  await swipe('right'); await expect(page.locator('#image-count')).toHaveText('1 / 2');
  await expect(page.locator('#lightbox-image img')).toHaveAttribute('src', imageURL(page, 'gravel-job.webp'));
  await session.detach();
  await page.getByRole('button', { name: 'ปิดภาพ', exact: true }).tap();
  await expect(page.locator('#lightbox')).not.toBeVisible(); await expect(trigger).toBeFocused();
 } finally { await context.close(); }
});
