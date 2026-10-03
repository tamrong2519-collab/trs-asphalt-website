// The home hero advances every six seconds. Pause while hidden or being used.
export function initializeSlider({ scene, services, image }) {
 const hero = document.querySelector('.hero-home');
 const title = hero.querySelector('h1');
 const subtitle = hero.querySelector('p');
 const photo = hero.querySelector('.hero-image');
 const sceneLayer = hero.querySelector('.hero-scene');
 const play = hero.querySelector('.slide-play');
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
 let transitionVersion = 0;
 const slides = [
  { title: title.innerHTML, text: subtitle.innerHTML },
  { title: 'ลานจอดรถ<br><span>หินคลุก</span>', text: 'เกลี่ยและบดอัดหินคลุก สำหรับลานจอดรถและทางเข้าออก' },
  { title: 'ปรับพื้นที่ด้วย<br><span>หินเกล็ด</span>', text: 'ปรับพื้นด้วยหินเกล็ด สำหรับลานและพื้นที่ใช้งาน' },
  { title: 'งานลูกระนาด<br><span>ยางมะตอย</span>', text: 'ทำลูกระนาดยางมะตอย เพื่อชะลอความเร็วในพื้นที่' },
  { title: 'ตีเส้นจราจร<br><span>คมชัด เป็นระเบียบ</span>', text: 'ตีเส้นถนนและช่องจอดรถด้วยสีเทอร์โมพลาสติก' },
 ];
 // Reserve the tallest slide copy after fonts load, so automatic slides do not move the page.
 const stabilizeCopy = () => {
  if (!hero.classList.contains('hero-estimate')) return;
  for (const [element, key] of [[title, 'title'], [subtitle, 'text']]) {
   const probe = element.cloneNode(false);
   probe.setAttribute('aria-hidden', 'true');
   Object.assign(probe.style, {position:'absolute',visibility:'hidden',pointerEvents:'none',width:`${element.clientWidth}px`,minHeight:'0',height:'auto'});
   element.parentElement.append(probe);
   let height = 0;
   // Thai marks can extend beyond the line box; include the full rendered text height.
   for (const slide of slides) {probe.innerHTML = slide[key];height = Math.max(height, probe.getBoundingClientRect().height, probe.scrollHeight);}
   probe.remove();element.style.minHeight = `${Math.ceil(height)}px`;
  }
 };
 document.fonts.ready.then(stabilizeCopy);
 window.addEventListener('resize', stabilizeCopy, {passive:true});
 let index = 0;
 let timer;
 let paused = reducedMotion.matches;
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
  const nextIndex = (next + slides.length) % slides.length;
  if (nextIndex === index) return;
  const version = ++transitionVersion;
  hero.querySelector('.hero-transition')?.remove();
  const outgoing = document.createElement('div');
  outgoing.className = 'hero-transition';
  outgoing.setAttribute('aria-hidden', 'true');
  const snapshot = (index === 0 ? photo : sceneLayer).cloneNode(true);
  snapshot.className = index === 0 ? 'hero-transition-photo' : 'hero-transition-scene';
  snapshot.removeAttribute('fetchpriority');
  outgoing.append(snapshot);
  if (!reducedMotion.matches) hero.append(outgoing);
  index = nextIndex;
  title.innerHTML = slides[index].title;
  subtitle.innerHTML = slides[index].text;
  subtitle.classList.remove('hero-service-list');
  hero.querySelector('.slide-count').textContent = `${String(index + 1).padStart(2, '0')} / 05`;
  photo.hidden = index !== 0;
  sceneLayer.hidden = index === 0;
  sceneLayer.innerHTML = index ? (image ? image(services[index]) : scene(services[index].scene, `ภาพประกอบ${services[index].title}`)) : '';
  hero.dataset.activeSlide = String(index);
  if (!reducedMotion.matches) {
   const incoming = index ? sceneLayer.querySelector('img') : photo;
   if (incoming) incoming.loading = 'eager';
   const fade = () => {
    if (version !== transitionVersion) return;
    const animation = outgoing.animate([{opacity:1},{opacity:0}], {duration:750,easing:'ease-in-out',fill:'forwards'});
    animation.onfinish = () => outgoing.remove();
   };
   if (incoming && !incoming.complete) incoming.decode().catch(()=>{}).then(fade); else fade();
   for (const element of [title, subtitle]) element.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,easing:'ease-out'});
  }
 };
 const select = next => { show(next); start(); };
 hero.querySelector('.slide-prev').addEventListener('click', () => select(index - 1));
 hero.querySelector('.slide-next').addEventListener('click', () => select(index + 1));
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
