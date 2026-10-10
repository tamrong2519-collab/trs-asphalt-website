const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('.site-nav');
function closeMenu(){nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav?.classList.contains('open')){closeMenu();menu.focus();}});
const photoData=document.querySelector('#photo-data');
if(photoData){
 const photos=JSON.parse(photoData.textContent);
 const thumbs=[...document.querySelectorAll('.thumb[data-index]')];
 function setCredit(credit,photo){
  if(credit){
   const hasCredit=Boolean(photo.author&&photo.creditsId);
   credit.hidden=!hasCredit;
   credit.textContent=hasCredit?`เครดิต: ${photo.author}`:'';
   if(hasCredit)credit.href=`image-credits.html#${photo.creditsId}`;
   else credit.removeAttribute('href');
  }
 }
 function selectThumb(index){
  thumbs.forEach(t=>t.setAttribute('aria-pressed',String(Number(t.dataset.index)===index)));
 }
 const viewer=document.querySelector('#photo-viewer');
 const viewerImage=document.querySelector('#viewer-image');
 const viewerCaption=document.querySelector('#viewer-caption');
 const viewerCredit=document.querySelector('#viewer-credit');
 const panel=viewer?.querySelector('.viewer-panel');
 const stage=viewer?.querySelector('.viewer-stage');
 const closeButton=viewer?.querySelector('.viewer-close');
 if(viewer&&typeof viewer.showModal==='function'&&viewerImage&&viewerCaption&&panel&&stage&&closeButton&&photos.length){
  let selectedIndex=0;
  let trigger=null;
  let scrollPosition=null;
  let savedBodyStyles=null;
  let loadingImage=null;
  let imageRequest=0;
  let backdropPointer=false;
  let touchStart=null;
  const lockProperties=['overflow-x','overflow-y','position','top','left','right','width','padding-right'];

  function cancelImage(){
   imageRequest+=1;
   if(loadingImage){loadingImage.onload=null;loadingImage.onerror=null;loadingImage=null;}
  }

  function showPhoto(index){
   if(!Number.isInteger(index)||!photos[index])return;
   cancelImage();
   selectedIndex=index;
   const photo=photos[index];
   const request=imageRequest;
   viewerImage.hidden=true;
   viewerImage.alt=photo.alt;
   viewerImage.width=photo.width;
   viewerImage.height=photo.height;
   viewerImage.src=photo.src;
   viewerCaption.textContent=photo.caption;
   setCredit(viewerCredit,photo);
   selectThumb(index);
   stage.setAttribute('aria-busy','true');
   const pending=new Image();
   loadingImage=pending;
   pending.decoding='async';
   const reveal=async()=>{
    pending.onload=null;
    pending.onerror=null;
    try{await pending.decode();}catch{}
    if(request!==imageRequest||!viewer.open)return;
    viewerImage.hidden=false;
    stage.setAttribute('aria-busy','false');
    loadingImage=null;
   };
   pending.onload=reveal;
   pending.onerror=()=>{
    if(request!==imageRequest||!viewer.open)return;
    stage.setAttribute('aria-busy','false');
    viewerCaption.textContent=`${photo.caption} — โหลดภาพไม่สำเร็จ กรุณาลองดูอีกครั้ง`;
    loadingImage=null;
   };
   pending.src=photo.src;
   if(pending.complete&&pending.naturalWidth)reveal();
  }

  function navigate(direction){
   showPhoto((selectedIndex+direction+photos.length)%photos.length);
  }

  function lockScroll(){
   const body=document.body;
   scrollPosition={x:window.scrollX,y:window.scrollY};
   savedBodyStyles=lockProperties.map(property=>({property,value:body.style.getPropertyValue(property),priority:body.style.getPropertyPriority(property)}));
   const gutter=Math.max(0,window.innerWidth-document.documentElement.clientWidth);
   const padding=parseFloat(getComputedStyle(body).paddingRight)||0;
   body.classList.add('photo-viewer-open');
   body.style.overflow='hidden';
   body.style.position='fixed';
   body.style.top=`-${scrollPosition.y}px`;
   body.style.left=`-${scrollPosition.x}px`;
   body.style.right='0';
   body.style.width='100%';
   if(gutter)body.style.paddingRight=`${padding+gutter}px`;
  }

  function restorePage(){
   if(!savedBodyStyles)return;
   cancelImage();
   stage.setAttribute('aria-busy','false');
   for(const{property,value,priority}of savedBodyStyles){
    if(value)document.body.style.setProperty(property,value,priority);
    else document.body.style.removeProperty(property);
   }
   document.body.classList.remove('photo-viewer-open');
   savedBodyStyles=null;
   selectThumb(-1);
   if(trigger?.isConnected)trigger.focus({preventScroll:true});
   if(scrollPosition)window.scrollTo({left:scrollPosition.x,top:scrollPosition.y,behavior:'instant'});
   trigger=null;
   scrollPosition=null;
   touchStart=null;
   backdropPointer=false;
  }

  function openViewer(index,button){
   if(!Number.isInteger(index)||!photos[index])return;
   if(!viewer.open){
    trigger=button;
    closeMenu();
    lockScroll();
    viewer.showModal();
   }
   showPhoto(index);
   closeButton.focus({preventScroll:true});
  }

  function closeViewer(){
   if(viewer.open){viewer.close();restorePage();}
  }

  thumbs.forEach(thumb=>thumb.addEventListener('click',()=>openViewer(Number(thumb.dataset.index),thumb)));
  document.querySelectorAll('.photo-open[data-photo-index]').forEach(button=>button.addEventListener('click',()=>openViewer(Number(button.dataset.photoIndex),button)));
  closeButton.addEventListener('click',closeViewer);
  viewer.querySelector('.viewer-prev')?.addEventListener('click',()=>navigate(-1));
  viewer.querySelector('.viewer-next')?.addEventListener('click',()=>navigate(1));
  viewer.addEventListener('close',()=>{if(!viewer.open)restorePage();});
  viewer.addEventListener('cancel',event=>{event.preventDefault();closeViewer();});
  viewer.addEventListener('keydown',event=>{
   if(!viewer.open||event.altKey||event.ctrlKey||event.metaKey)return;
   if(event.key==='Tab'){
    const focusable=[...viewer.querySelectorAll('button:not([disabled]),a[href]')].filter(element=>{
     if(element.tabIndex<0||element.getAttribute('aria-disabled')==='true'||!element.getClientRects().length)return false;
     if(element.tagName==='A'&&!element.getAttribute('href').trim())return false;
     return getComputedStyle(element).visibility!=='hidden';
    });
    const first=focusable[0];
    const last=focusable.at(-1);
    if(first&&last&&((event.shiftKey&&document.activeElement===first)||(!event.shiftKey&&document.activeElement===last))){
     event.preventDefault();
     (event.shiftKey?last:first).focus({preventScroll:true});
    }
    return;
   }
   if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
    event.preventDefault();
    navigate(event.key==='ArrowLeft'?-1:1);
   }
  });
  function outsidePanel(event){
   const bounds=panel.getBoundingClientRect();
   return event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom;
  }
  viewer.addEventListener('pointerdown',event=>{backdropPointer=event.target===viewer&&outsidePanel(event);});
  viewer.addEventListener('click',event=>{
   if(backdropPointer&&event.target===viewer&&outsidePanel(event))closeViewer();
   backdropPointer=false;
  });
  stage.addEventListener('touchstart',event=>{
   if(event.touches.length!==1||event.target.closest('button')){touchStart=null;return;}
   const touch=event.touches[0];
   touchStart={x:touch.clientX,y:touch.clientY};
  },{passive:true});
  stage.addEventListener('touchend',event=>{
   if(!touchStart||!viewer.open)return;
   const touch=event.changedTouches[0];
   if(!touch){touchStart=null;return;}
   const dx=touch.clientX-touchStart.x;
   const dy=touch.clientY-touchStart.y;
   touchStart=null;
   if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.3)navigate(dx<0?1:-1);
  },{passive:true});
  stage.addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});
 }else{
  // Older cached pages keep their original gallery until their HTML refreshes.
  const frame=document.querySelector('.main-photo');
  const image=document.querySelector('#featured-image');
  const caption=document.querySelector('#photo-caption');
  const credit=document.querySelector('#photo-credit');
  function select(index,scroll=true){
   const photo=photos[index];
   if(!photo||!frame||!image||!caption)return;
   image.src=photo.src;image.alt=photo.alt;image.width=photo.width;image.height=photo.height;
   caption.textContent=photo.caption;
   setCredit(credit,photo);
   frame.classList.toggle('is-selected',index!==0);
   selectThumb(index);
   if(scroll)frame.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  }
  thumbs.forEach(thumb=>thumb.addEventListener('click',()=>select(Number(thumb.dataset.index))));
  document.querySelector('.photo-reset')?.addEventListener('click',()=>select(0,false));
 }
}
const mobile=document.querySelector('.mobile-contact');
if(mobile){
 const visible=new Set();
 const observer=new IntersectionObserver(entries=>{for(const e of entries)e.isIntersecting?visible.add(e.target):visible.delete(e.target);mobile.hidden=visible.size>0;},{threshold:0});
 document.querySelectorAll('.primary-actions').forEach(x=>observer.observe(x));
}
