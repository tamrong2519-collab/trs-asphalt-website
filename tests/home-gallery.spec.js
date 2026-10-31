import { test, expect } from '@playwright/test';

const path = route => `${process.env.SITE_BASE || '/'}${route}`;
const albums = [
 { id:'asphalt-road', title:'งานลาดยางมะตอย', first:'asphalt-job-01.webp', last:'asphalt-job-29.webp', count:29 },
 { id:'gravel-yard', title:'งานลานจอดรถหินคลุก', first:'projects-gravel-cover.webp', last:'gravel-job-19.webp', count:20 },
 { id:'stone-yard', title:'งานหินเกล็ด', first:'stone-home-01.webp', last:'stone-home-05.webp', count:17 },
 { id:'speed-bump-work', title:'งานลูกระนาดยางมะตอย', first:'projects-speed-bump-cover.webp', last:'speed-bump-job-13.webp', count:14 },
 { id:'parking-marking', title:'งานตีเส้นจราจร', first:'projects-marking-cover.webp', last:'marking-job-15.webp', count:16 },
 { id:'gravel-road', title:'ถนนหินคลุก บดอัด', first:'home-gravel-road-alley-01-20261030.jpg', last:'gravel-road-job-20.webp', count:23 },
];
const triggerFor = (page, id, section = '.home-portfolio-photo') => page.locator(`${section}[data-home-album="${id}"]`).first();
const panelFor = (page, id) => page.locator(`#home-portfolio-panel-${id}`);
const categoryFor = (page, id) => page.locator(`[data-home-category="${id}"]`);

async function selectAlbum(page, id) {
 const tab = categoryFor(page, id);
 await tab.scrollIntoViewIfNeeded();
 await tab.click();
 await expect(tab).toHaveAttribute('aria-selected', 'true');
 await expect(panelFor(page, id)).toBeVisible();
 return panelFor(page, id);
}
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

