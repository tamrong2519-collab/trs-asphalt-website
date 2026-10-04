import '@fontsource/noto-sans-thai/400.css';
import '@fontsource/noto-sans-thai/500.css';
import '@fontsource/noto-sans-thai/600.css';
import '@fontsource/noto-sans-thai/700.css';
import './style.css';
import './home-reference.css';
import './arrows.css';
import './hero-estimate.css';
import './navigation.css';
import './typography.css';
import './photo-frames.css';
import './footer.css';
import './premium-theme.css';
import './services-paired.css';
import './projects-paired.css';
import './page-hero.css';
import './company-location.css';
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
 shield: '<path d="M12 2l8 3v6c0 5-3 8-8 11-5-3-8-6-8-11V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 11l3 3 5-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
 worker: '<path d="M5 9a7 7 0 0 1 14 0H5zM3 11h18v2H3zM4 23v-4c0-3 4-5 8-5s8 2 8 5v4z"/><path d="M12 2v6" fill="none" stroke="white" stroke-width="1.5"/>',
 gear: '<path d="M10 2h4l1 3 3-1 3 3-1 3 3 1v4l-3 1 1 3-3 3-3-1-1 3h-4l-1-3-3 1-3-3 1-3-3-1v-4l3-1-1-3 3-3 3 1z"/><circle cx="12" cy="13" r="4" fill="white"/>',
 clock: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
 helmet: '<path d="M3 16a9 9 0 0 1 18 0H3z"/><path d="M2 18h20v3H2z"/><path d="M12 3v10" stroke="white" stroke-width="2"/>',
 handshake: '<path d="M2 8l5-4 5 2 5-2 5 4-4 10-4 3-6-2-5-5z"/><path d="M8 8l4-2 5 5-3 3-4-3-2 2" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round"/>',
 phone: '<path d="M6 3l4 4-2 3c2 3 3 4 6 6l3-2 4 4-2 3C11 23 1 13 3 6z"/>',
 'phone-outline': '<path d="M5.1 3.2h3.1l1.5 4.2-2.3 1.8a15.2 15.2 0 0 0 7.4 7.4l1.8-2.3 4.2 1.5v3.1a1.8 1.8 0 0 1-2 1.8A19.5 19.5 0 0 1 3.3 5.2a1.8 1.8 0 0 1 1.8-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
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
const call = (cls='button primary',label='',phoneIcon='phone') => phone ? `<a class="${cls}" href="tel:${phone}">${icon(phoneIcon)}${label || escape(b.phone)}</a>` : `<a class="${cls}" href="/contact.html">สอบถามช่องทางโทร</a>`;
const lineButton = (label='LINE ส่งรูปหน้างาน',cls='button line') => line ? `<a class="${cls}" href="${escape(line)}" target="_blank" rel="noopener noreferrer"><span class="line-symbol" aria-hidden="true">LINE</span>${label}</a>` : '<a class="button line" href="/contact.html">สอบถามช่องทาง LINE</a>';
const floatingContact = `<div class="floating-contact" aria-label="ติดต่อด่วน">
 <a class="float-button float-call" href="${phone?`tel:${phone}`:'/contact.html'}" aria-label="โทร ${escape(b.phone)}"><span class="float-face">${icon('phone-outline')}<span class="float-label-desktop">โทร ${escape(b.phone)}</span><span class="float-label-mobile">${escape(b.phone)}</span></span></a>
 <a class="float-button float-line" href="${escape(line || '/contact.html')}" ${line?'target="_blank" rel="noopener noreferrer"':''} aria-label="LINE ${escape(b.lineId)}"><span class="float-face"><span class="line-symbol float-symbol-desktop" aria-hidden="true">LINE</span><svg class="float-symbol-mobile" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 3C6.5 3 2 6.5 2 10.8c0 3.9 3.6 7.1 8.3 7.7l-.5 2.5c-.1.5.3.6.7.4 3.2-1.7 11.5-6 11.5-10.6C22 6.5 17.5 3 12 3z"/><text x="12" y="12.6" text-anchor="middle" font-family="Arial,sans-serif" font-size="5.1" font-weight="700" fill="#007a2d">LINE</text></svg><span class="float-label-desktop">LINE ส่งรูปหน้างาน</span><span class="float-label-mobile">LINE</span></span></a>
</div>`;
const brand = `<a class="brand footer-brand" href="/index.html" aria-label="${escape(b.name)} หน้าแรก"><img src="/images/logo.webp" alt="" width="60" height="60"><span class="footer-wordmark"><b class="footer-title">TRS <span class="footer-name">${escape(b.name.replace(/^TRS\s*/, ''))}</span></b><small>CONSTRUCTION</small></span></a>`;
const headerBrand = `<a class="brand" href="/index.html" aria-label="${escape(b.name)} หน้าแรก"><img src="/images/logo.webp" alt="" width="64" height="64"><span class="brand-wordmark"><span class="brand-trs">TRS</span><span class="brand-name">${escape(b.name.replace(/^TRS\s*/, ''))}</span><small>CONSTRUCTION</small></span></a>`;
const headerLineIcon = `<svg class="icon header-line-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 3C6.5 3 2 6.5 2 10.8c0 3.9 3.6 7.1 8.3 7.7l-.5 2.5c-.1.5.3.6.7.4 3.2-1.7 11.5-6 11.5-10.6C22 6.5 17.5 3 12 3z"/><text x="12" y="12.6" text-anchor="middle" font-family="Arial,sans-serif" font-size="5.1" font-weight="700" fill="var(--line-ink, #fff)">LINE</text></svg>`;
const headerContacts = `<div class="header-contact"><a class="button header-call" href="${phone ? `tel:${phone}` : '/contact.html'}" aria-label="${phone ? `โทร ${escape(b.phone)}` : 'สอบถามช่องทางโทร'}">${icon('phone-outline')}<span>${phone ? escape(b.phone) : 'สอบถามโทร'}</span></a><a class="button header-line" href="${escape(line || '/contact.html')}" ${line ? 'target="_blank" rel="noopener noreferrer"' : ''} aria-label="${line ? `LINE ${escape(b.lineId)}` : 'สอบถามช่องทาง LINE'}">${headerLineIcon}<span>${line ? escape(b.lineId) : 'สอบถาม LINE'}</span></a></div>`;
const siteHeader = `<header class="site-header">
 <div class="header-brand-band"><div class="container header-inner">${headerBrand}<p class="header-tagline">งานถนนคุณภาพ ครบจบในทีมเดียว</p></div></div>
 <div class="header-nav-band"><div class="container header-nav-inner"><nav id="main-nav" aria-label="เมนูหลัก">${nav.map(([id,t])=>`<a class="nav-link" href="/${id}.html" ${id===page?'aria-current="page"':''}><span>${t}</span></a>`).join('')}</nav></div></div>
 <div class="header-contact-band"><div class="container header-contact-inner">${headerContacts}</div></div>
</header>`;
const scene = (n,alt,cls='') => `<div class="scene scene-${n} ${cls}"><img src="/images/work-scenes.webp" alt="${escape(alt)}" width="1536" height="1024" loading="lazy"></div>`;
const serviceImage = (s,cls='') => {
 const photo = (page==='services' && s.servicesPageImage) || {
  src: (page==='index' && s.homepageImage) || s.homeImage || s.image,
  alt: s.imageAlt || `${s.homeImage?'ภาพหน้างาน':'ภาพประกอบ'}${s.title}`,
  width: s.homeImage?1280:1536, height: s.homeImage?960:1024,
 };
 return `<div class="scene work-photo ${cls}"><img src="${escape(photo.src)}" alt="${escape(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy"></div>`;
};
const homeTitle = s => ({gravel:'ลานหินคลุก',stone:'หินเกล็ด','speed-bump':'ลูกระนาด'})[s.id] || s.title;
const homeDescription = s => ({asphalt:'ถนน ลานจอดรถ และพื้นที่ใช้งาน',gravel:'เกลี่ยและบดอัดลานจอดรถ ทางเข้าออก',stone:'ปรับพื้นลานและพื้นที่ใช้งาน','speed-bump':'ชะลอความเร็วภายในพื้นที่',marking:'ตีเส้นถนนและช่องจอดรถ'})[s.id];
const projectLink = s => {
 const project = projects.find(p => p.category === s.id && p.images?.length);
 return project ? `/projects.html#${encodeURIComponent(project.id)}` : '/projects.html';
};
const card = s => `<a class="service-card" href="${projectLink(s)}">${serviceImage(s)}<div class="card-content"><span class="service-icon">${serviceIcon(s)}</span><div><h3>${page==='index'?homeTitle(s):s.title}</h3><p>${page==='index'?homeDescription(s):s.description}</p></div><span class="card-arrow">${chevron}</span></div></a>`;
const sectionHead = (title,copy='',action='') => `<div class="section-heading"><h2>${title}</h2>${copy?`<p>${copy}</p>`:''}${action}</div>`;
const pageHero = ({name,title,accent,copy,image,imageAlt,width,height}) => `<section class="${name}-hero page-hero">
 <img class="${name}-hero-image page-hero-image" src="${escape(image)}" alt="${escape(imageAlt)}" width="${width}" height="${height}" fetchpriority="high">
 <div class="container"><span class="page-hero-eyebrow">${escape(b.name)} CONSTRUCTION</span><h1>${escape(title)}<span>${escape(accent)}</span></h1><p>${copy.map(escape).join('<br>')}</p></div>
</section>`;
const heroBenefits = `<div class="hero-benefits">${[['shield','งานคุณภาพ','ได้มาตรฐาน'],['worker','ทีมงานมืออาชีพ','ประสบการณ์จริง'],['gear','เครื่องจักรพร้อม','รองรับทุกขนาดงาน'],['clock','ส่งมอบงาน','ตรงเวลา']].map(([i,t,d])=>`<div class="hero-benefit">${icon(i)}<div><strong>${t}</strong><span>${d}</span></div></div>`).join('')}</div>`;
const banner = (title,text,home=false) => `<section class="hero ${home?'hero-home hero-estimate':''}"><img class="hero-image" src="${'/images/hero-sharp.webp'}" ${home?`srcset="${base}images/hero-sharp-mobile.webp 960w, ${base}images/hero-sharp.webp 1536w" sizes="100vw"`:""} alt="ภาพประกอบเครื่องจักรและทีมงานลาดยางมะตอย" width="1536" height="1024" fetchpriority="high"><div class="hero-overlay"></div><div class="container hero-content">${home?'<div class="hero-kicker"><span>TRS TAMRONGSAK CONSTRUCTION</span><span class="slide-count" aria-label="สไลด์ปัจจุบัน">01 / 05</span></div>':''}<h1>${title}</h1><p class="${home?'hero-copy':'hero-subtitle'}">${text}</p>${home?`${heroBenefits}<div class="hero-quote">${call('button primary hero-call',`โทร ${escape(b.phone)}`)}<p class="hero-quote-note">ฟรี! เข้าดูหน้างาน ประเมินเบื้องต้น</p></div>`:''}</div>${home?`<div class="hero-scene" hidden></div><div class="slider-controls" aria-label="ควบคุมสไลด์หน้าแรก"><button class="slide-prev" aria-label="สไลด์ก่อนหน้า">${icon('chevron-left')}</button><button class="slide-next" aria-label="สไลด์ถัดไป">${chevron}</button><button class="slide-play" aria-label="หยุดสไลด์อัตโนมัติ"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3h5v18H5zM14 3h5v18h-5z"/></svg></button></div>`:''}</section>`;
const cta = `<section class="cta"><div class="container cta-inner"><div><h2>ติดต่อเรา</h2><p>ปรึกษาฟรี<br>ส่งรูปหน้างานเพื่อขอประเมินราคา</p></div><div class="cta-phone">${icon('phone')}<div><span>โทรเลย</span><a href="tel:${phone}">${escape(b.phone)}</a></div></div><a class="button primary" href="/contact.html#estimate">ขอประเมินราคา ${arrow}</a></div></section>`;
const samples = (large=false) => `<div class="sample-grid ${large?'large':''}">${projects.filter(p=>p.images?.length && services.some(s=>s.id===p.category)).map(p=>{
 const s=services.find(s=>s.id===p.category), href=`/projects.html#${encodeURIComponent(p.id)}`;
 const sample=projectLink(s)===href?s:{title:p.title,homeImage:p.images[0].src,imageAlt:p.images[0].alt};
 return `<a class="sample-card" href="${href}">${serviceImage(sample)}<div>${icon('pin')}<h3>${escape(sample.title)}</h3>${chevron}</div></a>`;
}).join('')}</div>`;
const home = `${banner('<span class="hero-title-primary"><span class="hero-title-word">รับเหมา</span><wbr><span class="hero-title-word">ลาดยางมะตอย</span></span><span class="hero-title-secondary">และงานหินคลุกครบวงจร</span>','<span class="hero-copy-line">ถนน ลานจอดรถ ไซต์งาน โครงการภาครัฐและเอกชน</span> <span class="hero-copy-line">โดยทีมงานมืออาชีพ เครื่องจักรพร้อม ได้มาตรฐาน</span> <span class="hero-copy-line">งานเสร็จตรงเวลา</span>',true)}<section class="trust-strip"><div class="container trust-grid">${[['helmet','สำรวจหน้างานฟรี','ประเมินพื้นที่ก่อนเริ่มงาน'],['work','เครื่องจักรพร้อม','วางแผนเครื่องจักรให้เหมาะกับงาน'],['handshake','ดูแลตั้งแต่ต้นจนจบ','ให้คำปรึกษาและวางแผนงาน']].map(([i,t,d])=>`<div>${icon(i)}<div><h3>${t}</h3><p>${d}</p></div></div>`).join('')}</div></section><section class="container section">${sectionHead('บริการของเรา','งานถนนและพื้นที่ใช้งาน สำหรับบ้าน ธุรกิจ และโครงการ')}<div class="service-grid home-services">${services.map(card).join('')}</div></section><section class="blue-section"><div class="container section">${sectionHead('ผลงานที่ผ่านมา','ภาพหน้างานหินคลุก หินเกล็ด ลูกระนาด และตีเส้น',`<a class="button outline" href="/projects.html">ดูผลงานทั้งหมด ${arrow}</a>`)}${samples()}</div></section>`;
const serviceCheckMark = '<span class="paired-check-mark" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" focusable="false"><path d="m2.5 8.2 3.5 3.5 7.5-7.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
const servicePage = `
<section class="paired-hero">
 <img class="paired-hero-image" src="/images/hero-sharp.webp" alt="ภาพประกอบทีมงานและเครื่องจักรลาดยางมะตอย" width="1536" height="1024" fetchpriority="high">
 <div class="container"><span class="paired-eyebrow">${escape(b.name)} CONSTRUCTION</span><h1>บริการ<span>ของเรา</span></h1><p>งานถนนและพื้นลานครบวงจร<br>เลือกบริการให้เหมาะกับพื้นที่ของคุณ</p></div>
