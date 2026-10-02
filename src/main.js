import '@fontsource/prompt/400.css';
import '@fontsource/prompt/500.css';
import '@fontsource/prompt/600.css';
import '@fontsource/prompt/700.css';
import './style.css';
import './home-reference.css';
import './arrows.css';
import './hero-estimate.css';
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
const nav = [['index','หน้าแรก'],['services','บริการ'],['projects','ผลงาน'],['contact','ติดต่อเรา']];
const shapes = {
 shield: '<path d="M12 2l8 3v6c0 5-3 8-8 11-5-3-8-6-8-11V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 11l3 3 5-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
 worker: '<path d="M5 9a7 7 0 0 1 14 0H5zM3 11h18v2H3zM4 23v-4c0-3 4-5 8-5s8 2 8 5v4z"/><path d="M12 2v6" fill="none" stroke="white" stroke-width="1.5"/>',
 gear: '<path d="M10 2h4l1 3 3-1 3 3-1 3 3 1v4l-3 1 1 3-3 3-3-1-1 3h-4l-1-3-3 1-3-3 1-3-3-1v-4l3-1-1-3 3-3 3 1z"/><circle cx="12" cy="13" r="4" fill="white"/>',
 clock: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
 helmet: '<path d="M3 16a9 9 0 0 1 18 0H3z"/><path d="M2 18h20v3H2z"/><path d="M12 3v10" stroke="white" stroke-width="2"/>',
 handshake: '<path d="M2 8l5-4 5 2 5-2 5 4-4 10-4 3-6-2-5-5z"/><path d="M8 8l4-2 5 5-3 3-4-3-2 2" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round"/>',
 phone: '<path d="M6 3l4 4-2 3c2 3 3 4 6 6l3-2 4 4-2 3C11 23 1 13 3 6z"/>',
 road: '<path d="M7 2h10l6 20H1z"/><path d="M12 3v4m0 3v4m0 3v4" stroke="white" stroke-width="2"/>',
 gravel: '<circle cx="12" cy="5" r="4"/><circle cx="6" cy="13" r="4"/><circle cx="18" cy="13" r="4"/><circle cx="2" cy="21" r="3"/><circle cx="12" cy="21" r="4"/><circle cx="22" cy="21" r="3"/>',
 bump: '<path d="M1 20C1 1 23 1 23 20z"/><path d="M8 5v15M16 5v15" stroke="white" stroke-width="1.5"/>',
 camera: '<path d="M2 7h5l2-4h6l2 4h5v15H2z"/><circle cx="12" cy="14" r="5" fill="white"/><circle cx="12" cy="14" r="3"/>',
 mail: '<path d="M2 4h20v16H2zM3 5l9 8 9-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
 pin: '<path d="M12 1C0 1 0 14 12 23 24 14 24 1 12 1z"/><circle cx="12" cy="9" r="4" fill="white"/>',
 work: '<path d="M2 18h20v4H2zM4 17V8h9v9M10 8V2h9v5l-5 6h-4M18 7l4 4-2 6h-4"/>',
 check: '<path d="M2 12l6 6L22 3" fill="none" stroke="currentColor" stroke-width="3"/>',
 arrow: '<path d="M4 12h16M14 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
 'chevron-right': '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
 'chevron-left': '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
};
const icon = name => `<svg class="icon icon-${name}" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor">${shapes[name] || shapes.work}</svg>`;
const arrow = icon('arrow');
const chevron = icon('chevron-right');
const serviceIcon = s => icon(s.id==='asphalt'||s.id==='marking'?'road':s.id==='speed-bump'?'bump':'gravel');
const call = (cls='button primary',label='') => phone ? `<a class="${cls}" href="tel:${phone}">${icon('phone')}${label || escape(b.phone)}</a>` : `<a class="${cls}" href="/contact.html">สอบถามช่องทางโทร</a>`;
const lineButton = (label='LINE ส่งรูปหน้างาน',cls='button line') => line ? `<a class="${cls}" href="${escape(line)}" target="_blank" rel="noopener noreferrer"><span class="line-symbol" aria-hidden="true">LINE</span>${label}</a>` : '<a class="button line" href="/contact.html">สอบถามช่องทาง LINE</a>';
const quote = `<a class="button primary" href="/contact.html#estimate">ขอประเมินราคา ${arrow}</a>`;
const brand = `<a class="brand" href="/index.html" aria-label="${escape(b.name)} หน้าแรก"><img src="/images/logo.webp" alt="" width="72" height="72"><span>${escape(b.name)}<small>CONSTRUCTION</small></span></a>`;
const scene = (n,alt,cls='') => `<div class="scene scene-${n} ${cls}"><img src="/images/work-scenes.webp" alt="${escape(alt)}" width="1536" height="1024" loading="lazy"></div>`;
const serviceImage = s => page==='index' && s.homeImage ? `<div class="scene work-photo"><img src="${escape(s.homeImage)}" alt="ภาพหน้างาน${escape(s.title)}" width="1280" height="960" loading="lazy"></div>` : scene(s.scene,`ภาพประกอบ${s.title}`);
const homeTitle = s => ({gravel:'ลานหินคลุก',stone:'หินเกล็ด','speed-bump':'ลูกระนาด'})[s.id] || s.title;
const homeDescription = s => ({asphalt:'ถนน ลานจอดรถ<br>และพื้นที่ใช้งาน',gravel:'เกลี่ยและบดอัด<br>ลานจอดรถ ทางเข้าออก',stone:'ปรับพื้นลาน<br>และพื้นที่ใช้งาน','speed-bump':'ชะลอความเร็ว<br>ภายในพื้นที่',marking:'ตีเส้นถนน<br>และช่องจอดรถ'})[s.id];
const card = s => `<a class="service-card" href="/services.html#${s.id}">${serviceImage(s)}<div class="card-content"><span class="service-icon">${serviceIcon(s)}</span><div><h3>${page==='index'?homeTitle(s):s.title}</h3><p>${page==='index'?homeDescription(s):s.description}</p></div><span class="card-arrow">${chevron}</span></div></a>`;
const sectionHead = (title,copy='',action='') => `<div class="section-heading"><h2>${title}</h2>${copy?`<p>${copy}</p>`:''}${action}</div>`;
const heroBenefits = `<div class="hero-benefits">${[['shield','งานคุณภาพ','ได้มาตรฐาน'],['worker','ทีมงานมืออาชีพ','ประสบการณ์จริง'],['gear','เครื่องจักรพร้อม','รองรับทุกขนาดงาน'],['clock','ส่งมอบงาน','ตรงเวลา']].map(([i,t,d])=>`<div class="hero-benefit">${icon(i)}<div><strong>${t}</strong><span>${d}</span></div></div>`).join('')}</div>`;
const banner = (title,text,home=false) => `<section class="hero ${home?'hero-home hero-estimate':''}"><img class="hero-image" src="${home?'/images/hero-daylight.webp':'/images/hero.webp'}" alt="ภาพประกอบเครื่องจักรและทีมงานลาดยางมะตอย" width="1536" height="1024" fetchpriority="high"><div class="hero-overlay"></div><div class="container hero-content">${home?'<div class="hero-kicker"><span>TRS TAMRONGSAK CONSTRUCTION</span><span class="slide-count" aria-label="สไลด์ปัจจุบัน">01 / 05</span></div>':''}<h1>${title}</h1><p class="${home?'hero-copy':'hero-subtitle'}">${text}</p>${home?`${heroBenefits}<div class="hero-quote">${call('button primary hero-call',`โทร ${escape(b.phone)}`)}<p class="hero-quote-note">ฟรี! เข้าดูหน้างาน ประเมินเบื้องต้น</p></div>`:''}</div>${home?`<div class="hero-scene" hidden></div><div class="slider-controls" aria-label="ควบคุมสไลด์หน้าแรก"><button class="slide-prev" aria-label="สไลด์ก่อนหน้า">${icon('chevron-left')}</button><div class="slide-dots">${services.map((s,i)=>`<button data-slide="${i}" aria-label="สไลด์ ${i+1}: ${s.title}" aria-pressed="${i===0}"><span></span></button>`).join('')}</div><button class="slide-next" aria-label="สไลด์ถัดไป">${chevron}</button><button class="slide-play" aria-label="หยุดสไลด์อัตโนมัติ"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3h5v18H5zM14 3h5v18h-5z"/></svg></button></div>`:''}</section>`;
const cta = `<section class="cta"><div class="container cta-inner"><div><h2>ติดต่อเรา</h2><p>ปรึกษาฟรี<br>ส่งรูปหน้างานเพื่อขอประเมินราคา</p></div><div class="cta-phone">${icon('phone')}<div><span>โทรเลย</span><a href="tel:${phone}">${escape(b.phone)}</a></div></div><a class="button primary" href="/contact.html#estimate">ขอประเมินราคา ${arrow}</a></div></section>`;
const samples = (large=false) => `<div class="sample-grid ${large?'large':''}">${services.map(s=>`<a class="sample-card" href="/services.html#${s.id}">${serviceImage(s)}<div>${icon('pin')}<h3>${s.title}</h3>${chevron}</div></a>`).join('')}</div>`;
const steps = `<section class="container section">${sectionHead('ขั้นตอนการให้บริการ','สำรวจ เสนอราคา และดำเนินงาน')}<div class="process-grid">${[['01','สำรวจหน้างาน','ตรวจพื้นที่และวางแผนงาน','pin'],['02','เสนอราคา','ระบุขอบเขตงาน วัสดุ และราคา','mail'],['03','ดำเนินงาน','ทำงานตามแผนที่ตกลง','work']].map(([n,t,d,i])=>`<article class="process-card"><span class="step-number">${n}</span>${icon(i)}<div><h3>${t}</h3><p>${d}</p></div></article>`).join('')}</div></section>`;
const home = `${banner('รับเหมาลาดยางมะตอย<br><span>และงานหินคลุกครบวงจร</span>','ถนน ลานจอดรถ ไซต์งาน โครงการภาครัฐและเอกชน<br>โดยทีมงานมืออาชีพ เครื่องจักรพร้อม ได้มาตรฐาน<br>งานเสร็จตรงเวลา',true)}<section class="trust-strip"><div class="container trust-grid">${[['helmet','สำรวจหน้างานฟรี','ประเมินพื้นที่ก่อนเริ่มงาน'],['work','เครื่องจักรพร้อม','วางแผนเครื่องจักรให้เหมาะกับงาน'],['handshake','ดูแลตั้งแต่ต้นจนจบ','ให้คำปรึกษาและวางแผนงาน']].map(([i,t,d])=>`<div>${icon(i)}<div><h3>${t}</h3><p>${d}</p></div></div>`).join('')}</div></section><section class="container section">${sectionHead('บริการของเรา','งานถนนและพื้นที่ใช้งาน สำหรับบ้าน ธุรกิจ และโครงการ')}<div class="service-grid home-services">${services.map(card).join('')}</div></section><section class="blue-section"><div class="container section">${sectionHead('ผลงานที่ผ่านมา','ภาพหน้างานหินคลุก หินเกล็ด ลูกระนาด และตีเส้น',`<a class="button outline" href="/projects.html">ดูผลงานทั้งหมด ${arrow}</a>`)}${samples()}<p class="image-note">ภาพลาดยางมะตอยเป็นภาพประกอบ ส่วนภาพอื่นเป็นภาพหน้างานของทีมงาน</p></div></section>`;
const servicePage = `${banner('บริการ<span>ของเรา</span>','รับงานถนน ลานจอดรถ และพื้นที่ใช้งาน')}<section class="container section">${sectionHead('บริการงานพื้นและถนน','เลือกบริการที่เหมาะกับพื้นที่')}<div class="service-grid feature-services">${services.map(card).join('')}</div><p class="image-note">ภาพประกอบบริการ ไม่ใช่ภาพผลงานจริง</p></section><section class="preparation"><div class="container">${icon('work')}<div><h2>เตรียมพื้นก่อนเริ่มงาน</h2><p>ปรับระดับ บดอัด และวางแผนระบายน้ำ</p></div></div></section>${steps}<section class="container service-details">${services.map(s=>`<article id="${s.id}" class="service-detail">${scene(s.scene,`ภาพประกอบ${s.title}`)}<div><p class="eyebrow">${s.subtitle}</p><h2>${s.title}</h2><p>${s.description}</p><ul class="checklist">${s.details.map(d=>`<li>${icon('check')}${d}</li>`).join('')}</ul><a class="text-link" href="/contact.html?service=${s.id}#estimate">ขอประเมินงาน${s.title} ${arrow}</a></div></article>`).join('')}<p class="image-note">วัสดุ ความหนา และราคาขึ้นอยู่กับสภาพหน้างาน</p></section>${cta}`;
const projectPage = `${banner('ผลงาน<span>ของเรา</span>','ตัวอย่างงานถนนและพื้นที่ใช้งาน')}<section class="blue-section"><div class="container section">${sectionHead('ประเภทงานของเรา','เลือกประเภทงานเพื่อดูภาพตัวอย่าง')}<div class="filters" aria-label="กรองประเภทผลงาน"><button class="filter active" data-filter="all" aria-pressed="true">ทั้งหมด</button>${services.map(s=>`<button class="filter" data-filter="${s.id}" aria-pressed="false">${s.title}</button>`).join('')}</div><p id="empty-projects" class="image-note">ภาพตัวอย่างประกอบบริการ กำลังเตรียมผลงานจริง</p><div id="project-grid" class="project-grid"></div></div></section>${cta}<dialog id="lightbox"><button id="close-lightbox" class="close-button" aria-label="ปิดภาพ">✕</button><div id="lightbox-image"></div><p id="image-caption"></p></dialog>`;
const estimateForm = `<section class="container section"><div id="estimate" class="estimate"><div><p class="eyebrow">REQUEST AN ESTIMATE</p><h2>ขอประเมินราคา</h2><p>กรอกข้อมูล แล้วส่งข้อความผ่าน LINE หรืออีเมล</p><p class="form-note">เว็บไซต์ไม่ส่งหรือบันทึกข้อมูลอัตโนมัติ</p></div><div><form id="estimate-form"><div class="form-row"><div><label for="customer">ชื่อผู้ติดต่อ <span>*</span></label><input id="customer" name="customer" autocomplete="name" maxlength="100" required></div><div><label for="phone">เบอร์โทรติดต่อกลับ <span>*</span></label><input id="phone" name="phone" type="tel" autocomplete="tel" pattern="[0-9+ ()-]{8,20}" maxlength="20" required></div></div><label for="service">บริการที่สนใจ <span>*</span></label><select id="service" name="service" required><option value="">เลือกบริการ</option>${services.map(s=>`<option value="${s.id}">${s.title}</option>`).join('')}</select><div class="form-row"><div><label for="location">จังหวัด / พื้นที่หน้างาน <span>*</span></label><input id="location" name="location" maxlength="150" required></div><div><label for="area">ขนาดพื้นที่โดยประมาณ</label><input id="area" name="area" placeholder="เช่น 200 ตร.ม." maxlength="100"></div></div><label for="details">รายละเอียดเพิ่มเติม</label><textarea id="details" name="details" rows="3" maxlength="2000" placeholder="สภาพพื้นเดิมและช่วงเวลาที่ต้องการ"></textarea><button class="button primary" type="submit">สร้างข้อความขอประเมินราคา ${arrow}</button></form><div id="estimate-result" hidden><h3>ข้อความพร้อมส่ง</h3><textarea id="message" rows="9" readonly aria-label="ข้อความขอประเมินราคา"></textarea><div class="actions"><button class="button primary" id="copy-message">คัดลอกข้อความ</button>${lineButton('เปิด LINE')}${b.email?'<a class="button outline" id="email-message">ส่งทางอีเมล</a>':''}</div><p id="copy-status" role="status"></p></div></div></div></section>`;
const contactPage = `${banner('ติดต่อเรา','ปรึกษาฟรี พร้อมประเมินหน้างาน')}<section class="container section contact-grid">${scene(0,'ภาพประกอบรถบดถนนและงานลาดยาง','contact-photo')}<div class="contact-panel">${sectionHead('ช่องทางการติดต่อ')}<p>ปรึกษาฟรี ส่งรูปหน้างานเพื่อขอประเมินราคา</p><div class="contact-box"><span class="contact-icon">${icon('phone')}</span><div><h3>โทรศัพท์</h3><a href="tel:${phone}">${escape(b.phone)}</a></div></div><div class="contact-box"><span class="contact-icon green"><span class="line-symbol">LINE</span></span><div><h3>LINE</h3><a href="${escape(line)}" target="_blank" rel="noopener noreferrer">${escape(b.lineId || 'เพิ่มเพื่อน')}</a></div></div><div class="contact-box contact-email"><span class="contact-icon">${icon('mail')}</span><div><h3>อีเมล</h3><a href="mailto:${escape(b.email)}">${escape(b.email)}</a></div></div><div class="actions">${call('button primary',`โทร ${escape(b.phone)}`)}${lineButton(`LINE ${escape(b.lineId)}`)}</div></div></section><section class="blue-section"><div class="container section">${sectionHead('ข้อมูลสำหรับประเมินราคา','แจ้งประเภทงาน ขนาดพื้นที่ และรูปหน้างาน')}<div class="info-grid">${[['road','ประเภทงาน','เลือกบริการที่ต้องการ',0],['gravel','ขนาดพื้นที่','แจ้งกว้าง × ยาว หรือพื้นที่รวม',1],['camera','สถานที่และรูปหน้างาน','ส่งตำแหน่งและภาพพื้นเดิม',4]].map(([i,t,d,n])=>`<article class="info-card"><div>${icon(i)}<div><h3>${t}</h3><p>${d}</p></div></div>${scene(n,`ภาพประกอบ${t}`)}</article>`).join('')}</div></div></section><section class="service-area"><div class="container">${icon('pin')}<h2>พื้นที่ให้บริการ</h2><p>${escape(b.serviceArea)}</p></div></section><details id="estimate" class="estimate-disclosure container"><summary>ส่งรายละเอียดขอประเมินราคา ${arrow}</summary>${estimateForm.replace('id="estimate"','id="estimate-panel"')}</details>`;
document.getElementById('app').innerHTML = localPaths(`<a class="skip-link" href="#main">ข้ามไปเนื้อหา</a><header class="site-header"><div class="container header-inner">${brand}<button class="menu-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="เปิดเมนู"><svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button><nav id="main-nav" aria-label="เมนูหลัก">${nav.map(([id,t])=>`<a href="/${id}.html" ${id===page?'aria-current="page"':''}>${t}</a>`).join('')}</nav><div class="header-contact">${call('button header-call')}${page==='index'?'':quote}</div></div></header><main id="main">${({index:home,services:servicePage,projects:projectPage,contact:contactPage})[page] || home}</main><footer><div class="container footer-inner">${brand}<p>${page==='index'?'งานถนนคุณภาพ ครบจบในทีมเดียว':'งานถนนและพื้นที่ใช้งาน<br><strong>ครบจบในทีมเดียว</strong>'}</p>${call('footer-phone')}</div><div class="footer-stripes" aria-hidden="true"></div></footer><div class="floating-contact" aria-label="ติดต่อด่วน">${call('float-button float-call',`<span class="float-label-desktop">โทร ${escape(b.phone)}</span><span class="float-label-mobile">โทรเลย</span>`)}${lineButton('<span class="float-label-desktop">LINE ส่งรูปหน้างาน</span><span class="float-label-mobile">LINE</span>','float-button float-line')}</div>`);
if(page==='index' && typeof initializeSlider==='function'){initializeSlider({scene: (n,alt)=>localPaths(scene(n,alt)), image: s=>localPaths(serviceImage({...s, homeImage: s.slideImage || s.homeImage})), services});}
const toggle = document.querySelector('.menu-toggle');
toggle.addEventListener('click',()=>{const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded',open); toggle.setAttribute('aria-label',open?'ปิดเมนู':'เปิดเมนู'); document.getElementById('main-nav').classList.toggle('open',open);});
const closeMenu = () => {toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','เปิดเมนู');document.getElementById('main-nav').classList.remove('open');};
document.addEventListener('keydown',e=>{if(e.key==='Escape' && toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header')) closeMenu();});
window.matchMedia?.('(min-width:761px)').addEventListener('change',e=>{if(e.matches) closeMenu();});
if(page==='contact') {
 const disclosure=document.getElementById('estimate');
 const openEstimate=()=>{if(location.hash==='#estimate'){disclosure.open=true;}};
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
  document.getElementById('project-grid').innerHTML=localPaths(items.length ? items.map(p=>`<article class="project-card"><div class="project-photos">${p.images.map(img=>`<button class="photo-button" data-image="${escape(img.src)}" data-alt="${escape(img.alt)}"><img src="${escape(img.src)}" alt="${escape(img.alt)}" loading="lazy" width="1200" height="700"></button>`).join('')}</div><div class="project-caption"><h2>${escape(p.title)}</h2><p>${escape(p.location)}</p><p>${escape(p.description)}</p></div></article>`).join('') : examples.map(s=>`<article class="project-card"><button class="photo-button" data-scene="${s.scene}" data-alt="ภาพตัวอย่าง${s.title}">${scene(s.scene,`ภาพตัวอย่าง${s.title}`)}<span class="photo-label">ภาพตัวอย่าง</span></button><div class="project-caption">${serviceIcon(s)}<div><h2>${s.title}</h2><p>${s.description}</p></div>${chevron}</div></article>`).join(''));
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
