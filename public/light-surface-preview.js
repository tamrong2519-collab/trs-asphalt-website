// Applies only to the formerly white/ivory surfaces in comparison frames.
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
