import { spawn } from "child_process";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const pages = ["", "villas", "gallery", "experiences", "explore-galle", "contact"];
const mobileWidths = [320, 375, 390, 430, 768];
const desktopWidths = [1024, 1280];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runComprehensiveVerification() {
  console.log("===================================================================");
  console.log("TRANQUIL TERRACE — COMPREHENSIVE RESPONSIVE & CAROUSEL VERIFICATION");
  console.log("===================================================================\n");

  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9245",
    "--no-first-run",
    "--user-data-dir=C:\\Users\\chami\\AppData\\Local\\Temp\\chrome-verify-comprehensive"
  ]);

  await sleep(1500);

  let ws;
  try {
    const listRes = await fetch("http://127.0.0.1:9245/json/list");
    const targets = await listRes.json();
    const pageTarget = targets.find((t) => t.type === "page");
    ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const timer = setTimeout(() => {
          reject(new Error(`Timeout waiting for CDP response: ${method}`));
        }, 12000);

        const handler = (msg) => {
          try {
            const d = JSON.parse(msg.data);
            if (d.id === id) {
              clearTimeout(timer);
              ws.removeEventListener("message", handler);
              if (d.error) {
                reject(new Error(d.error.message));
              } else {
                resolve(d.result);
              }
            }
          } catch (e) {
            // ignore parse errors for non-matching messages
          }
        };

        ws.addEventListener("message", handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send("Page.enable");

    let allTestsPassed = true;

    // TEST 1: Page-Level Horizontal Overflow & 16px Inputs across all 6 pages & all mobile widths
    console.log("TEST 1: Page-Level Overflow & Mobile Form Focus Zoom (320px - 768px)");
    for (const p of pages) {
      const pageName = p === "" ? "index.html" : `${p}.html`;
      console.log(`\n  --- Page: ${pageName} (/ ${p}) ---`);

      // Set initial mobile metrics before navigating
      await send("Emulation.setDeviceMetricsOverride", {
        width: 375,
        height: 750,
        deviceScaleFactor: 2,
        mobile: true,
        screenWidth: 375,
        screenHeight: 750
      });

      await send("Page.navigate", { url: `http://localhost:3000/${p}` });
      await sleep(1500); // Allow Next.js compile & DOM hydration

      for (const w of mobileWidths) {
        await send("Emulation.setDeviceMetricsOverride", {
          width: w,
          height: 750,
          deviceScaleFactor: 2,
          mobile: true,
          screenWidth: w,
          screenHeight: 750
        });
        await sleep(350); // allow layout reflow

        const evalRes = await send("Runtime.evaluate", {
          expression: `
            (() => {
              const docW = document.documentElement.clientWidth;
              const scrollW = document.documentElement.scrollWidth;
              const bodyW = document.body ? document.body.scrollWidth : 0;
              const pageOverflow = (scrollW > docW + 1) || (bodyW > docW + 1);

              // Check visible form inputs for sub-16px font-size
              const sub16Inputs = Array.from(document.querySelectorAll('input, select, textarea')).filter(el => {
                const fs = parseFloat(window.getComputedStyle(el).fontSize);
                const s = window.getComputedStyle(el);
                return fs < 15.5 && s.display !== 'none' && s.visibility !== 'hidden';
              }).map(el => ({ tag: el.tagName, name: el.name || el.id, fs: parseFloat(window.getComputedStyle(el).fontSize) }));

              // Check for non-carousel overflowing elements
              const overflowingElements = [];
              const all = document.querySelectorAll('*');
              for (const el of all) {
                if (el.closest('.meta-amenities-grid, .meta-packages-list, .meta-reviews-grid, .meta-villas-grid, .dual-villas, .dual-villas-carousel, .villa-gallery-track, .carousel-pagination-dots, .review-marquee-track')) {
                  continue;
                }
                const rect = el.getBoundingClientRect();
                if (rect.right > docW + 1.5 && rect.width > 0 && rect.height > 0) {
                  const s = window.getComputedStyle(el);
                  if (s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0') {
                    overflowingElements.push({
                      tag: el.tagName.toLowerCase(),
                      cls: (el.className || '').toString().slice(0, 40),
                      id: el.id,
                      diff: Math.round(rect.right - docW)
                    });
                  }
                }
              }

              return {
                docW,
                scrollW,
                bodyW,
                pageOverflow,
                overflowingCount: overflowingElements.length,
                overflowSample: overflowingElements.slice(0, 3),
                sub16Count: sub16Inputs.length,
                sub16Sample: sub16Inputs.slice(0, 3)
              };
            })()
          `,
          returnByValue: true
        });

        const val = evalRes.result?.value;
        if (val) {
          const pass = !val.pageOverflow && val.overflowingCount === 0 && val.sub16Count === 0;
          if (!pass) allTestsPassed = false;
          console.log(`    [${w}px] ${pass ? "✓ PASS" : "✗ FAIL"} | docW: ${val.docW}, scrollW: ${val.scrollW}, bodyW: ${val.bodyW} | sub-16px inputs: ${val.sub16Count} | overflowing items: ${val.overflowingCount}`);
          if (val.overflowingCount > 0) {
            console.log(`      Overflow sample:`, val.overflowSample);
          }
          if (val.sub16Count > 0) {
            console.log(`      Sub-16px input sample:`, val.sub16Sample);
          }
        }
      }
    }

    // TEST 2: Horizontal Scroll Carousels & Pagination Dots on mobile (375px)
    console.log("\nTEST 2: Horizontal Scroll Carousels & Pagination Dots (Mobile 375px)");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 750,
      deviceScaleFactor: 2,
      mobile: true,
      screenWidth: 375,
      screenHeight: 750
    });

    await send("Page.navigate", { url: "http://localhost:3000/" });
    await sleep(1500);

    const homeCarouselChecks = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const carousels = [
            { name: "Amenities", sel: ".meta-amenities-grid" },
            { name: "Packages", sel: ".meta-packages-list" },
            { name: "Reviews", sel: ".meta-reviews-grid" },
            { name: "Villas", sel: ".meta-villas-grid" }
          ];

          return carousels.map(c => {
            const el = document.querySelector(c.sel);
            if (!el) return { name: c.name, found: false };
            const style = window.getComputedStyle(el);
            const dots = el.nextElementSibling && el.nextElementSibling.classList.contains('carousel-pagination-dots');
            const dotCount = dots ? el.nextElementSibling.querySelectorAll('.carousel-dot').length : 0;
            const cardCount = el.children.length;
            const firstChild = el.children[0];
            const firstChildW = firstChild ? firstChild.getBoundingClientRect().width : 0;

            return {
              name: c.name,
              found: true,
              display: style.display,
              overflowX: style.overflowX,
              scrollSnapType: style.scrollSnapType,
              hasDots: dots,
              dotCount,
              cardCount,
              cardWidth: Math.round(firstChildW),
              approxCardsVisible: Number((375 / firstChildW).toFixed(2))
            };
          });
        })()
      `,
      returnByValue: true
    });

    console.log("  Homepage Carousels Status at 375px:");
    const cResults = homeCarouselChecks.result?.value || [];
    for (const r of cResults) {
      const pass = r.found && r.overflowX === "auto" && r.hasDots && r.dotCount === r.cardCount;
      if (!pass) allTestsPassed = false;
      console.log(`    ${r.name}: ${pass ? "✓ PASS" : "✗ FAIL"} | display: ${r.display}, overflowX: ${r.overflowX}, dots: ${r.dotCount}/${r.cardCount}, cardW: ${r.cardWidth}px (~${r.approxCardsVisible} visible)`);
    }

    // TEST 3: Villas.html Dual Villas Carousel and Multi-slide Photo Galleries
    console.log("\nTEST 3: Villas.html Dual Villas & Photo Gallery (Mobile 375px)");
    await send("Page.navigate", { url: "http://localhost:3000/villas" });
    await sleep(1500);

    const villasCheck = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const dualCarousel = document.querySelector('.dual-villas-carousel');
          const dualStyle = dualCarousel ? window.getComputedStyle(dualCarousel) : null;
          const photoTracks = document.querySelectorAll('.villa-gallery-track');
          const dualDots = dualCarousel && dualCarousel.nextElementSibling && dualCarousel.nextElementSibling.classList.contains('carousel-pagination-dots');
          const dualDotCount = dualDots ? dualCarousel.nextElementSibling.querySelectorAll('.carousel-dot').length : 0;

          return {
            dualFound: !!dualCarousel,
            dualDisplay: dualStyle ? dualStyle.display : null,
            dualOverflowX: dualStyle ? dualStyle.overflowX : null,
            dualDotCount,
            villaCount: dualCarousel ? dualCarousel.children.length : 0,
            photoTrackCount: photoTracks.length,
            photoTrackSlides: Array.from(photoTracks).map(t => t.querySelectorAll('.villa-gallery-slide').length)
          };
        })()
      `,
      returnByValue: true
    });

    const vResult = villasCheck.result?.value;
    const dualPass = vResult?.dualFound && vResult?.dualOverflowX === "auto" && vResult?.dualDotCount === vResult?.villaCount;
    const photoPass = vResult?.photoTrackCount >= 2 && vResult?.photoTrackSlides?.every(count => count >= 4);
    if (!dualPass || !photoPass) allTestsPassed = false;
    console.log(`    Dual Villas Carousel: ${dualPass ? "✓ PASS" : "✗ FAIL"} | display: ${vResult?.dualDisplay}, overflowX: ${vResult?.dualOverflowX}, dots: ${vResult?.dualDotCount}/${vResult?.villaCount}`);
    console.log(`    Photo Gallery Tracks: ${photoPass ? "✓ PASS" : "✗ FAIL"} | tracks: ${vResult?.photoTrackCount}, slides per track: ${vResult?.photoTrackSlides?.join(", ")}`);

    // TEST 4: Auto-Scroll Mechanics & 2.5s Pause / Resume Verification
    console.log("\nTEST 4: Auto-Scroll Animation & 2.5s Pause / Resume Verification");
    await send("Page.navigate", { url: "http://localhost:3000/" });
    await sleep(1500);

    const autoScrollTest = await send("Runtime.evaluate", {
      expression: `
        (async () => {
          const amenities = document.querySelector('.meta-amenities-grid');
          if (!amenities) return { error: 'No amenities grid' };

          const initialScroll = amenities.scrollLeft;
          await new Promise(r => setTimeout(r, 600));
          const scrolled1 = amenities.scrollLeft;

          // Dispatch touchstart to test immediate pause
          amenities.dispatchEvent(new Event('touchstart', { bubbles: true }));
          await new Promise(r => setTimeout(r, 400));
          const pausedScroll = amenities.scrollLeft;

          // Dispatch touchend to test 2.5s resume delay
          amenities.dispatchEvent(new Event('touchend', { bubbles: true }));
          await new Promise(r => setTimeout(r, 800)); // Within 2.5s delay -> should remain paused
          const duringDelayScroll = amenities.scrollLeft;

          // Wait another 2200ms (total 3000ms > 2500ms delay) -> should resume auto-scroll
          await new Promise(r => setTimeout(r, 2200));
          const resumedScroll = amenities.scrollLeft;

          return {
            initialScroll: Math.round(initialScroll),
            scrolled1: Math.round(scrolled1),
            hasAutoScrolled: scrolled1 > initialScroll,
            pausedScroll: Math.round(pausedScroll),
            duringDelayScroll: Math.round(duringDelayScroll),
            isPausedDuringDelay: Math.abs(duringDelayScroll - pausedScroll) <= 1,
            resumedScroll: Math.round(resumedScroll),
            hasResumedAfterDelay: resumedScroll > duringDelayScroll
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    const asResult = autoScrollTest.result?.value;
    const autoScrollPass = asResult?.hasAutoScrolled && asResult?.isPausedDuringDelay && asResult?.hasResumedAfterDelay;
    if (!autoScrollPass) allTestsPassed = false;
    console.log(`    Auto-Scroll Active: ${asResult?.hasAutoScrolled ? "✓ PASS" : "✗ FAIL"} (${asResult?.initialScroll}px -> ${asResult?.scrolled1}px)`);
    console.log(`    Pause on Touch: ${asResult?.isPausedDuringDelay ? "✓ PASS" : "✗ FAIL"} (during delay: ${asResult?.pausedScroll}px -> ${asResult?.duringDelayScroll}px)`);
    console.log(`    Resume After 2.5s: ${asResult?.hasResumedAfterDelay ? "✓ PASS" : "✗ FAIL"} (after delay: ${asResult?.duringDelayScroll}px -> ${asResult?.resumedScroll}px)`);

    // TEST 5: Desktop Multi-Column Grid Layout Preservation (> 768px)
    console.log("\nTEST 5: Desktop Multi-Column Grid Preservation at 1024px and 1280px");
    for (const deskW of desktopWidths) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: deskW,
        height: 800,
        deviceScaleFactor: 1,
        mobile: false,
        screenWidth: deskW,
        screenHeight: 800
      });

      await sleep(400);

      const deskCheck = await send("Runtime.evaluate", {
        expression: `
          (() => {
            const amenities = document.querySelector('.meta-amenities-grid');
            const packages = document.querySelector('.meta-packages-list');
            const reviews = document.querySelector('.meta-reviews-grid');
            const villas = document.querySelector('.meta-villas-grid');
            const dots = document.querySelectorAll('.carousel-pagination-dots');

            const dotsVisible = Array.from(dots).some(d => window.getComputedStyle(d).display !== 'none');

            return {
              amenitiesCols: window.getComputedStyle(amenities).gridTemplateColumns.split(' ').length,
              reviewsCols: window.getComputedStyle(reviews).gridTemplateColumns.split(' ').length,
              villasCols: window.getComputedStyle(villas).gridTemplateColumns.split(' ').length,
              packagesDisplay: window.getComputedStyle(packages).display,
              dotsHidden: !dotsVisible
            };
          })()
        `,
        returnByValue: true
      });

      const dVal = deskCheck.result?.value;
      const deskPass = dVal?.amenitiesCols === 4 && dVal?.reviewsCols === 3 && dVal?.villasCols === 2 && dVal?.dotsHidden;
      if (!deskPass) allTestsPassed = false;
      console.log(`    [${deskW}px] ${deskPass ? "✓ PASS" : "✗ FAIL"} | Amenities: ${dVal?.amenitiesCols} cols, Reviews: ${dVal?.reviewsCols} cols, Villas: ${dVal?.villasCols} cols, Dots hidden: ${dVal?.dotsHidden}`);
    }

    console.log("\n===================================================================");
    console.log(`FINAL VERIFICATION RESULT: ${allTestsPassed ? "ALL 5 TEST SUITES PASSED (100% SUCCESS)" : "SOME TESTS FAILED"}`);
    console.log("===================================================================\n");

    ws.close();
  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    proc.kill();
  }
}

runComprehensiveVerification();
