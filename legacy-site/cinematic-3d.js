'use strict';
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const header=document.querySelector('header');
 if(header&&!header.querySelector('.site-utilities')){
  const utilities=document.createElement('div');
  utilities.className='site-utilities';
  utilities.setAttribute('aria-label','Quick contact');
  utilities.innerHTML='<a class="utility-call" href="tel:+94770682366">CALL</a><a class="utility-whatsapp" href="https://wa.me/94770682366" target="_blank" rel="noopener">WHATSAPP</a>';
  const nav=header.querySelector('nav');
  header.insertBefore(utilities,nav);
 }
 if(reduced)return;
 const interactive=[...document.querySelectorAll('.split-hero,.inner-hero,.story')];
 interactive.forEach(section=>section.addEventListener('pointermove',event=>{
  const r=section.getBoundingClientRect();
  section.style.setProperty('--mx',`${((event.clientX-r.left)/r.width*100).toFixed(1)}%`);
  section.style.setProperty('--my',`${((event.clientY-r.top)/r.height*100).toFixed(1)}%`);
 }));
 const tilts=[...document.querySelectorAll('.hero-right,.inner-photo')];
 tilts.forEach(card=>{
  card.addEventListener('pointermove',event=>{
   if(innerWidth<=800)return;
   const r=card.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;
   card.style.transform=`rotateX(${(-y*3.5).toFixed(2)}deg) rotateY(${(x*4.5).toFixed(2)}deg) translateZ(8px)`;
  });
  card.addEventListener('pointerleave',()=>card.style.transform='');
 });
 document.querySelectorAll('.frame').forEach(frame=>frame.addEventListener('pointermove',event=>{
  const r=frame.getBoundingClientRect();
  frame.style.setProperty('--frame-x',`${((event.clientX-r.left)/r.width*100).toFixed(1)}%`);
  frame.style.setProperty('--frame-y',`${((event.clientY-r.top)/r.height*100).toFixed(1)}%`);
 }));
 let last=scrollY;
 addEventListener('scroll',()=>{
  const current=scrollY;
  document.body.dataset.scrollDirection=current>last?'down':'up';
  last=current;
 },{passive:true});
})();