</section>
<section class="paired-content"><div class="container">
 <div class="paired-heading"><div><span class="paired-eyebrow">บริการงานพื้นและถนน</span><h2>งานถนนและพื้นลานครบวงจร</h2></div><p>เลือกงานให้เหมาะกับพื้นที่<br>พร้อมให้คำปรึกษาก่อนเริ่มงาน</p></div>
 <div class="paired-services">${services.map(s=>`
  <article id="${escape(s.id)}" class="paired-service">
   ${serviceImage(s,'paired-photo')}
   <div class="paired-copy"><span class="paired-number">${escape(s.number)} / ${escape(s.subtitle)}</span><h2>${escape(s.title)}</h2><p>${escape(s.description)}</p>
    <ul class="paired-checks">${s.details.map(d=>`<li>${serviceCheckMark}<span>${escape(d)}</span></li>`).join('')}</ul>
    <div class="paired-actions"><a class="button paired-quote" href="/contact.html" aria-label="ขอประเมินงานนี้: ${escape(s.title)}">ขอประเมินงานนี้ ${arrow}</a></div>
   </div>
  </article>`).join('')}
 </div>
</div></section>
<section class="paired-process"><div class="container"><span class="paired-eyebrow">ขั้นตอนการให้บริการ</span><h2>ดูแลตั้งแต่สำรวจจนจบงาน</h2>
 <div class="paired-process-grid">${[['01','สำรวจหน้างาน','ตรวจพื้นที่และวางแผนงาน'],['02','เสนอราคา','ระบุขอบเขตงาน วัสดุ และราคา'],['03','ดำเนินงาน','ทำงานตามแผนที่ตกลง']].map(([n,t,d])=>`<article><span>${n}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
</div></section>
<section class="paired-cta"><div class="container paired-cta-inner"><div><h2>ปรึกษางานของคุณกับเรา</h2><p>ส่งประเภทงาน ขนาดพื้นที่ และรูปหน้างาน<br>ทีมงานพร้อมให้คำแนะนำและประเมินเบื้องต้น</p></div>
 <div class="paired-actions">${call('button primary paired-phone',`โทร ${escape(b.phone)}`)}${lineButton(`LINE ${escape(b.lineId)}`,'button line paired-line')}</div>
</div></section>`;
const projectPage = `
${pageHero({name:'projects',title:'ผลงาน',accent:'ของเรา',copy:['งานถนนและพื้นที่ใช้งาน','ชมภาพงานตามประเภทที่คุณสนใจ'],image:'/images/marking-job.webp',imageAlt:'ภาพหน้างานลานจอดรถและเส้นจราจร',width:1280,height:960})}
<section class="projects-filter-band"><div class="container">
 <div class="filters" aria-label="กรองประเภทผลงาน"><button type="button" class="filter active" data-filter="all" aria-pressed="true" aria-controls="project-grid">ทั้งหมด</button>${services.map(s=>`<button type="button" class="filter" data-filter="${s.id}" aria-pressed="false" aria-controls="project-grid">${s.title}</button>`).join('')}</div>
 <p id="project-filter-status" class="visually-hidden" role="status"></p>
</div></section>
<section class="projects-content"><div class="container">
 <div class="projects-heading"><div><span class="projects-eyebrow">งานถนนและพื้นที่ใช้งาน</span><h2>ผลงานที่ผ่านมา</h2></div><p>ลาดยางมะตอย หินคลุก หินเกล็ด<br>ลูกระนาด และตีเส้นจราจร</p></div>
 <p id="empty-projects" hidden>ยังไม่มีชุดภาพในหมวดนี้</p><div id="project-grid" class="projects-paired"></div>
</div></section>
${cta}
<dialog id="lightbox" aria-labelledby="lightbox-title">
 <div class="lightbox-header"><h2 id="lightbox-title"></h2><button type="button" id="close-lightbox" class="close-button" aria-label="ปิดภาพ">✕</button></div>
 <div id="lightbox-image"></div>
 <div class="lightbox-navigation"><button type="button" id="lightbox-prev" aria-label="ภาพก่อนหน้า">${icon('chevron-left')}</button><span id="image-count" role="status" aria-label="ลำดับภาพ"></span><button type="button" id="lightbox-next" aria-label="ภาพถัดไป">${chevron}</button></div>
 <p id="image-caption"></p>
</dialog>`;
const estimateForm = `<section class="container section"><div id="estimate" class="estimate"><div><p class="eyebrow">REQUEST AN ESTIMATE</p><h2>ขอประเมินราคา</h2><p>กรอกข้อมูล แล้วส่งข้อความผ่าน LINE หรืออีเมล</p><p class="form-note">หลังสร้างข้อความ เลือกส่งผ่าน LINE หรืออีเมล</p></div><div><form id="estimate-form"><div class="form-row"><div><label for="customer">ชื่อผู้ติดต่อ <span>*</span></label><input id="customer" name="customer" autocomplete="name" maxlength="100" required></div><div><label for="phone">เบอร์โทรติดต่อกลับ <span>*</span></label><input id="phone" name="phone" type="tel" autocomplete="tel" pattern="[0-9+ ()-]{8,20}" maxlength="20" required></div></div><label for="service">บริการที่สนใจ <span>*</span></label><select id="service" name="service" required><option value="">เลือกบริการ</option>${services.map(s=>`<option value="${s.id}">${s.title}</option>`).join('')}</select><div class="form-row"><div><label for="location">จังหวัด / พื้นที่หน้างาน <span>*</span></label><input id="location" name="location" maxlength="150" required></div><div><label for="area">ขนาดพื้นที่โดยประมาณ</label><input id="area" name="area" placeholder="เช่น 200 ตร.ม." maxlength="100"></div></div><label for="details">รายละเอียดเพิ่มเติม</label><textarea id="details" name="details" rows="3" maxlength="2000" placeholder="สภาพพื้นเดิมและช่วงเวลาที่ต้องการ"></textarea><button class="button primary" type="submit">สร้างข้อความขอประเมินราคา ${arrow}</button></form><div id="estimate-result" hidden><h3>ข้อความพร้อมส่ง</h3><textarea id="message" rows="9" readonly aria-label="ข้อความขอประเมินราคา"></textarea><div class="actions"><button class="button primary" id="copy-message">คัดลอกข้อความ</button>${lineButton('เปิด LINE')}${b.email?'<a class="button outline" id="email-message">ส่งทางอีเมล</a>':''}</div><p id="copy-status" role="status"></p></div></div></div></section>`;
const companyMapQuery = encodeURIComponent(b.mapLocation);
const companyMapURL = `https://www.google.com/maps/dir/?api=1&destination=${companyMapQuery}`;
const companyMapEmbed = `https://www.google.com/maps?q=${companyMapQuery}&output=embed&hl=th&z=17`;
const companyLocation = `<section class="container section company-location" aria-labelledby="company-location-title">
 <div class="company-location-shell">
  <div class="company-location-layout">
   <div class="company-location-card">
    <header class="company-location-heading"><h2 id="company-location-title">ยินดีให้บริการทุกหน้างาน</h2><p>ทั้งกรุงเทพฯ และปริมณฑล</p></header>
    <div class="company-location-row company-location-address-row">
     <span class="company-location-icon">${icon('pin')}</span>
     <div class="company-location-address"><h3>ที่ตั้ง</h3><div class="company-address-text"><address id="company-address">${escape(b.address)}</address></div><button class="company-location-copy" type="button" aria-label="คัดลอกที่อยู่บริษัท"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3"/></svg>คัดลอกที่อยู่</button></div>
    </div>
    <div class="company-location-row company-location-phone-row">
     <span class="company-location-icon">${icon('phone')}</span>
     <div><h3>สอบถามเส้นทางและนัดหมาย</h3><a class="company-location-phone" href="tel:${phone}">โทร ${escape(b.phone)}</a></div>
    </div>
    <p class="company-location-status" role="status" aria-live="polite"></p>
   </div>
   <div class="company-location-map">
    <iframe src="${escape(companyMapEmbed)}" title="แผนที่${escape(b.mapLocation)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    <div class="company-map-actions"><a class="company-location-open" href="${escape(companyMapURL)}" target="_blank" rel="noopener noreferrer" aria-label="เปิดเส้นทางไป ${escape(b.mapLocation)} ใน Google Maps">${icon('pin')}<span>เปิดเส้นทางใน Google Maps</span>${arrow}</a></div>
   </div>
  </div>
 </div>
</section>`;
const contactPage = `${pageHero({name:'contact',title:'ติดต่อ',accent:'เรา',copy:['ปรึกษาฟรี','พร้อมประเมินหน้างาน'],image:'/images/hero-sharp.webp',imageAlt:'ภาพประกอบเครื่องจักรและทีมงานลาดยางมะตอย',width:1536,height:1024})}<section class="container section contact-grid">${serviceImage({...services[1],homeImage:services[1].slideImage},'contact-photo')}<div class="contact-panel">${sectionHead('ช่องทางการติดต่อ')}<p>ปรึกษาฟรี ส่งรูปหน้างานเพื่อขอประเมินราคา</p><div class="contact-box"><span class="contact-icon">${icon('phone')}</span><div><h3>โทรศัพท์</h3><a href="tel:${phone}">${escape(b.phone)}</a></div></div><div class="contact-box"><span class="contact-icon green"><span class="line-symbol">LINE</span></span><div><h3>LINE</h3><a href="${escape(line)}" target="_blank" rel="noopener noreferrer">${escape(b.lineId || 'เพิ่มเพื่อน')}</a></div></div><div class="contact-box contact-email"><span class="contact-icon">${icon('mail')}</span><div><h3>อีเมล</h3><a href="mailto:${escape(b.email)}">${escape(b.email)}</a></div></div><div class="actions">${call('button primary',`โทร ${escape(b.phone)}`)}${lineButton(`LINE ${escape(b.lineId)}`)}</div></div></section><section class="blue-section"><div class="container section">${sectionHead('ข้อมูลสำหรับประเมินราคา','แจ้งประเภทงาน ขนาดพื้นที่ และรูปหน้างาน')}<div class="info-grid">${[['road','ประเภทงาน','เลือกบริการที่ต้องการ',0],['gravel','ขนาดพื้นที่','แจ้งกว้าง × ยาว หรือพื้นที่รวม',1],['camera','สถานที่และรูปหน้างาน','ส่งตำแหน่งและภาพพื้นเดิม',4]].map(([i,t,d,n])=>`<article class="info-card"><div>${icon(i)}<div><h3>${t}</h3><p>${d}</p></div></div>${serviceImage(services[n])}</article>`).join('')}</div></div></section><section class="service-area"><div class="container">${icon('pin')}<h2>พื้นที่ให้บริการ</h2><p>${escape(b.serviceArea)}</p></div></section><details id="estimate" class="estimate-disclosure container"><summary>ส่งรายละเอียดขอประเมินราคา ${arrow}</summary>${estimateForm.replace('id="estimate"','id="estimate-panel"')}</details>${companyLocation}`;
document.getElementById('app').innerHTML = localPaths(`<a class="skip-link" href="#main">ข้ามไปเนื้อหา</a>${siteHeader}<main id="main">${({index:home,services:servicePage,projects:projectPage,contact:contactPage})[page] || home}</main><div class="footer-shell"><footer class="site-footer"><div class="footer-content"><div class="footer-top">${brand}<div class="footer-tagline"><strong>งานถนนคุณภาพ</strong><p>ครบจบในทีมเดียว</p></div><div class="footer-contact">${call('button primary footer-phone')}${lineButton(escape(b.lineId),'button line footer-line')}</div></div><div class="footer-secondary"><nav class="footer-nav" aria-label="เมนูส่วนท้าย">${nav.map(([id,t])=>`<a href="/${id}.html" ${id===page?'aria-current="page"':''}>${t}</a>`).join('')}</nav><p class="footer-area">${escape(b.serviceArea).replace('กรุงเทพฯ และปริมณฑล','กรุงเทพฯ–ปริมณฑล').replaceAll(' • ',' · ')}</p></div><div class="footer-legal"><span>© ${new Date().getFullYear()} ${escape(b.name)} CONSTRUCTION</span><span>งานถนนคุณภาพ ครบจบในทีมเดียว</span></div></div><div class="footer-stripes" aria-hidden="true"></div></footer></div>${floatingContact}`);
// Keep in-page destinations below the shared sticky header at every viewport and zoom level.
const siteHeaderElement = document.querySelector('.site-header');
const updateHeaderHeight = () => {
 const height = Math.ceil(siteHeaderElement.getBoundingClientRect().height);
 if (height > 0) document.documentElement.style.setProperty('--site-header-height', `${height}px`);
};
updateHeaderHeight();
if ('ResizeObserver' in window) new ResizeObserver(updateHeaderHeight).observe(siteHeaderElement);
else window.addEventListener('resize', updateHeaderHeight);
document.fonts?.ready.then(updateHeaderHeight);
// Use the footer's own contact links when it is visible, keeping desktop floats clear of its content.
if ('IntersectionObserver' in window) {
 const floatingContact=document.querySelector('.floating-contact');
 const footerObserver=new IntersectionObserver(([entry])=>floatingContact.classList.toggle('is-over-footer',entry.isIntersecting));
 footerObserver.observe(document.querySelector('.site-footer'));
}
if(page==='index' && typeof initializeSlider==='function'){initializeSlider({scene: (n,alt)=>localPaths(scene(n,alt)), image: s=>localPaths(serviceImage({...s, homeImage: s.slideImage || s.homeImage})), services});}
if(page==='contact') {
 const copyAddressButton=document.querySelector('.company-location-copy');
 copyAddressButton.addEventListener('click',async()=>{
  const status=document.querySelector('.company-location-status');
  try {
   await navigator.clipboard.writeText(b.address);
   status.textContent='คัดลอกที่อยู่แล้ว';
  } catch {
   const field=document.createElement('textarea');
   field.value=b.address;field.setAttribute('readonly','');field.style.cssText='position:fixed;left:-9999px;top:0';
   document.body.append(field);field.select();
   let copied=false;
   try {copied=document.execCommand('copy');} catch {}
   field.remove();copyAddressButton.focus();
   if(copied) status.textContent='คัดลอกที่อยู่แล้ว';
   else {
    const selection=window.getSelection(),range=document.createRange();
    range.selectNodeContents(document.querySelector('.company-address-text'));
    selection.removeAllRanges();selection.addRange(range);
    status.textContent='เลือกที่อยู่แล้ว กรุณาคัดลอกที่อยู่ด้วยตนเอง';
   }
  }
 });
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
 const groups=projects.filter(p=>p.images?.length && services.some(s=>s.id===p.category));
 const render=category=>{
  const items=groups.filter(p=>category==='all'||p.category===category);
  document.getElementById('empty-projects').hidden=items.length>0;
  document.getElementById('project-filter-status').textContent=`แสดง ${items.length} ชุดภาพ`;
  document.getElementById('project-grid').innerHTML=localPaths(items.map(p=>{
   const s=services.find(s=>s.id===p.category), index=groups.indexOf(p), cover=p.images[0];
   const label=p.imageKind==='illustration'?'ดูภาพประกอบ':'ดูภาพหน้างาน';
   return `<article class="project-card project-row" id="${escape(p.id)}" data-category="${escape(p.category)}">
    <button type="button" class="photo-button project-cover" data-project="${index}" aria-label="${label}: ${escape(p.title)}"><img src="${escape(cover.src)}" alt="${escape(cover.alt)}" width="1280" height="960" loading="lazy"><span class="project-view" aria-hidden="true">${arrow}</span></button>
    <div class="project-copy"><span class="project-category">${escape(s.title)}</span><h3>${escape(p.title)}</h3>${p.location?`<p class="project-location">${icon('pin')}${escape(p.location)}</p>`:''}<p>${escape(p.description)}</p>
     ${p.imageKind==='illustration'?'<p class="project-image-note">ภาพประกอบงานลาดยางมะตอย</p>':''}
     <div class="project-actions"><button type="button" class="project-gallery-open" data-project="${index}" aria-label="${label}ทั้งหมด: ${escape(p.title)}">${label}${p.images.length>1?`<span class="project-photo-count">${p.images.length} ภาพ</span>`:''}${arrow}</button><a class="project-quote" href="/contact.html?service=${encodeURIComponent(p.category)}#estimate" aria-label="ปรึกษางานลักษณะนี้: ${escape(p.title)}">ปรึกษางานลักษณะนี้ ${arrow}</a></div>
    </div>
   </article>`;
  }).join(''));
 };
 render('all');
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===btn);x.setAttribute('aria-pressed',String(x===btn));});render(btn.dataset.filter);}));
 const resolveProjectAnchor=()=>{
  const anchor=location.hash.slice(1), group=groups.find(p=>p.id===anchor||p.anchorAliases?.includes(anchor));
  if(!group)return;
  if(!document.getElementById(group.id))document.querySelector(`[data-filter="${group.category}"]`)?.click();
  history.replaceState(history.state,'',`#${group.id}`);
  document.getElementById(group.id)?.scrollIntoView({block:'start'});
 };
 resolveProjectAnchor();window.addEventListener('hashchange',resolveProjectAnchor);
 const dialog=document.getElementById('lightbox');
 const imageContainer=document.getElementById('lightbox-image');
 const galleryImage=document.createElement('img');galleryImage.draggable=false;imageContainer.append(galleryImage);
 const previous=document.getElementById('lightbox-prev'), next=document.getElementById('lightbox-next');
 let currentGroup, imageIndex=0, galleryTrigger, swipeStart;
 const showImage=()=>{
  const photo=currentGroup.images[imageIndex];
  galleryImage.src=new URL(photo.src.startsWith('/')?`${base}${photo.src.slice(1)}`:photo.src,document.baseURI).href;
  galleryImage.alt=photo.alt || currentGroup.title;
  document.getElementById('lightbox-title').textContent=currentGroup.title;
  document.getElementById('image-caption').textContent=photo.alt || currentGroup.title;
  document.getElementById('image-count').textContent=`${imageIndex+1} / ${currentGroup.images.length}`;
  previous.disabled=next.disabled=currentGroup.images.length<2;
 };
 const move=step=>{
  if(!currentGroup || currentGroup.images.length<2)return;
  imageIndex=(imageIndex+step+currentGroup.images.length)%currentGroup.images.length;showImage();
 };
 document.getElementById('project-grid').addEventListener('click',e=>{
  const btn=e.target.closest('[data-project]');if(!btn)return;
  currentGroup=groups[Number(btn.dataset.project)];if(!currentGroup)return;
  imageIndex=0;galleryTrigger=btn;showImage();dialog.showModal();
 });
 previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 dialog.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}
  if(e.key==='Tab'){
   const buttons=[...dialog.querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 });
 imageContainer.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')swipeStart={x:e.clientX,y:e.clientY};});
 imageContainer.addEventListener('pointerup',e=>{if(!swipeStart)return;const dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))move(dx<0?1:-1);});
 imageContainer.addEventListener('pointercancel',()=>{swipeStart=null;});
 document.getElementById('close-lightbox').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',()=>{swipeStart=null;galleryTrigger?.focus({preventScroll:true});});
}
if(safeURL(siteURL)) {
 const url=new URL(page==='index'?'':`${page}.html`,siteURL.endsWith('/')?siteURL:`${siteURL}/`).href;
 const canonical=document.querySelector('link[rel=canonical]') || document.createElement('link');canonical.rel='canonical';canonical.href=url;document.head.append(canonical);
 const og=document.querySelector('meta[property="og:url"]') || document.createElement('meta');og.setAttribute('property','og:url');og.content=url;document.head.append(og);
 const schema=document.querySelector('script[type="application/ld+json"]') || document.createElement('script');schema.type='application/ld+json';schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'GeneralContractor',name:b.name,url:siteURL,...(phone?{telephone:phone}:{}),...(b.email?{email:b.email}:{}),...(line?{sameAs:[line]}:{})});document.head.append(schema);
}
