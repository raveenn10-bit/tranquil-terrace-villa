import { spawn } from "child_process";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function probe() {
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9231",
    "--no-first-run",
    "--user-data-dir=C:\\Users\\chami\\AppData\\Local\\Temp\\chrome-overflow-probe"
  ]);

  await new Promise((r) => setTimeout(r, 1200));

  try {
    const listRes = await fetch("http://127.0.0.1:9231/json/list");
    const targets = await listRes.json();
    const pageTarget = targets.find((t) => t.type === "page");
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (msg) => {
          const d = JSON.parse(msg.data);
          if (d.id === id) {
            ws.removeEventListener("message", handler);
            resolve(d.result);
          }
        };
        ws.addEventListener("message", handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    const pages = ["", "villas", "gallery", "experiences", "explore-galle", "contact"];
    const testWidths = [320, 375, 390, 430];

    for (const p of pages) {
      console.log(`\n=================== Page: /${p} ===================`);
      for (const w of testWidths) {
        await send("Emulation.setDeviceMetricsOverride", {
          width: w,
          height: 700,
          deviceScaleFactor: 2,
          mobile: true,
          screenWidth: w,
          screenHeight: 700
        });

        await send("Page.navigate", { url: `http://localhost:3000/${p}` });
        await new Promise((r) => setTimeout(r, 1000));

        const res = await send("Runtime.evaluate", {
          expression: `
            (() => {
              const docW = document.documentElement.clientWidth;
              const scrollW = document.documentElement.scrollWidth;
              const bodyW = document.body ? document.body.scrollWidth : 0;
              const overflow = [];

              document.querySelectorAll('*').forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.right > docW + 1 && el.offsetWidth > 0) {
                  // Ignore hidden or zero opacity
                  const s = window.getComputedStyle(el);
                  if (s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0') {
                    overflow.push({
                      tag: el.tagName.toLowerCase(),
                      cls: (el.className || '').toString().slice(0, 60),
                      id: el.id || '',
                      right: Math.round(r.right),
                      width: Math.round(r.width),
                      overflowBy: Math.round(r.right - docW)
                    });
                  }
                }
              });

              return {
                docW,
                scrollW,
                bodyW,
                overflowCount: overflow.length,
                samples: overflow.slice(0, 10)
              };
            })()
          `,
          returnByValue: true
        });

        const val = res.result?.value;
        if (val) {
          const status = val.scrollW > val.docW || val.bodyW > val.docW ? "FAIL" : "PASS";
          console.log(`[${w}px] ${status} - docW: ${val.docW}, scrollW: ${val.scrollW}, bodyW: ${val.bodyW}`);
          if (val.samples && val.samples.length > 0) {
            console.log(`   Overflow samples:`, val.samples);
          }
        }
      }
    }

    ws.close();
  } catch (e) {
    console.error("Probe error:", e);
  } finally {
    proc.kill();
  }
}

probe();
