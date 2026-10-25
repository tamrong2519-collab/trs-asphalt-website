import { test, expect } from '@playwright/test';
import { expectPrimaryContactAccess } from './contact-assertions.js';

const path = route => `${process.env.SITE_BASE || '/'}${route}`;

test('secondary estimate form includes gravel roads and rejects unusable phone numbers', async ({ page }) => {
 await page.goto(path('contact.html?service=gravel-road#estimate'));
 await expect(page.locator('#estimate-form')).toBeVisible();
 await expect(page.locator('#service')).toHaveValue('gravel-road');
 const choices = await page.locator('#service option').evaluateAll(options => options.filter(option => option.value).map(option => option.value));
 expect(choices).toHaveLength(6);
 expect(choices).toContain('gravel-road');
 await page.locator('#customer').fill('คุณทดสอบ');
 await page.locator('#location').fill('กรุงเทพมหานคร');
 const phone = page.locator('#phone');
 const generate = page.getByRole('button', { name: 'สร้างข้อความขอประเมินราคา' });
 for (const invalid of ['abc', '--------', '123']) {
  await phone.fill(invalid);
  await generate.click();
  expect(await phone.evaluate(element => element.checkValidity()), invalid).toBe(false);
  await expect(page.locator('#estimate-result')).not.toBeVisible();
 }
 for (const valid of ['02-123-4567', '062-248-4089', '+66 62 248 4089']) {
  await phone.fill(valid);
  await generate.click();
  expect(await phone.evaluate(element => element.checkValidity()), valid).toBe(true);
  await expect(page.locator('#estimate-result')).toBeVisible();
  await expect(page.locator('#message')).toHaveValue(/คุณทดสอบ[\s\S]*ถนนหินคลุก บดอัด/);
  expect(await page.locator('#message').inputValue()).toContain(valid);
 }
});

for (const scenario of [
 { name: 'desktop portfolio link', width: 1440, route: 'index.html', selector: '.blue-section .section-heading .button', shortcut: 1, href: 'projects.html' },
 { name: 'mobile service CTA phone link', width: 390, route: 'services.html', selector: '.paired-cta .paired-phone', shortcut: 0, href: 'tel:0622484089' },
]) {
 test(`floating contacts stay fixed while scrolling past the ${scenario.name}`, async ({ page }) => {
  await page.setViewportSize({ width: scenario.width, height: 900 });
  await page.goto(path(scenario.route));
  await page.evaluate(() => document.fonts.ready);
  await expectPrimaryContactAccess(page);
  const target = page.locator(scenario.selector);
  await expect(target).toHaveAttribute('href', scenario.href.startsWith('tel:') ? scenario.href : path(scenario.href));
  // Place the real link level with the shortcut. Keep the click within the
  // link even when its current layout clears the shortcut horizontally.
  const dockCenter = await page.locator('.floating-contact a').nth(scenario.shortcut).evaluate(element => {
   const rect = element.getBoundingClientRect();
   return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });
  await target.evaluate((element, y) => {
   const rect = element.getBoundingClientRect();
   window.scrollTo({ top: scrollY + rect.top + rect.height / 2 - y, behavior: 'instant' });
  }, dockCenter.y);
  await expect.poll(() => target.evaluate(element => {
   const rect = element.getBoundingClientRect();
   return rect.top + rect.height / 2;
  })).toBeCloseTo(dockCenter.y, 0);
  const shortcut = page.locator('.floating-contact a').nth(scenario.shortcut);
  const href = scenario.shortcut === 0 ? 'tel:0622484089' : 'https://line.me/ti/p/%40138wlldt';
  await expect(shortcut).toBeVisible();
  await expect(shortcut).toHaveAttribute('href', href);
  await expect.poll(() => shortcut.evaluate((element, point) => element.contains(document.elementFromPoint(point.x, point.y)), dockCenter)).toBe(true);
  const anchored = await shortcut.boundingBox();
  expect(anchored.x + anchored.width / 2).toBeCloseTo(dockCenter.x, 1);
  expect(anchored.y + anchored.height / 2).toBeCloseTo(dockCenter.y, 1);
  if (scenario.width <= 760) {
   const box = await target.boundingBox();
   expect(dockCenter.x).toBeGreaterThanOrEqual(box.x);
   expect(dockCenter.x).toBeLessThanOrEqual(box.x + box.width);
  }
  // Keep contact activation local, without launching a call or a LINE tab.
  await shortcut.evaluate(element => element.addEventListener('click', event => {
   window.clickedContact = element.getAttribute('href');
   event.preventDefault();
  }, { once: true }));
  await shortcut.click();
  expect(await page.evaluate(() => window.clickedContact)).toBe(href);
 });
}

