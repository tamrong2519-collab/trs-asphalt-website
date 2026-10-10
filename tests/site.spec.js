import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { expectDecodedPhoto } from './photo-assertions.js';
import { expectPrimaryContactAccess } from './contact-assertions.js';
const path = route => `${process.env.SITE_BASE || '/'}${route}`;
for (const width of [320, 375, 390, 430, 768, 1440]) {
 test(`all pages, navigation and layout at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const routes=['index','services','projects','contact'];
  for (const route of routes) {
   const response=await page.goto(path(`${route}.html`));expect(response.status()).toBe(200);
   await expect(page.locator('h1')).toBeVisible();
   await expect(page.locator('main')).toBeVisible();
   await page.evaluate(()=>document.fonts.ready);
   expect(await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily)).toContain('Noto Sans Thai');
   expect(await page.evaluate(()=>document.fonts.check('16px "Noto Sans Thai"'))).toBe(true);
   const typography=await page.evaluate(()=>{
    const copy=[...document.querySelectorAll('main p, main label, main input, main select, main textarea')];
    const problems=copy.flatMap(e=>{const s=getComputedStyle(e),font=parseFloat(s.fontSize),line=parseFloat(s.lineHeight)/font,issues=[];if(font<16)issues.push('small text');if(line<1.64)issues.push('tight line spacing');if(!s.fontFamily.includes('Noto Sans Thai'))issues.push('unexpected font');return issues.map(problem=>({element:e.id||e.className||e.tagName,problem,font,line}));});
    const headings=[...document.querySelectorAll('main h1,main h2,main h3')].flatMap(e=>{const s=getComputedStyle(e),minimum=e.tagName==='H1'?34:e.tagName==='H2'?22:17;return parseFloat(s.fontSize)<minimum||!s.fontFamily.includes('Noto Sans Thai')?[{text:e.textContent.trim(),font:s.fontSize,family:s.fontFamily}]:[];});
    const fontResources=performance.getEntriesByType('resource').filter(e=>/\.woff2?(?:[?#]|$)/.test(e.name)).map(e=>e.name);
    return {problems,headings,loadedNoto:[...document.fonts].some(font=>font.family.includes('Noto Sans Thai')&&font.status==='loaded'),fontResources,selfHostedFonts:fontResources.every(url=>new URL(url).origin===location.origin),googleResources:performance.getEntriesByType('resource').filter(e=>/fonts\.(googleapis|gstatic)\.com/.test(e.name)).map(e=>e.name)};
   });
   expect(typography.problems).toEqual([]);expect(typography.headings).toEqual([]);expect(typography.loadedNoto).toBe(true);expect(typography.fontResources.length).toBeGreaterThan(0);expect(typography.selfHostedFonts).toBe(true);expect(typography.googleResources).toEqual([]);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
   if(width<=760){
    const readability=await page.evaluate(()=>({
     heroFont:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
     heroHeight:document.querySelector('.hero, .paired-hero, .page-hero').getBoundingClientRect().height,
     smallParagraphs:[...document.querySelectorAll('main p')].filter(p=>p.textContent.trim()&&parseFloat(getComputedStyle(p).fontSize)<16).map(p=>p.className),
     smallButtons:[...document.querySelectorAll('main .button')].filter(b=>b.getBoundingClientRect().height>0&&b.getBoundingClientRect().height<52).map(b=>b.textContent.trim()),
    }));
    expect(readability.heroFont).toBeGreaterThanOrEqual(34);expect(readability.heroFont).toBeLessThanOrEqual(44);
    expect(readability.heroHeight).toBeGreaterThanOrEqual(route==='index'?380:220);expect(readability.smallParagraphs).toEqual([]);expect(readability.smallButtons).toEqual([]);
   }
   await expect(page.locator('#main-nav a')).toHaveCount(4);
   await expect(page.locator('#main-nav a')).toHaveText(['หน้าแรก','บริการของเรา','ผลงานของเรา','ติดต่อเรา']);
   await expect(page.locator('#main-nav a[aria-current="page"]')).toHaveAttribute('href',path(`${route}.html`));
   await expect(page.locator('.menu-toggle')).toHaveCount(0);
   for(const link of await page.locator('#main-nav a').all()) await expect(link).toBeVisible();
   const footer=page.getByRole('navigation',{name:'เมนูส่วนท้าย'}),footerLinks=footer.locator('a');
   await expect(footerLinks).toHaveCount(4);await expect(footerLinks).toHaveText(['หน้าแรก','บริการของเรา','ผลงานของเรา','ติดต่อเรา']);
   for(let index=0;index<routes.length;index++){await expect(footerLinks.nth(index)).toHaveAttribute('href',path(`${routes[index]}.html`));await expect(footerLinks.nth(index)).toBeVisible();}
   await expect(footer.locator('[aria-current="page"]')).toHaveAttribute('href',path(`${route}.html`));
   for (const img of await page.locator('img[src]').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(i=>i.decode()); }
   if(width>760){await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await expect(page.locator('.floating-contact')).not.toBeVisible();}
   const nextRoute=routes[(routes.indexOf(route)+1)%routes.length];
   await footer.locator(`a[href="${path(`${nextRoute}.html`)}"]`).click();await expect(page).toHaveURL(new RegExp(`/${nextRoute}\\.html$`));
   if(width>760){await page.evaluate(()=>scrollTo(0,0));await expectPrimaryContactAccess(page);}
   await page.locator('#main-nav a').nth(1).click();await expect(page).toHaveURL(/services.html/);
   if(width>760){await page.evaluate(()=>scrollTo(0,0));await expectPrimaryContactAccess(page);}
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
test('project filters show the selected category and retain honest photo labels',async({page})=>{
 await page.goto(path('projects.html'));
 for(const category of ['asphalt','gravel','stone','speed-bump','marking']){
  const filter=page.locator(`[data-filter="${category}"]`);await filter.click();
  await expect(filter).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-filter][aria-pressed="true"]')).toHaveCount(1);
  const row=page.locator('.project-row:visible');await expect(row).toHaveCount(category==='gravel'?2:1);
  for(const item of await row.all())await expect(item).toHaveAttribute('data-category',category);
  await expect(page.locator('#empty-projects')).not.toBeVisible();
  if(category==='asphalt'){
   await expect(row.locator('.project-cover img')).toHaveAttribute('src',path('images/asphalt-job-01.webp'));
   await expect(row.locator('.project-cover img')).toHaveAttribute('alt','ภาพหน้างานลาดยางมะตอยบริเวณถนนและทางเข้าอาคาร');
   await expect(row.locator('.project-photo-count')).toHaveText('29 ภาพ');
   await expect(row.locator('.project-image-note')).toHaveCount(0);
  }
  if(category==='gravel'){
   expect(await row.evaluateAll(items=>items.map(item=>item.id))).toEqual(['gravel-yard','gravel-road']);
   await expect(page.locator('#gravel-yard .project-photo-count')).toHaveText('20 ภาพ');
   await expect(page.locator('#gravel-road .project-photo-count')).toHaveText('20 ภาพ');
   await expect(page.locator('#gravel-road .project-copy h3')).toHaveText('ถนนหินคลุก บดอัด');
   const cover=page.locator('#gravel-road .project-cover img');
   await expect(cover).toHaveAttribute('src',path('images/gravel-road-job-04.webp'));
   await expect(cover).toHaveAttribute('alt','ภาพหน้างานถนนหินคลุกบดอัดข้างอาคารสีน้ำเงิน');
   await expect(cover).toHaveAttribute('width','1280');
   await expect(cover).toHaveAttribute('height','720');
   await cover.scrollIntoViewIfNeeded();await cover.evaluate(i=>i.decode());
   await expectDecodedPhoto(cover,[1280,720]);
  }
  if(category==='stone'){
   expect(await row.evaluateAll(items=>items.map(item=>item.id))).toEqual(['stone-yard']);
   await expect(row.locator('.project-photo-count')).toHaveText('15 ภาพ');
  }
  if(category==='speed-bump'){
   await expect(row).toHaveAttribute('id','speed-bump-work');
   await expect(row.locator('.project-photo-count')).toHaveText('14 ภาพ');
   await expect(row.locator('.project-cover img')).toHaveAttribute('src',path('images/projects-speed-bump-cover.webp'));
  }
  if(category==='marking'){
   await expect(row).toHaveAttribute('id','parking-marking');
   await expect(row.locator('.project-photo-count')).toHaveText('16 ภาพ');
   await expect(row.locator('.project-cover img')).toHaveAttribute('src',path('images/projects-marking-cover.webp'));
  }
 }
 await page.locator('[data-filter="all"]').click();await expect(page.locator('.project-row:visible')).toHaveCount(6);
 await expect(page.locator('.project-row:visible').first()).toHaveAttribute('data-category','asphalt');
});
test('production HTML contains indexable Thai content without JS',async()=>{
 for(const route of ['index','services','projects','contact']){
  const html=await readFile(`dist/${route}.html`,'utf8');expect(html).toContain('<h1>');expect(html).toContain('ขอประเมินราคา');expect(html).toContain('lang="th"');expect(html).toContain('name="description"');
 }
});

test('gallery keeps the marking cover and opens the accessible parking photo',async({page})=>{
 await page.goto(path('projects.html'));await expect(page.locator('.project-row')).toHaveCount(6);
 const trigger=page.locator('.project-row[data-category="marking"] .photo-button');
 await trigger.click();await expect(page.locator('#lightbox')).toBeVisible();
 await expect(page.locator('#image-caption')).toHaveText('ภาพหน้างานตีเส้นจราจรและลูกศรบอกทิศทางหน้าอาคาร');
 await expect(page.locator('#lightbox-image img')).toHaveAttribute('src',new URL(path('images/projects-marking-cover.webp'),page.url()).href);
 await expect(page.locator('#image-count')).toHaveText('1 / 16');
 await expect(page.getByRole('button',{name:'ภาพก่อนหน้า',exact:true})).toBeEnabled();await expect(page.getByRole('button',{name:'ภาพถัดไป',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'ภาพถัดไป',exact:true}).click();
 await expect(page.locator('#image-count')).toHaveText('2 / 16');
 await expect(page.locator('#lightbox-image img')).toHaveAttribute('src',new URL(path('images/marking-job.webp'),page.url()).href);
 await expect(page.locator('#image-caption')).toHaveText('ภาพหน้างานตีเส้นจราจร');
 await page.getByRole('button',{name:'ภาพถัดไป',exact:true}).click();
 await expect(page.locator('#image-count')).toHaveText('3 / 16');
 await expect(page.locator('#lightbox-image img')).toHaveAttribute('src',new URL(path('images/marking-job-02.webp'),page.url()).href);
 await expect(page.locator('#image-caption')).toHaveText('ช่องจอดรถสำหรับผู้ใช้รถเข็นและเส้นแบ่งพื้นที่');
 await page.getByRole('button',{name:'ปิดภาพ',exact:true}).click();await expect(page.locator('#lightbox')).not.toBeVisible();await expect(trigger).toBeFocused();
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
 test(`premium contact panel buttons with shared floating controls at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:850});await page.goto(path('contact.html'));await page.evaluate(()=>document.fonts.ready);
  await expectPrimaryContactAccess(page);
  const buttons=page.locator('.contact-panel .actions .button');await expect(buttons).toHaveCount(2);
  await expect(buttons.nth(0)).toHaveText('โทร 062-248-4089');
  await expect(buttons.nth(1)).toContainText('แอด LINE ส่งรูปหน้างาน');
  const layout=await buttons.evaluateAll(items=>items.map(b=>{const r=b.getBoundingClientRect(),s=getComputedStyle(b);return {height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom,font:parseFloat(s.fontSize),radius:parseFloat(s.borderRadius),wrap:s.whiteSpace,overflow:b.scrollWidth>b.clientWidth,bg:s.backgroundColor};}));
  for(const button of layout){expect(button.height).toBe(52);expect(button.font).toBe(18);expect(button.radius).toBe(14);expect(button.wrap).toBe('nowrap');expect(button.overflow).toBe(false);expect(button.left).toBeGreaterThanOrEqual(16);expect(button.right).toBeLessThanOrEqual(width-16);}
  expect(layout[1].top-layout[0].bottom).toBe(16);
  expect(layout[0].bg).toBe('rgb(0, 119, 182)');expect(layout[1].bg).toBe('rgb(0, 122, 45)');
 });
}

