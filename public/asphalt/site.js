const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('.site-nav');
function closeMenu(){nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav?.classList.contains('open')){closeMenu();menu.focus();}});
const photoData=document.querySelector('#photo-data');
if(photoData){
 const photos=JSON.parse(photoData.textContent);
 const frame=document.querySelector('.main-photo');
 const image=document.querySelector('#featured-image');
 const caption=document.querySelector('#photo-caption');
 const credit=document.querySelector('#photo-credit');
 const thumbs=[...document.querySelectorAll('.thumb')];
 function select(index,scroll=true){
  const photo=photos[index];image.src=photo.src;image.alt=photo.alt;image.width=photo.width;image.height=photo.height;
  caption.textContent=photo.caption;
  if(credit){
   const hasCredit=Boolean(photo.author&&photo.creditsId);
   credit.hidden=!hasCredit;
   credit.textContent=hasCredit?`เครดิต: ${photo.author}`:'';
   if(hasCredit)credit.href=`image-credits.html#${photo.creditsId}`;
   else credit.removeAttribute('href');
  }
  frame.classList.toggle('is-selected',index!==0);
  thumbs.forEach(t=>t.setAttribute('aria-pressed',String(Number(t.dataset.index)===index)));
  if(scroll)frame.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 }
 thumbs.forEach(thumb=>thumb.addEventListener('click',()=>select(Number(thumb.dataset.index))));
 document.querySelector('.photo-reset')?.addEventListener('click',()=>select(0,false));
}
const mobile=document.querySelector('.mobile-contact');
if(mobile){
 const visible=new Set();
 const observer=new IntersectionObserver(entries=>{for(const e of entries)e.isIntersecting?visible.add(e.target):visible.delete(e.target);mobile.hidden=visible.size>0;},{threshold:0});
 document.querySelectorAll('.primary-actions').forEach(x=>observer.observe(x));
}
