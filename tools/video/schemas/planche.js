// Contact sheet of the diagram bank: node planche.js <fontsDir> <svgDir> <out.png> [cols=5] [cell=420] [filter]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [,, F, DIR, OUT, COLS = '5', CELL = '420', FILTER = ''] = process.argv;
const d = p => 'data:font/woff2;base64,' + fs.readFileSync(p).toString('base64');
const pkg = n => F + '/' + fs.readdirSync(F).filter(x => x.startsWith('fontsource-' + n) && !x.endsWith('.tgz')).sort().pop();
const BOD = `${pkg('bodoni-moda')}/files/bodoni-moda-latin`, JO = `${pkg('jost')}/files/jost-latin`;
const faces = `@font-face{font-family:Bodoni;font-style:italic;font-weight:400;src:url(${d(`${BOD}-400-italic.woff2`)})}
@font-face{font-family:Jost;font-weight:400;src:url(${d(`${JO}-400-normal.woff2`)})}`;
const files = fs.readdirSync(DIR).filter(x => x.endsWith('.svg') && x.includes(FILTER)).sort();
const cols = +COLS, cell = +CELL;
const cells = files.map(f => `<figure><div class="art">${fs.readFileSync(path.join(DIR, f), 'utf8').replace('width="1000" height="1000"', `width="${cell}" height="${cell}"`)}</div><figcaption>${f.replace('.svg', '')}</figcaption></figure>`).join('');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${faces}
body{margin:0;background:#0F0E0C;color:#ABA59B;font-family:Jost;padding:48px}
h1{font-family:Bodoni;font-style:italic;font-weight:400;color:#F6F3EE;font-size:44px;margin:0 0 6px}
p{margin:0 0 32px;font-size:18px;letter-spacing:.04em}
.g{display:grid;grid-template-columns:repeat(${cols},${cell}px);gap:28px}
figure{margin:0}.art{background:#16140F;border:1px solid #2A2620}figcaption{font-size:15px;margin-top:8px;letter-spacing:.03em}
svg{display:block}</style></head><body><h1>Banque de schémas · Beto Jewelry</h1>
<p>Dessins vectoriels (SVG + PNG 2160 px, fond transparent, 3 couleurs : or, ivoire, encre). Illustrations, jamais présentées comme des photos de pièces.</p>
<div class="g">${cells}</div></body></html>`;
(async () => {
  const b = await chromium.launch();
  const w = 96 + cols * cell + (cols - 1) * 28;
  const p = await b.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: 1 });
  await p.setContent(html);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: OUT, fullPage: true });
  await b.close();
  console.log(OUT);
})();
