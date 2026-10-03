import { test, expect } from '@playwright/test';

const homePath = `${process.env.SITE_BASE || '/'}index.html`;
const widths = [320, 375, 390, 430, 768, 853, 1024, 1440];

// Inspect rendered text after Thai fonts load, rather than assuming a particular
// heading structure or asserting the CSS used to make the copy readable.
async function inspectCopy(page, selector, minimumFontSize) {
 return page.locator(selector).evaluateAll((elements, minimum) => {
  const tolerance = 1;
  const clips = value => value === 'hidden' || value === 'clip';
  const problems = [];
  for (const element of elements) {
   const bounds = element.getBoundingClientRect();
   const style = getComputedStyle(element);
   if (!element.textContent.trim() || !bounds.width || !bounds.height || style.visibility === 'hidden') continue;
   const text = element.textContent.trim();
   if (minimum && parseFloat(style.fontSize) < minimum) {
    problems.push({ text, problem: 'small text', fontSize: style.fontSize });
   }
   if (element.scrollWidth > element.clientWidth + tolerance || element.scrollHeight > element.clientHeight + tolerance) {
    problems.push({ text, problem: 'text exceeds its available space' });
   }
   const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
   let node;
   while ((node = walker.nextNode())) {
    if (!node.textContent.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
     if (!rect.width || !rect.height) continue;
     if (rect.left < bounds.left - tolerance || rect.right > bounds.right + tolerance || rect.left < -tolerance || rect.right > innerWidth + tolerance) {
      problems.push({ text, problem: 'text overflows horizontally' });
     }
     for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      const parentStyle = getComputedStyle(parent);
      const parentBounds = parent.getBoundingClientRect();
      const clippedX = clips(parentStyle.overflowX) && (rect.left < parentBounds.left - tolerance || rect.right > parentBounds.right + tolerance);
      const clippedY = clips(parentStyle.overflowY) && (rect.top < parentBounds.top - tolerance || rect.bottom > parentBounds.bottom + tolerance);
      if (clippedX || clippedY) {
       problems.push({ text, problem: 'text is clipped by its container' });
       break;
      }
     }
    }
   }
  }
  return problems;
 }, minimumFontSize);
}

for (const width of widths) {
 test(`homepage copy remains readable and all five slides fit at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(homePath);
  await page.evaluate(() => document.fonts.ready);

  expect(await inspectCopy(page, 'main p, .hero-benefit strong, .hero-benefit span', 16)).toEqual([]);
  expect(await inspectCopy(page, 'main h1, main h2, main h3')).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const hero = page.locator('.hero-home');
  const originalHeight = await hero.evaluate(element => element.getBoundingClientRect().height);
  const dots = page.getByRole('button', { name: /^สไลด์ \d:/ });
  await expect(dots).toHaveCount(5);
  for (let index = 0; index < 5; index++) {
   await dots.nth(index).click();
   await expect(dots.nth(index)).toHaveAttribute('aria-pressed', 'true');
   await expect(hero.locator('h1')).toBeVisible();
   await expect(hero.locator('.hero-copy')).toBeVisible();
   expect(await inspectCopy(page, '.hero-home h1, .hero-home .hero-copy')).toEqual([]);
   const height = await hero.evaluate(element => element.getBoundingClientRect().height);
   expect(Math.abs(height - originalHeight)).toBeLessThanOrEqual(1);
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
 });
}
