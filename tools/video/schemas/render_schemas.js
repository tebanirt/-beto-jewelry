// Rasterise the diagram bank: node render_schemas.js <svgRootDir> <pngRootDir> [size=2160]
// Every SVG -> transparent PNG, size x size (2160 = full width of a vertical 4K frame).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [,, SRC, DST, SIZE = '2160'] = process.argv;
const size = parseInt(SIZE, 10);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  let n = 0;
  for (const cw of fs.readdirSync(SRC)) {
    const dir = path.join(SRC, cw);
    if (!fs.statSync(dir).isDirectory()) continue;
    fs.mkdirSync(path.join(DST, cw), { recursive: true });
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.svg')).sort()) {
      const svg = fs.readFileSync(path.join(dir, f), 'utf8').replace('width="1000" height="1000"', `width="${size}" height="${size}"`);
      await p.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${svg}</body></html>`);
      await p.screenshot({ path: path.join(DST, cw, f.replace('.svg', '.png')), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
      n++;
    }
  }
  await b.close();
  console.log(`${n} PNG ${size}x${size} -> ${DST}`);
})();
