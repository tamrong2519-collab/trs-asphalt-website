// The home hero advances every six seconds. Pause while hidden or being used.
export function initializeSlider({ scene, services, image }) {
 const hero = document.querySelector('.hero-home');
 const title = hero.querySelector('h1');
 const subtitle = hero.querySelector('p');
 const photo = hero.querySelector('.hero-image');
 const sceneLayer = hero.querySelector('.hero-scene');
 const dots = [...hero.querySelectorAll('[data-slide]')];
 const play = hero.querySelector('.slide-play');
 const slides = [
  { title: title.innerHTML, text: subtitle.innerHTML },
  { title: 'ลานจอดรถ<br><span>หินคลุก</span>', text: 'ปรับพื้นที่และบดอัด ให้เหมาะกับการใช้งานของคุณ' },
  { title: 'ปรับพื้นที่ด้วย<br><span>หินเกล็ด</span>', text: 'งานทางเข้าออกและลานอเนกประสงค์ เลือกวัสดุให้เหมาะกับพื้นที่' },
  { title: 'งานลูกระนาด<br><span>ยางมะตอย</span>', text: 'วางแผนตำแหน่งและรูปแบบตามสภาพหน้างาน' },
  { title: 'งานตีเส้นจราจร<br><span>เทอร์โมพลาสติก</span>', text: 'เส้นแบ่งช่องจอดและเครื่องหมายบนพื้น เพื่อพื้นที่ที่เป็นระเบียบ' },
 ];
 let index = 0;
 let timer;
 let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let hovering = false;
 let touchStart;
 hero.setAttribute('aria-roledescription', 'สไลด์');
 hero.setAttribute('aria-label', 'บริการของเรา 5 สไลด์');
 hero.dataset.activeSlide = '0';
 const updatePlay = () => {
  play.setAttribute('aria-label', paused ? 'เล่นสไลด์อัตโนมัติ' : 'หยุดสไลด์อัตโนมัติ');
  play.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${paused ? '<path d="M7 3l15 9-15 9z"/>' : '<path d="M5 3h5v18H5zM14 3h5v18h-5z"/>'}</svg>`;
 };
 const stop = () => { clearInterval(timer); timer = undefined; };
 const start = () => {
  stop();
  if (!paused && !document.hidden && !hovering && !hero.contains(document.activeElement)) timer = setInterval(() => show(index + 1), 6000);
 };
 const show = next => {
  index = (next + slides.length) % slides.length;
  title.innerHTML = slides[index].title;
  subtitle.innerHTML = slides[index].text;
  subtitle.classList.toggle('hero-services', index === 0);
  photo.hidden = index !== 0;
  sceneLayer.hidden = index === 0;
  sceneLayer.innerHTML = index ? (image ? image(services[index]) : scene(services[index].scene, `ภาพประกอบ${services[index].title}`)) : '';
  dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
  hero.dataset.activeSlide = String(index);
 };
 const select = next => { show(next); start(); };
 hero.querySelector('.slide-prev').addEventListener('click', () => select(index - 1));
 hero.querySelector('.slide-next').addEventListener('click', () => select(index + 1));
 dots.forEach((dot, i) => dot.addEventListener('click', () => select(i)));
 play.addEventListener('click', () => { paused = !paused; updatePlay(); start(); });
 hero.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hovering = true; stop(); } });
 hero.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hovering = false; start(); } });
 hero.addEventListener('focusin', stop);
 hero.addEventListener('focusout', () => setTimeout(start, 0));
 hero.addEventListener('touchstart', e => {
  const touch = e.changedTouches[0]; touchStart = { x: touch.clientX, y: touch.clientY }; stop();
 }, { passive: true });
 hero.addEventListener('touchend', e => {
  const touch = e.changedTouches[0];
  if (touchStart) {
   const dx = touch.clientX - touchStart.x;
   const dy = touch.clientY - touchStart.y;
   if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
  }
  touchStart = undefined; start();
 }, { passive: true });
 hero.addEventListener('touchcancel', () => { touchStart = undefined; start(); }, { passive: true });
 document.addEventListener('visibilitychange', start);
 window.addEventListener('pagehide', stop);
 window.addEventListener('pageshow', start);
 updatePlay(); start();
}
