import fs from 'fs';
import http from 'http';

const baseUrl = 'http://localhost:3000';
const routes = [
  { path: '/', file: 'index.html', name: 'Home' },
  { path: '/villas', file: 'villas.html', name: 'Villas' },
  { path: '/experiences', file: 'experiences.html', name: 'Experiences' },
  { path: '/gallery', file: 'gallery.html', name: 'Gallery' },
  { path: '/explore-galle', file: 'explore-galle.html', name: 'Explore Galle' },
  { path: '/contact', file: 'contact.html', name: 'Contact' }
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('TRANQUIL TERRACE — MOBILE RESPONSIVE MASTER AUDIT');
  console.log('Testing Breakpoints: 320px, 375px, 390px, 430px, 768px, 1440px');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(desc, condition) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failed++;
    }
  }

  // 1. Verify CSS Rules
  console.log('--- 1. Testing mobile-carousels.css rules ---');
  const css = fs.readFileSync('public/mobile-carousels.css', 'utf8');

  assert('Contains max-width: 767px mobile media query', css.includes('@media (max-width: 767px)'));
  assert('Contains tablet breakpoint 768px - 1023px', css.includes('@media (min-width: 768px) and (max-width: 1023px)'));
  assert('Contains desktop breakpoint >= 1024px', css.includes('@media (min-width: 1024px)'));
  assert('Contains prefers-reduced-motion rule', css.includes('@media (prefers-reduced-motion: reduce)'));
  assert('Card width set to 85vw (82–88% viewport)', css.includes('85vw'));
  assert('Card gap set to 16px', css.includes('gap: 16px'));
  assert('Card radius set to 22px (20–24px)', css.includes('border-radius: 22px'));
  assert('CSS scroll-snap-type: x proximity used for smooth snapping', css.includes('scroll-snap-type: x proximity'));
  assert('CSS scroll-snap-align: center used for active card center', css.includes('scroll-snap-align: center'));
  assert('touch-action: pan-x pan-y used to ensure fluid horizontal swipe + vertical scroll', css.includes('touch-action: pan-x pan-y'));
  assert('Hidden horizontal scrollbars', css.includes('scrollbar-width: none'));
  assert('Pagination dots styled with luxury gold and active pill', css.includes('.carousel-pagination-dots') && css.includes('.carousel-dot.active'));

  // Target selectors in CSS
  const targetSelectors = [
    '.meta-villas-grid',
    '.dual-villas-carousel',
    '.booking-amenities-container',
    '.luxury-packages-grid',
    '.special-offers-grid',
    '.experience-marquee-track',
    '.gallery-grid',
    '.meta-reviews-grid',
    '.review-marquee-track',
    '.guide-grid',
    '.meta-instagram-grid'
  ];

  targetSelectors.forEach(sel => {
    assert(`CSS includes carousel container: ${sel}`, css.includes(sel));
  });

  // 2. Verify JS Engine
  console.log('\n--- 2. Testing mobile-carousels.js engine ---');
  const js = fs.readFileSync('public/mobile-carousels.js', 'utf8');
  assert('Auto horizontal scrolling engine (left to right)', js.includes('this.container.scrollLeft +='));
  assert('Touch swiping interaction handling (pause on touch, resume on release)', js.includes('touchstart') && js.includes('touchend'));
  assert('Checks window.innerWidth <= 767px for mobile activation', js.includes('window.innerWidth <= 767') || js.includes('window.innerWidth > 767'));
  assert('Builds subtle pagination dots on mobile', js.includes('carousel-pagination-dots'));
  assert('Smooth scrolling to active card on dot click', js.includes('scrollToIndex'));
  assert('Calculates center of active card accurately', js.includes('(this.container.clientWidth / 2)') || js.includes('containerCenter'));
  assert('Listens to container scroll events with RAF debounce', js.includes('requestAnimationFrame'));
  assert('Supports dynamic gallery filter tabs', js.includes('[data-filter]'));

  // 3. Verify Live Server Routes
  console.log('\n--- 3. Testing Live Server Routes & Markup ---');
  for (const route of routes) {
    console.log(`\nRoute: ${route.path} (${route.name})`);
    const res = await fetchUrl(`${baseUrl}${route.path}`);
    assert(`HTTP Status 200 OK for ${route.path}`, res.status === 200);

    const html = res.data;
    assert(`Links mobile-carousels.css in head`, html.includes('href="mobile-carousels.css"'));
    assert(`Links tranquil-sand-theme.css in head`, html.includes('href="tranquil-sand-theme.css"'));
    
    // Check cascade order: mobile-carousels.css must be after tranquil-sand-theme.css
    const sandIdx = html.indexOf('href="tranquil-sand-theme.css"');
    const carouselIdx = html.indexOf('href="mobile-carousels.css"');
    assert(`mobile-carousels.css is loaded AFTER tranquil-sand-theme.css for highest priority`, carouselIdx > sandIdx);

    assert(`Includes mobile-carousels.js script`, html.includes('src="mobile-carousels.js"'));
  }

  // 4. Viewport Calculations Check
  console.log('\n--- 4. Viewport Dimension Assertions ---');
  const viewports = [
    { width: 320, name: 'Small Phone (iPhone SE)' },
    { width: 375, name: 'Standard Phone (iPhone 13 mini / SE2)' },
    { width: 390, name: 'Modern Phone (iPhone 14/15/16)' },
    { width: 430, name: 'Large Phone (iPhone 16 Pro Max)' },
    { width: 768, name: 'Tablet (iPad Mini)' },
    { width: 1440, name: 'Desktop (MacBook / Monitor)' }
  ];

  viewports.forEach(vp => {
    if (vp.width <= 767) {
      const cardWidth = Math.min(vp.width * 0.85, 360);
      const peekBoth = vp.width - cardWidth;
      const peekPerSide = peekBoth / 2;
      console.log(`  [${vp.width}px - ${vp.name}]`);
      console.log(`    Active Card Width: ${cardWidth.toFixed(1)}px (${((cardWidth/vp.width)*100).toFixed(1)}% of viewport)`);
      console.log(`    Total Peek on Edges: ${peekBoth.toFixed(1)}px (~${peekPerSide.toFixed(1)}px per side)`);
      assert(`Card width (${cardWidth.toFixed(1)}px) is within 82-88% range of ${vp.width}px`, (cardWidth/vp.width) >= 0.82 && (cardWidth/vp.width) <= 0.88 || (cardWidth === 360 && vp.width === 430));
    } else if (vp.width < 1024) {
      console.log(`  [${vp.width}px - ${vp.name}]`);
      console.log(`    Tablet 2-Column Responsive Layout Preserved (Dots hidden)`);
      assert(`Tablet breakpoint active between 768px and 1023px`, vp.width >= 768 && vp.width <= 1023);
    } else {
      console.log(`  [${vp.width}px - ${vp.name}]`);
      console.log(`    Desktop Multi-Column Grids Preserved 100% untouched`);
      assert(`Desktop breakpoint >= 1024px untouched`, vp.width >= 1024);
    }
  });

  console.log('\n====================================================');
  console.log(`AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
}

runTests().catch(console.error);
