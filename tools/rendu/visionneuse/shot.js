// Capture de la visionneuse en local (CDN servi depuis node_modules)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const NM = path.join(__dirname, 'node_modules');
(async () => {
  const [,, query = '', out = 'shot.png', size = '700'] = process.argv;
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +size, height: +size } });
  const logs = []; p.on('console', (m) => logs.push(m.type() + ': ' + m.text())); p.on('pageerror', (e) => logs.push('ERR ' + e.message));
  await p.route('https://cdn.jsdelivr.net/npm/**', (route) => {
    const u = route.request().url();
    let f = null;
    let m = u.match(/three@0\.170\.0\/(.*)$/); if (m) f = path.join(NM, 'three', m[1]);
    m = u.match(/three-mesh-bvh@0\.8\.3\/(.*)$/); if (m) f = path.join(NM, 'three-mesh-bvh', m[1]);
    if (f && fs.existsSync(f)) route.fulfill({ body: fs.readFileSync(f), contentType: 'application/javascript' }); else route.abort();
  });
  await p.goto('http://127.0.0.1:8766/index.html?' + query, { waitUntil: 'domcontentloaded', timeout: 120000 });
  try { await p.waitForFunction(() => window.ready === true, null, { timeout: 120000 }); } catch (e) { logs.push('timeout ready'); }
  await p.waitForTimeout(1500);
  const solo = query.includes('solo=1');
  if (solo) await p.evaluate(() => { document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent'; });
  await p.screenshot({ path: out, omitBackground: solo });
  console.log(logs.filter((l) => !l.includes('GPU stall')).slice(0, 15).join('\n'));
  await b.close();
})();
