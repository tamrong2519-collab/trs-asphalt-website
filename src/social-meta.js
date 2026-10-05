const shareImages = {
  index: { path: 'images/share/hero-sharp.jpg', width: 1536, height: 1024, alt: 'เครื่องจักรและทีมงานลาดยางมะตอย' },
  services: { path: 'images/share/services-hero.jpg', width: 1280, height: 960, alt: 'ผลงานถนนลาดยางมะตอยบริเวณอาคารและแนวต้นไม้' },
  projects: { path: 'images/share/marking-job.jpg', width: 1280, height: 960, alt: 'ผลงานตีเส้นจราจรและลานจอดรถ' },
  contact: { path: 'images/share/hero-sharp.jpg', width: 1536, height: 1024, alt: 'เครื่องจักรและทีมงานลาดยางมะตอย' },
};

const httpURL = value => {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
};

/** Set crawler-visible share metadata from the configured public site URL. */
export function applySocialMetadata({ document, siteURL, business, route, base = '/' }) {
  const site = httpURL(siteURL);
  if (!site) return null;
  site.search = '';
  site.hash = '';
  if (site.pathname === '/' && /^\/(?!\/)/.test(base)) site.pathname = base;
  if (!site.pathname.endsWith('/')) site.pathname += '/';

  const page = Object.hasOwn(shareImages, route) ? route : 'index';
  const photo = shareImages[page];
  const url = new URL(page === 'index' ? '' : `${page}.html`, site).href;
  const image = new URL(photo.path, site).href;
  const description = document.querySelector('meta[name="description"]')?.content || '';
  const title = document.title;
  const setMeta = (attribute, key, value) => {
    const element = document.querySelector(`meta[${attribute}="${key}"]`) || document.createElement('meta');
    element.setAttribute(attribute, key);
    element.content = String(value);
    document.head.append(element);
  };

  const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = url;
  document.head.append(canonical);
  for (const [key, value] of Object.entries({
    'og:type': 'website',
    'og:locale': 'th_TH',
    'og:site_name': `${business.name} CONSTRUCTION`,
    'og:title': title,
    'og:description': description,
    'og:url': url,
    'og:image': image,
    'og:image:secure_url': image.startsWith('https:') ? image : '',
    'og:image:type': 'image/jpeg',
    'og:image:width': photo.width,
    'og:image:height': photo.height,
    'og:image:alt': photo.alt,
  })) {
    if (value !== '') setMeta('property', key, value);
  }
  for (const [key, value] of Object.entries({
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
    'twitter:image:alt': photo.alt,
  })) setMeta('name', key, value);

  const telephone = String(business.phone || '').replace(/[^\d+]/g, '');
  const line = httpURL(business.lineUrl);
  const schema = document.querySelector('script[type="application/ld+json"]') || document.createElement('script');
  schema.type = 'application/ld+json';
  schema.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    '@id': `${site.href}#business`,
    name: business.thaiName || business.name,
    ...(business.thaiName ? { alternateName: `${business.name} CONSTRUCTION` } : {}),
    url: site.href,
    logo: new URL('images/logo.webp', site).href,
    image: new URL(shareImages.index.path, site).href,
    ...(telephone ? { telephone } : {}),
    ...(business.email ? { email: business.email } : {}),
    ...(business.address ? { address: business.address } : {}),
    ...(business.serviceArea ? { areaServed: business.serviceArea.split('•').map(area => area.trim()).filter(Boolean) } : {}),
    ...(line ? { sameAs: [line.href] } : {}),
  });
  document.head.append(schema);
  return { url, image };
}