test('mobile cards download responsive photos while albums retain the originals', async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 900 });
 await page.goto(path('index.html'));
 const card = page.locator('.home-services .service-card').first();
 const image = card.locator('img');
 await image.scrollIntoViewIfNeeded();
 await image.evaluate(element => element.decode());
 await expect(image).toHaveAttribute('srcset', /\d+w/);
 await expect(image).toHaveAttribute('sizes', /.+/);
 const source = await image.evaluate(element => ({ chosen: element.currentSrc, original: element.src }));
 expect(source.chosen).not.toBe(source.original);
 await card.click();
 await expect(page).toHaveURL(/\/asphalt\/$/);
 await page.goto(path('services.html#asphalt'));
 await page.locator('#asphalt .text-link').click();
 await page.locator('#asphalt-road .project-gallery-open').click();
 await expect(page.locator('#lightbox-image img')).toHaveAttribute('src', new URL(path('images/asphalt-job-01.webp'), page.url()).href);
 await expect(page.locator('#lightbox-image img')).not.toHaveAttribute('srcset', /.+/);
});

test('contact shortcuts remain visible after pointer focus, keyboard focus and form editing', async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 600 });
 await page.goto(path('services.html'));
 await page.evaluate(() => document.fonts.ready);
 // Start over a work photo, clear of the service links and copy whose
 // positions change as the page content grows.
 const dockCenter = await page.locator('.floating-contact').evaluate(element => {
  const rect = element.getBoundingClientRect();
  return rect.top + rect.height / 2;
 });
 await page.locator('.paired-photo').first().evaluate((element, y) => {
  const rect = element.getBoundingClientRect();
  scrollTo({ top: scrollY + rect.top + rect.height / 2 - y, behavior: 'instant' });
 }, dockCenter);
 const shortcut = page.locator('.floating-contact a').first();
 await expect(shortcut).toBeVisible();
 // Keep the click local: test pointer focus without starting a phone call.
 await shortcut.evaluate(element => element.addEventListener('click', event => event.preventDefault(), { once: true }));
 await shortcut.click();
 await expect(shortcut).toBeFocused();
 expect(await shortcut.evaluate(element => element.matches(':focus-visible'))).toBe(false);
 await page.setViewportSize({ width: 390, height: 900 });
 const point = await shortcut.evaluate(element => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
 });
 const nextAction = page.locator('.paired-cta .paired-phone');
 await expect(nextAction).toHaveAttribute('href', 'tel:0622484089');
 await nextAction.evaluate((element, y) => {
  const rect = element.getBoundingClientRect();
  scrollTo({ top: scrollY + rect.top + rect.height / 2 - y, behavior: 'instant' });
 }, point.y);
 await expect(shortcut).toBeVisible();
 await expect.poll(() => shortcut.evaluate((element, point) => element.contains(document.elementFromPoint(point.x, point.y)), point)).toBe(true);
 await page.keyboard.press('Tab');
 const lineShortcut = page.locator('.floating-contact a').nth(1);
 await expect(lineShortcut).toBeFocused();
 expect(await lineShortcut.evaluate(element => element.matches(':focus-visible'))).toBe(true);
 await page.goto(path('contact.html#estimate'));
 await page.locator('#phone').focus();
 await expect(page.locator('#phone')).toBeFocused();
 await expect(page.locator('.floating-contact a').first()).toBeVisible();
 await expect(page.locator('.floating-contact a').nth(1)).toBeVisible();
 await expectPrimaryContactAccess(page);
});
