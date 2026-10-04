import { test, expect } from '@playwright/test';

const routes = ['index', 'services', 'projects', 'contact'];
const path = route => `${process.env.SITE_BASE || '/'}${route}.html`;
const phone = 'tel:0622484089';
const line = 'https://line.me/ti/p/%40138wlldt';

// Check the rendered foreground against the solid surface behind ordinary copy.
// Photos and gradients require visual review, so they are not approximated here.
async function inspectReadability(page) {
 return page.evaluate(() => {
  const visible = element => {
   const rect = element.getBoundingClientRect();
   return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden';
  };
  const rgba = value => {
   const channels = value.match(/[\d.]+/g)?.map(Number);
   return channels?.length >= 3 ? [...channels.slice(0, 3), channels[3] ?? 1] : null;
  };
  const blend = (foreground, background) => foreground.slice(0, 3).map((channel, index) => channel * foreground[3] + background[index] * (1 - foreground[3]));
  const luminance = color => color.map(channel => {
   const normalized = channel / 255;
   return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
  }).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
  const problems = [];
  const paragraphs = [...document.querySelectorAll('main p')].filter(visible);
  for (const element of paragraphs) {
   const style = getComputedStyle(element), font = parseFloat(style.fontSize);
   if (font < 16 || parseFloat(style.lineHeight) / font < 1.64 || !style.fontFamily.includes('Noto Sans Thai')) {
    problems.push({ text: element.textContent.trim(), problem: 'unreadable body typography', font, lineHeight: style.lineHeight, family: style.fontFamily });
   }
  }
  let contrastChecks = 0;
  const copy = document.querySelectorAll('main .card-content :is(p,h3), main .sample-card h3, main .project-caption :is(p,h2), main .project-copy :is(p,h2,h3), main .contact-panel :is(p,h2), main .info-card :is(p,h3), main .process-card :is(p,h3), main .service-detail :is(p,h2), main .checklist li, main .paired-copy :is(p,h2), main .paired-checks li, main .paired-process-grid :is(p,h3)');
  for (const element of [...copy].filter(visible)) {
   const layers = []; let gradient = false;
   for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    if (style.backgroundImage !== 'none') { gradient = true; break; }
    const color = rgba(style.backgroundColor);
    if (color) layers.push(color);
    if (color?.[3] === 1) break;
   }
   if (gradient) continue;
   const style = getComputedStyle(element), foreground = rgba(style.color);
   if (!foreground) continue;
   const background = layers.reverse().reduce((color, layer) => blend(layer, color), [255, 255, 255]);
   const values = [luminance(blend(foreground, background)), luminance(background)].sort((a, b) => a - b);
   const ratio = (values[1] + .05) / (values[0] + .05);
   const font = parseFloat(style.fontSize), large = font >= 24 || font >= 18.66 && parseFloat(style.fontWeight) >= 700;
   contrastChecks++;
   if (ratio < (large ? 3 : 4.5)) problems.push({ text: element.textContent.trim(), problem: 'low text contrast', ratio, foreground: style.color, background });
  }
  return { problems, contrastChecks, scrollWidth: document.documentElement.scrollWidth, innerWidth, scale: visualViewport.scale };
 });
}

