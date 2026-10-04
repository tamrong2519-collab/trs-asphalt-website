import { test, expect } from '@playwright/test';

const path = route => `${process.env.SITE_BASE || '/'}${route}`;
const imageURL = (page, file) => new URL(path(`images/${file}`), page.url()).href;
const asphaltPhotos = [
 ['asphalt-job-01.webp', 'ภาพหน้างานลาดยางมะตอยบริเวณถนนและทางเข้าอาคาร'],
 ['asphalt-job-02.webp', 'ภาพหน้างานลาดยางมะตอยและรถบดบริเวณอาคาร'],
 ['asphalt-job-03.webp', 'รถบดเก็บผิวลาดยางมะตอยข้างอาคาร'],
 ['asphalt-job-04.webp', 'งานบดอัดยางมะตอยบริเวณทางเข้าอาคาร'],
 ['asphalt-job-05.webp', 'งานลาดยางมะตอยบริเวณทางโค้งและลานอาคาร'],
 ['asphalt-job-06.webp', 'ผิวถนนลาดยางมะตอยและพื้นที่ทางเข้าอาคาร'],
 ['asphalt-job-07.webp', 'รายละเอียดผิวลาดยางมะตอยและขอบทาง'],
 ['asphalt-job-08.webp', 'ภาพรวมถนนลาดยางมะตอยบริเวณอาคาร'],
 ['asphalt-job-09.webp', 'ทีมงานและเครื่องจักรขณะปูยางมะตอย'],
];
const gravelPhotos = [
 ['gravel-job.webp', 'ภาพหน้างานลานจอดรถหินคลุก'],
 ['gravel-slide.webp', 'เครื่องจักรเกลี่ยและปรับพื้นลานหินคลุก'],
 ['gravel-job-03.webp', 'รถบดบดอัดพื้นลานจอดรถหินคลุก'],
 ['gravel-job-04.webp', 'ภาพรวมพื้นลานจอดรถหินคลุกหลังบดอัด'],
 ['gravel-job-05.webp', 'ผิวหินคลุกและพื้นที่ลานจอดรถ'],
 ['gravel-job-06.webp', 'กองหินคลุกเตรียมเกลี่ยและบดอัดพื้นลาน'],
 ['gravel-job-07.webp', 'เตรียมวัสดุหินคลุกสำหรับลานจอดรถ'],
 ['gravel-job-08.webp', 'กองหินคลุกและพื้นที่ลานก่อนเกลี่ยปรับระดับ'],
 ['gravel-job-09.webp', 'ภาพแนวตั้งของวัสดุหินคลุกเตรียมปรับพื้นลาน'],
 ['gravel-job-10.webp', 'รถขุดเตรียมเกลี่ยหินคลุกในลานจอดรถ'],
 ['gravel-job-11.webp', 'เครื่องจักรเตรียมพื้นลานก่อนลงหินคลุก'],
];
const gravelRoadPhotos = [
 ['gravel-road-job.webp', 'ภาพหน้างานถนนหินคลุกขณะเกลี่ยและบดอัด'],
 ['gravel-road-job-02.webp', 'รถดันเกลี่ยหินคลุกและเตรียมพื้นถนน'],
 ['gravel-road-job-03.webp', 'งานเกลี่ยปรับระดับถนนหินคลุกข้างอาคาร'],
 ['gravel-road-job-04.webp', 'ภาพรวมถนนหินคลุกหลังเกลี่ยและบดอัด'],
 ['gravel-road-job-05.webp', 'เครื่องจักรเกลี่ยหินคลุกบริเวณทางเข้าออก'],
 ['gravel-road-job-06.webp', 'ภาพแนวตั้งของถนนหินคลุกและเครื่องจักรขณะปรับระดับ'],
 ['gravel-road-job-07.webp', 'เครื่องจักรเกลี่ยและบดอัดถนนหินคลุกในภาพแนวตั้ง'],
 ['gravel-road-job-08.webp', 'รถบดบดอัดถนนหินคลุกข้างอาคาร'],
 ['gravel-road-job-09.webp', 'งานถนนหินคลุกบริเวณทางเข้าออกสู่ถนน'],
 ['gravel-road-job-10.webp', 'ภาพแนวตั้งของรถบดขณะบดอัดถนนหินคลุก'],
];
const stonePhotos = [
 ['stone-job.webp', 'ภาพหน้างานหินเกล็ด'],
 ['stone-job-02.webp', 'ภาพรวมลานหินเกล็ดบริเวณอาคาร'],
 ['stone-job-03.webp', 'ลานหินเกล็ดและพื้นที่ทางเข้าอาคาร'],
 ['stone-job-04.webp', 'ผิวลานหินเกล็ดและพื้นที่ใช้งาน'],
 ['stone-job-05.webp', 'งานหินเกล็ดรอบอาคารและแนวต้นไม้'],
 ['stone-job-06.webp', 'รถบดบดอัดพื้นลานหินเกล็ด'],
 ['stone-building-01.webp', 'ภาพหน้างานลานหินเกล็ดข้างอาคาร'],
 ['stone-building-02.webp', 'ลานหินเกล็ดรอบต้นไม้และแนวกำแพง'],
 ['stone-building-03.webp', 'พื้นหินเกล็ดบริเวณทางเดินข้างอาคาร'],
 ['stone-building-04.webp', 'ภาพรวมลานหินเกล็ดรอบอาคารและแนวต้นไม้'],
 ['stone-home-01.webp', 'ภาพหน้างานหินเกล็ดบริเวณหน้าบ้าน'],
 ['stone-home-02.webp', 'พื้นหินเกล็ดรอบต้นไม้และทางเดินข้างบ้าน'],
 ['stone-home-03.webp', 'งานหินเกล็ดข้างบ้านและแนวกำแพง'],
 ['stone-home-04.webp', 'ลานหินเกล็ดบริเวณทางเข้าบ้าน'],
 ['stone-home-05.webp', 'พื้นหินเกล็ดตลอดแนวด้านข้างบ้าน'],
];
const speedBumpPhotos = [
 ['speed-bump-job.webp', 'ภาพหน้างานลูกระนาดยางมะตอย'],
 ['speed-bump-job-02.webp', 'รถบดบดอัดงานลูกระนาดยางมะตอย'],
 ['speed-bump-job-03.webp', 'ทีมงานเกลี่ยยางมะตอยสำหรับลูกระนาด'],
 ['speed-bump-job-04.webp', 'ผิวลูกระนาดยางมะตอยระหว่างเก็บงาน'],
 ['speed-bump-job-05.webp', 'งานปูและปรับผิวลูกระนาดยางมะตอย'],
 ['speed-bump-job-06.webp', 'ทีมงานทำเครื่องหมายบนลูกระนาดยางมะตอย'],
 ['speed-bump-job-07.webp', 'ภาพรวมงานทำลูกระนาดยางมะตอยและเครื่องหมายชะลอความเร็ว'],
 ['speed-bump-job-08.webp', 'งานลูกระนาดยางมะตอยบริเวณทางเข้าอาคาร'],
];
const markingPhotos = [
 ['marking-job.webp', 'ภาพหน้างานตีเส้นจราจร'],
 ['marking-job-02.webp', 'ช่องจอดรถสำหรับผู้ใช้รถเข็นและเส้นแบ่งพื้นที่'],
 ['marking-job-03.webp', 'งานตีเส้นช่องจอดรถตามแนวอาคาร'],
 ['marking-job-04.webp', 'ภาพรวมเส้นแบ่งช่องจอดรถข้างอาคาร'],
 ['marking-job-05.webp', 'งานตีเส้นช่องจอดรถและลูกศรจราจร'],
 ['marking-job-06.webp', 'ลูกศรบอกทิศทางและเส้นจราจรภายในอาคาร'],
 ['marking-job-07.webp', 'ทีมงานตีเส้นขอบทางด้วยเครื่องตีเส้น'],
 ['marking-job-08.webp', 'งานตีเส้นบริเวณทางโค้งและทางเข้าออก'],
 ['marking-job-09.webp', 'ทีมงานทำลูกศรบอกทิศทางจราจร'],
 ['marking-job-10.webp', 'เส้นแบ่งช่องทางและลูกศรภายในพื้นที่อาคาร'],
 ['marking-job-11.webp', 'งานตีเส้นแบ่งช่องทางเดินรถและลูกศรสองทิศทาง'],
];