for(const width of [320,375,390,430]){
 test(`consistent mobile call and LINE actions across all pages at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:850});
  for(const route of ['index','services','projects','contact']){
   await page.goto(path(`${route}.html`));await page.evaluate(()=>document.fonts.ready);
   await expectPrimaryContactAccess(page);
   const buttons=page.locator('.floating-contact .float-button');await expect(buttons).toHaveCount(2);
   const geometry=await buttons.evaluateAll(items=>items.map(b=>{
    const r=b.getBoundingClientRect(),s=getComputedStyle(b);
    const face=b.querySelector('.float-face'),f=face?.getBoundingClientRect(),fs=face&&getComputedStyle(face),icon=face?.querySelector('.icon,.float-symbol-mobile')?.getBoundingClientRect();
    return {width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom,font:parseFloat(s.fontSize),radius:parseFloat(s.borderRadius),wrap:s.whiteSpace,overflow:b.scrollWidth>b.clientWidth,align:s.alignItems,justify:s.justifyContent,face:f?{width:f.width,height:f.height,left:f.left,right:f.right,top:f.top,bottom:f.bottom,font:parseFloat(fs.fontSize),radius:parseFloat(fs.borderRadius),wrap:fs.whiteSpace,overflow:face.scrollWidth>face.clientWidth,align:fs.alignItems,justify:fs.justifyContent,iconWidth:icon?.width,iconHeight:icon?.height}:null};
   }));
   for(const b of geometry){expect(b.height).toBe(44);expect(b.height).toBeGreaterThanOrEqual(44);expect(b.wrap).toBe('nowrap');expect(b.overflow).toBe(false);expect(b.align).toBe('center');expect(b.justify).toBe('center');expect(b.left).toBeGreaterThanOrEqual(12);expect(b.right).toBeLessThanOrEqual(width-12);}
   await expect(buttons.nth(0)).toHaveAttribute('href','tel:0622484089');await expect(buttons.nth(1)).toHaveAttribute('href','https://line.me/ti/p/%40138wlldt');
   await expect(buttons.nth(0).locator('.float-label-mobile')).toHaveText('062-248-4089');await expect(buttons.nth(1).locator('.float-label-mobile')).toHaveText('LINE');
   expect(geometry[1].top-geometry[0].bottom).toBeCloseTo(4,1);
   expect(geometry[0].left).toBeCloseTo(geometry[1].left,1);
   expect(geometry[0].width).toBeCloseTo(geometry[1].width,1);
   for(const [index,b] of geometry.entries()){
    expect(b.width).toBe(160);expect(b.face).not.toBeNull();
    const face=b.face;expect(face.width).toBe(160);expect(face.height).toBe(30);expect(face.font).toBe(index===0?13:14);expect(face.radius).toBe(9);
    expect(face.wrap).toBe('nowrap');expect(face.overflow).toBe(false);expect(face.align).toBe('center');expect(face.justify).toBe('center');
    expect(face.left).toBeCloseTo(b.left,1);expect(face.right).toBeCloseTo(b.right,1);expect(face.top-b.top).toBeCloseTo(b.bottom-face.bottom,1);
    expect(face.iconWidth).toBe(18);expect(face.iconHeight).toBe(18);
   }
   const dock=await page.locator('.floating-contact').evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {left:r.left,right:r.right,width:r.width,bottom:r.bottom,padding:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft],background:s.backgroundColor,border:s.borderTopWidth};});
   expect(dock.width).toBe(160);
   expect(dock.left).toBeGreaterThanOrEqual(12);expect(dock.right).toBeCloseTo(width-12,1);
   expect(dock.padding).toEqual(['0px','0px','0px','0px']);expect(dock.background).toBe('rgba(0, 0, 0, 0)');expect(dock.border).toBe('0px');
   expect(850-dock.bottom).toBeGreaterThanOrEqual(12);
   expect(geometry[0].left).toBeCloseTo(dock.left,1);expect(geometry[1].right).toBeCloseTo(dock.right,1);
   await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
   const unobstructed=await page.evaluate(()=>document.querySelector('.site-footer').getBoundingClientRect().bottom<=document.querySelector('.floating-contact').getBoundingClientRect().top);
   expect(unobstructed).toBe(true);
   await page.locator('main .button:visible').last().evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
   await expect.poll(()=>page.locator('main .button:visible').last().evaluate(b=>{const r=b.getBoundingClientRect();return b.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));})).toBe(true);
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
 const hero=page.locator('.hero-home');await expect(hero.locator('.slide-dots,[data-slide]')).toHaveCount(0);
 for(const index of [1,2,3,4,0]){
  await page.clock.runFor(6001);await expect(hero).toHaveAttribute('data-active-slide',String(index));
  await expect(page.locator('.slide-count')).toHaveText(`${String(index+1).padStart(2,'0')} / 05`);
 }
 await page.getByRole('button',{name:'หยุดสไลด์อัตโนมัติ'}).click();await page.clock.runFor(12000);await expect(hero).toHaveAttribute('data-active-slide','0');
 await page.getByRole('button',{name:'เล่นสไลด์อัตโนมัติ'}).click();await page.locator('header .brand').focus();await page.mouse.move(0,0);await page.clock.runFor(6001);await expect(hero).toHaveAttribute('data-active-slide','1');
});
for(const width of [320,375,390,430]){
 test(`all five hero photos autoplay above readable copy without slider buttons at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:950});await page.clock.install();await page.goto(path('index.html'));
  const hero=page.locator('.hero-home');
  await expect(hero.locator('.slider-controls')).toBeHidden();
  await expect(hero.getByRole('button')).toHaveCount(0);
  for(let index=0;index<5;index++){
   if(index>0)await page.clock.runFor(6001);await expect(hero).toHaveAttribute('data-active-slide',String(index));
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   for(const image of await hero.locator('img:visible').all()) await image.evaluate(i=>i.decode());
   const composition=await hero.evaluate(e=>{const photo=e.querySelector(e.dataset.activeSlide==='0'?'.hero-image':'.hero-scene').getBoundingClientRect();return {photoHeight:photo.height,photoBottom:photo.bottom,titleTop:e.querySelector('h1').getBoundingClientRect().top};});
   expect(composition.photoHeight).toBeGreaterThanOrEqual(230);expect(composition.titleTop-composition.photoBottom).toBeGreaterThanOrEqual(20);
  }
  await page.clock.runFor(6001);await expect(hero).toHaveAttribute('data-active-slide','0');
  await hero.evaluate(e=>{
   e.dispatchEvent(new TouchEvent('touchstart',{changedTouches:[new Touch({identifier:1,target:e,clientX:250,clientY:200})]}));
   e.dispatchEvent(new TouchEvent('touchend',{changedTouches:[new Touch({identifier:1,target:e,clientX:100,clientY:205})]}));
  });await expect(hero).toHaveAttribute('data-active-slide','1');
  await page.clock.runFor(6001);await expect(hero).toHaveAttribute('data-active-slide','2');
 });
}
test('reduced motion keeps the automatic slider paused initially',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.clock.install();
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:950});await page.goto(path('index.html'));await page.clock.runFor(18000);await expect(page.locator('.hero-home')).toHaveAttribute('data-active-slide','0');
  if(width<=760)await expect(page.locator('.slider-controls')).toBeHidden();
  else await expect(page.getByRole('button',{name:'เล่นสไลด์อัตโนมัติ'})).toBeVisible();
 }
});

