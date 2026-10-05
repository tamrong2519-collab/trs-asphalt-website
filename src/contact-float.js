// Leave page copy readable and controls tappable as they pass behind the float.
export function initializeContactFloat() {
 const floating = document.querySelector('.floating-contact');
 const main = document.querySelector('main');
 if (!floating || !main) return;
 let frame;
 const update = () => {
  frame = undefined;
  const box = floating.getBoundingClientRect();
  const overlapsContent = [...main.querySelectorAll('a, button, input, select, textarea, summary, iframe, p, h1, h2, h3, li, label, .hero-benefit, .paired-number, .project-category')].some(control => {
   const rect = control.getBoundingClientRect();
   if (!rect.width || !rect.height || rect.top >= box.bottom + 8 || rect.bottom <= box.top - 8 || rect.left >= box.right + 8 || rect.right <= box.left - 8) return false;
   return getComputedStyle(control).visibility !== 'hidden';
  });
  const editing = matchMedia('(max-width: 760px)').matches && main.contains(document.activeElement) && document.activeElement.matches('input, select, textarea');
  // Preserve an active keyboard user's focus until they leave the floating links.
  const keyboardFocus = floating.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
  floating.classList.toggle('is-obstructing', !keyboardFocus && (overlapsContent || editing));
 };
 const schedule = () => { if (frame === undefined) frame = requestAnimationFrame(update); };
 window.addEventListener('scroll', schedule, { passive: true });
 window.addEventListener('resize', schedule, { passive: true });
 window.visualViewport?.addEventListener('resize', schedule, { passive: true });
 document.addEventListener('focusin', schedule);
 document.addEventListener('focusout', schedule);
 document.addEventListener('toggle', schedule, true);
 if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(main);
 document.fonts?.ready.then(schedule);
 schedule();
}
