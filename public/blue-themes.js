import { themeStyles as baseThemeStyles } from './color-themes.js';

// These materials are used only inside the blue examples page's preview frame.
export const colorThemes = [
  {
    id: '1', name: 'ฟ้าไข่มุก', recommended: true,
    description: 'ฟ้าอ่อนนุ่ม แววไข่มุกบาง ๆ ดูสะอาดและพรีเมี่ยม',
    colors: { page: '#E7F2FC', card: '#EDF7FE', header: '#173D62', nav: '#CDDFEE', ink: '#17344E', muted: '#465D72', accent: '#739ABD', accentInk: '#355D80', call: '#164F9F', navInk: '#17344E', secondary: '#D9EAF7', highlight: '#D4EAFB' },
    finish: { light: '#F2F9FF', shade: '#DDEBF8', edge: '#BDD3E6', angle: 125, glow: 0.18, band: 44 },
  },
  {
    id: '2', name: 'ฟ้าคริสตัล', recommended: false,
    description: 'ฟ้าใสชัดขึ้น พร้อมประกายเรียบ ๆ ให้ความรู้สึกทันสมัย',
    colors: { page: '#D9EDFF', card: '#E4F2FF', header: '#144B85', nav: '#BBDAF5', ink: '#123A60', muted: '#3D5A75', accent: '#6F9AC2', accentInk: '#285980', call: '#14529C', navInk: '#123A60', secondary: '#CAE2F8', highlight: '#D2EBFF' },
    finish: { light: '#EFF8FF', shade: '#CFE5FA', edge: '#A8CBEA', angle: 135, glow: 0.16, band: 38 },
  },
  {
    id: '3', name: 'ฟ้าเงิน', recommended: false,
    description: 'ฟ้าอมเงิน แววโลหะละเอียด สุขุมและเป็นทางการ',
    colors: { page: '#E3EBF3', card: '#EAF1F8', header: '#294B68', nav: '#CCD7E4', ink: '#263F57', muted: '#48596B', accent: '#839AAF', accentInk: '#3C5870', call: '#214F82', navInk: '#263F57', secondary: '#D8E2EC', highlight: '#DCEAF5' },
    finish: { light: '#F1F6FC', shade: '#D9E3ED', edge: '#BACBDC', angle: 112, glow: 0.14, band: 50 },
  },
  {
    id: '4', name: 'ฟ้าไอซ์', recommended: false,
    description: 'ฟ้าอ่อนอมเขียว แววใสเย็นตา โปร่งและสบายตา',
    colors: { page: '#E0F5F8', card: '#EBFAFB', header: '#145264', nav: '#C5E6EC', ink: '#173E49', muted: '#435D68', accent: '#629FAC', accentInk: '#285F6D', call: '#13598C', navInk: '#173E49', secondary: '#D3EEF2', highlight: '#D7F5FA' },
    finish: { light: '#F0FDFF', shade: '#D4EEF3', edge: '#AFD5DC', angle: 145, glow: 0.18, band: 42 },
  },
  {
    id: '5', name: 'ฟ้าอมเทา', recommended: false,
    description: 'ฟ้าอมเทานุ่ม แววซาตินบาง ๆ เรียบ เท่ และน่าเชื่อถือ',
    colors: { page: '#DCE8F1', card: '#E7F0F7', header: '#2C465F', nav: '#C7D8E5', ink: '#243F56', muted: '#43596B', accent: '#7698AF', accentInk: '#375D76', call: '#234F7D', navInk: '#243F56', secondary: '#D0E0ED', highlight: '#D5E7F5' },
    finish: { light: '#EEF5FB', shade: '#D2E1ED', edge: '#B0C8DA', angle: 118, glow: 0.12, band: 56 },
  },
];