async function expectPhoto(page, photos, index) {
 const [file, alt] = photos[index], image = page.locator('#lightbox-image img');
 await expect(page.locator('#image-count')).toHaveText(`${index + 1} / ${photos.length}`);
 await expect(image).toHaveAttribute('src', imageURL(page, file));
 await expect(image).toHaveAttribute('alt', alt);
 await expect(page.locator('#image-caption')).toHaveText(alt);
 await image.evaluate(element => element.decode());
 expect(await image.evaluate(element => element.naturalWidth > 0 && element.naturalHeight > 0)).toBe(true);
 const expectedDimensions = {
  'asphalt-job-09.webp': [1280, 720],
  'gravel-job-05.webp': [960, 1280],
  'gravel-job-06.webp': [960, 1280],
  'gravel-job-09.webp': [960, 1280],
  'gravel-road-job.webp': [1280, 960],
  'gravel-road-job-02.webp': [1280, 720],
  'gravel-road-job-03.webp': [1280, 720],
  'gravel-road-job-04.webp': [1280, 720],
  'gravel-road-job-05.webp': [1280, 720],
  'gravel-road-job-06.webp': [960, 1280],
  'gravel-road-job-07.webp': [960, 1280],
  'gravel-road-job-08.webp': [1280, 960],
  'gravel-road-job-09.webp': [1280, 720],
  'gravel-road-job-10.webp': [960, 1280],
  'stone-building-01.webp': [963, 1280],
  'stone-building-02.webp': [963, 1280],
  'stone-building-03.webp': [963, 1280],
  'stone-building-04.webp': [963, 1280],
  'stone-home-01.webp': [960, 1280],
  'stone-home-02.webp': [1280, 960],
  'stone-home-03.webp': [960, 1280],
  'stone-home-04.webp': [1280, 960],
  'stone-home-05.webp': [960, 1280],
  'speed-bump-job.webp': [1280, 960],
  'speed-bump-job-02.webp': [960, 1280],
  'speed-bump-job-03.webp': [960, 1280],
  'speed-bump-job-04.webp': [960, 1280],
  'speed-bump-job-05.webp': [960, 1280],
  'speed-bump-job-06.webp': [1280, 960],
  'speed-bump-job-07.webp': [1280, 960],
  'speed-bump-job-08.webp': [1280, 960],
  'marking-job.webp': [1280, 960],
  'marking-job-02.webp': [1280, 960],
  'marking-job-03.webp': [1280, 960],
  'marking-job-04.webp': [1280, 960],
  'marking-job-05.webp': [1280, 960],
  'marking-job-06.webp': [1280, 960],
  'marking-job-07.webp': [960, 1280],
  'marking-job-08.webp': [960, 1280],
  'marking-job-09.webp': [1280, 960],
  'marking-job-10.webp': [1280, 960],
  'marking-job-11.webp': [1280, 960],
 }[file];
 if (expectedDimensions) {
  const photoLayout = await image.evaluate(element => {
   const rect = element.getBoundingClientRect(), frame = element.parentElement.getBoundingClientRect();
   return { width: element.naturalWidth, height: element.naturalHeight, fit: getComputedStyle(element).objectFit, insideFrame: rect.left >= frame.left - 1 && rect.right <= frame.right + 1 && rect.top >= frame.top - 1 && rect.bottom <= frame.bottom + 1 };
  });
  expect(photoLayout.width).toBe(expectedDimensions[0]); expect(photoLayout.height).toBe(expectedDimensions[1]);
  expect(photoLayout.fit).toBe('contain'); expect(photoLayout.insideFrame).toBe(true);
 }
}

