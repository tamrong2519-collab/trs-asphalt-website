import { galleryThumbnailPhotos } from './gallery-thumbnail-photos.js';

/**
 * A compact picker with small previews loaded only near the visible strip.
 * If a newly added photo has no generated thumbnail yet, selecting it reuses
 * the original URL already requested by the main viewer.
 */
export function createGalleryThumbnails({ container, base = '/', onSelect }) {
  if (!container) return { setPhotos() {}, setSelected() {} };

  const document = container.ownerDocument;
  const view = document.defaultView;
  const prefix = base.endsWith('/') ? base : `${base}/`;
  let entries = [];
  let observer;
  let selectedIndex = -1;

  container.classList.add('gallery-thumbnails');
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', 'เลือกภาพในชุดผลงาน');

  const resolveSource = source => new URL(
    source.startsWith('/') ? `${prefix}${source.slice(1)}` : source,
    document.baseURI,
  ).href;

  const showPreview = (entry, source) => {
    if (!source || entry.image.getAttribute('src')) return;
    entry.image.addEventListener('load', () => {
      entry.image.hidden = false;
      entry.button.classList.add('has-preview');
    }, { once: true });
    entry.image.addEventListener('error', () => {
      entry.image.hidden = true;
      entry.button.classList.remove('has-preview');
    }, { once: true });
    entry.image.src = source;
  };

  // Scroll only this strip. Scrolling ancestors would move the open dialog.
  const revealButton = button => {
    if (!container.closest('dialog')?.open || !container.clientWidth) return;
    const strip = container.getBoundingClientRect();
    const item = button.getBoundingClientRect();
    if (item.left < strip.left + 6) {
      container.scrollLeft += item.left - strip.left - 6;
    } else if (item.right > strip.right - 6) {
      container.scrollLeft += item.right - strip.right + 6;
    }
  };

  const setSelected = index => {
    if (!Number.isInteger(index) || index < 0 || index >= entries.length) return;
    const pickerFocused = container.contains(document.activeElement);
    selectedIndex = index;
    entries.forEach((entry, entryIndex) => {
      const selected = entryIndex === index;
      entry.button.setAttribute('aria-current', String(selected));
    });
    const entry = entries[index];
    showPreview(entry, entry.preview || entry.original);
    if (pickerFocused) entry.button.focus({ preventScroll: true });
    revealButton(entry.button);
  };

  const setPhotos = photos => {
    observer?.disconnect();
    observer = undefined;
    selectedIndex = -1;
    entries = [];
    container.replaceChildren();
    container.scrollLeft = 0;
    container.hidden = !Array.isArray(photos) || photos.length < 2;
    if (container.hidden) return;

    if (view?.IntersectionObserver) {
      observer = new view.IntersectionObserver(records => {
        records.forEach(record => {
          if (!record.isIntersecting) return;
          const entry = entries[Number(record.target.dataset.photoIndex)];
          if (entry) showPreview(entry, entry.preview);
          observer.unobserve(record.target);
        });
      }, { root: container, rootMargin: '0px 48px', threshold: 0.01 });
    }

    const fragment = document.createDocumentFragment();
    entries = photos.map((photo, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery-thumbnail';
      button.dataset.photoIndex = String(index);
      button.setAttribute('aria-current', 'false');
      button.setAttribute('aria-label', `เลือกภาพที่ ${index + 1}${photo.alt ? `: ${photo.alt}` : ''}`);

      const image = document.createElement('img');
      image.alt = '';
      image.hidden = true;
      image.decoding = 'async';
      image.draggable = false;
      image.width = 80;
      image.height = 60;

      const number = document.createElement('span');
      number.className = 'gallery-thumbnail-number';
      number.textContent = String(index + 1);
      number.setAttribute('aria-hidden', 'true');
      button.append(image, number);
      button.addEventListener('click', () => {
        onSelect?.(index);
        // Selecting a photo keeps keyboard focus on its corresponding button.
        button.focus({ preventScroll: true });
        if (selectedIndex !== index) setSelected(index);
      });
      button.addEventListener('focus', () => revealButton(button));

      const thumbnail = galleryThumbnailPhotos[photo.src];
      const preview = thumbnail
        ? resolveSource(thumbnail)
        : undefined;
      const entry = { button, image, preview, original: resolveSource(photo.src) };
      fragment.append(button);
      return entry;
    });
    container.append(fragment);
    entries.filter(entry => entry.preview).forEach(entry => {
      if (observer) observer.observe(entry.button);
      else showPreview(entry, entry.preview);
    });
  };

  return { setPhotos, setSelected };
}
