import { test, expect } from '@playwright/test';
import { business } from '../src/data.js';

const path = route => `${process.env.SITE_BASE || '/'}${route}`;
const siteURL = process.env.VITE_SITE_URL || business.siteUrl;
test.use({ reducedMotion:'reduce' });

async function expectReadableContactButtons(page) {
 const controls = await page.locator('.hero-primary-actions > .button, .contact-panel .actions > .button, .footer-contact > .button').evaluateAll(elements => {
  const luminance = color => color.match(/[\d.]+/g).slice(0,3).map(Number).map(channel => {
   const value = channel / 255;
   return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  }).reduce((sum,value,index) => sum + value * [.2126,.7152,.0722][index],0);
  return elements.map(element => {
   const style = getComputedStyle(element), rect = element.getBoundingClientRect();
   const values = [luminance(style.color),luminance(style.backgroundColor)].sort((a,b)=>a-b);
   return { text:element.textContent.trim(),contrast:(values[1]+.05)/(values[0]+.05),height:rect.height,clipped:element.scrollWidth>element.clientWidth+1 };
  });
 });
 expect(controls.length).toBeGreaterThan(0);
 for (const control of controls) {
  expect(control.contrast,control.text).toBeGreaterThanOrEqual(4.5);
  expect(control.height,control.text).toBeGreaterThanOrEqual(44);
  expect(control.clipped,control.text).toBe(false);
 }
}

for (const width of [320,390,1440]) {
 test(`urgent enquiries and service-to-gallery navigation work at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:950});
  await page.goto(path('index.html'));await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.hero-quote .urgent-work-note')).toHaveText('งานด่วนโทรได้เลย เครื่องจักรครบ เริ่มงานไว');
  await expect(page.locator('.hero-call')).toHaveAttribute('href','tel:0622484089');
  await expect(page.locator('.hero-line')).toHaveAttribute('href','https://line.me/ti/p/%40138wlldt');
  const actionsBeforeBenefits = await page.evaluate(()=>document.querySelector('.hero-primary-actions').getBoundingClientRect().bottom <= document.querySelector('.hero-benefits').getBoundingClientRect().top);
  expect(actionsBeforeBenefits).toBe(true);
  await expectReadableContactButtons(page);
  await page.locator('.home-services .service-card').first().click();
  await expect(page).toHaveURL(/\/asphalt\/$/);
  await expect(page.locator('main h1')).toBeVisible();
  const menuToggle = page.locator('.menu-toggle');
  if(await menuToggle.isVisible()) await menuToggle.click();
  await page.locator('.main-site-link').click();
  await expect(page.locator('.home-services')).toBeVisible();
  await page.goto(path('services.html'));
  await expect(page.locator('#asphalt .asphalt-detail-link')).toHaveAttribute('href',path('asphalt/'));
  await page.locator('#asphalt .asphalt-detail-link').click();
  await expect(page).toHaveURL(/\/asphalt\/$/);
  await page.goto(path('services.html'));
  const shortcuts = page.locator('.service-jump-links a');
  await expect(shortcuts).toHaveCount(6);
  await expect(page.locator('.paired-service .text-link')).toHaveCount(6);
  await shortcuts.last().click();await expect(page).toHaveURL(/#gravel-road$/);
  await page.locator('#gravel-road .text-link').click();
  await expect(page).toHaveURL(/\/projects\.html#gravel-road$/);
  await expect(page.locator('#gravel-road .project-facts')).toContainText('เกลี่ยปรับระดับและบดอัดถนนหินคลุก');
  const trigger = page.locator('#gravel-road .project-gallery-open');
  await trigger.click();await expect(page.locator('#lightbox')).toBeVisible();
  await expect(page.locator('#gallery-thumbnails button')).toHaveCount(20);
  await expect(page.locator('#gallery-thumbnails button img').first()).toBeVisible();
  await expect(page.locator('#gallery-thumbnails button img').first()).toHaveAttribute('src',/\/images\/thumbnails\//);
  const selected = page.locator('#gallery-thumbnails button').nth(19);
  await selected.click();
  await expect(page.locator('#image-count')).toHaveText('20 / 20');
  await expect(page.locator('#lightbox-image img')).toHaveAttribute('src',new URL(path('images/gravel-road-job-20.webp'),page.url()).href);
  await expect(selected).toHaveAttribute('aria-current','true');
  await expect(selected).toBeFocused();
  await page.keyboard.press('ArrowRight');await expect(page.locator('#image-count')).toHaveText('1 / 20');
  await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
  await page.goto(path('contact.html'));await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.contact-panel .urgent-work-note')).toHaveText('งานด่วนโทรได้เลย เครื่องจักรครบ เริ่มงานไว');
  await expectReadableContactButtons(page);
  if(width<=760) {
   const panelBeforePhoto = await page.evaluate(()=>document.querySelector('.contact-panel').getBoundingClientRect().bottom <= document.querySelector('.contact-photo').getBoundingClientRect().top);
   expect(panelBeforePhoto).toBe(true);
  }
 });
}

test('shared links expose real JPEG preview images before JavaScript runs',async({request})=>{
 for(const [route,image] of [['index','hero-sharp'],['services','services-hero'],['projects','marking-job'],['contact','hero-sharp']]) {
  const response=await request.get(path(`${route}.html`));expect(response.status()).toBe(200);
  const html=await response.text();
  expect(html).toContain(`property="og:image" content="${new URL(`images/share/${image}.jpg`, siteURL).href}"`);
  expect(html).toContain('property="og:image:type" content="image/jpeg"');
  expect(html).toContain('name="twitter:card" content="summary_large_image"');
  expect(html).not.toContain('https://preview.invalid');
 }
});
