import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
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
     heroHeight:document.querySelector('.hero, .paired-hero, .projects-hero').getBoundingClientRect().height,
     smallParagraphs:[...document.querySelectorAll('main p')].filter(p=>p.textContent.trim()&&parseFloat(getComputedStyle(p).fontSize)<16).map(p=>p.className),
     smallButtons:[...document.querySelectorAll('main .button')].filter(b=>b.getBoundingClientRect().height>0&&b.getBoundingClientRect().height<52).map(b=>b.textContent.trim()),
    }));
    expect(readability.heroFont).toBeGreaterThanOrEqual(34);expect(readability.heroFont).toBeLessThanOrEqual(44);
    expect(readability.heroHeight).toBeGreaterThanOrEqual(['services','projects'].includes(route)?220:380);expect(readability.smallParagraphs).toEqual([]);expect(readability.smallButtons).toEqual([]);
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
   if(width>760){await page.evaluate(()=>scrollTo(0,0));await expect(page.locator('.floating-contact')).toBeVisible();}
   await page.locator('#main-nav a').nth(1).click();await expect(page).toHaveURL(/services.html/);
   if(width>760){await page.evaluate(()=>scrollTo(0,0));await expect(page.locator('.floating-contact')).toBeVisible();}
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
  const row=page.locator('.project-row:visible');await expect(row).toHaveCount(category==='stone'?3:1);
  for(const item of await row.all())await expect(item).toHaveAttribute('data-category',category);
  await expect(page.locator('#empty-projects')).not.toBeVisible();
  if(category==='asphalt'){
   await expect(row.locator('.project-cover img')).toHaveAttribute('src',path('images/asphalt-job-01.webp'));
   await expect(row.locator('.project-cover img')).toHaveAttribute('alt','ภาพหน้างานลาดยางมะตอยบริเวณถนนและทางเข้าอาคาร');
   await expect(row.locator('.project-photo-count')).toHaveText('9 ภาพ');
   await expect(row.locator('.project-image-note')).toHaveCount(0);
  }
  if(category==='stone'){
   expect(await row.evaluateAll(items=>items.map(item=>item.id))).toEqual(['stone-yard','stone-building-yard','stone-home-yard']);
   await expect(row.locator('.project-photo-count')).toHaveText(['6 ภาพ','4 ภาพ','5 ภาพ']);
  }
 }
 await page.locator('[data-filter="all"]').click();await expect(page.locator('.project-row:visible')).toHaveCount(7);
 await expect(page.locator('.project-row:visible').first()).toHaveAttribute('data-category','asphalt');
});
test('production HTML contains indexable Thai content without JS',async()=>{
 for(const route of ['index','services','projects','contact']){
  const html=await readFile(`dist/${route}.html`,'utf8');expect(html).toContain('<h1>');expect(html).toContain('ขอประเมินราคา');expect(html).toContain('lang="th"');expect(html).toContain('name="description"');
 }
});