test('portfolio combines all stone work into one album with the supplied asphalt photos first', async ({ page }) => {
 await page.goto(path('projects.html'));
 const rows = page.locator('.project-row');
 await expect(rows).toHaveCount(6);
 expect(await rows.evaluateAll(items => items.map(element => element.dataset.category))).toEqual(['asphalt', 'gravel', 'stone', 'speed-bump', 'marking', 'gravel']);
 expect(await rows.evaluateAll(items => items.map(element => element.id))).toEqual(['asphalt-road', 'gravel-yard', 'stone-yard', 'speed-bump-work', 'parking-marking', 'gravel-road']);
 await expect(rows.first().locator('.project-cover img')).toHaveAttribute('src', path('images/asphalt-job-01.webp'));
 await expect(rows.first().locator('.project-cover img')).toHaveAttribute('alt', 'ภาพหน้างานลาดยางมะตอยบริเวณถนนและทางเข้าอาคาร');
 await expect(rows.first().locator('.project-copy')).toContainText('งานลาดยางมะตอยบริเวณถนนและทางเข้าอาคาร');
 await expect(rows.first().locator('.project-photo-count')).toHaveText('9 ภาพ');
 await expect(rows.first().locator('.project-image-note')).toHaveCount(0);
 await expect(page.locator('#gravel-yard .project-photo-count')).toHaveText('11 ภาพ');
 await expect(page.locator('#stone-yard .project-photo-count')).toHaveText('15 ภาพ');
 await expect(page.locator('#stone-yard .project-cover img')).toHaveAttribute('src', path('images/stone-job.webp'));
 await expect(page.locator('#stone-yard .project-copy')).toContainText('งานหินเกล็ดสำหรับลาน รอบอาคาร และรอบบ้าน');
 await expect(page.locator('#speed-bump-work .project-photo-count')).toHaveText('8 ภาพ');
 await expect(page.locator('#speed-bump-work .project-cover img')).toHaveAttribute('src', path('images/speed-bump-job.webp'));
 await expect(page.locator('#parking-marking .project-photo-count')).toHaveText('11 ภาพ');
 await expect(page.locator('#parking-marking .project-cover img')).toHaveAttribute('src', path('images/marking-job.webp'));
 await expect(page.locator('#parking-marking .project-copy')).toContainText('ตีเส้นช่องจอดรถ เส้นแบ่งช่องทาง และลูกศรบอกทิศทาง');
 await expect(page.locator('#gravel-road .project-copy h3')).toHaveText('ถนนหินคลุก บดอัด');
 await expect(page.locator('#gravel-road .project-copy')).toContainText('เกลี่ยปรับระดับและบดอัดหินคลุกสำหรับถนนและทางเข้าออก');
 await expect(page.locator('#gravel-road .project-cover img')).toHaveAttribute('src', path('images/gravel-road-job.webp'));
 await expect(page.locator('#gravel-road .project-cover img')).toHaveAttribute('alt', gravelRoadPhotos[0][1]);
 await expect(page.locator('#gravel-road .project-photo-count')).toHaveText('10 ภาพ');
 for (const [id, category] of [['asphalt-road', 'asphalt'], ['gravel-yard', 'gravel'], ['stone-yard', 'stone'], ['speed-bump-work', 'speed-bump'], ['parking-marking', 'marking'], ['gravel-road', 'gravel']]) {
  const row = page.locator(`.project-row#${id}`);
  await expect(row.locator('.project-cover img')).toHaveAttribute('alt', /ภาพหน้างาน/);
  await expect(row.locator('.project-gallery-open')).toBeVisible();
  await expect(row.locator(`a[href="${path(`contact.html?service=${category}#estimate`)}"]`)).toBeVisible();
 }
 await expect(page.locator('#empty-projects')).not.toBeVisible();
 const expectStoneAnchorClear = async (width, anchor) => {
  await expect(page).toHaveURL(/projects\.html#stone-yard$/);
  await expect(page.locator('.project-row#stone-yard')).toBeInViewport();
  await expect.poll(() => page.evaluate(() => {
   const row = document.querySelector('.project-row#stone-yard');
   const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
   return Math.min(row.getBoundingClientRect().top, row.querySelector('.project-cover').getBoundingClientRect().top) - headerBottom;
  }), { message: `Album anchor ${anchor} stays clear of the sticky header at ${width}px` }).toBeGreaterThanOrEqual(-1);
 };
 for (const width of [320, 375, 390, 430, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const anchor of ['stone-yard', 'stone-building-yard', 'stone-home-yard']) {
   await page.goto(path(`projects.html#${anchor}`));
   await page.evaluate(() => document.fonts.ready);
   await expectStoneAnchorClear(width, anchor);
  }
 }
 await page.setViewportSize({ width: 390, height: 900 });
 await page.goto(path('projects.html')); await page.evaluate(() => document.fonts.ready);
 for (const anchor of ['stone-yard', 'stone-building-yard', 'stone-home-yard']) {
  await page.locator('[data-filter="gravel"]').click();
  await expect(page.locator('.project-row#stone-yard')).toHaveCount(0);
  await page.evaluate(anchor => {
   history.replaceState(history.state, '', location.pathname + location.search);
   location.hash = anchor;
  }, anchor);
  await expect(page.locator('[data-filter="stone"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.project-row:visible')).toHaveCount(1);
  await expectStoneAnchorClear(390, anchor);
 }
});

test('grouped project gallery changes photos with buttons and keyboard and restores focus', async ({ page }) => {
 await page.goto(path('projects.html'));
 for (const [id, title, photos] of [
  ['asphalt-road', 'ลาดยางมะตอย', asphaltPhotos],
  ['gravel-yard', 'หินคลุก', gravelPhotos],
  ['stone-yard', 'งานหินเกล็ด', stonePhotos],
  ['speed-bump-work', 'งานลูกระนาดยางมะตอย', speedBumpPhotos],
  ['parking-marking', 'งานตีเส้นจราจร', markingPhotos],
  ['gravel-road', 'ถนนหินคลุก บดอัด', gravelRoadPhotos],
 ]) {
  const trigger = page.locator(`.project-row#${id} .project-gallery-open`);
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
  const cover = page.locator(`.project-row#${id} .project-cover`);
  await cover.click(); await expectPhoto(page, photos, 0);
  await page.getByRole('button', { name: 'ปิดภาพ', exact: true }).click(); await expect(cover).toBeFocused();
 }
});

test('mobile project gallery supports touch swipes without overflowing the screen', async ({ browser, baseURL }) => {
 // Traverse all six full albums with browser-generated gestures in both directions.
 test.setTimeout(90000);
 const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 900 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
 try {
  const page = await context.newPage(); await page.goto(path('projects.html'));
  const session = await context.newCDPSession(page);
  const swipe = async direction => {
   const photo = await page.locator('#lightbox-image').boundingBox();
   const start = photo.x + photo.width * (direction === 'left' ? .8 : .2);
   const end = photo.x + photo.width * (direction === 'left' ? .2 : .8);
   const y = photo.y + photo.height / 2;
   // Let Chromium generate the complete trusted touch gesture sequence.
   await session.send('Input.synthesizeScrollGesture', { x: start, y, xDistance: end - start, yDistance: 0, gestureSourceType: 'touch', speed: 600 });
  };
  for (const [id, photos] of [['asphalt-road', asphaltPhotos], ['gravel-yard', gravelPhotos], ['stone-yard', stonePhotos], ['speed-bump-work', speedBumpPhotos], ['parking-marking', markingPhotos], ['gravel-road', gravelRoadPhotos]]) {
   const trigger = page.locator(`.project-row#${id} .project-gallery-open`);
   await trigger.tap(); await expect(page.locator('#lightbox')).toBeVisible();
   await expectPhoto(page, photos, 0);
   const dialog = await page.locator('#lightbox').boundingBox();
   expect(dialog.x).toBeGreaterThanOrEqual(0); expect(dialog.x + dialog.width).toBeLessThanOrEqual(390);
   for (const name of ['ภาพก่อนหน้า', 'ภาพถัดไป', 'ปิดภาพ']) {
    const button = page.getByRole('button', { name, exact: true }), box = await button.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
   }
   for (let index = 1; index < photos.length; index++) {
    await swipe('left'); await expectPhoto(page, photos, index);
   }
   await swipe('left'); await expectPhoto(page, photos, 0);
   for (let index = photos.length - 1; index >= 0; index--) {
    await swipe('right'); await expectPhoto(page, photos, index);
   }
   await page.getByRole('button', { name: 'ปิดภาพ', exact: true }).tap();
   await expect(page.locator('#lightbox')).not.toBeVisible(); await expect(trigger).toBeFocused();
  }
  await session.detach();
 } finally { await context.close(); }
});
