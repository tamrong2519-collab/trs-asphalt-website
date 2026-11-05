import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Measured from the published site before adding the phone contact name.
const baseline = JSON.parse(readFileSync(new URL('./fixtures/phone-frames.json', import.meta.url)));

for (const width of [320, 390, 768, 1024, 1440]) {
 test(`phone contact names fit the original frames on all 11 pages at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const previous of baseline.filter(item => item.width === width)) {
   const route = `${process.env.SITE_BASE || '/'}${previous.route.slice(1)}`;
   await page.goto(route);
   await page.evaluate(() => document.fonts.ready);
   const result = await page.evaluate(() => {
    const size = element => {
     const box = element.getBoundingClientRect();
     return { width: box.width, height: box.height };
    };
    return {
     overflow: document.documentElement.scrollWidth > innerWidth,
     headerHeight: size(document.querySelector('.site-header')).height,
     footerHeight: size(document.querySelector('.site-footer')).height,
     phones: [...document.querySelectorAll('a[href^="tel:"]')].map(link => {
      const frame = link.closest('.contact-box,.cta-phone,.company-location-row') || link;
      const bounds = frame.getBoundingClientRect();
      const copy = link.querySelector('.phone-button-copy,.phone-inline-copy');
      const label = copy?.querySelector('.phone-button-number');
      const name = copy?.querySelector('.phone-button-name');
      const icon = copy?.querySelector('svg');
      const expectsIcon = copy?.classList.contains('phone-button-copy');
      const numberBox = label?.getBoundingClientRect(), nameBox = name?.getBoundingClientRect();
      return {
       frame: size(frame), href: link.getAttribute('href'), aria: link.getAttribute('aria-label'),
       visibleNumber: copy ? label?.textContent : link.innerText.trim(),
       numberWeight: label ? getComputedStyle(label).fontWeight : null,
       name: name?.textContent,
       iconVisible: !expectsIcon || Boolean(icon && icon.getBoundingClientRect().width > 0 && getComputedStyle(icon).visibility === 'visible'),
       fits: !copy || (numberBox.left >= bounds.left - 1 && nameBox.right <= bounds.right + 1
        && numberBox.top >= bounds.top - 1 && nameBox.bottom <= bounds.bottom + 1),
       sameLine: !copy || Math.max(numberBox.top, nameBox.top) < Math.min(numberBox.bottom, nameBox.bottom),
      };
     }),
    };
   });
   expect(result.overflow, route).toBe(false);
   expect(Math.abs(result.headerHeight - previous.headerHeight), route).toBeLessThan(1);
   expect(Math.abs(result.footerHeight - previous.footerHeight), route).toBeLessThan(1);
   expect(result.phones.length, route).toBe(previous.frames.length);
   result.phones.forEach((phone, index) => {
    const note = `${route}: phone ${index + 1}`;
    expect(phone.href, note).toBe('tel:0622484089');
    expect(phone.aria, note).toContain('ช่างหมู');
    if (phone.visibleNumber) {
     expect(phone.visibleNumber, note).toContain('062-248-4089');
     expect(phone.name, note).toBe('ช่างหมู');
     expect(phone.numberWeight, note).toBe('700');
    }
    expect(phone.fits, note).toBe(true);
    expect(phone.iconVisible, note).toBe(true);
    expect(phone.sameLine, note).toBe(true);
    for (const dimension of ['width', 'height']) {
     expect(Math.abs(phone.frame[dimension] - previous.frames[index][dimension]), `${note}: ${dimension}`).toBeLessThan(1);
    }
   });
  }
 });
}
