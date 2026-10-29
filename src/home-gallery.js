import { createGalleryThumbnails } from './gallery-thumbnails.js';

// Keep homepage albums in a modal, retaining normal links as a fallback.
export function initializeHomeGallery({ projects, base = '/' }) {
 const dialog = document.getElementById('home-gallery');
 if (!dialog || typeof dialog.showModal !== 'function') return;
 const albums = new Map(projects.filter(project => project.images?.length).map(project => [project.id, project]));
 const stage = document.getElementById('home-gallery-image');
 const image = stage.querySelector('img');
 const message = stage.querySelector('.home-gallery-message');
 const title = document.getElementById('home-gallery-title');
 const caption = document.getElementById('home-gallery-caption');
 const count = document.getElementById('home-gallery-count');
 const close = document.getElementById('home-gallery-close');
 const previous = document.getElementById('home-gallery-prev');
 const next = document.getElementById('home-gallery-next');
 const root = document.documentElement;
 const prefix = base.endsWith('/') ? base : `${base}/`;
 let album, imageIndex = 0, trigger, scroll, swipeStart, backdropStart = false;

 const thumbnails = createGalleryThumbnails({
  container: document.getElementById('home-gallery-thumbnails'), base,
  onSelect: index => { imageIndex = index; showImage(); },
 });
 const showImage = () => {
  const photo = album.images[imageIndex];
  image.hidden = true;
  message.textContent = 'กำลังโหลดภาพ…';
  message.hidden = false;
  image.alt = photo.alt || album.title;
  image.src = new URL(photo.src.startsWith('/') ? `${prefix}${photo.src.slice(1)}` : photo.src, document.baseURI).href;
  title.textContent = album.title;
  caption.textContent = photo.alt || album.title;
  title.scrollTop = caption.scrollTop = 0;
  count.textContent = `${imageIndex + 1} / ${album.images.length}`;
  previous.disabled = next.disabled = album.images.length < 2;
  thumbnails.setSelected(imageIndex);
  if (image.complete && image.naturalWidth > 0) { image.hidden = false; message.hidden = true; }
 };
 const move = step => {
  if (!album || album.images.length < 2) return;
  imageIndex = (imageIndex + step + album.images.length) % album.images.length;
  showImage();
 };
 image.addEventListener('load', () => { if (album) { image.hidden = false; message.hidden = true; } });
 image.addEventListener('error', () => {
  if (!album) return;
  image.hidden = true;
  message.textContent = 'โหลดภาพไม่สำเร็จ กรุณาเลือกภาพอื่นหรือลองเปิดอีกครั้ง';
  message.hidden = false;
 });

 document.querySelectorAll('[data-home-album]').forEach(link => {
  link.setAttribute('aria-haspopup', 'dialog');
  link.setAttribute('aria-controls', dialog.id);
 });
 document.getElementById('main').addEventListener('click', event => {
  const link = event.target.closest('[data-home-album]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const selected = albums.get(link.dataset.homeAlbum);
  if (!selected) return;
  event.preventDefault();
  if (dialog.open) return;
  album = selected; imageIndex = 0; trigger = link;
  scroll = { x: window.scrollX, y: window.scrollY };
  root.style.setProperty('--home-gallery-scroll-top', `${-scroll.y}px`);
  root.style.setProperty('--home-gallery-scroll-left', `${-scroll.x}px`);
  root.classList.add('home-gallery-open');
  thumbnails.setPhotos(album.images);
  showImage();
  dialog.showModal();
  dialog.scrollTop = 0;
  close.focus({ preventScroll: true });
 });
 previous.addEventListener('click', () => move(-1));
 next.addEventListener('click', () => move(1));
 close.addEventListener('click', () => dialog.close());
 dialog.addEventListener('keydown', event => {
  if (!event.altKey && !event.ctrlKey && !event.metaKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
   event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
  }
  if (event.key === 'Tab') {
   const buttons = [...dialog.querySelectorAll('button:not(:disabled)')].filter(button => button.getClientRects().length);
   const first = buttons[0], last = buttons.at(-1);
   if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
   else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
 });
 stage.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch') swipeStart = event.isPrimary ? { x: event.clientX, y: event.clientY } : null;
 });
 stage.addEventListener('pointerup', event => {
  if (!swipeStart) return;
  const dx = event.clientX - swipeStart.x, dy = event.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
 });
 stage.addEventListener('pointercancel', () => { swipeStart = null; });
 const outside = event => {
  const box = dialog.getBoundingClientRect();
  return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
 };
 dialog.addEventListener('pointerdown', event => { backdropStart = event.target === dialog && outside(event); });
 dialog.addEventListener('click', event => {
  if (backdropStart && event.target === dialog && outside(event)) dialog.close();
  backdropStart = false;
 });
 dialog.addEventListener('close', () => {
  swipeStart = null; backdropStart = false; album = null;
  thumbnails.setPhotos([]);
  image.hidden = true; image.removeAttribute('src'); message.hidden = true;
  root.classList.remove('home-gallery-open');
  root.style.removeProperty('--home-gallery-scroll-top');
  root.style.removeProperty('--home-gallery-scroll-left');
  trigger?.focus({ preventScroll: true });
  if (scroll) window.scrollTo({ left: scroll.x, top: scroll.y, behavior: 'instant' });
  scroll = null;
 });
}