test('homepage cards use supplied photos while all five slider images stay unchanged',async({page})=>{
 await page.goto(path('index.html'));
 await page.getByRole('button',{name:'หยุดสไลด์อัตโนมัติ'}).click();
 const albums=['asphalt-road','gravel-yard','stone-yard','speed-bump-work','parking-marking'];
 const serviceIds=['asphalt','gravel','stone','speed-bump','marking'];
 const serviceCards=page.locator('.home-services a'),sampleCards=page.locator('.sample-card');
 await expect(serviceCards).toHaveCount(5);await expect(sampleCards).toHaveCount(6);
 for(let index=0;index<albums.length;index++){
  const destination=path(`projects.html#${albums[index]}`);
  const serviceDestination=serviceIds[index]==='asphalt'?'asphalt/':serviceIds[index]==='speed-bump'?'speed-bump/':serviceIds[index]==='marking'?'traffic-marking/':`services.html#${serviceIds[index]}`;
  await expect(serviceCards.nth(index)).toHaveAttribute('href',path(serviceDestination));
  await expect(sampleCards.nth(index)).toHaveAttribute('href',destination);
 }
 const gravelRoad=sampleCards.last();
 await expect(gravelRoad).toHaveAttribute('href',path('projects.html#gravel-road'));
 await expect(gravelRoad.locator('h3')).toHaveText('ถนนหินคลุก บดอัด');
 await expect(gravelRoad.locator('img')).toHaveAttribute('src',path('images/home-gravel-road.webp'));
 await expect(gravelRoad.locator('img')).toHaveAttribute('alt','ภาพหน้างานถนนหินคลุกบดอัดระหว่างอาคารระบบสาธารณูปโภค');
 await expect(gravelRoad.locator('img')).toHaveAttribute('width','1280');
 await expect(gravelRoad.locator('img')).toHaveAttribute('height','960');
 await gravelRoad.scrollIntoViewIfNeeded();await gravelRoad.locator('img').evaluate(i=>i.decode());
 await expectDecodedPhoto(gravelRoad.locator('img'),[1280,960]);
 const photos=[
  ['asphalt-job-18','asphalt-job-17',[1280,960],[960,1280]],
  ['home-gravel-service','gravel-job-14',[1280,960],[1280,960]],
  ['stone-job','stone-job',[1280,960],[1280,960]],
  ['speed-bump-job','speed-bump-job-02',[1280,960],[960,1280]],
  ['marking-home','marking-home',[1280,960],[1280,960]],
 ];
 for(let index=0;index<photos.length;index++){
  const [serviceFile,projectFile,serviceSize,projectSize]=photos[index];
  for(const [image,file,size] of [[serviceCards.nth(index).locator('img'),serviceFile,serviceSize],[sampleCards.nth(index).locator('img'),projectFile,projectSize]]){
   await expect(image).toHaveAttribute('src',path(`images/${file}.webp`));
   await expect(image).toHaveAttribute('alt',/ภาพหน้างาน/);
   await expect(image).toHaveAttribute('width',String(size[0]));
   await expect(image).toHaveAttribute('height',String(size[1]));
   await image.scrollIntoViewIfNeeded();await image.evaluate(i=>i.decode());
   await expectDecodedPhoto(image,size);
  }
 }
 await expect(page.locator('.hero-image')).toHaveAttribute('src',path('images/hero-sharp.webp'));
 await expect(page.locator('.hero-image')).toHaveAttribute('srcset',`${path('images/responsive/hero-sharp-480.webp')} 480w, ${path('images/responsive/hero-sharp-800.webp')} 800w, ${path('images/hero-sharp-mobile.webp')} 960w, ${path('images/hero-sharp.webp')} 1536w`);
 const slidePhotos=['gravel-slide','stone-job','speed-bump-job','marking-home'];
 for(let index=0;index<slidePhotos.length;index++){
  await page.getByRole('button',{name:'สไลด์ถัดไป',exact:true}).click();
  await expect(page.locator('.hero-home')).toHaveAttribute('data-active-slide',String(index+1));
  await expect(page.locator('.hero-scene img')).toHaveAttribute('src',path(`images/${slidePhotos[index]}.webp`));
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
 await page.getByRole('button',{name:'สไลด์ถัดไป',exact:true}).click();await page.getByRole('button',{name:'สไลด์ถัดไป',exact:true}).click();
 await expect(page.locator('.hero-home')).toHaveAttribute('data-active-slide','3');
 await expect(page.locator('.hero-transition')).toHaveCount(0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'สไลด์ถัดไป',exact:true}).click();
 await expect(page.locator('.hero-transition')).toHaveCount(0);
 await expect(page.locator('.slide-count')).toHaveText('05 / 05');
});