test('gallery shows the marking work photo and disables single-photo navigation',async({page})=>{
 await page.goto(path('projects.html'));await expect(page.locator('.project-row')).toHaveCount(7);
 const trigger=page.locator('.project-row[data-category="marking"] .photo-button');
 await trigger.click();await expect(page.locator('#lightbox')).toBeVisible();
 await expect(page.locator('#image-caption')).toHaveText('ภาพหน้างานตีเส้นจราจร');
 await expect(page.locator('#image-count')).toHaveText('1 / 1');
 await expect(page.getByRole('button',{name:'ภาพก่อนหน้า',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'ภาพถัดไป',exact:true})).toBeDisabled();
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
    return {width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom,font:parseFloat(s.fontSize),radius:parseFloat(s.borderRadius),wrap:s.whiteSpace,overflow:b.scrollWidth>b.clientWidth,align:s.alignItems,justify:s.justifyContent};
   }));
   for(const b of geometry){expect(b.height).toBe(route==='contact'?52:48);expect(b.height).toBeGreaterThanOrEqual(44);expect(b.font).toBe(18);if(route==='contact')expect(b.radius).toBe(14);else expect(b.radius).toBeGreaterThanOrEqual(b.height/2);expect(b.wrap).toBe('nowrap');expect(b.overflow).toBe(false);expect(b.align).toBe('center');expect(b.justify).toBe('center');expect(b.left).toBeGreaterThanOrEqual(16);expect(b.right).toBeLessThanOrEqual(width-16);}
   if(route==='contact'){
    expect(geometry[1].top-geometry[0].bottom).toBe(16);await expect(page.locator('.floating-contact')).not.toBeVisible();
   }else{
    expect(geometry[1].left-geometry[0].right).toBeCloseTo(12,1);
    expect(geometry[0].width).toBeCloseTo(geometry[1].width,1);
    expect(geometry[0].top).toBeCloseTo(geometry[1].top,1);
    const dock=await page.locator('.floating-contact').evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,bottom:r.bottom};});
    expect(dock.width).toBeCloseTo(Math.min(360,width-32),1);
    expect(dock.left).toBeGreaterThanOrEqual(16);expect(dock.right).toBeLessThanOrEqual(width-16);
    expect(dock.left).toBeCloseTo(width-dock.right,0);
    expect(850-dock.bottom).toBeGreaterThanOrEqual(12);
    expect(geometry[0].left-dock.left).toBeGreaterThanOrEqual(8);expect(dock.right-geometry[1].right).toBeGreaterThanOrEqual(8);
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    const unobstructed=await page.evaluate(()=>document.querySelector('.site-footer').getBoundingClientRect().bottom<=document.querySelector('.floating-contact').getBoundingClientRect().top);
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
 const hero=page.locator('.hero-home');await expect(hero.locator('.slide-dots,[data-slide]')).toHaveCount(0);
 for(const index of [1,2,3,4,0]){
  await page.clock.runFor(6001);await expect(hero).toHaveAttribute('data-active-slide',String(index));
  await expect(page.locator('.slide-count')).toHaveText(`${String(index+1).padStart(2,'0')} / 05`);
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
   if(index>0)await page.getByRole('button',{name:'สไลด์ถัดไป',exact:true}).click();await expect(hero).toHaveAttribute('data-active-slide',String(index));
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
  await page.getByRole('button',{name:'สไลด์ถัดไป',exact:true}).click();
  await expect(page.locator('.hero-home')).toHaveAttribute('data-active-slide',String(index+1));
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

test('reference header keeps compact equal-sized contacts readable on every page and breakpoint',async({page})=>{
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
   await expect(contacts.nth(0)).toHaveText('โทร 062-248-4089');
   await expect(contacts.nth(1)).toHaveAttribute('href','https://line.me/ti/p/%40138wlldt');
   await expect(contacts.nth(1)).toContainText('@138wlldt');
   for(const contact of await contacts.all()) await expect(contact).toBeVisible();
   const contactLayout=await contacts.evaluateAll(items=>items.map(e=>{
    const r=e.getBoundingClientRect(),s=getComputedStyle(e),icon=e.querySelector('.icon,.line-symbol').getBoundingClientRect();
    const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let node,textClipped=false;
    while((node=walker.nextNode())){if(!node.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(node);for(const rect of range.getClientRects()){if(rect.left<r.left-1||rect.right>r.right+1||rect.top<r.top-1||rect.bottom>r.bottom+1)textClipped=true;}}
    return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,radius:parseFloat(s.borderRadius),font:parseFloat(s.fontSize),wrap:s.whiteSpace,overflow:e.scrollWidth>e.clientWidth,iconWidth:icon.width,iconHeight:icon.height,textClipped};
   }));
   for(const contact of contactLayout){expect(contact.left).toBeGreaterThanOrEqual(12);expect(contact.right).toBeLessThanOrEqual(width-12);expect(contact.height).toBeCloseTo(40,1);expect(contact.radius).toBeGreaterThanOrEqual(contact.height/2);expect(contact.font).toBeGreaterThanOrEqual(width>760?14:13);expect(contact.wrap).toBe('nowrap');expect(contact.overflow).toBe(false);expect(contact.textClipped).toBe(false);expect(contact.iconWidth).toBeLessThanOrEqual(18);expect(contact.iconHeight).toBeLessThanOrEqual(18);}
   const [call,line]=contactLayout;expect(call.width).toBeCloseTo(line.width,1);expect(call.height).toBeCloseTo(line.height,1);expect(call.radius).toBeCloseTo(line.radius,1);expect(call.right<=line.left-7||line.right<=call.left-7||call.bottom<=line.top-7||line.bottom<=call.top-7).toBe(true);
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
   expect(activeStyle.color).toBe('rgb(0, 159, 232)');expect(activeStyle.background).toBe('rgba(0, 0, 0, 0)');expect(activeStyle.underlineHeight).toBeGreaterThanOrEqual(2);expect(activeStyle.underlineTransform).toBe('matrix(1, 0, 0, 1, 0, 0)');
   if(width>1200){
    const geometry=await page.evaluate(()=>{const brand=document.querySelector('header .brand').getBoundingClientRect();const nav=document.querySelector('#main-nav').getBoundingClientRect();const call=document.querySelector('.header-contact').getBoundingClientRect();return {brandRight:brand.right,navLeft:nav.left,navRight:nav.right,callLeft:call.left,callRight:call.right};});
    expect(geometry.navLeft-geometry.brandRight).toBeGreaterThanOrEqual(12);expect(geometry.callLeft-geometry.navRight).toBeGreaterThanOrEqual(12);expect(geometry.callRight).toBeLessThanOrEqual(width-20);
   }
  }
 }
});

