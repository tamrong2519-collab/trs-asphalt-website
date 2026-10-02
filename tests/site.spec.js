import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const path = route => `${process.env.SITE_BASE || '/'}${route}`;
for (const width of [320, 375, 390, 430, 768, 1440]) {
 test(`all pages, navigation and layout at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for (const route of ['index','services','projects','contact']) {
   const response=await page.goto(path(`${route}.html`));expect(response.status()).toBe(200);
   await expect(page.locator('h1')).toBeVisible();
   await expect(page.locator('main')).toBeVisible();
   await page.evaluate(()=>document.fonts.ready);
   expect(await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily)).toContain('Prompt');
   expect(await page.evaluate(()=>document.fonts.check('16px Prompt'))).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
   if(width<=760){
    const readability=await page.evaluate(()=>({
     heroFont:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
     heroHeight:document.querySelector('.hero').getBoundingClientRect().height,
     smallParagraphs:[...document.querySelectorAll('main p')].filter(p=>p.textContent.trim()&&parseFloat(getComputedStyle(p).fontSize)<16).map(p=>p.className),
     smallButtons:[...document.querySelectorAll('main .button')].filter(b=>b.getBoundingClientRect().height>0&&b.getBoundingClientRect().height<52).map(b=>b.textContent.trim()),
    }));
    expect(readability.heroFont).toBeGreaterThanOrEqual(34);expect(readability.heroFont).toBeLessThanOrEqual(44);
    expect(readability.heroHeight).toBeGreaterThanOrEqual(380);expect(readability.smallParagraphs).toEqual([]);expect(readability.smallButtons).toEqual([]);
   }
   await expect(page.locator('nav a')).toHaveCount(4);
   for (const img of await page.locator('img[src]').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(i=>i.decode()); }
   if(width<=760){await page.getByRole('button',{name:'เปิดเมนู'}).click();await expect(page.locator('nav')).toBeVisible();await page.locator('nav a').nth(1).click();await expect(page).toHaveURL(/services.html/);}
  }
  expect(errors).toEqual([]);
 });
}
test('estimate form validates and generates accurate message',async({page})=>{
 await page.goto(path('contact.html?service=gravel#estimate'));
 await expect(page.locator('#service')).toHaveValue('gravel');
 await page.locator('#customer').fill('คุณทดสอบ');await page.locator('#phone').fill('0812345678');await page.locator('#location').fill('กรุงเทพมหานคร');await page.locator('#area').fill('200 ตร.ม.');
 await page.getByRole('button',{name:'สร้างข้อความขอประเมินราคา'}).click();
 await expect(page.locator('#estimate-result')).toBeVisible();await expect(page.locator('#message')).toHaveValue(/คุณทดสอบ[\s\S]*ลานจอดรถหินคลุก[\s\S]*200 ตร.ม./);
});
test('project filters show honest empty state',async({page})=>{
 await page.goto(path('projects.html'));await page.getByRole('button',{name:'ลาดยางมะตอย',exact:true}).click();
 await expect(page.getByRole('button',{name:'ลาดยางมะตอย',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.locator('#empty-projects')).toBeVisible();
});
test('production HTML contains indexable Thai content without JS',async()=>{
 for(const route of ['index','services','projects','contact']){
  const html=await readFile(`dist/${route}.html`,'utf8');expect(html).toContain('<h1>');expect(html).toContain('ขอประเมินราคา');expect(html).toContain('lang="th"');expect(html).toContain('name="description"');
 }
});

test('gallery opens and closes an example photo',async({page})=>{
 await page.goto(path('projects.html'));await expect(page.locator('.project-card')).toHaveCount(5);
 await page.locator('.photo-button').first().click();await expect(page.locator('#lightbox')).toBeVisible();
 await expect(page.locator('#image-caption')).toContainText('ภาพตัวอย่าง');await page.getByRole('button',{name:'ปิดภาพ'}).click();await expect(page.locator('#lightbox')).not.toBeVisible();
});
test('phone and LINE buttons use confirmed contact details',async({page})=>{
 await page.goto(path('contact.html'));await expect(page.locator('.floating-contact a').first()).toHaveAttribute('href','tel:0622484089');
 await expect(page.locator('.floating-contact a').nth(1)).toHaveAttribute('href','https://line.me/ti/p/%40138wlldt');
 await expect(page.locator('a[href="mailto:tamrong2519@gmail.com"]')).toBeVisible();
});
test('form message links to email without claiming an automatic submission',async({page})=>{
 await page.goto(path('contact.html#estimate'));await page.locator('#customer').fill('คุณทดสอบ');await page.locator('#phone').fill('0622484089');await page.locator('#service').selectOption('marking');await page.locator('#location').fill('ชลบุรี');
 await page.getByRole('button',{name:'สร้างข้อความขอประเมินราคา'}).click();await expect(page.locator('#email-message')).toHaveAttribute('href',/^mailto:tamrong2519@gmail.com\?subject=/);
 await expect(page.locator('#message')).toHaveValue(/ตีเส้นจราจร/);
});

for(const width of [320,375,390,430]){
 test(`premium contact buttons and no duplicate floating controls at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:850});await page.goto(path('contact.html'));await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.floating-contact')).not.toBeVisible();
  const buttons=page.locator('.contact-panel .actions .button');await expect(buttons).toHaveCount(2);
  await expect(buttons.nth(0)).toHaveText('โทร 062-248-4089');
  await expect(buttons.nth(1)).toContainText('LINE @138wlldt');
  const layout=await buttons.evaluateAll(items=>items.map(b=>{const r=b.getBoundingClientRect(),s=getComputedStyle(b);return {height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom,font:parseFloat(s.fontSize),radius:parseFloat(s.borderRadius),wrap:s.whiteSpace,overflow:b.scrollWidth>b.clientWidth,bg:s.backgroundColor};}));
  for(const button of layout){expect(button.height).toBeGreaterThanOrEqual(52);expect(button.height).toBeLessThanOrEqual(58);expect(button.font).toBeGreaterThanOrEqual(17);expect(button.radius).toBeGreaterThanOrEqual(14);expect(button.radius).toBeLessThanOrEqual(18);expect(button.wrap).toBe('nowrap');expect(button.overflow).toBe(false);expect(button.left).toBeGreaterThanOrEqual(16);expect(button.right).toBeLessThanOrEqual(width-16);}
  expect(layout[1].top-layout[0].bottom).toBeGreaterThanOrEqual(12);
  expect(layout[0].bg).toBe('rgb(16, 45, 103)');expect(layout[1].bg).toBe('rgb(0, 168, 61)');
 });
}

