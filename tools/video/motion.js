// Motion layer renderer: node motion.js <fontsDir> <spec.json> <outDir> <logo.png> <motion_lib.js>
// spec.json = { beats:[t of beat k], total: seconds, elements:[...] } -> outDir/00000.png ... (1080x1920, transparent, 30 fps)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [,, F, specPath, outDir, logoPath, libPath] = process.argv;
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
for (const e of spec.elements) if (e.src) {  // images are inlined as data URIs (cut-outs: PNG with alpha)
  const ext = e.src.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
  e.data = `data:image/${ext};base64,` + fs.readFileSync(e.src).toString('base64');
}
const FPS = 30;
const d = p => 'data:font/woff2;base64,' + fs.readFileSync(p).toString('base64');
const pkg = n => F + '/' + fs.readdirSync(F).filter(x => x.startsWith('fontsource-' + n) && !x.endsWith('.tgz')).sort().pop();
const BOD = `${pkg('bodoni-moda')}/files/bodoni-moda-latin`, JO = `${pkg('jost')}/files/jost-latin`;
let faces = '';
for (const w of [400, 500, 700, 900]) for (const s of ['normal', 'italic'])
  faces += `@font-face{font-family:Bodoni;font-weight:${w};font-style:${s};src:url(${d(`${BOD}-${w}-${s}.woff2`)}) format('woff2')}\n`;
for (const w of [300, 400, 500, 600, 700, 800, 900])
  faces += `@font-face{font-family:Jost;font-weight:${w};font-style:normal;src:url(${d(`${JO}-${w}-normal.woff2`)}) format('woff2')}\n`;
const LOGO = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
const css = `${faces}html,body{margin:0;background:transparent}#s{position:relative;width:1080px;height:1920px;overflow:hidden}`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div id="s"></div></body></html>`);
  const ok = await p.evaluate(async () => {
    const specs = ['400 40px Bodoni', 'italic 400 40px Bodoni', '400 40px Jost', '600 40px Jost', '700 40px Jost', '800 40px Jost', '900 40px Jost'];
    for (const s of specs) await document.fonts.load(s, 'Aàé');
    return specs.every(s => document.fonts.check(s, 'Aàé'));
  });
  if (!ok) { console.error('FONT LOAD FAILED'); process.exit(1); }
  await p.addScriptTag({ content: fs.readFileSync(libPath, 'utf8') });
  await p.evaluate(([s, logo]) => MOTION.init(s, logo), [spec, LOGO]);
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  const n = Math.ceil(spec.total * FPS) + 2;
  let blank = null;
  for (let i = 0; i < n; i++) {
    const vis = await p.evaluate(t => MOTION.render(t), i / FPS);
    const f = path.join(outDir, String(i).padStart(5, '0') + '.png');
    if (!vis && blank) { fs.copyFileSync(blank, f); continue; }
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
    fs.writeFileSync(f, Buffer.from(r.data, 'base64'));
    if (!vis && !blank) blank = f;
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
