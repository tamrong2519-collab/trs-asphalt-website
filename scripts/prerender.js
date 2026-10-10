import { readFile, writeFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { responsivePhotoAttributes } from '../src/responsive-photos.js';
import { applySocialMetadata } from '../src/social-meta.js';
import { business } from '../src/data.js';
const source = (await readFile('src/main.js', 'utf8')).replace(/^import .*;\n/gm, '').replaceAll('import.meta.env.BASE_URL', JSON.stringify(process.env.SITE_BASE || '/')).replaceAll('import.meta.env.VITE_SITE_URL', JSON.stringify(process.env.VITE_SITE_URL || ''));
const { services, servicesPageServices, projects } = await import('../src/data.js');
for (const page of ['index', 'services', 'projects', 'contact']) {
 const path = `dist/${page}.html`;
 const dom = new JSDOM(await readFile(path, 'utf8'), { url: `https://preview.invalid/${page}.html`, runScripts: 'outside-only' });
 dom.window.responsivePhotoAttributes = responsivePhotoAttributes; dom.window.applySocialMetadata = applySocialMetadata; dom.window.b = business; dom.window.services = services; dom.window.servicesPageServices = servicesPageServices; dom.window.projects = projects;
 dom.window.eval(source);
 dom.window.document.querySelector('#site-noscript').textContent = 'เมนูมือถือ ตัวกรองภาพ และฟอร์มขอประเมินราคา ต้องเปิดใช้งาน JavaScript';
 await writeFile(path, dom.serialize());
 dom.window.close();
}
const origin = process.env.VITE_SITE_URL || business.siteUrl;
if (origin) {
 const base = new URL(origin);
 if (!['http:', 'https:'].includes(base.protocol)) throw new Error('siteUrl must be HTTP(S)');
 const urls=['','services.html','projects.html','contact.html','asphalt/','asphalt-paving/','speed-bump/','traffic-marking/','gravel-parking/','stone-chips/'].map(p=>new URL(p,origin.endsWith('/')?origin:`${origin}/`).href);
 const xmlEscape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
 await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${xmlEscape(u)}</loc></url>`).join('')}</urlset>`);
 await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml',origin.endsWith('/')?origin:`${origin}/`).href}\n`);
} else {
 await writeFile('dist/robots.txt','User-agent: *\nAllow: /\n');
}
console.log('Pre-rendered all four pages for SEO and non-JavaScript readers.');