test('homepage mosaic and six sample cards open each full album without leaving the page', async ({ page }) => {
 await openHome(page);
 const originalURL = page.url();
 await expect(page.locator('.home-portfolio-tabs [data-home-category]')).toHaveCount(6);
 await expect(page.locator('.sample-card[data-home-album]')).toHaveCount(6);
 for (const section of ['.home-portfolio-photo', '.sample-card']) {
  for (const album of albums) {
   if (section === '.home-portfolio-photo') {
    const panel = await selectAlbum(page, album.id);
    await expect(panel.locator('.home-portfolio-photo')).toHaveCount(album.count);
    await expect(panel.locator('.home-portfolio-photo img').first()).toHaveAttribute('src', path(`images/${album.first}`));
   }
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
  await selectAlbum(page, 'parking-marking');
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
   await selectAlbum(page, 'stone-yard');
   const openAlbum = triggerFor(page, 'stone-yard');
   await openAlbum.evaluate(element => element.scrollIntoView({ block:'end' }));
   await openAlbum.tap();
   await expectPhoto(page, 'stone-home-01.webp', 1, 17);
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

test('homepage mosaic matches the featured photo and equal small tiles at every breakpoint', async ({ page }) => {
 for (const width of [320, 390, 768, 1440]) {
  await page.setViewportSize({ width, height:1000 });
  await openHome(page);
  const layout = await panelFor(page, 'asphalt-road').locator('.home-portfolio-grid').evaluate(grid => {
   const bounds = element => {
    const rect = element.getBoundingClientRect();
    return { x:rect.x, y:rect.y, width:rect.width, height:rect.height };
   };
   return {
    grid:bounds(grid),
    columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,
    gap:parseFloat(getComputedStyle(grid).columnGap),
    rowGap:parseFloat(getComputedStyle(grid).rowGap),
    photos:[...grid.querySelectorAll('.home-portfolio-photo')].map(photo => ({ ...bounds(photo), fit:getComputedStyle(photo.querySelector('img')).objectFit })),
   };
  });
  expect(layout.photos).toHaveLength(29);
  expect(layout.columns).toBe(width <= 760 ? 3 : 6);
  const featured = layout.photos[0], normal = layout.photos[1], featuredColumns = width <= 760 ? 2 : 3;
  expect(Math.abs(featured.width - (normal.width * featuredColumns + layout.gap * (featuredColumns - 1)))).toBeLessThanOrEqual(1);
  expect(Math.abs(featured.height - (normal.height * 2 + layout.rowGap))).toBeLessThanOrEqual(1);
  for (const [index, photo] of layout.photos.entries()) {
   expect(photo.x).toBeGreaterThanOrEqual(0);
   expect(photo.x + photo.width).toBeLessThanOrEqual(width + 1);
   expect(photo.width).toBeGreaterThan(0);
   expect(photo.height).toBeGreaterThan(0);
   expect(photo.fit).toBe('cover');
   if (index === 0 || (width > 760 && index === 7)) continue;
   expect(Math.abs(photo.width - normal.width)).toBeLessThanOrEqual(1);
   expect(Math.abs(photo.height - normal.height)).toBeLessThanOrEqual(1);
  }
  for (const tab of await page.locator('.home-portfolio-tabs [data-home-category]').all()) {
   const box = await tab.boundingBox();
   expect(box.height).toBeGreaterThanOrEqual(44);
   expect(box.x).toBeGreaterThanOrEqual(0);
   expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 }
});

test('homepage categories support keyboard selection and show accurate photo counts without navigation', async ({ page }) => {
 await openHome(page);
 const originalURL = page.url();
 const tabs = page.locator('.home-portfolio-tabs [data-home-category]');
 await expect(tabs).toHaveCount(6);
 await expect(categoryFor(page, 'asphalt-road')).toHaveAttribute('role', 'tab');
 await expect(categoryFor(page, 'asphalt-road')).toHaveAttribute('aria-selected', 'true');
 await categoryFor(page, 'asphalt-road').focus();
 await page.keyboard.press('ArrowRight');
 await expect(categoryFor(page, 'gravel-yard')).toBeFocused();
 await expect(categoryFor(page, 'gravel-yard')).toHaveAttribute('aria-selected', 'true');
 await expect(panelFor(page, 'gravel-yard')).toBeVisible();
 await page.keyboard.press('End');
 await expect(categoryFor(page, 'gravel-road')).toBeFocused();
 await expect(panelFor(page, 'gravel-road')).toBeVisible();
 await page.keyboard.press('ArrowRight');
 await expect(categoryFor(page, 'asphalt-road')).toBeFocused();
 await page.keyboard.press('ArrowLeft');
 await expect(categoryFor(page, 'gravel-road')).toBeFocused();
 await page.keyboard.press('Home');
 await expect(categoryFor(page, 'asphalt-road')).toBeFocused();
 for (const album of albums) {
  const panel = await selectAlbum(page, album.id);
  await expect(categoryFor(page, album.id)).toHaveText(new RegExp(`\\b${album.count}\\b`));
  await expect(page.locator('.home-portfolio-tabs [aria-selected="true"]')).toHaveCount(1);
  await expect(page.locator('.home-portfolio-tabs [tabindex="0"]')).toHaveCount(1);
  await expect(page.locator('.home-portfolio-panel:visible')).toHaveCount(1);
  await expect(panel).toHaveAttribute('role', 'tabpanel');
  await expect(panel.locator('.home-portfolio-photo')).toHaveCount(album.count);
  await expect(page).toHaveURL(originalURL);
 }
});

test('existing direct portfolio links select the matching category without changing their hash', async ({ page }) => {
 await page.route(/https?:\/\/(?:[^/]+\.)?(?:googletagmanager\.com|google-analytics\.com|googleadservices\.com|doubleclick\.net)\//, route => route.abort());
 await page.goto(path('index.html#home-portfolio-card-gravel-road'));
 await page.evaluate(() => document.fonts.ready);
 await expect(categoryFor(page, 'gravel-road')).toHaveAttribute('aria-selected', 'true');
 await expect(categoryFor(page, 'gravel-road')).toHaveAttribute('tabindex', '0');
 const panel = panelFor(page, 'gravel-road');
 await expect(panel).toBeVisible();
 await expect(page.locator('.home-portfolio-panel:visible')).toHaveCount(1);
 await expect(panel.locator('.home-portfolio-photo')).toHaveCount(23);
 for (let index = 0; index < 3; index += 1) {
  await expect(panel.locator(`[data-home-photo-index="${index}"] img`)).toHaveAttribute('src', path(`images/home-gravel-road-alley-${String(index + 1).padStart(2, '0')}-20261030.jpg`));
 }
 await expect(page).toHaveURL(/#home-portfolio-card-gravel-road$/);
});

test('a mosaic photo opens its own position in the full album and retains the supplied road photos', async ({ page }) => {
 await openHome(page);
 const originalURL = page.url();
 const asphalt = await selectAlbum(page, 'asphalt-road');
 const fourth = asphalt.locator('[data-home-photo-index="3"]');
 await fourth.scrollIntoViewIfNeeded();
 const before = await page.evaluate(() => scrollY);
 await fourth.click();
 await expectPhoto(page, 'asphalt-job-04.webp', 4, 29);
 await closeButton(page).click();
 await expect(fourth).toBeFocused();
 await expect.poll(() => page.evaluate(() => scrollY)).toBe(before);
 const road = await selectAlbum(page, 'gravel-road');
 for (let index = 0; index < 3; index += 1) {
  const trigger = road.locator(`[data-home-photo-index="${index}"]`);
  const file = `home-gravel-road-alley-${String(index + 1).padStart(2, '0')}-20261030.jpg`;
  await expect(trigger.locator('img')).toHaveAttribute('src', path(`images/${file}`));
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expectPhoto(page, file, index + 1, 23);
  await closeButton(page).click();
  await expect(trigger).toBeFocused();
 }
 await expect(page).toHaveURL(originalURL);
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
