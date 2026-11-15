// Generic text-layer renderer: node layers2.js <fontsDir> <spec.json> <outDir> <logo.png>
// spec.json = { layerId: "<inner html>" }  -> outDir/layerId.png (1080x1920, transparent)
const { chromium } = require('playwright');
const fs = require('fs');
const [,, F, specPath, outDir, logoPath] = process.argv;
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const d = p => 'data:font/woff2;base64,' + fs.readFileSync(p).toString('base64');
const pkg = n => F + '/' + fs.readdirSync(F).filter(x => x.startsWith('fontsource-' + n) && !x.endsWith('.tgz')).sort().pop();
const BOD = pkg('bodoni-moda'), JOS = pkg('jost');
const FB = d(`${BOD}/files/bodoni-moda-latin-400-normal.woff2`);
const FBI = d(`${BOD}/files/bodoni-moda-latin-400-italic.woff2`);
const FJ4 = d(`${JOS}/files/jost-latin-400-normal.woff2`);
const FJ5 = d(`${JOS}/files/jost-latin-500-normal.woff2`);
const LOGO = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
const css = `
@font-face{font-family:Bodoni;font-weight:400;font-style:normal;src:url(${FB}) format('woff2')}
@font-face{font-family:Bodoni;font-weight:400;font-style:italic;src:url(${FBI}) format('woff2')}
@font-face{font-family:Jost;font-weight:400;font-style:normal;src:url(${FJ4}) format('woff2')}
@font-face{font-family:Jost;font-weight:500;font-style:normal;src:url(${FJ5}) format('woff2')}
html,body{margin:0;background:transparent}
.stage{position:relative;width:1080px;height:1920px;overflow:hidden}
i{font-style:italic}
.card{position:absolute;left:50%;transform:translateX(-50%);background:rgba(246,243,238,.94);color:#1B1A17;text-align:center;white-space:nowrap;box-shadow:0 10px 40px rgba(15,14,12,.10)}
.dark{background:rgba(15,14,12,.86);color:#F6F3EE}
.dark .over{color:#DABD86}.dark .det{color:#ABA59B}
.serif{font-family:Bodoni;line-height:1.06}
.s120{font-size:120px}.s100{font-size:100px}.s86{font-size:86px}.s72{font-size:72px}.s62{font-size:62px}
.pad{padding:36px 60px 44px}.padS{padding:24px 48px 26px}
.over{display:block;font-family:Jost;font-weight:500;font-size:24px;letter-spacing:.42em;text-transform:uppercase;color:#7D5F2B;margin:0 0 20px .42em}
.det{display:block;font-family:Jost;font-weight:400;font-size:29px;line-height:1.55;letter-spacing:.06em;color:#5C574F;margin-top:20px;white-space:nowrap}
.src{display:block;font-family:Jost;font-weight:400;font-size:19px;letter-spacing:.18em;text-transform:uppercase;color:#706A62;margin-top:18px}
.label{padding:26px 52px 26px 60px;font-family:Jost;font-weight:500;font-size:42px;letter-spacing:.42em;text-transform:uppercase}
.label b{font-weight:500;color:#7D5F2B}
.label .rule{display:inline-block;width:46px;height:2px;background:#C9A86A;vertical-align:middle;margin:0 26px 6px 12px}
.num{position:absolute;width:92px;height:92px;border-radius:50%;background:rgba(246,243,238,.95);color:#1B1A17;font-family:Bodoni;font-size:58px;line-height:92px;text-align:center;box-shadow:0 6px 24px rgba(15,14,12,.18)}
.endbg{position:absolute;inset:0;background:#F6F3EE}
.logo{position:absolute;left:50%;width:360px;transform:translateX(-50%)}
.ctr{position:absolute;left:0;right:0;text-align:center}
.e1{font-family:Bodoni;font-size:92px;line-height:1.08;color:#1B1A17}
.e1s{font-family:Jost;font-weight:400;font-size:28px;line-height:1.7;letter-spacing:.16em;text-transform:uppercase;color:#5C574F}
.rule2{position:absolute;left:50%;width:72px;height:2px;margin-left:-36px;background:#C9A86A}
.e2{font-family:Jost;font-weight:500;font-size:28px;letter-spacing:.22em;text-transform:uppercase;color:#5C574F}
.btn{position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap;font-family:Jost;font-weight:500;font-size:34px;letter-spacing:.06em;color:#F6F3EE;background:#1B1A17;padding:24px 46px}
.e4{font-family:Jost;font-weight:500;font-size:22px;letter-spacing:.5em;text-transform:uppercase;color:#7D5F2B;padding-left:.5em}
.count{font-family:Bodoni;font-size:300px;color:#F6F3EE;text-shadow:0 8px 60px rgba(15,14,12,.55)}
`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="stage" id="s"></div></body></html>`);
  const ok = await p.evaluate(async () => {
    const specs = ['400 40px Bodoni', 'italic 400 40px Bodoni', '400 40px Jost', '500 40px Jost'];
    for (const s of specs) await document.fonts.load(s, 'Aàé');
    return specs.every(s => document.fonts.check(s, 'Aàé'));
  });
  if (!ok) { console.error('FONT LOAD FAILED'); process.exit(1); }
  for (const [k, html] of Object.entries(spec)) {
    await p.evaluate(([h, logo]) => { document.getElementById('s').innerHTML = h.replaceAll('%LOGO%', logo); }, [html, LOGO]);
    await p.waitForTimeout(40);
    await p.screenshot({ path: `${outDir}/${k}.png`, omitBackground: true });
  }
  await b.close();
})();