test('homepage gallery keeps five equal photo cards centered on desktop and tablet and stacked on mobile',async({page})=>{
 for(const width of [320,375,390,430,768,853,1024,1280,1440]){
  await page.setViewportSize({width,height:1280});await page.goto(path('index.html'));await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.home-services .service-card')).toHaveCount(5);await expect(page.locator('.sample-card')).toHaveCount(5);
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
  const [a,b,c,d,e]=geometry.cards;
  if(width>1100){
   expect(a.top).toBeCloseTo(b.top,0);expect(b.top).toBeCloseTo(c.top,0);expect(b.left).toBeGreaterThanOrEqual(a.right);expect(c.left).toBeGreaterThanOrEqual(b.right);expect(d.top).toBeCloseTo(e.top,0);expect(e.left).toBeGreaterThanOrEqual(d.right);expect(d.top).toBeGreaterThanOrEqual(a.bottom);expect((d.left+e.right)/2).toBeCloseTo(geometry.gridCenter,0);
  }else if(width>760){
   expect(a.top).toBeCloseTo(b.top,0);expect(b.left).toBeGreaterThanOrEqual(a.right);expect(c.top).toBeCloseTo(d.top,0);expect(d.left).toBeGreaterThanOrEqual(c.right);expect(c.top).toBeGreaterThanOrEqual(a.bottom);expect(e.top).toBeGreaterThanOrEqual(c.bottom);expect((e.left+e.right)/2).toBeCloseTo(geometry.gridCenter,0);
  }else{
   for(let index=1;index<geometry.cards.length;index++){expect(geometry.cards[index].left).toBeCloseTo(a.left,0);expect(geometry.cards[index].top).toBeGreaterThanOrEqual(geometry.cards[index-1].bottom);}
  }
 }
 await page.goto(path('services.html'));await expect(page.locator('.image-note').first()).toContainText('ภาพประกอบบริการ');
 await page.goto(path('projects.html'));await expect(page.locator('.project-row').first().locator('.project-cover img')).toHaveAttribute('src',path('images/asphalt-job-01.webp'));await expect(page.locator('#empty-projects')).not.toBeVisible();
});

test('homepage hero matches requested wording, four benefits and blue phone button',async({page})=>{
 await page.goto(path('index.html'));await expect(page.locator('h1')).toHaveText('รับเหมาลาดยางมะตอยและงานหินคลุกครบวงจร');
 await expect(page.locator('.hero-copy')).toContainText('ถนน ลานจอดรถ ไซต์งาน โครงการภาครัฐและเอกชน');
 await expect(page.locator('.hero-copy')).toContainText('โดยทีมงานมืออาชีพ เครื่องจักรพร้อม ได้มาตรฐาน');
 await expect(page.locator('.hero-copy')).toContainText('งานเสร็จตรงเวลา');await expect(page.locator('.hero-benefit')).toHaveCount(4);
 await expect(page.locator('.hero-quote-note')).toHaveText('ฟรี! เข้าดูหน้างาน ประเมินเบื้องต้น');
 const button=page.locator('.hero-quote .button');await expect(button).toHaveAttribute('href','tel:0622484089');await expect(button).toHaveText('โทร 062-248-4089');
 expect(await button.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(0, 119, 182)');
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
  for(let index=0;index<4;index++)await page.getByRole('button',{name:'สไลด์ถัดไป',exact:true}).click();await expect(hero).toHaveAttribute('data-active-slide','4');
  expect(await hero.evaluate(e=>e.getBoundingClientRect().height)).toBeCloseTo(before,0);
 }
});
