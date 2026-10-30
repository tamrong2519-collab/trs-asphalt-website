import { test, expect } from '@playwright/test';

const path = route => `${process.env.SITE_BASE || '/'}${route}`;
const albums = [
 { id:'asphalt-road', title:'งานลาดยางมะตอย', first:'asphalt-job-01.webp', last:'asphalt-job-29.webp', count:29 },
 { id:'gravel-yard', title:'งานลานจอดรถหินคลุก', first:'projects-gravel-cover.webp', last:'gravel-job-19.webp', count:20 },
 { id:'stone-yard', title:'งานหินเกล็ด', first:'stone-home-01.webp', last:'stone-home-05.webp', count:15 },
 { id:'speed-bump-work', title:'งานลูกระนาดยางมะตอย', first:'projects-speed-bump-cover.webp', last:'speed-bump-job-13.webp', count:14 },
 { id:'parking-marking', title:'งานตีเส้นจราจร', first:'projects-marking-cover.webp', last:'marking-job-15.webp', count:16 },
 { id:'gravel-road', title:'ถนนหินคลุก บดอัด', first:'home-gravel-road-alley-01-20261030.jpg', last:'gravel-road-job-20.webp', count:23 },
];
const triggerFor = (page, id, section = '.home-portfolio-card') => page.locator(`${section}[data-home-album="${id}"]`);
const closeButton = page => page.getByRole('button', { name:'ปิดภาพ', exact:true });
const nextButton = page => page.getByRole('button', { name:'ภาพถัดไป', exact:true });
const previousButton = page => page.getByRole('button', { name:'ภาพก่อนหน้า', exact:true });

async function openHome(page) {
 await page.route(/https?:\/\/(?:[^/]+\.)?(?:googletagmanager\.com|google-analytics\.com|googleadservices\.com|doubleclick\.net)\//, route => route.abort());
 await page.goto(path('index.html'));
 await page.evaluate(() => document.fonts.ready);
}

async function expectPhoto(page, file, index, count) {
 await expect(page.locator('#home-gallery-count')).toHaveText(`${index} / ${count}`);
 const image = page.locator('#home-gallery-image img');
 await expect.poll(() => image.evaluate(element => new URL(element.currentSrc || element.src, location.href).pathname)).toBe(path(`images/${file}`));
 await expect(image).toBeVisible();
 await image.evaluate(element => element.decode());
 expect(await image.evaluate(element => element.naturalWidth > 0 && element.naturalHeight > 0)).toBe(true);
 await expect(image).toHaveAttribute('alt', /\S/);
 await expect(page.locator('#home-gallery-caption')).toHaveText(await image.getAttribute('alt'));
}

test('all twelve homepage work cards open their full album without leaving the page', async ({ page }) => {
 await openHome(page);
 const originalURL = page.url();
 await expect(page.locator('.home-portfolio-card[data-home-album]')).toHaveCount(6);
 await expect(page.locator('.sample-card[data-home-album]')).toHaveCount(6);
 const gravelRoadCard = triggerFor(page, 'gravel-road');
 await expect(gravelRoadCard.locator('h3')).toHaveText('ถนนหินคลุก บดอัด');
 await expect(gravelRoadCard.locator('.home-portfolio-count')).toHaveText('23 ภาพ');
 await expect(gravelRoadCard.locator('img')).toHaveAttribute('src', path('images/home-gravel-road-alley-01-20261030.jpg'));
 for (const section of ['.home-portfolio-card', '.sample-card']) {
  for (const album of albums) {
   const trigger = triggerFor(page, album.id, section);
   await expect(trigger).toHaveAttribute('href', path(`projects.html#${album.id}`));
   await trigger.scrollIntoViewIfNeeded();
   const scroll = await page.evaluate(() => ({ x:scrollX, y:scrollY }));
   await trigger.click();
   await expect(page.locator('#home-gallery')).toBeVisible();
   await expect(page.locator('#home-gallery-title')).toHaveText(album.title);
   await expect(page.locator('#home-gallery-count')).toHaveAttribute('role', 'status');
   await expect(page.locator('#home-gallery-thumbnails button')).toHaveCount(album.count);
   await expectPhoto(page, album.first, 1, album.count);
   await expect(page).toHaveURL(originalURL);
   await closeButton(page).click();
   await expect(page.locator('#home-gallery')).not.toBeVisible();
   await expect(trigger).toBeFocused();
   await expect.poll(() => page.evaluate(() => ({ x:scrollX, y:scrollY }))).toEqual(scroll);
  }
 }
});

test('homepage album supports looping, arrow keys, thumbnails and modal keyboard focus', async ({ page }) => {
 await openHome(page);
 const trigger = triggerFor(page, 'asphalt-road');
 await trigger.focus();
 await page.keyboard.press('Enter');
 await expectPhoto(page, 'asphalt-job-01.webp', 1, 29);
 await previousButton(page).click();
 await expectPhoto(page, 'asphalt-job-29.webp', 29, 29);
 await nextButton(page).click();
 await expectPhoto(page, 'asphalt-job-01.webp', 1, 29);
 await page.keyboard.press('ArrowRight');
 await expectPhoto(page, 'asphalt-job-02.webp', 2, 29);
 await page.keyboard.press('ArrowLeft');
 await expectPhoto(page, 'asphalt-job-01.webp', 1, 29);
 const thumbnail = page.getByRole('button', { name:/^เลือกภาพที่ 4:/ });
 await thumbnail.click();
 await expectPhoto(page, 'asphalt-job-04.webp', 4, 29);
 await expect(thumbnail).toHaveAttribute('aria-current', 'true');
 await expect(thumbnail).toBeFocused();
 const controls = page.locator('#home-gallery button:not(:disabled)');
 await controls.first().focus();
 await page.keyboard.press('Shift+Tab');
 await expect(controls.last()).toBeFocused();
 await page.keyboard.press('Tab');
 await expect(controls.first()).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(page.locator('#home-gallery')).not.toBeVisible();
 await expect(trigger).toBeFocused();
});

test('a mobile homepage album responds to trusted swipes and returns to its card', async ({ browser, baseURL }) => {
 const context = await browser.newContext({ baseURL, viewport:{ width:390, height:900 }, isMobile:true, hasTouch:true, reducedMotion:'reduce' });
 try {
  const page = await context.newPage();
  await openHome(page);
  const originalURL = page.url();
  const trigger = triggerFor(page, 'parking-marking');
  await trigger.scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => scrollY);
  await trigger.tap();
  await expectPhoto(page, 'projects-marking-cover.webp', 1, 16);
  const session = await context.newCDPSession(page);
  const swipe = async direction => {
   const stage = await page.locator('#home-gallery-image').boundingBox();
   const start = stage.x + stage.width * (direction === 'left' ? .8 : .2);
   const end = stage.x + stage.width * (direction === 'left' ? .2 : .8);
   await session.send('Input.synthesizeScrollGesture', { x:start, y:stage.y + stage.height / 2, xDistance:end - start, yDistance:0, gestureSourceType:'touch', speed:700 });
  };
  await swipe('left');
  await expectPhoto(page, 'marking-job.webp', 2, 16);
  await swipe('right');
  await expectPhoto(page, 'projects-marking-cover.webp', 1, 16);
  await expect(page).toHaveURL(originalURL);
  await closeButton(page).tap();
  await expect(page.locator('#home-gallery')).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(scroll);
  await session.detach();
 } finally { await context.close(); }
});