for(const width of [320,375,390,430]){
 test(`consistent mobile call and LINE actions across all pages at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:850});
  for(const route of ['index','services','projects','contact']){
   await page.goto(path(`${route}.html`));await page.evaluate(()=>document.fonts.ready);
   const selector=route==='contact'?'.contact-panel .actions>.button':'.floating-contact .float-button';
   const buttons=page.locator(selector);await expect(buttons).toHaveCount(2);
   const geometry=await buttons.evaluateAll(items=>items.map(b=>{
    const r=b.getBoundingClientRect(),s=getComputedStyle(b);
    return {height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom,font:parseFloat(s.fontSize),radius:parseFloat(s.borderRadius),wrap:s.whiteSpace,overflow:b.scrollWidth>b.clientWidth,align:s.alignItems,justify:s.justifyContent};
   }));
   for(const b of geometry){expect(b.height).toBe(52);expect(b.font).toBe(18);expect(b.radius).toBe(14);expect(b.wrap).toBe('nowrap');expect(b.overflow).toBe(false);expect(b.align).toBe('center');expect(b.justify).toBe('center');expect(b.left).toBeGreaterThanOrEqual(16);expect(b.right).toBeLessThanOrEqual(width-16);}
   if(route==='contact'){
    expect(geometry[1].top-geometry[0].bottom).toBe(16);await expect(page.locator('.floating-contact')).not.toBeVisible();
   }else{
    expect(geometry[1].left-geometry[0].right).toBe(16);
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    const unobstructed=await page.evaluate(()=>document.querySelector('.footer-phone').getBoundingClientRect().bottom<=document.querySelector('.floating-contact').getBoundingClientRect().top);
    expect(unobstructed).toBe(true);
    await page.locator('main .button').last().scrollIntoViewIfNeeded();
    const clearButton=await page.locator('main .button').last().evaluate(b=>b.getBoundingClientRect().bottom<=document.querySelector('.floating-contact').getBoundingClientRect().top);
    expect(clearButton).toBe(true);
   }
  }
 });
}

test('contact reference layout keeps estimate form compact and accessible',async({page})=>{
 await page.goto(path('contact.html'));await expect(page.locator('#estimate-form')).not.toBeVisible();
 await expect(page.locator('.contact-photo')).toBeVisible();await expect(page.locator('.info-card')).toHaveCount(3);
 await page.locator('#estimate summary').click();await expect(page.locator('#estimate-form')).toBeVisible();
 await page.locator('#estimate summary').click();await expect(page.locator('#estimate-form')).not.toBeVisible();
 await page.goto(path('contact.html#estimate'));await expect(page.locator('#estimate-form')).toBeVisible();
});

test('home hero advances automatically through all five slides and loops',async({page})=>{
 await page.clock.install();await page.goto(path('index.html'));
 const hero=page.locator('.hero-home');await expect(page.locator('[data-slide]')).toHaveCount(5);
 for(const index of [1,2,3,4,0]){
  await page.clock.runFor(6001);await expect(hero).toHaveAttribute('data-active-slide',String(index));
  await expect(page.locator(`[data-slide="${index}"]`)).toHaveAttribute('aria-pressed','true');
 }
 await page.getByRole('button',{name:'หยุดสไลด์อัตโนมัติ'}).click();await page.clock.runFor(12000);await expect(hero).toHaveAttribute('data-active-slide','0');
 await page.getByRole('button',{name:'เล่นสไลด์อัตโนมัติ'}).click();await page.locator('header .brand').focus();await page.mouse.move(0,0);await page.clock.runFor(6001);await expect(hero).toHaveAttribute('data-active-slide','1');
});
for(const width of [320,375,390,430]){
 test(`all five hero photos stay clear above readable copy and controls fit at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:950});await page.goto(path('index.html'));
  const hero=page.locator('.hero-home');
  for(const selector of ['.slide-prev','.slide-next']){
   const control=hero.locator(selector);await expect(control.locator('svg')).toHaveCount(1);
   const size=await control.boundingBox();expect(size.width).toBeGreaterThanOrEqual(44);expect(size.height).toBeGreaterThanOrEqual(44);
   const photo=await hero.locator('.hero-image').boundingBox();expect(size.y+size.height).toBeLessThanOrEqual(photo.y+photo.height);
   const floating=await page.locator('.floating-contact').boundingBox();expect(size.y+size.height).toBeLessThan(floating.y);
  }
  for(let index=0;index<5;index++){
   await page.locator(`[data-slide="${index}"]`).click();await expect(hero).toHaveAttribute('data-active-slide',String(index));
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   const within=await page.locator('.slider-controls').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth});expect(within).toBe(true);
   for(const image of await hero.locator('img:visible').all()) await image.evaluate(i=>i.decode());
   const composition=await hero.evaluate(e=>{const photo=e.querySelector(e.dataset.activeSlide==='0'?'.hero-image':'.hero-scene').getBoundingClientRect();return {photoHeight:photo.height,photoBottom:photo.bottom,titleTop:e.querySelector('h1').getBoundingClientRect().top};});
   expect(composition.photoHeight).toBeGreaterThanOrEqual(230);expect(composition.titleTop-composition.photoBottom).toBeGreaterThanOrEqual(24);
  }
  await page.getByRole('button',{name:'สไลด์ถัดไป',exact:true}).click();await expect(hero).toHaveAttribute('data-active-slide','0');
  await page.getByRole('button',{name:'สไลด์ก่อนหน้า',exact:true}).click();await expect(hero).toHaveAttribute('data-active-slide','4');
  await hero.evaluate(e=>{
   e.dispatchEvent(new TouchEvent('touchstart',{changedTouches:[new Touch({identifier:1,target:e,clientX:250,clientY:200})]}));
   e.dispatchEvent(new TouchEvent('touchend',{changedTouches:[new Touch({identifier:1,target:e,clientX:100,clientY:205})]}));
  });await expect(hero).toHaveAttribute('data-active-slide','0');
 });
}
test('reduced motion keeps the automatic slider paused initially',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.clock.install();await page.goto(path('index.html'));await page.clock.runFor(18000);await expect(page.locator('.hero-home')).toHaveAttribute('data-active-slide','0');await expect(page.getByRole('button',{name:'เล่นสไลด์อัตโนมัติ'})).toBeVisible();
});

