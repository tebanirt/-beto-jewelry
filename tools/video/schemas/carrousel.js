// Instagram carousel from the schema bank: node carrousel.js <fontsDir> <spec.json> <outDir> <logo.png>
// spec = { slides: [ {kind:'cover'|'item'|'end', kicker, title, text, svg (path), small} ], w:1080, h:1350 }
// Brand: ink background, ivory lines, gold accents, Bodoni Moda italic titles, Jost text. JPEG, 1080 x 1350 (4:5).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [,, F, SPEC, OUT, LOGO] = process.argv;
const spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'));
const W = spec.w || 1080, H = spec.h || 1350;
const d = p => 'data:font/woff2;base64,' + fs.readFileSync(p).toString('base64');
const pkg = n => F + '/' + fs.readdirSync(F).filter(x => x.startsWith('fontsource-' + n) && !x.endsWith('.tgz')).sort().pop();
const BOD = `${pkg('bodoni-moda')}/files/bodoni-moda-latin`, JO = `${pkg('jost')}/files/jost-latin`;
const faces = `@font-face{font-family:Bodoni;font-style:italic;font-weight:400;src:url(${d(`${BOD}-400-italic.woff2`)})}
@font-face{font-family:Bodoni;font-style:normal;font-weight:400;src:url(${d(`${BOD}-400-normal.woff2`)})}
@font-face{font-family:Jost;font-weight:400;src:url(${d(`${JO}-400-normal.woff2`)})}
@font-face{font-family:Jost;font-weight:500;src:url(${d(`${JO}-500-normal.woff2`)})}`;
const logo = 'data:image/png;base64,' + fs.readFileSync(LOGO).toString('base64');
const css = `${faces}
html,body{margin:0;background:#0F0E0C}
.s{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:radial-gradient(120% 80% at 50% 38%,#1A1813 0%,#0F0E0C 62%);color:#F6F3EE;font-family:Jost}
.k{position:absolute;top:86px;left:0;right:0;text-align:center;font-weight:500;font-size:26px;letter-spacing:.32em;text-transform:uppercase;color:#C9A86A;padding-left:.32em}
.art{position:absolute;left:50%;transform:translateX(-50%)}
.art svg{display:block;width:100%;height:100%}
.t{position:absolute;left:80px;right:80px;text-align:center;font-family:Bodoni;font-style:italic;font-weight:400;color:#F6F3EE;line-height:1.04}
.x{position:absolute;left:110px;right:110px;text-align:center;font-size:33px;line-height:1.42;color:#D9D3C8}
.sm{position:absolute;left:110px;right:110px;text-align:center;font-size:22px;letter-spacing:.06em;color:#ABA59B}
.btn{position:absolute;left:50%;transform:translateX(-50%);border:1.5px solid #C9A86A;color:#F6F3EE;font-weight:500;font-size:26px;letter-spacing:.18em;text-transform:uppercase;padding:22px 40px;white-space:nowrap}
.logo{position:absolute;left:50%;transform:translateX(-50%);bottom:70px;background:#F6F3EE;padding:14px 26px;line-height:0}.logo img{width:120px}
.dots{position:absolute;bottom:44px;left:0;right:0;text-align:center;font-size:20px;letter-spacing:.4em;color:#8A847A}`;
const svgOf = (p, color) => {
  let s = fs.readFileSync(p, 'utf8').replace('width="1000" height="1000"', '');
  if (color) s = s.replace(/stroke="#[0-9A-Fa-f]{6}"/g, `stroke="${color}"`);
  return s;
};
function slide(sl, i, n) {
  const art = sl.svg ? svgOf(sl.svg, sl.color) : '';
  if (sl.kind === 'cover') return `<div class="s">
    <div class="k">${sl.kicker || ''}</div>
    <div class="art" style="top:200px;width:640px;height:640px">${art}</div>
    <div class="t" style="top:860px;font-size:104px">${sl.title}</div>
    <div class="x" style="top:1150px;color:#DABD86">${sl.text || ''}</div>
    <div class="dots">${sl.small || 'Glisse →'}</div></div>`;
  if (sl.kind === 'end') return `<div class="s">
    ${art ? `<div class="art" style="top:150px;width:520px;height:520px">${art}</div>` : ''}
    <div class="t" style="top:${art ? 700 : 420}px;font-size:84px">${sl.title}</div>
    <div class="x" style="top:${art ? 850 : 650}px">${sl.text || ''}</div>
    <div class="btn" style="top:${art ? 1000 : 820}px">${sl.cta || 'Consultation gratuite — lien en bio'}</div>
    <div class="logo"><img src="${logo}"></div></div>`;
  if (sl.kind === 'pair') {
    const col = (it, x) => `<div class="art" style="left:${x}px;transform:none;top:370px;width:400px;height:400px">${svgOf(it.svg, it.color)}</div>
      <div class="t" style="left:${x - 40}px;right:auto;width:480px;top:810px;font-size:84px">${it.title}</div>
      <div class="x" style="left:${x - 30}px;right:auto;width:460px;top:920px;font-size:29px">${it.text}</div>`;
    return `<div class="s"><div class="k">${sl.kicker}</div>${col(sl.items[0], 80)}${col(sl.items[1], 600)}
      <div style="position:absolute;left:540px;top:380px;width:1px;height:760px;background:#2A2620"></div></div>`;
  }
  return `<div class="s">
    <div class="k">${sl.kicker || `${String(i).padStart(2, '0')} / ${n}`}</div>
    <div class="art" style="top:150px;width:${sl.artw || 700}px;height:${sl.artw || 700}px">${art}</div>
    <div class="t" style="top:880px;font-size:112px">${sl.title}</div>
    <div class="x" style="top:1035px">${sl.text || ''}</div>
    ${sl.small ? `<div class="sm" style="top:1230px">${sl.small}</div>` : ''}</div>`;
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const items = spec.slides.filter(s => s.kind === 'item').length;
  let k = 0;
  for (let i = 0; i < spec.slides.length; i++) {
    const sl = spec.slides[i];
    if (sl.kind === 'item') k++;
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${slide(sl, k, items)}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    const f = path.join(OUT, `${String(i + 1).padStart(2, '0')}.jpg`);
    await p.screenshot({ path: f, type: 'jpeg', quality: 93, clip: { x: 0, y: 0, width: W, height: H } });
  }
  await b.close();
  console.log(`${spec.slides.length} slides -> ${OUT}`);
})();