test('homepage gallery stays inside small portrait and landscape screens with reachable controls', async ({ browser, baseURL }) => {
 for (const viewport of [{ width:320, height:720 }, { width:844, height:390 }]) {
  const context = await browser.newContext({ baseURL, viewport, isMobile:true, hasTouch:true, reducedMotion:'reduce' });
  try {
   const page = await context.newPage();
   await openHome(page);
   const openAlbum = triggerFor(page, 'stone-yard').locator('.home-portfolio-link');
   await openAlbum.evaluate(element => element.scrollIntoView({ block:'end' }));
   await openAlbum.tap();
   await expectPhoto(page, 'stone-home-01.webp', 1, 15);
   const dialog = await page.locator('#home-gallery').boundingBox();
   expect(dialog.x).toBeGreaterThanOrEqual(0);
   expect(dialog.y).toBeGreaterThanOrEqual(0);
   expect(dialog.x + dialog.width).toBeLessThanOrEqual(viewport.width + 1);
   expect(dialog.y + dialog.height).toBeLessThanOrEqual(viewport.height + 1);
   for (const control of [previousButton(page), nextButton(page), closeButton(page)]) {
    await control.scrollIntoViewIfNeeded();
    const box = await control.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
   }
   await closeButton(page).tap();
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
   await openAlbum.evaluate(element => element.scrollIntoView({ block:'end' }));
   await openAlbum.tap();
   await expect(page.locator('#home-gallery')).toBeVisible();
   await expect.poll(() => page.locator('#home-gallery').evaluate(dialog => dialog.scrollTop)).toBe(0);
   await closeButton(page).tap();
  } finally { await context.close(); }
 }
});

test('modified homepage work clicks retain their original open-in-a-new-tab destination', async ({ page, context }) => {
 await openHome(page);
 const originalURL = page.url();
 const newTab = context.waitForEvent('page');
 await triggerFor(page, 'asphalt-road').click({ modifiers:['Control'] });
 const destination = await newTab;
 try {
  await expect(destination).toHaveURL(new URL(path('projects.html#asphalt-road'), originalURL).href);
  await expect(page).toHaveURL(originalURL);
  await expect(page.locator('#home-gallery')).not.toBeVisible();
 } finally { await destination.close(); }
});

