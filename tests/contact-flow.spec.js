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
 test(`floating contacts do not intercept the ${scenario.name}`, async ({ page }) => {
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
  const box = await target.boundingBox();
  const point = { x: Math.min(box.x + box.width - 8, Math.max(box.x + 8, dockCenter.x)), y: dockCenter.y };
  await expect.poll(() => target.evaluate((element, point) => element.contains(document.elementFromPoint(point.x, point.y)), point)).toBe(true);
  if (scenario.href.startsWith('tel:')) {
   await page.evaluate(() => {
    document.addEventListener('click', event => {
     const link = event.target.closest('a');
     window.clickedContact = link?.getAttribute('href');
     event.preventDefault();
    }, { once: true });
   });
   await page.mouse.click(point.x, point.y);
   expect(await page.evaluate(() => window.clickedContact)).toBe(scenario.href);
  } else {
   await page.mouse.click(point.x, point.y);
   await expect(page).toHaveURL(new URL(path(scenario.href), page.url()).href);
  }
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
 await expect(page).toHaveURL(/\/services\.html#asphalt$/);
 await page.locator('#asphalt .text-link').click();
 await page.locator('#asphalt-road .project-gallery-open').click();
 await expect(page.locator('#lightbox-image img')).toHaveAttribute('src', new URL(path('images/asphalt-job-01.webp'), page.url()).href);
 await expect(page.locator('#lightbox-image img')).not.toHaveAttribute('srcset', /.+/);
});

test('mouse focus on a contact shortcut does not leave it covering the next action', async ({ page }) => {
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
 await expect.poll(() => nextAction.evaluate((element, point) => element.contains(document.elementFromPoint(point.x, point.y)), point)).toBe(true);
 await expectPrimaryContactAccess(page);
});
