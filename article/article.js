
const header = document.querySelector('.site-header');
const progress = document.querySelector('#article-progress-fill');
const content = document.querySelector('#article-content');
const toc = document.querySelector('#article-toc');
const compact = matchMedia('(max-width: 900px)');

const measureHeader = () => document.documentElement.style.setProperty('--site-header-height', `${header.offsetHeight}px`);
new ResizeObserver(measureHeader).observe(header);
measureHeader();
const setToc = () => { toc.open = !compact.matches || location.hash === '#article-toc'; };
setToc();
compact.addEventListener('change', setToc);
addEventListener('hashchange', () => {
  if (location.hash === '#article-toc') toc.open = true;
});

let framePending = false;
const updateProgress = () => {
  const bounds = content.getBoundingClientRect();
  const visible = innerHeight - header.offsetHeight;
  const value = Math.max(0, Math.min(1, (header.offsetHeight - bounds.top) / Math.max(1, bounds.height - visible)));
  progress.style.transform = `scaleX(${value})`;
  framePending = false;
};
addEventListener('scroll', () => {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(updateProgress);
  }
}, { passive: true });
addEventListener('resize', updateProgress, { passive: true });
updateProgress();

const links = [...toc.querySelectorAll('a')];
for (const link of links) link.addEventListener('click', () => { if (compact.matches) toc.open = false; });
const observer = new IntersectionObserver(entries => {
  const entry = entries.filter(item => item.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
  if (!entry) return;
  for (const link of links) {
    if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}, { rootMargin: `-${header.offsetHeight + 20}px 0px -48% 0px` });
for (const section of content.querySelectorAll('section[id]')) observer.observe(section);

const status = document.querySelector('#article-share-status');
let messageTimeout;
const announce = message => {
  clearTimeout(messageTimeout);
  status.textContent = message;
  status.classList.add('is-visible');
  messageTimeout = setTimeout(() => status.classList.remove('is-visible'), 4500);
};
const shareButton = document.querySelector('#article-share');
shareButton.hidden = false;
shareButton.addEventListener('click', async () => {
  const url = new URL(location.href);
  url.hash = '';
  const data = { title: document.querySelector('h1').innerText.replace(/\n/g, ' '), url: url.href };
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(data.url);
      announce('คัดลอกลิงก์บทความแล้ว');
    } else {
      announce('แชร์ได้ด้วยการคัดลอกลิงก์จากแถบที่อยู่ของเบราว์เซอร์');
    }
  } catch (error) {
    if (error.name !== 'AbortError') announce('แชร์ได้ด้วยการคัดลอกลิงก์จากแถบที่อยู่ของเบราว์เซอร์');
  }
});

for (const link of document.querySelectorAll('a[href="#article-toc"]')) {
  link.addEventListener('click', () => { toc.open = true; });
}
