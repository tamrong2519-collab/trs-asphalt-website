import '@fontsource/kanit/400.css';
import '@fontsource/kanit/600.css';
import '@fontsource/kanit/700.css';
import '@fontsource/kanit/800.css';
import '@fontsource/kanit/900.css';
import './style.css';
import './reference.css';
import { initializeSlider } from './slider.js';
import { business as b, services, projects } from './data.js';
const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL = s => { try { const u = new URL(s); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
const phone = b.phone.replace(/[^\d+]/g, '');
const line = safeURL(b.lineUrl);
const base = import.meta.env.BASE_URL;
const siteURL = import.meta.env.VITE_SITE_URL || b.siteUrl;
const localPaths = html => html.replace(/(href|src)="\/(?!\/)/g, `$1="${base}`);
const page = document.body.dataset.page;
const nav = [['index','หน้าแรก'],['services','บริการของเรา'],['projects','ผลงานของเรา'],['contact','ติดต่อเรา']];
const shapes = {
 phone: '<path d="M6 3l4 4-2 3c2 3 3 4 6 6l3-2 4 4-2 3C11 23 1 13 3 6z"/>',
 road: '<path d="M7 2h10l6 20H1z"/><path d="M12 3v4m0 3v4m0 3v4" stroke="white" stroke-width="2"/>',
 gravel: '<circle cx="12" cy="5" r="4"/><circle cx="6" cy="13" r="4"/><circle cx="18" cy="13" r="4"/><circle cx="2" cy="21" r="3"/><circle cx="12" cy="21" r="4"/><circle cx="22" cy="21" r="3"/>',
 bump: '<path d="M1 20C1 1 23 1 23 20z"/><path d="M8 5v15M16 5v15" stroke="white" stroke-width="1.5"/>',
 camera: '<path d="M2 7h5l2-4h6l2 4h5v15H2z"/><circle cx="12" cy="14" r="5" fill="white"/><circle cx="12" cy="14" r="3"/>',
 mail: '<path d="M2 4h20v16H2zM3 5l9 8 9-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
 pin: '<path d="M12 1C0 1 0 14 12 23 24 14 24 1 12 1z"/><circle cx="12" cy="9" r="4" fill="white"/>',
 work: '<path d="M2 18h20v4H2zM4 17V8h9v9M10 8V2h9v5l-5 6h-4M18 7l4 4-2 6h-4"/>',
 check: '<path d="M2 12l6 6L22 3" fill="none" stroke="currentColor" stroke-width="3"/>',
 arrow: '<path d="M3 12h18M14 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2"/>',
};
const icon = name => `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">${shapes[name] || shapes.work}</svg>`;
const arrow = icon('arrow');
const serviceIcon = s => icon(s.id==='asphalt'||s.id==='marking'?'road':s.id==='speed-bump'?'bump':'gravel');
const call = (cls='button primary',label='') => phone ? `<a class="${cls}" href="tel:${phone}">${icon('phone')}${label || escape(b.phone)}</a>` : `<a class="${cls}" href="/contact.html">สอบถามช่องทางโทร</a>`;
const lineButton = (label='LINE ส่งรูปหน้างาน',cls='button line') => line ? `<a class="${cls}" href="${escape(line)}" target="_blank" rel="noopener noreferrer"><span class="line-symbol" aria-hidden="true">LINE</span>${label}</a>` : '<a class="button line" href="/contact.html">สอบถามช่องทาง LINE</a>';
const quote = `<a class="button primary" href="/contact.html#estimate">ขอประเมินราคา ${arrow}</a>`;
const brand = `<a class="brand" href="/index.html" aria-label="${escape(b.name)} หน้าแรก"><img src="/images/logo.webp" alt="" width="72" height="72"><span>${escape(b.name)}<small>CONSTRUCTION</small></span></a>`;
const scene = (n,alt,cls='') => `<div class="scene scene-${n} ${cls}"><img src="/images/work-scenes.webp" alt="${escape(alt)}" width="1536" height="1024" loading="lazy"></div>`;
const serviceImage = s => s.homeImage ? `<div class="scene work-photo"><img src="${escape(s.homeImage)}" alt="ภาพหน้างาน${escape(s.title)}" width="1280" height="960" loading="lazy"></div>` : scene(s.scene,`ภาพประกอบ${s.title}`);
const sectionHead = (title,copy='',action='') => `<div class="section-heading"><h2>${title}</h2>${copy?`<p>${copy}</p>`:''}${action}</div>`;
const banner = (title,text,home=false) => `<section class="hero ${home?'hero-home':''}"><img class="hero-image" src="/images/hero.webp" alt="ภาพประกอบเครื่องจักรและทีมงานลาดยางมะตอย" width="1536" height="1024" fetchpriority="high"><div class="hero-overlay"></div><div class="container hero-content"><h1>${title}</h1><p class="${home?'hero-services':'hero-subtitle'}">${text}</p>${home?`<div class="hero-benefits"><span>${icon('check')}วางแผนตามหน้างาน</span><span>${icon('work')}เครื่องจักรพร้อม</span><span>${icon('pin')}ดูแลครบทุกขั้นตอน</span></div><div class="actions">${quote}<a class="button white-outline" href="/projects.html">ดูผลงาน ${arrow}</a></div>`:''}</div>${home?`<div class="hero-scene" hidden></div><div class="slider-controls" aria-label="ควบคุมสไลด์หน้าแรก"><button class="slide-prev" aria-label="สไลด์ก่อนหน้า">‹</button><div class="slide-dots">${services.map((s,i)=>`<button data-slide="${i}" aria-label="สไลด์ ${i+1}: ${s.title}" aria-pressed="${i===0}"><span></span></button>`).join('')}</div><button class="slide-next" aria-label="สไลด์ถัดไป">›</button><button class="slide-play" aria-label="หยุดสไลด์อัตโนมัติ"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3h5v18H5zM14 3h5v18h-5z"/></svg></button></div>`:''}</section>`;
const steps = `<section class="container section">${sectionHead('ขั้นตอนการให้บริการ','เริ่มต้นจากความเข้าใจพื้นที่ สู่แผนงานที่ชัดเจน')}<div class="process-grid">${[['01','สำรวจหน้างาน','ประเมินพื้นที่ รับฟังความต้องการ และกำหนดแนวทางที่เหมาะสม','pin'],['02','เสนอราคา','พูดคุยขอบเขตงาน วัสดุ และแผนดำเนินงาน','mail'],['03','ดำเนินงาน','เตรียมพื้นที่และทำงานตามรายละเอียดที่ตกลง','work']].map(([n,t,d,i])=>`<article class="process-card"><span class="step-number">${n}</span>${icon(i)}<div><h3>${t}</h3><p>${d}</p></div></article>`).join('')}</div></section>`;
const home = `${banner('รับเหมาลาดยางมะตอย<br><span>และงานหินคลุกครบวงจร</span>','ถนน ลานจอดรถ และพื้นที่ใช้งาน สำหรับบ้าน ธุรกิจ และโครงการ',true)}<section class="container section home-overview"><div class="overview-services">${sectionHead('บริการของเรา','',`<a class="text-link" href="/services.html">ดูบริการทั้งหมด ${arrow}</a>`)}<div class="service-grid home-services">${services.map(s=>`<a class="service-card" href="/services.html#${s.id}">${serviceImage(s)}<div class="card-content"><h3>${s.title}</h3></div></a>`).join('')}</div></div><div class="overview-projects">${sectionHead('ผลงานของเรา','',`<a class="text-link" href="/projects.html">ดูภาพทั้งหมด ${arrow}</a>`)}<div class="home-projects">${services.filter(s=>s.homeImage).slice(0,3).map(s=>`<a href="/projects.html">${serviceImage(s)}<h3>${s.title}</h3></a>`).join('')}</div></div></section><section class="container home-note"><p>รับงานลาดยาง หินคลุก หินเกล็ด ลูกระนาด และตีเส้นจราจร พร้อมให้คำปรึกษาและประเมินหน้างาน</p>${quote}</section>`;
const servicePage = `${banner('บริการของเรา','งานลาดยางมะตอยและงานหินคลุกครบวงจร ตอบโจทย์พื้นที่และการใช้งานของคุณ')}<section class="container section"><div class="service-grid feature-services">${services.map(s=>`<article class="service-card">${serviceImage(s)}<div class="card-content"><h2>${s.title}</h2><p>${s.description}</p><a class="button primary" href="#${s.id}">ดูรายละเอียด ${arrow}</a></div></article>`).join('')}<article class="service-card preparation-card">${scene(5,'ภาพประกอบการเตรียมพื้นที่')}<div class="card-content"><h2>ปรับพื้นที่และเตรียมงาน</h2><p>วางแผนระดับพื้น การบดอัด และการระบายน้ำ ก่อนเริ่มงานผิวทาง</p><a class="button primary" href="/contact.html#estimate">ขอประเมินราคา ${arrow}</a></div></article></div><p class="image-note">ภาพหินคลุก หินเกล็ด ลูกระนาด และตีเส้นเป็นภาพหน้างานของทีมงาน ส่วนภาพลาดยางและเตรียมพื้นที่เป็นภาพประกอบ</p></section><section class="container service-details">${services.map(s=>`<article id="${s.id}" class="service-detail"><div><p class="eyebrow">${s.subtitle}</p><h2>${s.title}</h2><p>${s.description}</p></div><div><ul class="checklist">${s.details.map(d=>`<li>${icon('check')}${d}</li>`).join('')}</ul><a class="text-link" href="/contact.html?service=${s.id}#estimate">ขอประเมินงาน${s.title} ${arrow}</a></div></article>`).join('')}</section>${steps}`;
const projectPage = `${banner('ผลงานของเรา','ภาพหน้างานหินคลุก หินเกล็ด ลูกระนาด และตีเส้นจราจร ดูรายละเอียดเพื่อวางแผนงานของคุณ')}<section class="container section"><div class="filters" aria-label="กรองประเภทผลงาน"><button class="filter active" data-filter="all" aria-pressed="true">ทั้งหมด</button>${services.map(s=>`<button class="filter" data-filter="${s.id}" aria-pressed="false">${s.title}</button>`).join('')}</div><p id="empty-projects" class="image-note">ภาพหน้างานแยกตามประเภทบริการ — ภาพลาดยางมะตอยเป็นภาพตัวอย่างประกอบ</p><div id="project-grid" class="project-grid"></div></section><section class="container project-inquiry"><div><h2>มีพื้นที่ที่ต้องการปรับปรุง?</h2><p>ส่งรูปหน้างานให้ทีมงานช่วยประเมินแนวทางและราคา</p></div>${quote}</section><dialog id="lightbox"><button id="close-lightbox" class="close-button" aria-label="ปิดภาพ">✕</button><div id="lightbox-image"></div><p id="image-caption"></p></dialog>`;
const estimateForm = `<section class="container section"><div id="estimate" class="estimate"><div><p class="eyebrow">REQUEST AN ESTIMATE</p><h2>ขอประเมินราคา</h2><p>กรอกข้อมูลเพื่อเตรียมข้อความ แล้วส่งให้ทีมงานผ่าน LINE หรืออีเมล</p><p class="form-note">ข้อมูลยังไม่ส่งหรือบันทึกบนเว็บไซต์จนกว่าคุณจะส่งข้อความผ่านช่องทางติดต่อ</p></div><div><form id="estimate-form"><div class="form-row"><div><label for="customer">ชื่อผู้ติดต่อ <span>*</span></label><input id="customer" name="customer" autocomplete="name" maxlength="100" required></div><div><label for="phone">เบอร์โทรติดต่อกลับ <span>*</span></label><input id="phone" name="phone" type="tel" autocomplete="tel" pattern="[0-9+ ()-]{8,20}" maxlength="20" required></div></div><label for="service">บริการที่สนใจ <span>*</span></label><select id="service" name="service" required><option value="">เลือกบริการ</option>${services.map(s=>`<option value="${s.id}">${s.title}</option>`).join('')}</select><div class="form-row"><div><label for="location">จังหวัด / พื้นที่หน้างาน <span>*</span></label><input id="location" name="location" maxlength="150" required></div><div><label for="area">ขนาดพื้นที่โดยประมาณ</label><input id="area" name="area" placeholder="เช่น 200 ตร.ม." maxlength="100"></div></div><label for="details">รายละเอียดเพิ่มเติม</label><textarea id="details" name="details" rows="3" maxlength="2000" placeholder="สภาพพื้นเดิม ประเภทการใช้งาน หรือช่วงเวลาที่ต้องการ"></textarea><button class="button primary" type="submit">สร้างข้อความขอประเมินราคา ${arrow}</button></form><div id="estimate-result" hidden><h3>ข้อความพร้อมส่ง</h3><textarea id="message" rows="9" readonly aria-label="ข้อความขอประเมินราคา"></textarea><div class="actions"><button class="button primary" id="copy-message">คัดลอกข้อความ</button>${lineButton('เปิด LINE')}${b.email?'<a class="button outline" id="email-message">ส่งทางอีเมล</a>':''}</div><p id="copy-status" role="status"></p></div></div></div></section>`;
const contactPage = `${banner('ติดต่อเรา','สอบถามข้อมูล ขอประเมินราคา หรือนัดสำรวจหน้างาน ทีมงานพร้อมให้คำปรึกษา')}<section class="container section contact-layout"><div class="quote-panel">${estimateForm}</div><aside class="contact-panel">${sectionHead('ช่องทางการติดต่อ')}<p>ติดต่อทีมงานโดยตรง หรือส่งรูปหน้างานเพื่อประกอบการประเมินราคา</p><div class="contact-box"><span class="contact-icon">${icon('phone')}</span><div><h3>โทรศัพท์</h3><a href="tel:${phone}">${escape(b.phone)}</a></div></div><div class="contact-box"><span class="contact-icon green"><span class="line-symbol">LINE</span></span><div><h3>LINE</h3><a href="${escape(line)}" target="_blank" rel="noopener noreferrer">${escape(b.lineId)}</a></div></div><div class="contact-box contact-email"><span class="contact-icon">${icon('mail')}</span><div><h3>อีเมล</h3><a href="mailto:${escape(b.email)}">${escape(b.email)}</a></div></div><div class="actions">${call('button primary',`โทร ${escape(b.phone)}`)}${lineButton(`LINE ${escape(b.lineId)}`)}</div><div class="contact-area">${icon('pin')}<div><h3>พื้นที่ให้บริการ</h3><p>${escape(b.serviceArea)}</p></div></div></aside></section>`;
document.getElementById('app').innerHTML = localPaths(`<a class="skip-link" href="#main">ข้ามไปเนื้อหา</a><header class="site-header"><div class="container header-inner">${brand}<button class="menu-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="เปิดเมนู">☰</button><nav id="main-nav" aria-label="เมนูหลัก">${nav.map(([id,t])=>`<a href="/${id}.html" ${id===page?'aria-current="page"':''}>${t}</a>`).join('')}</nav><div class="header-contact">${quote}</div></div></header><main id="main">${({index:home,services:servicePage,projects:projectPage,contact:contactPage})[page] || home}</main><footer><div class="container footer-inner">${brand}<div class="footer-contacts">${call('footer-phone')}${lineButton(escape(b.lineId),'footer-line')}<a class="footer-email" href="mailto:${escape(b.email)}">${icon('mail')}${escape(b.email)}</a></div><nav class="footer-nav" aria-label="เมนูท้ายเว็บไซต์">${nav.map(([id,t])=>`<a href="/${id}.html">${t}</a>`).join('')}</nav></div><div class="footer-stripes" aria-hidden="true"></div></footer><div class="floating-contact" aria-label="ติดต่อด่วน">${call('float-button float-call',`<span class="float-label-desktop">โทร ${escape(b.phone)}</span><span class="float-label-mobile">โทรเลย</span>`)}${lineButton('<span class="float-label-desktop">LINE ส่งรูปหน้างาน</span><span class="float-label-mobile">LINE</span>','float-button float-line')}</div>`);
if(page==='index' && typeof initializeSlider==='function'){initializeSlider({scene: (n,alt)=>localPaths(scene(n,alt)), image: s=>localPaths(serviceImage({...s, homeImage: s.slideImage || s.homeImage})), services});}
const toggle = document.querySelector('.menu-toggle');
toggle.addEventListener('click',()=>{const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded',open); toggle.setAttribute('aria-label',open?'ปิดเมนู':'เปิดเมนู'); document.getElementById('main-nav').classList.toggle('open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){toggle.setAttribute('aria-expanded','false');document.getElementById('main-nav').classList.remove('open');}});
if(page==='contact') {
 const disclosure=document.getElementById('estimate');
 const openEstimate=()=>{if(location.hash==='#estimate' && disclosure?.tagName==='DETAILS'){disclosure.open=true;}};
 openEstimate();window.addEventListener('hashchange',openEstimate);
 const selected = new URLSearchParams(location.search).get('service');
 if(services.some(s=>s.id===selected)) document.getElementById('service').value=selected;
 document.getElementById('estimate-form').addEventListener('submit',e=>{
  e.preventDefault(); const f=new FormData(e.target);
  const message=`ขอประเมินราคางาน\nชื่อ: ${f.get('customer')}\nโทร: ${f.get('phone')}\nบริการ: ${services.find(s=>s.id===f.get('service'))?.title}\nพื้นที่: ${f.get('location')}\nขนาด: ${f.get('area') || 'ยังไม่ทราบ'}\nรายละเอียด: ${f.get('details') || '-'}`;
  document.getElementById('message').value=message;
  document.getElementById('estimate-result').hidden=false;
  if(b.email) document.getElementById('email-message').href=`mailto:${b.email}?subject=${encodeURIComponent('ขอประเมินราคางาน')}&body=${encodeURIComponent(message)}`;
  document.getElementById('message').focus();
 });
 document.getElementById('copy-message').addEventListener('click',async()=>{
  const field=document.getElementById('message');
  try {await navigator.clipboard.writeText(field.value);document.getElementById('copy-status').textContent='คัดลอกแล้ว กรุณาส่งข้อความให้ทีมงาน';}
  catch {field.focus();field.select();document.getElementById('copy-status').textContent='กรุณาคัดลอกข้อความที่เลือกด้วยตนเอง';}
 });
}
if(page==='projects') {
 const render=category=>{
  const items=projects.filter(p=>category==='all'||p.category===category);
  document.getElementById('empty-projects').hidden=items.length>0;
  const examples=services.filter(s=>category==='all'||s.id===category);
  document.getElementById('project-grid').innerHTML=localPaths(items.length ? items.map(p=>`<article class="project-card"><div class="project-photos">${p.images.map(img=>`<button class="photo-button" data-image="${escape(img.src)}" data-alt="${escape(img.alt)}"><img src="${escape(img.src)}" alt="${escape(img.alt)}" loading="lazy" width="1200" height="700"></button>`).join('')}</div><div class="project-caption"><h2>${escape(p.title)}</h2><p>${escape(p.location)}</p><p>${escape(p.description)}</p></div></article>`).join('') : examples.map(s=>`<article class="project-card"><button class="photo-button" ${s.homeImage?`data-image="${escape(s.homeImage)}"`:`data-scene="${s.scene}"`} data-alt="${s.homeImage?'ภาพหน้างาน':'ภาพตัวอย่าง'}${s.title}">${serviceImage(s)}<span class="photo-label">${s.homeImage?'ภาพหน้างาน':'ภาพตัวอย่าง'}</span></button><div class="project-caption">${serviceIcon(s)}<div><h2>${s.title}</h2><p>${s.description}</p></div>${arrow}</div></article>`).join(''));
 };
 render('all');
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===btn);x.setAttribute('aria-pressed',String(x===btn));});render(btn.dataset.filter);}));
 const dialog=document.getElementById('lightbox');
 document.getElementById('project-grid').addEventListener('click',e=>{
  const btn=e.target.closest('.photo-button');if(!btn)return;
  document.getElementById('lightbox-image').innerHTML=btn.dataset.scene!==undefined ? localPaths(scene(Number(btn.dataset.scene),btn.dataset.alt)) : `<img src="${escape(btn.querySelector('img').src)}" alt="${escape(btn.dataset.alt)}">`;
  document.getElementById('image-caption').textContent=btn.dataset.alt;dialog.showModal();
 });
 document.getElementById('close-lightbox').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
}
if(safeURL(siteURL)) {
 const url=new URL(page==='index'?'':`${page}.html`,siteURL.endsWith('/')?siteURL:`${siteURL}/`).href;
 const canonical=document.querySelector('link[rel=canonical]') || document.createElement('link');canonical.rel='canonical';canonical.href=url;document.head.append(canonical);
 const og=document.querySelector('meta[property="og:url"]') || document.createElement('meta');og.setAttribute('property','og:url');og.content=url;document.head.append(og);
 const schema=document.querySelector('script[type="application/ld+json"]') || document.createElement('script');schema.type='application/ld+json';schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'GeneralContractor',name:b.name,url:siteURL,...(phone?{telephone:phone}:{}),...(b.email?{email:b.email}:{}),...(line?{sameAs:[line]}:{})});document.head.append(schema);
}