test('homepage work photos match the four service cards and automatic slides',async({page})=>{
 await page.goto(path('index.html'));
 const jobs=[['gravel','gravel-job'],['stone','stone-job'],['speed-bump','speed-bump-job'],['marking','marking-job']];
 for(let index=0;index<jobs.length;index++){
  const [id,image]=jobs[index];
  const card=page.locator(`.home-services a[href$="#${id}"] img`);
  await expect(card).toHaveAttribute('src',path(`images/${image}.webp`));
  await page.locator(`[data-slide="${index+1}"]`).click();
  await expect(page.locator('.hero-scene img')).toHaveAttribute('src',path(`images/${id==='gravel'?'gravel-slide':image}.webp`));
  await page.locator('.hero-scene img').evaluate(i=>i.decode());
  expect(await page.locator('.hero-scene img').evaluate(i=>getComputedStyle(i).objectFit)).toBe('cover');
 }
});

test('premium hero fades between slides and cleans up rapid transitions',async({page})=>{
 await page.goto(path('index.html'));await page.locator('.hero-image').evaluate(i=>i.decode());
 await page.getByRole('button',{name:'สไลด์ถัดไป',exact:true}).click();
 await expect(page.locator('.slide-count')).toHaveText('02 / 05');
 await expect(page.locator('.hero-transition')).toHaveCount(1);
 await expect(page.locator('.hero-transition')).toHaveCount(0);
 await page.locator('[data-slide="2"]').click();await page.locator('[data-slide="3"]').click();
 await expect(page.locator('.hero-home')).toHaveAttribute('data-active-slide','3');
 await expect(page.locator('.hero-transition')).toHaveCount(0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-slide="4"]').click();
 await expect(page.locator('.hero-transition')).toHaveCount(0);
 await expect(page.locator('.slide-count')).toHaveText('05 / 05');
});