test('reference text navigation supports direct clicks and keyboard access without a menu toggle',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto(path('services.html'));
 await expect(page.locator('.header-call')).toHaveAttribute('href','tel:0622484089');
 await expect(page.locator('.header-contact a[href="https://line.me/ti/p/%40138wlldt"]')).toBeVisible();
 await page.evaluate(()=>scrollTo(0,600));expect(await page.locator('.site-header').evaluate(e=>e.getBoundingClientRect().top)).toBe(0);
 for(const width of [320,375,390,430,1440]){
  await page.setViewportSize({width,height:900});await page.goto(path('index.html'));
  await expect(page.locator('.menu-toggle')).toHaveCount(0);
  await expect(page.locator('#main-nav')).toBeVisible();
  for(const link of await page.locator('#main-nav a').all()) await expect(link).toBeVisible();
  await page.locator('#main-nav a').nth(2).click();await expect(page).toHaveURL(/projects.html/);
  await page.locator('header .brand').focus();await page.keyboard.press('Tab');await expect(page.locator('#main-nav a').nth(0)).toBeFocused();
  await page.keyboard.press('Tab');await expect(page.locator('#main-nav a').nth(1)).toBeFocused();
  await page.keyboard.press('Enter');await expect(page).toHaveURL(/services.html/);
  await page.locator('#main-nav a').nth(3).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/contact.html/);
 }
});

