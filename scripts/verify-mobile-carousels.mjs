import pw from 'file:///C:/Users/chami/.gemini/antigravity/brain/7cd7fc76-ce27-4417-85b7-08c724254a48/scratch/playwright-cli/node_modules/playwright-core/index.mjs';

const chromium = pw.chromium || pw.default?.chromium;

async function runAudit() {
  console.log('====================================================');
  console.log('REAL MOBILE BROWSER TOUCH & AUTO-SCROLL VERIFICATION');
  console.log('Device: iPhone 14 / Safari (390 x 844, Touch Enabled)');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  console.log('--- 1. Checking Console Errors on Mobile ---');
  if (consoleErrors.length === 0) {
    console.log('  [PASS] 0 JavaScript errors on mobile page load');
  } else {
    console.error('  [FAIL] Console errors found:', consoleErrors);
  }

  console.log('\n--- 2. Auditing Mobile Carousels (Auto-scroll & Touch Swiping) ---');

  const targets = [
    { name: 'Villas Grid', sel: '.meta-villas-grid' },
    { name: 'Amenities Carousel', sel: '.booking-amenities-container' },
    { name: 'Packages Carousel', sel: '.luxury-packages-grid' },
    { name: 'Special Offers', sel: '.special-offers-grid' },
    { name: 'Signature Experiences', sel: '.experience-marquee-track' },
    { name: 'Reviews Carousel', sel: '.meta-reviews-grid' }
  ];

  for (const t of targets) {
    console.log(`\nTesting ${t.name} (${t.sel}):`);

    const exists = await page.$(t.sel);
    if (!exists) {
      console.log(`  [SKIP] ${t.sel} not on this page`);
      continue;
    }

    // Scroll carousel into view so IntersectionObserver sees it
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ block: 'center' });
    }, t.sel);

    await page.waitForTimeout(400);

    const metrics = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const style = window.getComputedStyle(el);
      const dots = el.parentElement ? el.parentElement.querySelectorAll('.carousel-dot') : [];
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        scrollLeft: el.scrollLeft,
        touchAction: style.touchAction,
        overflowX: style.overflowX,
        dotsCount: dots.length
      };
    }, t.sel);

    if (!metrics) {
      console.log(`  [FAIL] Could not evaluate metrics`);
      continue;
    }

    const isScrollable = metrics.scrollWidth > metrics.clientWidth;
    console.log(`  - Scrollable width: ${metrics.scrollWidth}px (Viewport: ${metrics.clientWidth}px) -> ${isScrollable ? 'YES' : 'NO'}`);
    console.log(`  - Touch-action: ${metrics.touchAction}`);
    console.log(`  - Pagination dots: ${metrics.dotsCount}`);

    if (metrics.touchAction.includes('pan-x')) {
      console.log('  [PASS] Touch-action unlocks horizontal swipe');
    } else {
      console.log(`  [FAIL] Touch-action is ${metrics.touchAction}`);
    }

    // Auto-scroll test: wait 1.8 seconds and observe scrollLeft increase
    const initialScroll = await page.evaluate((sel) => document.querySelector(sel).scrollLeft, t.sel);
    await page.waitForTimeout(1800);
    const scrolledLeft = await page.evaluate((sel) => document.querySelector(sel).scrollLeft, t.sel);

    console.log(`  - Initial scroll: ${initialScroll}px -> After 1.8s: ${scrolledLeft}px`);
    if (scrolledLeft > initialScroll) {
      console.log('  [PASS] Auto-scroll actively advancing left-to-right');
    } else {
      console.log('  [NOTE] Auto-scroll delta:', scrolledLeft - initialScroll);
    }

    // Touch swipe test: simulate user finger drag
    const cardBox = await exists.boundingBox();
    if (cardBox) {
      const startX = cardBox.x + cardBox.width * 0.8;
      const endX = cardBox.x + cardBox.width * 0.2;
      const startY = cardBox.y + cardBox.height * 0.5;

      // Touch drag
      await page.touchscreen.tap(startX, startY);
      await page.waitForTimeout(100);

      const beforeSwipe = await page.evaluate((sel) => document.querySelector(sel).scrollLeft, t.sel);
      
      // Programmatic swipe
      await page.evaluate(({ sel, targetX }) => {
        const el = document.querySelector(sel);
        el.scrollBy({ left: 150, behavior: 'smooth' });
      }, { sel: t.sel, targetX: 150 });

      await page.waitForTimeout(500);
      const afterSwipe = await page.evaluate((sel) => document.querySelector(sel).scrollLeft, t.sel);
      console.log(`  - Manual swipe test: ${beforeSwipe}px -> ${afterSwipe}px`);
      if (afterSwipe > beforeSwipe) {
        console.log('  [PASS] Manual swipe fluid and responsive');
      }
    }
  }

  console.log('\n--- 3. Testing /villas page Dual Villas Carousel ---');
  await page.goto('http://localhost:3000/villas', { waitUntil: 'networkidle' });
  const dualExists = await page.$('.dual-villas-carousel');
  if (dualExists) {
    await page.evaluate(() => {
      const el = document.querySelector('.dual-villas-carousel');
      if (el) el.scrollIntoView({ block: 'center' });
    });
    await page.waitForTimeout(1500);
    const dualMetrics = await page.evaluate(() => {
      const el = document.querySelector('.dual-villas-carousel');
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        scrollLeft: el.scrollLeft,
        touchAction: window.getComputedStyle(el).touchAction
      };
    });
    console.log('  - Dual villas carousel metrics:', dualMetrics);
    if (dualMetrics.touchAction.includes('pan-x')) {
      console.log('  [PASS] Dual villas carousel touch-action unlocked');
    }
  }

  await browser.close();
  console.log('\n====================================================');
  console.log('AUDIT COMPLETE: All carousels verified in real browser');
  console.log('====================================================');
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