export function themeStyles(theme) {
  const c = theme.colors;
  const f = theme.finish;
  const canvas = `radial-gradient(ellipse at 18% 0%,rgba(255,255,255,${f.glow}),transparent 58%),linear-gradient(${f.angle}deg,${c.page} 0%,${f.light} ${f.band}%,${c.page} 68%,${f.shade} 100%)`;
  const panel = `linear-gradient(${f.angle}deg,${c.card} 0%,${f.light} 36%,${c.card} 58%,${c.secondary} 100%)`;
  const ribbon = `linear-gradient(180deg,${c.card} 0%,${c.nav} 48%,${c.secondary} 100%)`;
  const secondary = `linear-gradient(${f.angle}deg,${c.secondary} 0%,${c.page} 43%,${c.secondary} 100%)`;
  // Namespace the id so base theme 5's dark content special case is not applied.
  return `${baseThemeStyles({ ...theme, id: `blue-${theme.id}` })}
    :root{color:${c.ink};--navy:${c.ink};--muted:${c.muted};--line:${f.edge};--blue:${c.call};--pale:${c.secondary};--premium-border:${f.edge}}
    html body[data-page]{color:${c.ink}}
    html body[data-page],html body[data-page] #main,
    html body[data-page="services"] #main :is(.paired-content,.paired-process),
    html body[data-page="projects"] #main :is(.projects-filter-band,.projects-content){background:${canvas}}
    html body[data-page] #main :is(.service-card,.sample-card,.info-card,.process-card,.contact-panel),
    html body[data-page] #main .project-card:not(.project-row),
    html body[data-page] #main .estimate-disclosure>summary,
    html body[data-page="services"] #main .paired-process-grid article,
    html body[data-page="contact"] :is(.company-location-card,.company-map-actions),
    html body[data-page] .site-footer{
      background:${panel};border-color:${f.edge};
      box-shadow:inset 0 1px 0 #ffffffb3,0 7px 24px #183e620a;
    }
    html body[data-page] #main :is(.trust-strip,.preparation,.service-area,.estimate),
    html body[data-page] #main .service-area p,
    html body[data-page] .footer-shell,
    html body[data-page="contact"] .company-location-shell{background:${secondary};border-color:${f.edge}}
    html body[data-page] .site-header .header-brand-band{
      background:linear-gradient(125deg,#ffffff0a,transparent 65%),${c.header};
    }
    html body[data-page] .site-header .header-nav-band{
      background:${ribbon};box-shadow:inset 0 1px 0 #ffffffb3,inset 0 -1px 0 ${f.edge};
    }
    html body[data-page] .site-header .header-contact-band{
      background:${panel};box-shadow:inset 0 1px 0 #ffffffb3;
    }
    html body[data-page] .site-header .header-contact .header-line,
    html body[data-page] .site-header .header-contact .header-line-icon{color:#006526}
    html body[data-page] .site-header .header-contact .header-line{border-color:${f.edge}}
    html body[data-page] .site-header .header-contact .header-line .line-symbol{background:#006526;color:#FFF}
    html body[data-page] #main :is(.paired-checks li,.paired-note,.project-image-note,.image-note),
    html body[data-page] .site-footer p,
    html body[data-page="contact"] #main .company-location-shell :is(p,address){color:${c.muted}}
    html body[data-page="services"] #main .paired-process-grid article>span,
    html body[data-page] #main :is(.process-card>.icon,.info-card .icon,.project-caption>.icon,.checklist .icon){color:${c.accentInk}}
    html body[data-page] #main :is(.paired-service,.project-row,.contact-box),
    html body[data-page] .site-footer :is(.footer-legal,.footer-secondary,.footer-tagline){border-color:${f.edge}}
    html body[data-page] #main :is(input,select,textarea),
    html body[data-page] #main select option,
    html body[data-page] #main .filter:not(.active),
    html body[data-page] #lightbox,
    html body[data-page="contact"] .company-location-map{
      background:${c.card};border-color:${f.edge};color:${c.ink};
    }
    html body[data-page] #main :is(input,select,textarea):focus-visible{outline-color:${c.call};border-color:${c.call}}
    html body[data-page] #main .section-heading>p{border-left-color:${f.edge}}
  `;
}
