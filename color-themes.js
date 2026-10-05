export const colorThemes = [
 { id:'1', name:'ขาวเทา–กรมท่า', description:'สะอาด น่าเชื่อถือ เพิ่มทองด้านเป็นจุดเน้นเล็กน้อย', recommended:true,
  colors:{page:'#F4F5F7',card:'#FFFFFF',header:'#12233F',nav:'#E8ECF2',ink:'#17263C',muted:'#536174',accent:'#A48245',accentInk:'#80602A',call:'#123D74',navInk:'#17263C',secondary:'#E8ECF2',highlight:'#E3CDA2'} },
 { id:'2', name:'ขาวนวล–เทาถ่าน', description:'อบอุ่น สุขุม ใช้ขาวนวลคู่กับเทาเข้มและบรอนซ์', recommended:false,
  colors:{page:'#F4F1EA',card:'#FFFDFA',header:'#292B2D',nav:'#E5DED1',ink:'#292B2D',muted:'#625E58',accent:'#A77D50',accentInk:'#785532',call:'#353E49',navInk:'#292B2D',secondary:'#E5DED1',highlight:'#E3CCB0'} },
 { id:'3', name:'ขาวสะอาด–น้ำเงิน', description:'โปร่ง ทันสมัย ใช้น้ำเงินและเงินอมฟ้าให้ดูเป็นระเบียบ', recommended:false,
  colors:{page:'#FFFFFF',card:'#F5F7FA',header:'#10345D',nav:'#E6ECF3',ink:'#17304D',muted:'#52647A',accent:'#6F8AA4',accentInk:'#496783',call:'#164F9F',navInk:'#17304D',secondary:'#E6ECF3',highlight:'#D8E5F2'} },
 { id:'4', name:'เทาหิน–สเลต', description:'เรียบ เท่ มั่นคง ได้บรรยากาศงานก่อสร้างและวัสดุธรรมชาติ', recommended:false,
  colors:{page:'#EFEEEA',card:'#FAF9F6',header:'#35434B',nav:'#DDDCD5',ink:'#303D42',muted:'#606760',accent:'#928365',accentInk:'#716348',call:'#35434B',navInk:'#303D42',secondary:'#DDDCD5',highlight:'#E0D6C0'} },
 { id:'5', name:'กรมท่าเข้ม–ขาว', description:'เน้นพื้นที่สีเข้มสลับการ์ดขาว ให้ภาพผลงานดูโดดเด่น', recommended:false,
  colors:{page:'#EDF0F4',card:'#FFFFFF',header:'#0D1B30',nav:'#23374F',ink:'#192C44',muted:'#556477',accent:'#C2A16A',accentInk:'#80602A',call:'#173F6E',navInk:'#F5F7FA',secondary:'#E2E8F0',highlight:'#E4C99E'} },
];

