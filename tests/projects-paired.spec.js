import { test, expect } from '@playwright/test';

const path = route => `${process.env.SITE_BASE || '/'}${route}`;
const imageURL = (page, file) => new URL(path(`images/${file}`), page.url()).href;
const asphaltPhotos = [
 ['asphalt-job-01.webp', 'ภาพหน้างานลาดยางมะตอยบริเวณถนนและทางเข้าอาคาร'],
 ['asphalt-job-02.webp', 'ภาพหน้างานลาดยางมะตอยและรถบดบริเวณอาคาร'],
 ['asphalt-job-03.webp', 'รถบดเก็บผิวลาดยางมะตอยข้างอาคาร'],
 ['asphalt-job-04.webp', 'งานบดอัดยางมะตอยบริเวณทางเข้าอาคาร'],
 ['asphalt-job-05.webp', 'งานลาดยางมะตอยบริเวณทางโค้งและลานอาคาร'],
];

async function expectPhoto(page, photos, index) {
 const [file, alt] = photos[index], image = page.locator('#lightbox-image img');
 await expect(page.locator('#image-count')).toHaveText(`${index + 1} / ${photos.length}`);
 await expect(image).toHaveAttribute('src', imageURL(page, file));
 await expect(image).toHaveAttribute('alt', alt);
 await expect(page.locator('#image-caption')).toHaveText(alt);
 await image.evaluate(element => element.decode());
 expect(await image.evaluate(element => element.naturalWidth > 0 && element.naturalHeight > 0)).toBe(true);
}

test('portfolio groups all five services with the supplied asphalt work photos first', async ({ page }) => {
 await page.goto(path('projects.html'));
 const rows = page.locator('.project-row');
 await expect(rows).toHaveCount(5);
 expect(await rows.evaluateAll(items => items.map(element => element.dataset.category))).toEqual(['asphalt', 'gravel', 'stone', 'speed-bump', 'marking']);
 await expect(rows.first().locator('.project-cover img')).toHaveAttribute('src', path('images/asphalt-job-01.webp'));
 await expect(rows.first().locator('.project-cover img')).toHaveAttribute('alt', 'ภาพหน้างานลาดยางมะตอยบริเวณถนนและทางเข้าอาคาร');
 await expect(rows.first().locator('.project-copy')).toContainText('งานลาดยางมะตอยบริเวณถนนและทางเข้าอาคาร');
 await expect(rows.first().locator('.project-photo-count')).toHaveText('5 ภาพ');
 await expect(rows.first().locator('.project-image-note')).toHaveCount(0);
 for (const category of ['asphalt', 'gravel', 'stone', 'speed-bump', 'marking']) {
  const row = page.locator(`.project-row[data-category="${category}"]`);
  await expect(row.locator('.project-cover img')).toHaveAttribute('alt', /ภาพหน้างาน/);
  await expect(row.locator('.project-gallery-open')).toBeVisible();
  await expect(row.locator(`a[href="${path(`contact.html?service=${category}#estimate`)}"]`)).toBeVisible();
 }
 await expect(page.locator('#empty-projects')).not.toBeVisible();
});

test('grouped project gallery changes photos with buttons and keyboard and restores focus', async ({ page }) => {
 await page.goto(path('projects.html'));
 for (const [category, title, photos] of [
  ['asphalt', 'ลาดยางมะตอย', asphaltPhotos],
  ['gravel', 'หินคลุก', [['gravel-job.webp', 'ภาพหน้างานลานจอดรถหินคลุก'], ['gravel-slide.webp', 'เครื่องจักรเกลี่ยและปรับพื้นลานหินคลุก']]],
 ]) {
  const trigger = page.locator(`.project-row[data-category="${category}"] .project-gallery-open`);
  await trigger.click();
  await expect(page.locator('#lightbox')).toBeVisible();
  await expect(page.locator('#lightbox-title')).toContainText(title);
  await expect(page.locator('#image-count')).toHaveAttribute('role', 'status');
  for (let index = 0; index < photos.length; index++) {
   if (index > 0) await page.getByRole('button', { name: 'ภาพถัดไป', exact: true }).click();
   await expectPhoto(page, photos, index);
  }
  await page.getByRole('button', { name: 'ภาพถัดไป', exact: true }).click();
  await expectPhoto(page, photos, 0);
  await page.getByRole('button', { name: 'ภาพก่อนหน้า', exact: true }).click();
  await expectPhoto(page, photos, photos.length - 1);
  await page.keyboard.press('ArrowRight');
  await expectPhoto(page, photos, 0);
  await page.keyboard.press('ArrowLeft');
  await expectPhoto(page, photos, photos.length - 1);
  await page.keyboard.press('Tab');
  expect(await page.locator('#lightbox').evaluate(dialog => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('#lightbox')).not.toBeVisible();
  await expect(trigger).toBeFocused();
  const cover = page.locator(`.project-row[data-category="${category}"] .project-cover`);
  await cover.click(); await expectPhoto(page, photos, 0);
  await page.getByRole('button', { name: 'ปิดภาพ', exact: true }).click(); await expect(cover).toBeFocused();
 }
});

test('mobile project gallery supports touch swipes without overflowing the screen', async ({ browser, baseURL }) => {
 const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 900 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
 try {
  const page = await context.newPage(); await page.goto(path('projects.html'));
  const trigger = page.locator('.project-row[data-category="asphalt"] .project-gallery-open');
  await trigger.tap(); await expect(page.locator('#lightbox')).toBeVisible();
  await expectPhoto(page, asphaltPhotos, 0);
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
  for (let index = 1; index < asphaltPhotos.length; index++) {
   await swipe('left'); await expectPhoto(page, asphaltPhotos, index);
  }
  await swipe('left'); await expectPhoto(page, asphaltPhotos, 0);
  for (let index = asphaltPhotos.length - 1; index >= 0; index--) {
   await swipe('right'); await expectPhoto(page, asphaltPhotos, index);
  }
  await session.detach();
  await page.getByRole('button', { name: 'ปิดภาพ', exact: true }).tap();
  await expect(page.locator('#lightbox')).not.toBeVisible(); await expect(trigger).toBeFocused();
 } finally { await context.close(); }
});