test('blue and gold header keeps three bands and compact contacts readable on every page and breakpoint',async({page})=>{
 for(const width of [320,375,390,430,768,1024,1200,1201,1280,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of ['index','services','projects','contact']){
   await page.goto(path(`${route}.html`));await page.evaluate(()=>document.fonts.ready);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await expect(page.locator('header .brand')).toContainText('TRS');
   await expect(page.locator('header .brand')).toContainText('TAMRONGSAK');
   await expect(page.locator('header .brand')).toContainText('CONSTRUCTION');
   await expect(page.locator('header .brand img')).toHaveAttribute('src',path('images/logo.webp'));
   const contacts=page.locator('.header-contact a');await expect(contacts).toHaveCount(2);
   await expect(contacts.nth(0)).toHaveAttribute('href','tel:0622484089');
   await expect(contacts.nth(0)).toHaveText('062-248-4089');
   await expect(contacts.nth(0)).toHaveAccessibleName('โทร 062-248-4089');
   await expect(contacts.nth(1)).toHaveAttribute('href','https://line.me/ti/p/%40138wlldt');
   await expect(contacts.nth(1)).toContainText('@138wlldt');
   for(const contact of await contacts.all()) await expect(contact).toBeVisible();
   const contactLayout=await contacts.evaluateAll(items=>items.map(e=>{
    const r=e.getBoundingClientRect(),s=getComputedStyle(e),icon=e.querySelector('.icon,.line-symbol').getBoundingClientRect();
    const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let node,textClipped=false;
    while((node=walker.nextNode())){if(!node.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(node);for(const rect of range.getClientRects()){if(rect.left<r.left-1||rect.right>r.right+1||rect.top<r.top-1||rect.bottom>r.bottom+1)textClipped=true;}}
    return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,radius:parseFloat(s.borderRadius),font:parseFloat(s.fontSize),wrap:s.whiteSpace,overflow:e.scrollWidth>e.clientWidth,iconWidth:icon.width,iconHeight:icon.height,textClipped};
   }));
   for(const contact of contactLayout){expect(contact.left).toBeGreaterThanOrEqual(12);expect(contact.right).toBeLessThanOrEqual(width-12);expect(contact.height).toBeGreaterThanOrEqual(44);expect(contact.radius).toBe(0);expect(contact.font).toBeGreaterThanOrEqual(13);expect(contact.wrap).toBe('nowrap');expect(contact.overflow).toBe(false);expect(contact.textClipped).toBe(false);expect(contact.iconWidth).toBeLessThanOrEqual(18);expect(contact.iconHeight).toBeLessThanOrEqual(18);}
   const [call,line]=contactLayout;expect(call.width).toBeCloseTo(line.width,1);expect(call.height).toBeCloseTo(line.height,1);expect(call.radius).toBeCloseTo(line.radius,1);expect(call.right).toBeLessThanOrEqual(line.left+1);
   if(width<=760)expect(call.left).toBeCloseTo(width-line.right,0);
   await expect(page.locator('.menu-toggle')).toHaveCount(0);
   await expect(page.locator('#main-nav')).toBeVisible();
   const links=page.locator('#main-nav .nav-link');await expect(links).toHaveCount(4);
   await expect(page.locator('#main-nav [aria-current="page"]')).toHaveAttribute('href',path(`${route}.html`));
   for(const link of await links.all()){
    await expect(link).toBeVisible();
    const layout=await link.evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);const range=document.createRange();range.selectNodeContents(e.querySelector('span'));const text=range.getBoundingClientRect();return {left:r.left,right:r.right,height:r.height,overflow:e.scrollWidth>e.clientWidth,wrap:s.whiteSpace,textLeft:text.left,textRight:text.right};});
    expect(layout.left).toBeGreaterThanOrEqual(12);expect(layout.right).toBeLessThanOrEqual(width-12);expect(layout.height).toBeGreaterThanOrEqual(44);expect(layout.overflow).toBe(false);expect(layout.wrap).toBe('nowrap');expect(layout.textLeft).toBeGreaterThanOrEqual(layout.left-1);expect(layout.textRight).toBeLessThanOrEqual(layout.right+1);
   }
   const linkPositions=await links.evaluateAll(items=>items.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,left:r.left,right:r.right};}));
   for(let index=1;index<linkPositions.length;index++){expect(linkPositions[index].top).toBeCloseTo(linkPositions[0].top,0);expect(linkPositions[index].left).toBeGreaterThanOrEqual(linkPositions[index-1].right);}
   const activeStyle=await page.locator('#main-nav [aria-current]').evaluate(e=>({color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor,underlineHeight:parseFloat(getComputedStyle(e,'::after').height),underlineTransform:getComputedStyle(e,'::after').transform}));
   expect(activeStyle.color).toBe('rgb(20, 61, 117)');expect(activeStyle.background).toBe('rgba(0, 0, 0, 0)');expect(activeStyle.underlineHeight).toBeGreaterThanOrEqual(2);expect(activeStyle.underlineTransform).toBe('matrix(1, 0, 0, 1, 0, 0)');
   const bands=await page.evaluate(()=>['.header-brand-band','.header-nav-band','.header-contact-band'].map(selector=>{const element=document.querySelector(selector),rect=element.getBoundingClientRect(),style=getComputedStyle(element);return {background:style.backgroundColor,finish:style.backgroundImage,left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom};}));
   expect(bands.slice(0,2).map(band=>band.background)).toEqual(['rgb(22, 79, 159)','rgb(224, 188, 104)']);
   expect(bands[2].finish).toContain('linear-gradient(');
   expect(bands[2].finish).toContain('rgb(237, 240, 243)');
   expect(bands[2].finish).toContain('rgb(224, 228, 232)');
   expect(bands[2].finish).toContain('rgb(227, 230, 233)');
   for(const band of bands){expect(band.left).toBe(0);expect(band.right).toBe(width);}
   expect(bands[0].bottom).toBeCloseTo(bands[1].top,1);expect(bands[1].bottom).toBeCloseTo(bands[2].top,1);
   expect(await page.locator('.site-header svg').count()).toBe(2);
   const placement=await page.evaluate(()=>{const brand=document.querySelector('header .brand').getBoundingClientRect(),header=document.querySelector('.site-header').getBoundingClientRect(),main=document.querySelector('main').getBoundingClientRect();return {brandLeft:brand.left,brandRight:brand.right,headerBottom:header.bottom,mainTop:main.top};});
   expect(placement.mainTop).toBeGreaterThanOrEqual(placement.headerBottom);
   if(width<=760)expect(placement.brandLeft).toBeCloseTo(width-placement.brandRight,0);
  }
 }
});

