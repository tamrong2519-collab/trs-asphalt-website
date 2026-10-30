// Enhance the server-rendered project links without changing their fallback URLs.
export function initializeHomePortfolio() {
 const section = document.getElementById('home-portfolio');
 const navigation = section?.querySelector('nav.home-portfolio-tabs');
 if (!navigation || navigation.dataset.homePortfolioReady === 'true') return;

 const categories = [...navigation.querySelectorAll('a[data-home-category]')].map(link => ({
  id: link.dataset.homeCategory,
  link,
  panel: document.getElementById(`home-portfolio-panel-${link.dataset.homeCategory}`),
 })).filter(category => category.id && category.panel && section.contains(category.panel));
 if (!categories.length) return;

 const status = document.getElementById('home-portfolio-status');
 let selected;
 navigation.dataset.homePortfolioReady = 'true';
 navigation.setAttribute('role', 'tablist');
 categories.forEach(({ link, panel }) => {
  link.setAttribute('role', 'tab');
  link.setAttribute('aria-controls', panel.id);
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', link.id);
 });

 const activate = (id, { focus = false, announce = true } = {}) => {
  const category = categories.find(item => item.id === id);
  if (!category) return;
  const changed = selected !== category;
  selected = category;
  section.dataset.activeCategory = category.id;
  categories.forEach(item => {
   const active = item === category;
   item.link.classList.toggle('is-active', active);
   item.link.setAttribute('aria-selected', String(active));
   item.link.tabIndex = active ? 0 : -1;
   item.panel.hidden = !active;
  });
  if (focus) category.link.focus({ preventScroll: true });
  if (status && changed && announce) {
   const label = category.link.dataset.homeCategoryLabel
    || category.link.querySelector('.home-portfolio-tab-label')?.textContent.trim()
    || category.link.textContent.trim().replace(/\s+/g, ' ');
   const count = category.panel.querySelectorAll('[data-home-album]').length;
   status.textContent = `${label} · ${count} ภาพ`;
  }
 };

 const categoryFromHash = () => {
  let target;
  try { target = decodeURIComponent(location.hash.slice(1)); }
  catch { return; }
  return categories.find(({ id }) => target === `home-portfolio-card-${id}`
   || target === `home-portfolio-panel-${id}`
   || (target.startsWith(`home-portfolio-photo-${id}-`)
    && /^\d+$/.test(target.slice(`home-portfolio-photo-${id}-`.length))));
 };

 categories.forEach((category, index) => {
  category.link.addEventListener('click', event => {
   if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
   event.preventDefault();
   activate(category.id);
  });
  category.link.addEventListener('keydown', event => {
   if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
   let next;
   if (event.key === 'ArrowRight') next = (index + 1) % categories.length;
   else if (event.key === 'ArrowLeft') next = (index + categories.length - 1) % categories.length;
   else if (event.key === 'Home') next = 0;
   else if (event.key === 'End') next = categories.length - 1;
   else if (event.key === ' ') next = index;
   else return;
   event.preventDefault();
   activate(categories[next].id, { focus: true });
  });
 });

 const initial = categoryFromHash() || categories.find(({ panel }) => !panel.hidden) || categories[0];
 activate(initial.id, { announce: false });
 window.addEventListener('hashchange', () => {
  const category = categoryFromHash();
  if (category) activate(category.id);
 });
}
