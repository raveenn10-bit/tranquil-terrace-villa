'use strict';
(()=>{
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Wire menu button toggle for responsive navigation drawer
  const menuBtn = document.querySelector('.btn-menu, .menu-toggle');
  const nav = document.querySelector('.header-nav, nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuBtn.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      document.body.style.overflow = isOpen && window.innerWidth <= 960 ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        document.body.style.overflow = '';
        if (menuBtn) {
          menuBtn.setAttribute('aria-expanded', 'false');
          menuBtn.setAttribute('aria-label', 'Open navigation');
        }
      });
    });
  }

  // Wire Book Now buttons to open booking modal
  document.querySelectorAll('.btn-book-now, [data-book]').forEach(btn => {
    btn.addEventListener('click', () => {
      const bookingDialog = document.getElementById('booking');
      if (bookingDialog && typeof bookingDialog.showModal === 'function') {
        if (nav && nav.classList.contains('open')) {
          nav.classList.remove('open');
          document.body.style.overflow = '';
        }
        bookingDialog.showModal();
      }
    });
  });

  // Horizontal Left-to-Right auto-scrolling touch pause & interaction
  const autoScrollWraps = document.querySelectorAll('.auto-scroll-wrap');
  autoScrollWraps.forEach(wrap => {
    const track = wrap.querySelector('.auto-scroll-ltr');
    if (!track) return;
    let resumeTimer = null;
    wrap.addEventListener('touchstart', () => {
      track.classList.add('is-paused');
      if (resumeTimer) clearTimeout(resumeTimer);
    }, { passive: true });
    wrap.addEventListener('touchend', () => {
      resumeTimer = setTimeout(() => {
        track.classList.remove('is-paused');
      }, 1800);
    }, { passive: true });
    wrap.addEventListener('pointerenter', () => track.classList.add('is-paused'));
    wrap.addEventListener('pointerleave', () => track.classList.remove('is-paused'));
  });

  if (reduced) return;

  // Interactive luxury pointer sheen
  const interactive = [...document.querySelectorAll('.split-hero, .inner-hero, .story')];
  interactive.forEach(section => section.addEventListener('pointermove', event => {
    const r = section.getBoundingClientRect();
    section.style.setProperty('--mx', `${((event.clientX - r.left) / r.width * 100).toFixed(1)}%`);
    section.style.setProperty('--my', `${((event.clientY - r.top) / r.height * 100).toFixed(1)}%`);
  }));

  // Gentle 3D perspective tilt for desktop screens
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