// Applied only to the comparison page's iframe; the published site keeps its theme.
export function themeStyles(theme) {
 const c = theme.colors;
 const rgb = c.header.slice(1).match(/../g).map(value=>parseInt(value,16)).join(',');
 return `
 :root{--premium-navy:${c.ink};--premium-copy:${c.muted};--premium-gold:${c.highlight};--premium-gold-ink:${c.accentInk};--premium-ivory:${c.page};--premium-border:${c.secondary};--surface-light:${c.page};--surface-muted:${c.secondary};--surface-hover:${c.secondary};background:${c.page}}
 html body[data-page],html body[data-page] #main,
 html body[data-page="services"] #main :is(.paired-content,.paired-process),
 html body[data-page="projects"] #main :is(.projects-filter-band,.projects-content){background:${c.page}}
 html body[data-page] .site-header{--header-blue:${c.header};--header-gold:${c.nav};--header-nav-ink:${c.navInk};background:${c.header}}
 html body[data-page] .site-header #main-nav>.nav-link,
 html body[data-page] .site-header #main-nav>.nav-link:is([aria-current],:hover,:focus-visible){color:${c.navInk}}
 html body[data-page] .site-header .header-nav-band a:focus-visible{outline-color:${c.navInk}}
 html body[data-page] .site-header .header-contact-band{background:${c.card}}
 html body[data-page] .site-header .brand small{color:${c.highlight}}
 html body[data-page] .site-header .header-contact a{color:${c.call}}
 html body[data-page] #main :is(.service-card,.sample-card,.info-card,.process-card,.contact-panel),
 html body[data-page] #main .estimate-disclosure>summary,
 html body[data-page="services"] #main .paired-process-grid article,
 html body[data-page] #main :is(input,select,textarea),
 html body[data-page] #main select option,
 html body[data-page] #main .filter:not(.active),
 html body[data-page] .site-footer,
 html body[data-page="contact"] :is(.company-location-card,.company-location-map,.company-map-actions),
 html body[data-page] #lightbox{background:${c.card};border-color:${c.secondary}}
 html body[data-page] #main :is(.trust-strip,.preparation,.service-area,.estimate),
 html body[data-page] #main .service-area p,
 html body[data-page] .footer-shell,
 html body[data-page="contact"] :is(.company-location-shell,.company-location-icon),
 html body[data-page="projects"] #lightbox-image{background:${c.secondary}}
 html body[data-page] #main .trust-strip h3{color:${c.ink}}
 html body[data-page] #main .trust-strip p{color:${c.ink}}
 html body[data-page] #main :is(.service-icon,.card-arrow,.paired-number,.paired-eyebrow,.projects-eyebrow,.project-category),
 html body[data-page] #main .sample-card .icon-pin{color:${c.accentInk}}
 html body[data-page="services"] #main .paired-check-mark{background:${c.secondary};color:${c.accentInk};border-color:${c.secondary}}
 html body[data-page] #main :is(.hero,.page-hero,.paired-hero,.blue-section,.cta,.paired-cta){background:${c.header}}
 html body[data-page] #main .hero .hero-overlay{background:linear-gradient(90deg,rgba(${rgb},1),rgba(${rgb},.94) 36%,rgba(${rgb},.75) 50%,transparent 78%)}
 html body[data-page="index"] #main .hero-estimate .hero-benefits{background:linear-gradient(90deg,transparent 36%,rgba(${rgb},.93) 100%)}
 html body[data-page] #main :is(.paired-hero,.page-hero)::after{background:linear-gradient(90deg,rgba(${rgb},.98),rgba(${rgb},.86) 42%,transparent 82%)}
 html body[data-page] #main :is(.paired-hero .paired-eyebrow,.page-hero-eyebrow){color:${c.highlight}}
 html body[data-page] #main :is(.blue-section,.cta,.paired-cta) :is(h2,h3){color:#F7FAFD}
 html body[data-page] #main :is(.blue-section,.cta,.paired-cta)>:is(.container,.cta-inner)>.section-heading>p,
 html body[data-page] #main :is(.cta,.paired-cta) p{color:#DCE4EE}
 html body[data-page] #main .blue-section .section-heading .button{color:${c.highlight};border-color:${c.accent}}
 html body[data-page] #main .sample-card h3,html body[data-page] #main .info-card h3{color:${c.ink}}
 html body[data-page] #main .info-card p{color:${c.muted}}
 html body[data-page] #main .text-link{color:${c.call}}
 html body[data-page] #main .estimate p{color:${c.ink}}
 html body[data-page] #main .eyebrow{color:${c.accentInk}}
 html body[data-page] #main .button.primary,
 html body[data-page="index"] #main .hero-estimate .hero-quote>.button,
 html body[data-page="contact"] #main .contact-panel .actions>.button.primary,
 html body[data-page] .site-footer .footer-phone,
 html body[data-page="contact"] .company-location-open{background:${c.call};color:#FFF}
 html body[data-page] #main .button.line,
 html body[data-page="contact"] #main .contact-panel .actions>.button.line,
 html body[data-page] .site-footer .footer-line{background:#007A2D;color:#FFF}
 html body[data-page] #main .contact-icon{background:${c.call}}
 html body[data-page] #main .contact-icon.green{background:#007A2D}
 html body[data-page] #main .contact-box,html body[data-page] .site-footer :is(.footer-legal,.footer-secondary,.footer-tagline){border-color:${c.secondary}}
 html body[data-page] .site-footer .footer-brand,html body[data-page] .site-footer .footer-nav a{color:${c.ink}}
 html body[data-page] .site-footer .footer-brand img{background:${c.card}}
 html body[data-page] .site-footer .footer-stripes{background:repeating-linear-gradient(125deg,${c.accent} 0,${c.accent} 14px,${c.header} 14px,${c.header} 28px)}
 html body[data-page] .float-call{background:${c.header}}
 html body[data-page] #main .filter.active{background:${c.header};color:#FFF;border-color:${c.header}}
 html body[data-page="projects"] #main :is(.project-view,.project-gallery-open){background:${c.header};color:${c.highlight}}
 @media(max-width:760px){
  html body[data-page="index"] #main .hero-estimate{background:${c.header}}
  html body[data-page="index"] #main .hero-estimate :is(.hero-overlay,.hero-benefits){background:none}
  html body[data-page] .float-call{background:transparent}
  html body[data-page] .float-call .float-face{background:${c.header}}
  html body[data-page] #main :is(.paired-hero,.page-hero)::after{background:linear-gradient(90deg,rgba(${rgb},.98),rgba(${rgb},.70))}
 }
 ${theme.id==='5'?`
 html body[data-page="index"] #main,
 html body[data-page="services"] #main .paired-content,
 html body[data-page="projects"] #main .projects-content{background:#14263F}
 html body[data-page="index"] #main>.section>.section-heading h2,
 html body[data-page="services"] #main .paired-content h2,
 html body[data-page="projects"] #main .projects-content :is(h2,h3){color:#F5F7FA}
 html body[data-page="index"] #main>.section>.section-heading p,
 html body[data-page="services"] #main .paired-content :is(p,li),
 html body[data-page="projects"] #main .projects-content p{color:#DCE4EE}
 html body[data-page="services"] #main .paired-content :is(.paired-number,.paired-eyebrow),
 html body[data-page="projects"] #main .projects-content :is(.projects-eyebrow,.project-category){color:${c.highlight}}
 html body[data-page="services"] #main .paired-content .text-link{color:${c.highlight}}
 html body[data-page="services"] #main .paired-service,html body[data-page="projects"] #main .project-row{border-color:#ffffff24}
 html body[data-page] .site-header #main-nav>.nav-link::after{background:${c.highlight}}
 `:''}
 `;
}
