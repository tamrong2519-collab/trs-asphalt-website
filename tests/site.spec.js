import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
for (const width of [320, 375, 768, 1440]) {
 test(`all pages, navigation and layout at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for (const route of ['index','services','projects','contact']) {
   const response=await page.goto(`/${route}.html`);expect(response.status()).toBe(200);
   await expect(page.locator('h1')).toBeVisible();
   await expect(page.locator('main')).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
   await expect(page.locator('nav a')).toHaveCount(4);
   if(width<=760){await page.getByRole('button',{name:'เปิดเมนู'}).click();await expect(page.locator('nav')).toBeVisible();await page.locator('nav a[href="/services.html"]').click();await expect(page).toHaveURL(/services.html/);}
   expect(await page.locator('img[src]').evaluateAll(imgs=>imgs.filter(i=>i.complete&&i.naturalWidth===0).length)).toBe(0);
  }
  expect(errors).toEqual([]);
 });
}
test('estimate form validates and generates accurate message',async({page})=>{
 await page.goto('/contact.html?service=gravel#estimate');
 await expect(page.locator('#service')).toHaveValue('gravel');
 await page.locator('#customer').fill('คุณทดสอบ');await page.locator('#phone').fill('0812345678');await page.locator('#location').fill('กรุงเทพมหานคร');await page.locator('#area').fill('200 ตร.ม.');
 await page.getByRole('button',{name:'สร้างข้อความขอประเมินราคา'}).click();
 await expect(page.locator('#estimate-result')).toBeVisible();await expect(page.locator('#message')).toHaveValue(/คุณทดสอบ[\s\S]*ลานจอดรถหินคลุก[\s\S]*200 ตร.ม./);
});
test('project filters show honest empty state',async({page})=>{
 await page.goto('/projects.html');await page.getByRole('button',{name:'ลาดยางมะตอย',exact:true}).click();
 await expect(page.getByRole('button',{name:'ลาดยางมะตอย',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.locator('#empty-projects')).toBeVisible();
});
test('production HTML contains indexable Thai content without JS',async()=>{
 for(const route of ['index','services','projects','contact']){
  const html=await readFile(`dist/${route}.html`,'utf8');expect(html).toContain('<h1>');expect(html).toContain('ขอประเมินราคา');expect(html).toContain('lang="th"');expect(html).toContain('name="description"');
 }
});
