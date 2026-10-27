'use strict';
(()=>{
 const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
 
 // Wire menu button toggle for responsive navigation
 const menuBtn = document.querySelector('.btn-menu, .menu-toggle');
 const nav = document.querySelector('.header-nav, nav');
 if (menuBtn && nav) {
   menuBtn.addEventListener('click', (e) => {
     e.preventDefault();
     const isOpen = nav.classList.toggle('open');
     menuBtn.setAttribute('aria-expanded', String(isOpen));
   });
   nav.querySelectorAll('a').forEach(link => {
     link.addEventListener('click', () => {
       nav.classList.remove('open');
       if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
     });
   });
 }

 // Wire Book Now buttons to open booking modal
 document.querySelectorAll('.btn-book-now, [data-book]').forEach(btn => {
   btn.addEventListener('click', () => {
     const bookingDialog = document.getElementById('booking');
     if (bookingDialog && typeof bookingDialog.showModal === 'function') {
       bookingDialog.showModal();
     }
   });
 });

 if (reduced) return;

 // Interactive luxury pointer sheen
 const interactive = [...document.querySelectorAll('.split-hero, .inner-hero, .story')];
 interactive.forEach(section => section.addEventListener('pointermove', event => {
   const r = section.getBoundingClientRect();
   section.style.setProperty('--mx', `${((event.clientX - r.left) / r.width * 100).toFixed(1)}%`);
   section.style.setProperty('--my', `${((event.clientY - r.top) / r.height * 100).toFixed(1)}%`);
 }));

 // Gentle 3D perspective tilt
 const tilts = [...document.querySelectorAll('.hero-right, .inner-photo, .collection-card .frame')];
 tilts.forEach(card => {
   card.addEventListener('pointermove', event => {
     if (innerWidth <= 800) return;
     const r = card.getBoundingClientRect();
     const x = (event.clientX - r.left) / r.width - 0.5;
     const y = (event.clientY - r.top) / r.height - 0.5;
     card.style.transform = `rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateZ(10px)`;
   });
   card.addEventListener('pointerleave', () => {
     card.style.transform = '';
   });
 });

 // Shimmer light following pointer on photography frames
 document.querySelectorAll('.frame').forEach(frame => frame.addEventListener('pointermove', event => {
   const r = frame.getBoundingClientRect();
   frame.style.setProperty('--frame-x', `${((event.clientX - r.left) / r.width * 100).toFixed(1)}%`);
   frame.style.setProperty('--frame-y', `${((event.clientY - r.top) / r.height * 100).toFixed(1)}%`);
 }));

 let last = scrollY;
 addEventListener('scroll', () => {
   const current = scrollY;
   document.body.dataset.scrollDirection = current > last ? 'down' : 'up';
   last = current;
 }, { passive: true });
})();
