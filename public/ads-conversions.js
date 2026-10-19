/* Google Ads event snippets copied from TRS Construction on 19 October 2026.
 * The two function names are distinct so the TEL and LINE labels cannot overwrite
 * each other. The Google tag itself is installed once in each page's <head>.
 */
(function () {
  if (window.__trsAdsConversionsInstalled) return;
  window.__trsAdsConversionsInstalled = true;

  // Event snippet for TEL จาก เว็บไซร์ conversion page.
  function gtag_report_phone_conversion(url) {
    var callback = function () {
      if (typeof(url) != 'undefined') {
        window.location = url;
      }
    };
    gtag('event', 'conversion', {
      'send_to': 'AW-18460039086/0dEpCObMov4cEK6vt-JE',
      'event_callback': callback
    });
    return false;
  }

  // Event snippet for LINE conversion page.
  function gtag_report_line_conversion(url) {
    var callback = function () {
      if (typeof(url) != 'undefined') {
        window.location = url;
      }
    };
    gtag('event', 'conversion', {
      'send_to': 'AW-18460039086/AVTTCIvEnf4cEK6vt-JE',
      'event_callback': callback
    });
    return false;
  }

  function reportContactClick(event) {
    if (event.defaultPrevented || event.button > 1) return;
    var target = event.target;
    var link = target && target.closest ? target.closest('a[href]') : null;
    if (!link || typeof window.gtag !== 'function') return;
    var url;
    try { url = new URL(link.href, document.baseURI); }
    catch (_) { return; }

    // Keep the native phone action and LINE's target="_blank" behavior. Both
    // leave this page open, so the snippets do not need to redirect the visitor.
    if (url.protocol === 'tel:') {
      gtag_report_phone_conversion();
    } else if (url.protocol === 'line:' ||
      ((url.protocol === 'https:' || url.protocol === 'http:') &&
        (url.hostname === 'line.me' || url.hostname === 'lin.ee'))) {
      gtag_report_line_conversion();
    }
  }

  // Delegation also covers contact links rendered by the site's main script.
  document.addEventListener('click', reportContactClick, true);
  document.addEventListener('auxclick', function (event) {
    if (event.button === 1) reportContactClick(event);
  }, true);
})();
