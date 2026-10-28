import http from "node:http";

const pages = [
  "",
  "villas",
  "experiences",
  "gallery",
  "explore-galle",
  "contact",
];

async function checkPage(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000/${path}`, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        resolve({ path, statusCode: res.statusCode, length: data.length });
      });
    }).on("error", err => {
      reject(err);
    });
  });
}

async function run() {
  console.log("Checking live server routes...");
  for (const p of pages) {
    try {
      const res = await checkPage(p);
      console.log(`Route /${p}: ${res.statusCode} OK (Length: ${res.length})`);
    } catch (e) {
      console.error(`Route /${p} ERROR:`, e.message);
    }
  }
}

run();