for (const width of [320, 375, 390, 430, 768, 1440]) {
 test(`premium presentation remains cohesive and readable on all four pages at ${width}px`, async ({ browser, baseURL }) => {
  const mobile = width <= 430;
  const context = await browser.newContext({ baseURL, viewport: { width, height: 950 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  try {
   const page = await context.newPage(), errors = [];
   page.on('pageerror', error => errors.push(error.message));
   let sharedPresentation;
   for (const route of routes) {
    const response = await page.goto(path(route)); expect(response.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toBeVisible();
    const readability = await inspectReadability(page);
    expect(readability.problems, route).toEqual([]); expect(readability.contrastChecks, route).toBeGreaterThan(0);
    expect(readability.innerWidth).toBe(width); expect(readability.scrollWidth).toBeLessThanOrEqual(width);
    if (mobile) expect(readability.scale).toBeCloseTo(1, 3);
    if (route === 'services') {
     const rows = page.locator('.paired-service');
     await expect(rows).toHaveCount(5);
     await expect(page.locator('.feature-services')).toHaveCount(0);
     const pairedLayout = await rows.evaluateAll(items => items.map(element => {
      const photo = element.querySelector('.paired-photo').getBoundingClientRect();
      const copy = element.querySelector('.paired-copy').getBoundingClientRect();
      return { photo: { left: photo.left, right: photo.right, top: photo.top, bottom: photo.bottom, width: photo.width, height: photo.height }, copy: { left: copy.left, right: copy.right, top: copy.top, bottom: copy.bottom } };
     }));
     for (let index = 0; index < pairedLayout.length; index++) {
      const { photo, copy } = pairedLayout[index];
      expect(photo.width).toBeCloseTo(pairedLayout[0].photo.width, 0);
      expect(photo.height).toBeCloseTo(pairedLayout[0].photo.height, 0);
      if (mobile) {
       expect(copy.top - photo.bottom).toBeGreaterThanOrEqual(16);
       expect(copy.left).toBeCloseTo(photo.left, 0);
       expect(copy.right).toBeCloseTo(photo.right, 0);
      } else if (width === 1440) {
       expect(photo.top).toBeLessThan(copy.bottom);
       expect(copy.top).toBeLessThan(photo.bottom);
       expect(index % 2 === 0 ? copy.left - photo.right : photo.left - copy.right).toBeGreaterThanOrEqual(24);
      }
     }
    }
    if (route === 'projects') {
     const rows = page.locator('.project-row'); await expect(rows).toHaveCount(6);
     await expect(rows.first()).toHaveAttribute('data-category', 'asphalt');
     const projectLayout = await rows.evaluateAll(items => items.map(element => {
      const photo = element.querySelector('.project-cover').getBoundingClientRect();
      const copy = element.querySelector('.project-copy').getBoundingClientRect();
      return { photo: { left: photo.left, right: photo.right, top: photo.top, bottom: photo.bottom, width: photo.width, height: photo.height }, copy: { left: copy.left, right: copy.right, top: copy.top, bottom: copy.bottom } };
     }));
     for (let index = 0; index < projectLayout.length; index++) {
      const { photo, copy } = projectLayout[index];
      expect(photo.width).toBeCloseTo(projectLayout[0].photo.width, 0);
      expect(photo.height).toBeCloseTo(projectLayout[0].photo.height, 0);
      expect(photo.left).toBeGreaterThanOrEqual(16); expect(photo.right).toBeLessThanOrEqual(width - 16);
      if (mobile) {
       expect(copy.top - photo.bottom).toBeGreaterThanOrEqual(16);
       expect(copy.left).toBeCloseTo(photo.left, 0); expect(copy.right).toBeCloseTo(photo.right, 0);
      } else if (width === 1440) {
       expect(photo.top).toBeLessThan(copy.bottom); expect(copy.top).toBeLessThan(photo.bottom);
       expect(index % 2 === 0 ? copy.left - photo.right : photo.left - copy.right).toBeGreaterThanOrEqual(24);
      }
     }
    }
    await expect(page.locator('#main-nav [aria-current="page"]')).toHaveAttribute('href', path(route));
    await expect(page.locator('.header-call')).toHaveAttribute('href', phone);
    await expect(page.locator('.header-line')).toHaveAttribute('href', line);
    await expect(page.locator('.footer-phone')).toHaveAttribute('href', phone);
    await expect(page.locator('.footer-line')).toHaveAttribute('href', line);
    const presentation = await page.evaluate(() => ['.site-header', '.site-footer', '.header-call', '.header-line', '.footer-phone', '.footer-line'].map(selector => {
     const style = getComputedStyle(document.querySelector(selector));
     return { selector, background: style.backgroundColor, color: style.color, border: style.borderColor, radius: style.borderRadius, font: style.fontFamily };
    }));
    if (sharedPresentation) expect(presentation, `${route} uses the same shared components`).toEqual(sharedPresentation);
    else sharedPresentation = presentation;
    const actions = route === 'contact' ? page.locator('.contact-panel .actions a') : page.locator('.floating-contact a');
    await expect(actions).toHaveCount(2);
    await expect(actions.nth(0)).toHaveAttribute('href', phone); await expect(actions.nth(1)).toHaveAttribute('href', line);
    for (const action of await actions.all()) {
     await expect(action).toBeVisible();
     const geometry = await action.evaluate(element => {
      const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
      return { left: rect.left, right: rect.right, height: rect.height, nowrap: style.whiteSpace === 'nowrap', clipped: element.scrollWidth > element.clientWidth + 1 };
     });
     expect(geometry.left).toBeGreaterThanOrEqual(12); expect(geometry.right).toBeLessThanOrEqual(width - 12);
     expect(geometry.height).toBeGreaterThanOrEqual(44); expect(geometry.nowrap).toBe(true); expect(geometry.clipped).toBe(false);
    }
    if (mobile) {
     await expect(page.locator('.floating-contact')).toBeVisible();
     await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
     const clearFooter = await page.evaluate(() => document.querySelector('.footer-phone').getBoundingClientRect().bottom <= document.querySelector('.floating-contact').getBoundingClientRect().top);
     expect(clearFooter).toBe(true);
    }
   }
   expect(errors).toEqual([]);
  } finally { await context.close(); }
 });
}

test('premium homepage keeps all five automatic slides, matching photos and accessible controls', async ({ page }) => {
 await page.clock.install(); await page.goto(path('index'));
 await page.evaluate(() => document.fonts.ready);
 const hero = page.locator('.hero-home');
 await expect(hero.locator('.slide-dots,[data-slide]')).toHaveCount(0);
 const expectedPhotos = ['gravel-slide.webp', 'stone-job.webp', 'speed-bump-job.webp', 'marking-home.webp'];
 for (let index = 1; index <= 4; index++) {
  await page.clock.runFor(6001); await expect(hero).toHaveAttribute('data-active-slide', String(index));
  const image = hero.locator('.hero-scene img');
  await expect(image).toHaveAttribute('src', `${process.env.SITE_BASE || '/'}images/${expectedPhotos[index - 1]}`);
  await image.evaluate(element => element.decode());
  expect(await image.evaluate(element => element.naturalWidth)).toBeGreaterThanOrEqual(1200);
 }
 await page.clock.runFor(6001); await expect(hero).toHaveAttribute('data-active-slide', '0');
 await page.getByRole('button', { name: 'หยุดสไลด์อัตโนมัติ' }).click();
 await page.clock.runFor(12000); await expect(hero).toHaveAttribute('data-active-slide', '0');
 await page.getByRole('button', { name: 'สไลด์ถัดไป', exact: true }).click(); await expect(hero).toHaveAttribute('data-active-slide', '1');
 await page.getByRole('button', { name: 'สไลด์ก่อนหน้า', exact: true }).click(); await expect(hero).toHaveAttribute('data-active-slide', '0');
});

test('inner pages show the supplied work photos and gallery opens the selected full photo', async ({ page }) => {
 const jobs = [
  ['gravel', 'gravel-job.webp', 'ลานจอดรถหินคลุก'],
  ['stone', 'stone-job.webp', 'งานหินเกล็ด'],
  ['speed-bump', 'speed-bump-job.webp', 'ลูกระนาดยางมะตอย'],
  ['marking', 'marking-job.webp', 'ตีเส้นจราจร'],
 ];
 const servicePhotos = [
  ['asphalt', 'services-asphalt.webp', [1280, 720]],
  ['gravel', 'services-gravel.webp', [1280, 960]],
  ['stone', 'stone-job.webp', [1280, 960]],
  ['speed-bump', 'services-speed-bump.webp', [1280, 960]],
  ['marking', 'services-marking.webp', [1280, 960]],
 ];
 const projectPhotos = [
  ['gravel-yard', 'projects-gravel-cover.webp', [1280, 720]],
  ['stone-yard', 'stone-home-01.webp', [960, 1280]],
  ['speed-bump-work', 'projects-speed-bump-cover.webp', [1280, 1280]],
  ['parking-marking', 'projects-marking-cover.webp', [1280, 960]],
 ];
 const photoPath = file => `${process.env.SITE_BASE || '/'}images/${file}`;
 const loadedPhoto = async (image, file, expectedDimensions) => {
  await expect(image).toHaveAttribute('src', photoPath(file));
  await expect(image).toHaveAttribute('alt', /ภาพหน้างาน/);
  await image.scrollIntoViewIfNeeded(); await image.evaluate(element => element.decode());
  const dimensions = await image.evaluate(element => ({ width: element.naturalWidth, height: element.naturalHeight }));
  if (expectedDimensions) {
   expect([dimensions.width, dimensions.height]).toEqual(expectedDimensions);
   await expect(image).toHaveAttribute('width', String(expectedDimensions[0]));
   await expect(image).toHaveAttribute('height', String(expectedDimensions[1]));
  } else {
   expect(dimensions.width).toBeGreaterThanOrEqual(1200); expect(dimensions.height).toBeGreaterThanOrEqual(900);
  }
 };
 await page.goto(path('services'));
 await expect(page.locator('.paired-service')).toHaveCount(5);
 for (const [id, file, dimensions] of servicePhotos) {
  await loadedPhoto(page.locator(`.paired-service#${id} img`), file, dimensions);
 }
 for (const id of ['asphalt', ...jobs.map(([id]) => id)]) {
  const row = page.locator(`.paired-service#${id}`);
  await expect(row.locator('img')).toHaveCount(1);
  const estimateLink = row.locator('.paired-quote');
  await expect(estimateLink).toHaveText('ขอประเมินงานนี้');
  await expect(estimateLink).toHaveAccessibleName(/^ขอประเมินงาน.+/);
  await expect(estimateLink).toHaveAttribute('href', path('contact'));
 }
 await page.locator('.paired-service#gravel .paired-quote').click();
 await expect(page).toHaveURL(/\/contact\.html$/);
 await expect(page.locator('h1')).toHaveText('ติดต่อเรา');
 await expect(page.locator('.contact-panel')).toBeVisible();
 await expect(page.locator('#estimate-form')).not.toBeVisible();
 await page.goto(path('projects'));
 for (const [id, file, dimensions] of projectPhotos) await loadedPhoto(page.locator(`#${id} .project-cover img`), file, dimensions);
 await page.getByRole('button', { name: 'ลานจอดรถหินคลุก', exact: true }).click();
 await expect(page.locator('.project-row:visible')).toHaveCount(2);
 await page.locator('#gravel-yard .project-cover').click();
 await expect(page.locator('#lightbox')).toBeVisible();
 await expect(page.locator('#lightbox-image img')).toHaveAttribute('src', new URL(photoPath('projects-gravel-cover.webp'), page.url()).href);
 await expect(page.locator('#image-caption')).toHaveText('ภาพหน้างานลานจอดรถหินคลุกข้างอาคารและแนวต้นไม้');
 await page.getByRole('button', { name: 'ปิดภาพ' }).click(); await expect(page.locator('#lightbox')).not.toBeVisible();
 await page.goto(path('contact'));
 await loadedPhoto(page.locator('.contact-photo img'), 'gravel-slide.webp');
 await loadedPhoto(page.locator('.info-card').nth(1).locator('img'), 'gravel-job.webp');
 await loadedPhoto(page.locator('.info-card').nth(2).locator('img'), 'marking-job.webp');
});