test('premium header provides working desktop actions and accessible mobile menu',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto(path('services.html'));
 await expect(page.locator('.header-call')).toHaveAttribute('href','tel:0622484089');
 await expect(page.locator('.header-contact .primary')).toHaveAttribute('href',path('contact.html#estimate'));
 expect(await page.locator('.header-inner').evaluate(e=>e.getBoundingClientRect().height)).toBe(88);
 await page.evaluate(()=>scrollTo(0,600));expect(await page.locator('.site-header').evaluate(e=>e.getBoundingClientRect().top)).toBe(0);
 await page.setViewportSize({width:320,height:900});await page.evaluate(()=>scrollTo(0,0));
 expect(await page.locator('.header-inner').evaluate(e=>e.getBoundingClientRect().height)).toBe(72);
 await page.getByRole('button',{name:'เปิดเมนู'}).click();await expect(page.locator('#main-nav')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('#main-nav')).not.toBeVisible();await expect(page.getByRole('button',{name:'เปิดเมนู'})).toBeFocused();
 await page.getByRole('button',{name:'เปิดเมนู'}).click();await page.mouse.click(8,500);await expect(page.locator('#main-nav')).not.toBeVisible();
 await page.getByRole('button',{name:'เปิดเมนู'}).click();await page.setViewportSize({width:1440,height:900});await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded','false');
});

