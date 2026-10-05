import { colorThemes, themeStyles } from './color-themes.js';

const grid = document.querySelector('#theme-grid');
const dialog = document.querySelector('#preview-dialog');
const frame = document.querySelector('#preview-frame');
const frameWrap = document.querySelector('.preview-frame-wrap');
const select = document.querySelector('#theme-select');
const loading = document.querySelector('#preview-loading');
const closeButton = document.querySelector('#close-preview');
const title = document.querySelector('#preview-title');
let selectedTheme = colorThemes[0];
let lastTrigger;

const arrow = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>';
const escapeText = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

for (const theme of colorThemes) {
  const card = document.createElement('article');
  card.className = 'theme-card';
  card.id = `theme-${theme.id}`;
  card.style.setProperty('--sample-page', theme.colors.page);
  const colors = [theme.colors.page, theme.colors.card, theme.colors.header, theme.colors.accent, theme.colors.call];
  card.innerHTML = `
    <div class="screenshot-bar" aria-hidden="true">
      <span class="window-dots"><i></i><i></i><i></i></span>
      <span class="screenshot-label">ตัวอย่างหน้าเว็บไซต์จริง</span>
    </div>
    <img class="theme-screenshot" src="./images/color-examples/theme-${escapeText(theme.id)}.jpg" alt="ตัวอย่างเว็บไซต์โทน${escapeText(theme.name)}" width="1200" height="1150" loading="${theme.id === '1' ? 'eager' : 'lazy'}" decoding="async" />
    <div class="theme-details">
      <div class="theme-title-row">
        <span class="theme-number" aria-hidden="true">0${escapeText(theme.id)}</span>
        <h2 class="theme-title">${escapeText(theme.name)}</h2>
        ${theme.recommended ? '<span class="recommended-badge">แนะนำ</span>' : ''}
      </div>
      <p class="theme-description">${escapeText(theme.description)}</p>
      <div class="theme-bottom">
        <div class="theme-swatches" aria-label="ชุดสีตัวอย่าง">${colors.map(color => `<span class="theme-swatch" style="background:${escapeText(color)}" title="${escapeText(color)}"></span>`).join('')}</div>
        <button class="open-preview" type="button" data-theme="${escapeText(theme.id)}" aria-label="เปิดดูแบบที่ ${escapeText(theme.id)} ${escapeText(theme.name)}">เปิดดูแบบนี้ ${arrow}</button>
      </div>
    </div>`;
  grid.append(card);
  const option = document.createElement('option');
  option.value = theme.id;
  option.textContent = `${theme.id}. ${theme.name}`;
  select.append(option);
}
grid.setAttribute('aria-busy', 'false');

function applySelectedTheme() {
  title.textContent = `แบบที่ ${selectedTheme.id} · ${selectedTheme.name}`;
  frame.title = `ตัวอย่างเว็บไซต์ แบบที่ ${selectedTheme.id} ${selectedTheme.name}`;
  const documentInFrame = frame.contentDocument;
  if (!documentInFrame?.head) return;
  let style = documentInFrame.querySelector('#color-comparison-theme');
  if (!style) {
    style = documentInFrame.createElement('style');
    style.id = 'color-comparison-theme';
    documentInFrame.head.append(style);
  }
  style.textContent = themeStyles(selectedTheme);
}

function openPreview(theme, trigger) {
  selectedTheme = theme;
  lastTrigger = trigger;
  select.value = theme.id;
  document.body.classList.add('has-preview');
  dialog.showModal();
  if (!frame.getAttribute('src')) {
    loading.hidden = false;
    frameWrap.setAttribute('aria-busy', 'true');
    frame.src = './services.html';
  }
  applySelectedTheme();
  select.focus();
}

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-theme]');
  if (!button) return;
  const theme = colorThemes.find(item => item.id === button.dataset.theme);
  if (theme) openPreview(theme, button);
});

select.addEventListener('change', () => {
  const theme = colorThemes.find(item => item.id === select.value);
  if (!theme) return;
  selectedTheme = theme;
  applySelectedTheme();
});

frame.addEventListener('load', () => {
  applySelectedTheme();
  frameWrap.setAttribute('aria-busy', 'false');
  loading.hidden = true;
});

closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  document.body.classList.remove('has-preview');
  lastTrigger?.focus({ preventScroll: true });
});
