// Preview only: change formerly white/ivory surfaces; preserve the site's brand colors.
const originalColors = { header:'#164F9F', nav:'#E0BC68', ink:'#091F59', muted:'#566077', accent:'#AF8426', accentInk:'#83651E', call:'#0077B6', navInk:'#143D75', highlight:'#F0D68C' };
export const colorThemes = [
  {
    id: '1', name: 'ฟ้าไข่มุก', recommended: true,
    description: 'ฟ้าอ่อนนุ่ม แววไข่มุกบาง ๆ ดูสะอาดและพรีเมี่ยม',
    colors: { page: '#E7F2FC', card: '#EDF7FE', secondary: '#D9EAF7' },
    finish: { light: '#F2F9FF', angle: 125, glow: 0.18, band: 44 },
  },
  {
    id: '2', name: 'ฟ้าคริสตัล', recommended: false,
    description: 'ฟ้าใสชัดขึ้น พร้อมประกายเรียบ ๆ ให้ความรู้สึกทันสมัย',
    colors: { page: '#D9EDFF', card: '#E4F2FF', secondary: '#CAE2F8' },
    finish: { light: '#EFF8FF', angle: 135, glow: 0.16, band: 38 },
  },
  {
    id: '3', name: 'ฟ้าเงิน', recommended: false,
    description: 'ฟ้าอมเงิน แววโลหะละเอียด สุขุมและเป็นทางการ',
    colors: { page: '#E3EBF3', card: '#EAF1F8', secondary: '#D8E2EC' },
    finish: { light: '#F1F6FC', angle: 112, glow: 0.14, band: 50 },
  },
  {
    id: '4', name: 'ฟ้าไอซ์', recommended: false,
    description: 'ฟ้าอ่อนอมเขียว แววใสเย็นตา โปร่งและสบายตา',
    colors: { page: '#E0F5F8', card: '#EBFAFB', secondary: '#D3EEF2' },
    finish: { light: '#F0FDFF', angle: 145, glow: 0.18, band: 42 },
  },
  {
    id: '5', name: 'ฟ้าอมเทา', recommended: false,
    description: 'ฟ้าอมเทานุ่ม แววซาตินบาง ๆ เรียบ เท่ และน่าเชื่อถือ',
    colors: { page: '#E4EEF6', card: '#E7F0F7', secondary: '#D0E0ED' },
    finish: { light: '#EEF5FB', angle: 118, glow: 0.12, band: 56 },
  },
].map(theme => ({ ...theme, colors: { ...originalColors, ...theme.colors } }));

export function themeStyles(theme) {
  const c = theme.colors;
  const f = theme.finish;
  const canvas = `radial-gradient(ellipse at 18% 0%,rgba(255,255,255,${f.glow}),transparent 58%),linear-gradient(${f.angle}deg,${c.page} 0%,${f.light} ${f.band}%,${c.page} 68%,${c.card} 100%)`;
  const panel = `linear-gradient(${f.angle}deg,${c.card} 0%,${f.light} 36%,${c.card} 58%,${c.page} 100%)`;
  return `
    :root{background:${c.page}}
    html body[data-page],html body[data-page] #main,
    html body[data-page="services"] #main :is(.paired-content,.paired-process),
    html body[data-page="projects"] #main :is(.projects-filter-band,.projects-content){background:${canvas}}
    html body[data-page] .site-header .header-contact-band,
    html body[data-page] .skip-link,
    html body[data-page] #main :is(.service-card,.sample-card,.info-card,.process-card,.contact-panel),
    html body[data-page] #main .project-card:not(.project-row),
    html body[data-page] #main .estimate-disclosure>summary,
    html body[data-page] #main :is(.estimate,.service-area p),
    html body[data-page="services"] #main .paired-process-grid article,
    html body[data-page="contact"] :is(.company-location-card,.company-map-actions),
    html body[data-page] .site-footer{background:${panel}}
    html body[data-page] #main :is(input,select,textarea),
    html body[data-page] #main select option,
    html body[data-page] #main .filter:not(.active),
    html body[data-page="projects"] #main .project-view,
    html body[data-page] #lightbox,
    html body[data-page="contact"] .company-location-map,
    html body[data-page] .site-footer .footer-brand img{background:${c.card}}
    /* Use the existing body-copy ink for small notes on the tinted surfaces. */
    html body[data-page] #main :is(.project-image-note,.image-note),
    html body[data-page="services"] #main .paired-process-grid article>span,
    html body[data-page="contact"] #main .company-location-card :is(p,address){color:var(--premium-copy)}
    html body[data-page="services"] #main .paired-number{color:#83651e}
    html body[data-page="services"] #main .paired-content .text-link{color:#00669d}
  `;
}