test('homepage gallery keeps six equal photo cards aligned on desktop and tablet and stacked on mobile',async({page})=>{
 for(const width of [320,375,390,430,768,853,1024,1280,1440]){
  await page.setViewportSize({width,height:1280});await page.goto(path('index.html'));await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.home-services .service-card')).toHaveCount(5);await expect(page.locator('.sample-card')).toHaveCount(6);
  await expect(page.locator('.header-contact a')).toHaveCount(2);await expect(page.locator('.header-call')).toHaveAttribute('href','tel:0622484089');
  await expect(page.locator('main .cta')).toHaveCount(0);await expect(page.locator('.blue-section .image-note')).toHaveCount(0);
  const geometry=await page.evaluate(()=>{
   const grid=document.querySelector('.sample-grid').getBoundingClientRect(),hero=document.querySelector('.hero-home').getBoundingClientRect();
   const cards=[...document.querySelectorAll('.sample-card')].map(e=>{const r=e.getBoundingClientRect(),photo=e.querySelector('.scene').getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,photoWidth:photo.width,photoHeight:photo.height};});
   return {gridCenter:(grid.left+grid.right)/2,cards,heroRatio:hero.width/hero.height,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  expect(geometry.overflow).toBe(false);
  if(width===853){expect(geometry.heroRatio).toBeGreaterThan(1);expect(geometry.heroRatio).toBeLessThan(2);}
  for(const card of geometry.cards){expect(card.width).toBeCloseTo(geometry.cards[0].width,0);expect(card.height).toBeCloseTo(geometry.cards[0].height,0);expect(card.photoWidth).toBeCloseTo(geometry.cards[0].photoWidth,0);expect(card.photoHeight).toBeCloseTo(geometry.cards[0].photoHeight,0);expect(card.photoWidth/card.photoHeight).toBeCloseTo(1.6,2);expect(card.left).toBeGreaterThanOrEqual(16);expect(card.right).toBeLessThanOrEqual(width-16);}
  const [a,b,c,d,e,f]=geometry.cards;
  if(width>1100){
   expect(a.top).toBeCloseTo(b.top,0);expect(b.top).toBeCloseTo(c.top,0);expect(b.left).toBeGreaterThanOrEqual(a.right);expect(c.left).toBeGreaterThanOrEqual(b.right);expect(d.top).toBeCloseTo(e.top,0);expect(e.top).toBeCloseTo(f.top,0);expect(e.left).toBeGreaterThanOrEqual(d.right);expect(f.left).toBeGreaterThanOrEqual(e.right);expect(d.top).toBeGreaterThanOrEqual(a.bottom);expect(d.left).toBeCloseTo(a.left,0);expect(e.left).toBeCloseTo(b.left,0);expect(f.left).toBeCloseTo(c.left,0);expect((d.left+f.right)/2).toBeCloseTo(geometry.gridCenter,0);
  }else if(width>760){
   expect(a.top).toBeCloseTo(b.top,0);expect(b.left).toBeGreaterThanOrEqual(a.right);expect(c.top).toBeCloseTo(d.top,0);expect(d.left).toBeGreaterThanOrEqual(c.right);expect(c.top).toBeGreaterThanOrEqual(a.bottom);expect(e.top).toBeGreaterThanOrEqual(c.bottom);expect(e.top).toBeCloseTo(f.top,0);expect(f.left).toBeGreaterThanOrEqual(e.right);expect(c.left).toBeCloseTo(a.left,0);expect(e.left).toBeCloseTo(a.left,0);expect(d.left).toBeCloseTo(b.left,0);expect(f.left).toBeCloseTo(b.left,0);expect((e.left+f.right)/2).toBeCloseTo(geometry.gridCenter,0);
  }else{
   for(let index=1;index<geometry.cards.length;index++){expect(geometry.cards[index].left).toBeCloseTo(a.left,0);expect(geometry.cards[index].top).toBeGreaterThanOrEqual(geometry.cards[index-1].bottom);}
  }
 }
 await page.goto(path('projects.html'));await expect(page.locator('.project-row').first().locator('.project-cover img')).toHaveAttribute('src',path('images/asphalt-job-01.webp'));await expect(page.locator('#empty-projects')).not.toBeVisible();
});

test('homepage hero matches requested wording, four benefits and blue phone button',async({page})=>{
 await page.goto(path('index.html'));await expect(page.locator('h1')).toHaveText('รับเหมาลาดยางมะตอยและงานหินคลุกครบวงจร');
 await expect(page.locator('.hero-copy')).toContainText('ถนน ลานจอดรถ ไซต์งาน โครงการภาครัฐและเอกชน');
 await expect(page.locator('.hero-copy')).toContainText('โดยทีมงานมืออาชีพ เครื่องจักรพร้อม ได้มาตรฐาน');
 await expect(page.locator('.hero-copy')).toContainText('งานเสร็จตรงเวลา');await expect(page.locator('.hero-benefit')).toHaveCount(4);
 await expect(page.locator('.hero-quote-note')).toHaveText('ฟรี! เข้าดูหน้างาน ประเมินเบื้องต้น');
 await expect(page.locator('.hero-quote .urgent-work-note')).toHaveText('งานด่วนโทรได้เลย เครื่องจักรครบ เริ่มงานไว');
 await expect(page.locator('.hero-quote .hero-line')).toHaveAttribute('href','https://line.me/ti/p/%40138wlldt');
 const button=page.locator('.hero-quote .hero-call');await expect(button).toHaveAttribute('href','tel:0622484089');await expect(button).toHaveText('โทร 062-248-4089');
 expect(await button.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(0, 119, 182)');
 for(const width of [320,375,390,430]){
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);
  const layout=await button.evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,wrap:getComputedStyle(el).whiteSpace,overflow:el.scrollWidth>el.clientWidth,height:r.height};});
  expect(layout.wrap).toBe('nowrap');expect(layout.overflow).toBe(false);expect(layout.left).toBeGreaterThanOrEqual(16);expect(layout.right).toBeLessThanOrEqual(width-16);expect(layout.height).toBeGreaterThanOrEqual(52);
 }
});

test('mobile estimate hero keeps its height when the automatic slide changes',async({page})=>{
 await page.clock.install();
 for(const width of [320,390]){
  await page.setViewportSize({width,height:1000});await page.goto(path('index.html'));await page.evaluate(()=>document.fonts.ready);
  const hero=page.locator('.hero-estimate');const before=await hero.evaluate(e=>e.getBoundingClientRect().height);
  for(let index=0;index<4;index++)await page.clock.runFor(6001);await expect(hero).toHaveAttribute('data-active-slide','4');
  expect(await hero.evaluate(e=>e.getBoundingClientRect().height)).toBeCloseTo(before,0);
 }
});
