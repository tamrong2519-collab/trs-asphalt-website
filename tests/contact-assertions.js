import { expect } from '@playwright/test';

// The sticky header keeps both primary contact routes accessible when the
// floating shortcuts yield space to another control.
export async function expectPrimaryContactAccess(page) {
 for (const [selector, href] of [
  ['.header-call', 'tel:0622484089'],
  ['.header-line', 'https://line.me/ti/p/%40138wlldt'],
 ]) {
  const link = page.locator(selector);
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', href);
  await expect.poll(() => link.evaluate(element => {
   const box = element.getBoundingClientRect();
   return element.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
  })).toBe(true);
 }
}
