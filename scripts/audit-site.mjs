import http from 'http';

const baseUrl = 'http://localhost:3000';
const routes = ['/', '/villas', '/experiences', '/gallery', '/explore-galle', '/contact'];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function audit() {
  console.log('--- Starting Comprehensive Site Audit ---');
  let errorsFound = 0;
  const checkedAssets = new Set();

  for (const route of routes) {
    console.log(`\nAuditing route: ${route}`);
    const res = await fetchUrl(`${baseUrl}${route}`);
    if (res.status !== 200) {
      console.error(`[ERROR] Route ${route} returned status ${res.status}`);
      errorsFound++;
      continue;
    }
    const html = res.data;

    // Check footer presence
    if (!html.includes('class="tt-footer"')) {
      console.error(`[ERROR] Footer missing on ${route}`);
      errorsFound++;
    } else {
      console.log(`[PASS] Footer present on ${route}`);
    }

    // Check footer elements
    const requiredElements = [
      'id="villa"',
      'id="lighthouse"',
      '#6DD5C4', // Mint Lagoon pool
      '#FFD3B6', // Peach Champagne
      'tt-nav-grid-2col', // 2 col explore
      'tt-guest-details', // accordion
      'Crafted by',
      'Harsh Apex Digital Solutions',
      'hello@tranquilterracegalle.com',
      '+94 77 068 2366',
      '@tranquil_terrace_galle'
    ];

    for (const el of requiredElements) {
      if (!html.includes(el)) {
        console.error(`[ERROR] Missing required element '${el}' on ${route}`);
        errorsFound++;
      }
    }

    // Extract stylesheets, scripts, and images
    const linkMatches = [...html.matchAll(/<link[^>]+href=["']([^"']+)["']/g)].map(m => m[1]);
    const scriptMatches = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
    const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);

    const assets = [...linkMatches, ...scriptMatches, ...imgMatches];
    for (let asset of assets) {
      if (asset.startsWith('http://') || asset.startsWith('https://')) {
        continue; // external
      }
      if (asset.startsWith('//')) {
        continue;
      }
      // Normalize
      const fullUrl = asset.startsWith('/') ? `${baseUrl}${asset}` : `${baseUrl}/${asset}`;
      if (checkedAssets.has(fullUrl)) continue;
      checkedAssets.add(fullUrl);

      try {
        const assetRes = await fetchUrl(fullUrl);
        if (assetRes.status >= 400) {
          console.error(`[ERROR 404/BROKEN] Asset on ${route}: ${asset} -> Status ${assetRes.status}`);
          errorsFound++;
        }
      } catch (err) {
        console.error(`[ERROR FETCH] Asset ${asset}: ${err.message}`);
        errorsFound++;
      }
    }
  }

  console.log(`\nChecked ${checkedAssets.size} unique local assets across all routes.`);
  if (errorsFound === 0) {
    console.log('✅ AUDIT PASSED: ZERO errors found across all routes and assets!');
  } else {
    console.log(`❌ AUDIT COMPLETED with ${errorsFound} errors.`);
  }
}

audit().catch(console.error);