test('homepage reference layout uses five service cards and a 3 plus 2 gallery',async({page})=>{
 await page.setViewportSize({width:853,height:1280});await page.goto(path('index.html'));await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('.home-services .service-card')).toHaveCount(5);await expect(page.locator('.sample-card')).toHaveCount(5);
 await expect(page.locator('.header-contact a')).toHaveCount(1);await expect(page.locator('.header-call')).toHaveAttribute('href','tel:0622484089');
 await expect(page.locator('main .cta')).toHaveCount(0);
 const geometry=await page.evaluate(()=>{const hero=document.querySelector('.hero-home').getBoundingClientRect();const cards=[...document.querySelectorAll('.sample-card')].map(e=>e.getBoundingClientRect());return {ratio:hero.width/hero.height,rows:cards.map(e=>Math.round(e.top)),overflow:document.documentElement.scrollWidth>innerWidth};});
 expect(geometry.ratio).toBeGreaterThan(1);expect(geometry.ratio).toBeLessThan(2);expect(geometry.rows[0]).toBe(geometry.rows[1]);expect(geometry.rows[1]).toBe(geometry.rows[2]);expect(geometry.rows[3]).toBe(geometry.rows[4]);expect(geometry.rows[3]).toBeGreaterThan(geometry.rows[0]);expect(geometry.overflow).toBe(false);
});

test('homepage hero matches requested wording, four benefits and blue phone button',async({page})=>{
 await page.goto(path('index.html'));await expect(page.locator('h1')).toHaveText('รับเหมาลาดยางมะตอยและงานหินคลุกครบวงจร');
 await expect(page.locator('.hero-copy')).toContainText('ถนน ลานจอดรถ ไซต์งาน โครงการภาครัฐและเอกชน');
 await expect(page.locator('.hero-copy')).toContainText('โดยทีมงานมืออาชีพ เครื่องจักรพร้อม ได้มาตรฐาน');
 await expect(page.locator('.hero-copy')).toContainText('งานเสร็จตรงเวลา');await expect(page.locator('.hero-benefit')).toHaveCount(4);
 await expect(page.locator('.hero-quote-note')).toHaveText('ฟรี! เข้าดูหน้างาน ประเมินเบื้องต้น');
 const button=page.locator('.hero-quote .button');await expect(button).toHaveAttribute('href','tel:0622484089');await expect(button).toHaveText('โทร 062-248-4089');
 expect(await button.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(0, 159, 232)');
 for(const width of [320,375,390,430]){
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);
  const layout=await button.evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,wrap:getComputedStyle(el).whiteSpace,overflow:el.scrollWidth>el.clientWidth,height:r.height};});
  expect(layout.wrap).toBe('nowrap');expect(layout.overflow).toBe(false);expect(layout.left).toBeGreaterThanOrEqual(16);expect(layout.right).toBeLessThanOrEqual(width-16);expect(layout.height).toBeGreaterThanOrEqual(52);
 }
});

test('mobile estimate hero keeps its height when the automatic slide changes',async({page})=>{
 for(const width of [320,390]){
  await page.setViewportSize({width,height:1000});await page.goto(path('index.html'));await page.evaluate(()=>document.fonts.ready);
  const hero=page.locator('.hero-estimate');const before=await hero.evaluate(e=>e.getBoundingClientRect().height);
  await page.locator('[data-slide="4"]').click();await expect(hero).toHaveAttribute('data-active-slide','4');
  expect(await hero.evaluate(e=>e.getBoundingClientRect().height)).toBeCloseTo(before,0);
 }
});
