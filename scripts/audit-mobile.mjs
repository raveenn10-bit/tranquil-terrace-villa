import { spawn } from "child_process";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const pages = ["index.html", "villas.html", "gallery.html", "experiences.html", "explore-galle.html", "contact.html"];
const widths = [320, 375, 390, 430, 768];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runAudit() {
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9223",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--window-size=1200,900"
  ]);

  await sleep(1500);

  try {
    const listRes = await fetch("http://127.0.0.1:9223/json/list");
    const targets = await listRes.json();
    let webSocketDebuggerUrl = targets[0]?.webSocketDebuggerUrl;

    if (!webSocketDebuggerUrl) {
      const newRes = await fetch("http://127.0.0.1:9223/json/new");
      const target = await newRes.json();
      webSocketDebuggerUrl = target.webSocketDebuggerUrl;
    }

    const ws = new WebSocket(webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data.result);
        callbacks.delete(data.id);
      }
    };

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    console.log("=== STARTING MOBILE RESPONSIVE AUDIT ===");

    for (const pageName of pages) {
      const pageUrl = `http://localhost:3000/${pageName === "index.html" ? "" : pageName.replace(".html", "")}`;
      console.log(`\nAuditing ${pageName} (${pageUrl}):`);

      for (const width of widths) {
        await send("Emulation.setDeviceMetricsOverride", {
          width: width,
          height: 800,
          deviceScaleFactor: 2,
          mobile: true
        });

        await send("Page.navigate", { url: pageUrl });
        await sleep(600);

        const evalRes = await send("Runtime.evaluate", {
          expression: `
            (() => {
              const docWidth = document.documentElement.clientWidth;
              const scrollW = document.documentElement.scrollWidth;
              const bodyScrollW = document.body ? document.body.scrollWidth : 0;
              const overflowingElements = [];

              const all = document.querySelectorAll('*');
              for (const el of all) {
                const rect = el.getBoundingClientRect();
                // Exclude elements inside carousel containers or transformed overlays
                if (el.closest('.meta-amenities-grid, .meta-packages-list, .meta-reviews-grid, .meta-villas-grid, .dual-villas, .carousel-track, .review-marquee-track')) {
                  continue;
                }
                if (rect.right > docWidth + 1.5 && rect.width > 0 && rect.height > 0) {
                  const style = window.getComputedStyle(el);
                  if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                    overflowingElements.push({
                      tag: el.tagName.toLowerCase(),
                      class: (el.className || '').toString().slice(0, 50),
                      id: el.id,
                      rectRight: Math.round(rect.right),
                      docWidth: docWidth,
                      diff: Math.round(rect.right - docWidth)
                    });
                  }
                }
              }

              // Check input font sizes
              const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map(input => {
                const fs = parseFloat(window.getComputedStyle(input).fontSize);
                return { tag: input.tagName.toLowerCase(), id: input.id, name: input.name, fontSize: fs };
              }).filter(i => i.fontSize < 16);

              return {
                docWidth,
                scrollW,
                bodyScrollW,
                hasOverflow: scrollW > docWidth || bodyScrollW > docWidth,
                overflowCount: overflowingElements.length,
                overflowingElements: overflowingElements.slice(0, 5),
                sub16Inputs: inputs.length,
                sub16InputSample: inputs.slice(0, 3)
              };
            })()
          `,
          returnByValue: true
        });

        const result = evalRes.result?.value;
        if (result) {
          const status = result.hasOverflow ? "FAIL" : "PASS";
          console.log(`  [${width}px] status: ${status} | scrollWidth: ${result.scrollW} / clientWidth: ${result.docWidth} | overflowItems: ${result.overflowCount} | sub16Inputs: ${result.sub16Inputs}`);
          if (result.overflowCount > 0) {
            console.log("    Overflowing items:", JSON.stringify(result.overflowingElements));
          }
          if (result.sub16Inputs > 0) {
            console.log("    Sub-16px inputs:", JSON.stringify(result.sub16InputSample));
          }
        }
      }
    }

    ws.close();
  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    proc.kill();
  }
}

runAudit();