test('homepage portfolio links still open the project album when JavaScript is disabled', async ({ browser, baseURL }) => {
 const context = await browser.newContext({ baseURL, javaScriptEnabled:false });
 try {
  const page = await context.newPage();
  await page.goto(path('index.html'));
  await triggerFor(page, 'asphalt-road').click();
  await expect(page).toHaveURL(/\/projects\.html#asphalt-road$/);
  await expect(page.locator('#asphalt-road')).toBeVisible();
 } finally { await context.close(); }
});

test('all six homepage portfolio cards keep equal photo and outer frames at every breakpoint', async ({ page }) => {
 for (const width of [320, 390, 768, 1440]) {
  await page.setViewportSize({ width, height:1000 });
  await openHome(page);
  const layout = await page.locator('.home-portfolio-grid').evaluate(grid => {
   const bounds = element => {
    const rect = element.getBoundingClientRect();
    return { x:rect.x, y:rect.y, width:rect.width, height:rect.height };
   };
   return { grid:bounds(grid), cards:[...grid.querySelectorAll('.home-portfolio-card')].map(card => ({ card:bounds(card), photo:bounds(card.querySelector('.home-portfolio-photo')) })) };
  });
  expect(layout.cards).toHaveLength(6);
  const first = layout.cards[0];
  for (const { card, photo } of layout.cards) {
   expect(Math.abs(card.width - first.card.width)).toBeLessThanOrEqual(1);
   expect(Math.abs(card.height - first.card.height)).toBeLessThanOrEqual(1);
   expect(Math.abs(photo.width - first.photo.width)).toBeLessThanOrEqual(1);
   expect(Math.abs(photo.height - first.photo.height)).toBeLessThanOrEqual(1);
   expect(card.x).toBeGreaterThanOrEqual(0);
   expect(card.x + card.width).toBeLessThanOrEqual(width + 1);
   expect(photo.width).toBeGreaterThan(0);
   expect(photo.height).toBeGreaterThan(0);
  }
  const rows = [];
  for (const { card } of layout.cards) {
   let row = rows.find(items => Math.abs(items[0].y - card.y) <= 1);
   if (!row) { row = []; rows.push(row); }
   row.push(card);
  }
  expect(rows.map(row => row.length)).toEqual(width <= 760 ? [1, 1, 1, 1, 1, 1] : width <= 1100 ? [2, 2, 2] : [3, 3]);
  if (width > 1100) {
   const lastRow = rows.at(-1);
   const left = Math.min(...lastRow.map(card => card.x));
   const right = Math.max(...lastRow.map(card => card.x + card.width));
   expect(Math.abs((left + right) / 2 - (layout.grid.x + layout.grid.width / 2))).toBeLessThanOrEqual(1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 }
});

test('homepage album viewer keeps fixed dialog and photo frames across all albums and image shapes', async ({ browser, baseURL }) => {
 test.setTimeout(60000);
 for (const viewport of [{ width:390, height:900 }, { width:1440, height:1000 }, { width:844, height:390 }]) {
  const mobile = viewport.width < 1000;
  const context = await browser.newContext({ baseURL, viewport, isMobile:mobile, hasTouch:mobile, reducedMotion:'reduce' });
  try {
   const page = await context.newPage();
   await openHome(page);
   let reference;
   const expectStableFrames = async () => {
    const boxes = { dialog:await page.locator('#home-gallery').boundingBox(), stage:await page.locator('#home-gallery-image').boundingBox() };
    if (!reference) reference = boxes;
    for (const name of ['dialog', 'stage']) {
     for (const dimension of ['x', 'y', 'width', 'height']) {
      expect(Math.abs(boxes[name][dimension] - reference[name][dimension])).toBeLessThanOrEqual(1);
     }
     expect(boxes[name].width).toBeGreaterThan(0);
     expect(boxes[name].height).toBeGreaterThan(0);
     expect(boxes[name].x).toBeGreaterThanOrEqual(0);
     expect(boxes[name].y).toBeGreaterThanOrEqual(0);
     expect(boxes[name].x + boxes[name].width).toBeLessThanOrEqual(viewport.width + 1);
     expect(boxes[name].y + boxes[name].height).toBeLessThanOrEqual(viewport.height + 1);
    }
    await expect(page.locator('#home-gallery-image img')).toHaveCSS('object-fit', 'contain');
    for (const control of [previousButton(page), nextButton(page), closeButton(page)]) {
     const box = await control.boundingBox();
     expect(box.width).toBeGreaterThanOrEqual(44);
     expect(box.height).toBeGreaterThanOrEqual(44);
     expect(box.x).toBeGreaterThanOrEqual(0);
     expect(box.y).toBeGreaterThanOrEqual(0);
     expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
     expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    }
   };
   for (const album of albums) {
    const caption = triggerFor(page, album.id, '.sample-card').locator('h3');
    await caption.evaluate(element => element.scrollIntoView({ block:'end' }));
    if (mobile) await caption.tap(); else await caption.click();
    await expectPhoto(page, album.first, 1, album.count);
    await expectStableFrames();
    await previousButton(page).click();
    await expectPhoto(page, album.last, album.count, album.count);
    await expectStableFrames();
    await nextButton(page).click();
    await expectPhoto(page, album.first, 1, album.count);
    await expectStableFrames();
    await closeButton(page).click();
    await expect(page.locator('#home-gallery')).not.toBeVisible();
   }
  } finally { await context.close(); }
 }
});
