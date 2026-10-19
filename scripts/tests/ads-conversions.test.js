import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const routes = ['index.html', 'services.html', 'projects.html', 'contact.html',
  'asphalt/index.html', 'asphalt-paving/index.html', 'gravel-parking/index.html',
  'gravel-road/index.html', 'stone-chips/index.html', 'speed-bump/index.html',
  'traffic-marking/index.html'];
const phoneDestination = 'AW-18460039086/0dEpCObMov4cEK6vt-JE';
const lineDestination = 'AW-18460039086/AVTTCIvEnf4cEK6vt-JE';
const script = readFileSync(new URL('../../public/ads-conversions.js', import.meta.url), 'utf8');

function openBuiltPage(route) {
  const html = readFileSync(new URL(`../../dist/${route}`, import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: `https://www.trsasphalt.com/${route}`, runScripts: 'outside-only' });
  const { window } = dom;
  const googleTags = [...window.document.querySelectorAll('script[src]')]
    .filter(tag => tag.src.startsWith('https://www.googletagmanager.com/gtag/js'));
  assert.equal(googleTags.length, 1, `${route}: exactly one Google tag`);
  assert.equal(new URL(googleTags[0].src).searchParams.get('id'), 'AW-18460039086');
  assert.equal(window.document.querySelectorAll('script[src*="ads-conversions.js"]').length, 1);
  assert.equal(/GTM-T2FM6SK9|googletagmanager\.com\/(?:gtm\.js|ns\.html)/.test(html), false);
  const base = [...window.document.querySelectorAll('head script:not([src])')]
    .find(tag => tag.textContent.includes("gtag('config', 'AW-18460039086')"));
  assert.ok(base, `${route}: the account's base snippet is in the head`);
  window.eval(base.textContent);
  window.eval(script);
  return dom;
}

function conversions(window) {
  return window.dataLayer.filter(args => args[0] === 'event' && args[1] === 'conversion');
}

function clickWithoutOpeningApp(window, element, options = {}) {
  // Inspect the website's decision before stopping native navigation in this
  // offline test; no requests, calls or LINE windows are opened by these tests.
  let preventedBySite;
  window.addEventListener(options.type || 'click', event => {
    preventedBySite = event.defaultPrevented;
    event.preventDefault();
  }, { once: true });
  element.dispatchEvent(new window.MouseEvent(options.type || 'click', {
    bubbles: true, cancelable: true, button: options.button || 0,
  }));
  assert.equal(preventedBySite, false, 'contact links keep their native action');
}

test('all 11 published pages send the matching conversion once for every contact link', () => {
  for (const route of routes) {
    const dom = openBuiltPage(route);
    try {
      const { window } = dom;
      assert.equal(conversions(window).length, 0, `${route}: page load is not a lead`);
      assert.equal(window.dataLayer.filter(args => args[0] === 'config').length, 1);
      const links = [...window.document.querySelectorAll('a[href]')]
        .filter(link => link.protocol === 'tel:' || link.hostname === 'line.me');
      assert.ok(links.some(link => link.protocol === 'tel:'), `${route}: phone CTA exists`);
      assert.ok(links.some(link => link.hostname === 'line.me'), `${route}: LINE CTA exists`);
      for (const link of links) {
        const before = conversions(window).length;
        clickWithoutOpeningApp(window, link.querySelector('svg path, span') || link);
        const events = conversions(window);
        assert.equal(events.length, before + 1, `${route}: one conversion per contact click`);
        assert.equal(events.at(-1)[2].send_to,
          link.protocol === 'tel:' ? phoneDestination : lineDestination, `${route}: correct Ads label`);
      }
      const before = conversions(window).length;
      const internal = window.document.querySelector('a[href="/"]');
      if (internal) clickWithoutOpeningApp(window, internal);
      assert.equal(conversions(window).length, before, `${route}: internal navigation is not a lead`);
    } finally { dom.window.close(); }
  }
});

test('reloading the contact script does not duplicate hits; dynamically added contact links work', () => {
  const dom = openBuiltPage('index.html');
  try {
    const { window } = dom;
    window.eval(script);
    window.document.body.insertAdjacentHTML('beforeend', '<a id="new-line" href="https://lin.ee/example" target="_blank"><span>LINE</span></a>');
    clickWithoutOpeningApp(window, window.document.querySelector('#new-line span'));
    assert.equal(conversions(window).length, 1);
    assert.equal(conversions(window)[0][2].send_to, lineDestination);
    clickWithoutOpeningApp(window, window.document.querySelector('#new-line'), { type: 'auxclick', button: 1 });
    assert.equal(conversions(window).length, 2, 'middle click is tracked once');
  } finally { dom.window.close(); }
});

test('blocked or not-yet-loaded Google requests do not stop phone or LINE navigation', () => {
  const dom = openBuiltPage('contact.html');
  try {
    const { window } = dom;
    // No remote Google script is loaded in this test. The base tag queues events.
    for (const selector of ['a[href^="tel:"]', 'a[href*="line.me/"]']) {
      clickWithoutOpeningApp(window, window.document.querySelector(selector));
    }
    assert.equal(conversions(window).length, 2);
    delete window.gtag;
    clickWithoutOpeningApp(window, window.document.querySelector('a[href^="tel:"]'));
    assert.equal(conversions(window).length, 2);
  } finally { dom.window.close(); }
});
