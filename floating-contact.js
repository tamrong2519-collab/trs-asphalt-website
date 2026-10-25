/* Shared by the main site and all service pages. Keep real controls tappable. */
(function () {
  function initializeContactFloat() {
    const floating = document.querySelector('.floating-contact');
    if (!floating) return;
    const regions = [...document.querySelectorAll('main, .site-footer')];
    let frame;
    const update = () => {
      frame = undefined;
      const box = floating.getBoundingClientRect();
      const overlapsControl = regions.some(region => [...region.querySelectorAll('a, button, input, select, textarea, summary, iframe')].some(control => {
        const rect = control.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.top >= box.bottom + 8 || rect.bottom <= box.top - 8 || rect.left >= box.right + 8 || rect.right <= box.left - 8) return false;
        return getComputedStyle(control).visibility !== 'hidden';
      }));
      const editing = matchMedia('(pointer: coarse), (max-width: 760px)').matches && document.activeElement.matches('input, select, textarea');
      const keyboardFocus = floating.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
      floating.classList.toggle('is-obstructing', Boolean(document.querySelector('dialog[open]')) || (!keyboardFocus && (overlapsControl || editing)));
    };
    const schedule = () => { if (frame === undefined) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);
    document.addEventListener('toggle', schedule, true);
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(schedule);
      regions.forEach(region => observer.observe(region));
    }
    document.fonts?.ready.then(schedule);
    schedule();
  }
  // Deferred scripts run while readyState is interactive. Wait for the main
  // module to replace pre-rendered content before retaining its DOM elements.
  if (document.readyState === 'complete') initializeContactFloat();
  else document.addEventListener('DOMContentLoaded', initializeContactFloat, { once: true });
})();
