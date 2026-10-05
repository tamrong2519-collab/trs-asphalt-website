import { expect } from '@playwright/test';

export async function expectDecodedPhoto(image, [width, height]) {
 await expect(image).toHaveAttribute('width', String(width));
 await expect(image).toHaveAttribute('height', String(height));
 await image.scrollIntoViewIfNeeded();
 const photo = await image.evaluate(async element => {
  await element.decode();
  const candidates = element.srcset
   ? element.srcset.split(',').map(candidate => new URL(candidate.trim().split(/\s+/)[0], location.href).href)
   : [element.src];
  return { width: element.naturalWidth, height: element.naturalHeight, source: element.currentSrc, candidates };
 });
 expect(photo.width).toBeGreaterThan(0);
 expect(photo.height).toBeGreaterThan(0);
 expect(photo.width / photo.height).toBeCloseTo(width / height, 2);
 expect(photo.candidates).toContain(photo.source);
}
