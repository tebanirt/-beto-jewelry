// motion_lib — Beto Jewelry motion design layer (kinetic type, counters, explainer graphics).
// Deterministic: MOTION.render(t) sets every element for time t (s), so frames can be captured one by one.
// Times are given in BEATS of the music (spec.beats[k] = time of beat k), so every move lands on the beat.
// Brand: Bodoni Moda + Jost, ivory #F6F3EE, ink #0F0E0C, gold #C9A86A / #DABD86. No emoji, no fake UI.
(function () {
  const W = 1080, H = 1920;
  const IVORY = '#F6F3EE', INK = '#0F0E0C', GOLD = '#C9A86A', GOLD_L = '#DABD86';
  const EZ = {
    outExpo: x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    out3: x => 1 - Math.pow(1 - x, 3),
    inOut: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    outBack: x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  let BT = [0, 0.5], STAGE = null, ELS = [], LOGO = '';

  function B(k) {  // time (s) of beat k: fractional, extrapolated outside the grid
    const n = BT.length, per = (BT[n - 1] - BT[0]) / (n - 1);
    if (k <= 0) return BT[0] + k * per;
    if (k >= n - 1) return BT[n - 1] + (k - (n - 1)) * per;
    const i = Math.floor(k), f = k - i;
    return BT[i] + (BT[i + 1] - BT[i]) * f;
  }
  function mk(tag, css, parent, html) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (html != null) e.innerHTML = html;
    (parent || STAGE).appendChild(e);
    return e;
  }
  const SVGNS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  }
  // text styles: font family/weight + fill or outline
  function font(o) {
    const f = o.f || 'jost';
    const fam = f.startsWith('bod') ? 'Bodoni' : 'Jost';
    const ital = f === 'bodI' || f === 'jostI' ? 'italic' : 'normal';
    const w = o.w || (fam === 'Jost' ? 800 : 400);
    const col = o.color || IVORY;
    let s = `font-family:${fam};font-style:${ital};font-weight:${w};font-size:${o.size || 120}px;line-height:${o.lh || 0.98};` +
            `letter-spacing:${o.ls != null ? o.ls : (fam === 'Jost' ? '-0.01em' : '0')};white-space:nowrap;`;
    if (o.upper !== false && fam === 'Jost') s += 'text-transform:uppercase;';
    // outline = filled text minus its eroded copy (SVG filter): clean contour, no overlapping-glyph artefacts
    if (o.style === 'outline') s += `color:${col};filter:${olf(o)};`;
    else s += `color:${col};`;
    if (o.shadow !== false && o.style !== 'outline') s += 'text-shadow:0 6px 40px rgba(15,14,12,.45);';
    return s;
  }
  function olf(o) { return o.style === 'outline' ? `url(#ol${Math.max(2, Math.min(6, Math.round(o.stroke || 3)))}) drop-shadow(0 4px 24px rgba(15,14,12,.5))` : ''; }
  // common window: visible in [t0, t1); exit animation over the last `dx` seconds
  function win(e, t) {
    const t0 = B(e.at), t1 = e.until != null ? B(e.until) : 1e9;
    if (t < t0 - 1e-4 || t >= t1) return null;
    const dx = e.out === 'cut' ? 0 : (e.outDur || 0.16);
    const xo = dx ? cl((t1 - t) / dx) : 1;
    return { t0, t1, lt: t - t0, xo };
  }
  function exitStyle(e, xo) {
    if (xo >= 1) return '';
    if (e.out === 'up') return `translateY(${-80 * (1 - EZ.inOut(xo))}px)`;
    if (e.out === 'zoom') return `scale(${1 + 0.25 * (1 - xo)})`;
    return '';
  }

  const T = {};

  // ---- giant stacked lines, one per `every` beats (slam / rise / track / pop)
  T.stack = {
    init(e) {
      e.root = mk('div', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;`);
      let y = e.y || 300;
      e.lines = e.lines.map((l, i) => {
        const size = l.size || 130;
        const h = l.h || Math.round(size * (l.lh || 0.98)) + (l.gap != null ? l.gap : (e.gap || 6));
        const x = l.x != null ? l.x : (e.x != null ? e.x : null);
        const align = l.align || e.align || 'center';
        const pos = align === 'center' ? `left:0;width:${W}px;text-align:center;` :
          align === 'left' ? `left:${x != null ? x : 80}px;text-align:left;` : `right:${x != null ? x : 80}px;text-align:right;`;
        const box = mk('div', `position:absolute;top:${l.y != null ? l.y : y}px;${pos}overflow:${(l.anim || e.anim) === 'rise' ? 'hidden' : 'visible'};padding:0 4px;`, e.root);
        const span = mk('div', `display:inline-block;${font(l)}transform-origin:50% 60%;will-change:transform,opacity,filter;`, box, l.t);
        if (l.y == null) y += h;
        return { box, span, base: olf(l), at: l.at != null ? l.at : e.at + i * (e.every != null ? e.every : 1), anim: l.anim || e.anim || 'slam' };
      });
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      e.root.style.opacity = w.xo;
      e.root.style.transform = exitStyle(e, w.xo);
      for (const L of e.lines) {
        const p = cl((t - B(L.at)) / (L.anim === 'track' ? 0.5 : 0.24));
        if (t < B(L.at) - 1e-4) { L.span.style.opacity = 0; continue; }
        const q = EZ.outExpo(p);
        if (L.anim === 'slam') {
          L.span.style.opacity = cl(p * 5);
          L.span.style.transform = `scale(${1.55 - 0.55 * q})`;
          L.span.style.filter = (L.base + (p < 1 ? ` blur(${(1 - q) * 16}px)` : '')) || 'none';
        } else if (L.anim === 'rise') {
          L.span.style.opacity = 1;
          L.span.style.transform = `translateY(${(1 - q) * 105}%)`;
        } else if (L.anim === 'track') {
          L.span.style.opacity = cl(p * 3);
          L.span.style.letterSpacing = `${0.5 * (1 - q)}em`;
          L.span.style.filter = (L.base + (p < 1 ? ` blur(${(1 - q) * 8}px)` : '')) || 'none';
        } else if (L.anim === 'pop') {
          L.span.style.opacity = cl(p * 4);
          L.span.style.transform = `scale(${0.6 + 0.4 * EZ.outBack(cl((t - B(L.at)) / 0.36))})`;
        } else {
          L.span.style.opacity = q;
        }
      }
      return 1;
    },
  };

  // ---- endless band of repeated words (outline), scrolling sideways
  T.marquee = {
    init(e) {
      e.root = mk('div', `position:absolute;left:0;top:${e.y}px;width:${W}px;overflow:hidden;white-space:nowrap;`);
      const unit = (e.t + (e.sep != null ? e.sep : ' · '));
      e.row = mk('div', `display:inline-block;${font(Object.assign({ style: 'outline' }, e))}`, e.root, unit.repeat(14));
      const probe = mk('span', `${font(Object.assign({ style: 'outline' }, e))}position:absolute;visibility:hidden;`, STAGE, unit);
      e.period = probe.getBoundingClientRect().width || 600;
      probe.remove();
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      const dir = e.dir || 1, sp = e.speed || 260;
      const off = ((w.lt * sp) % e.period + e.period) % e.period;
      e.row.style.transform = `translateX(${dir > 0 ? -off : off - e.period}px)`;
      e.root.style.opacity = Math.min(cl(w.lt / 0.2), w.xo) * (e.alpha != null ? e.alpha : 1);
      return 1;
    },
  };

  // ---- number that counts up, then pulses (48 h, 2 semaines, 500+)
  T.counter = {
    init(e) {
      e.root = mk('div', `position:absolute;top:${e.y}px;left:0;width:${W}px;text-align:center;`);
      e.num = mk('div', `display:inline-block;${font(Object.assign({ f: 'bod', w: 400, size: 360, color: GOLD_L }, e))}transform-origin:50% 70%;`, e.root);
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      const dur = B(e.at + (e.count || 2)) - w.t0;
      const p = cl(w.lt / dur), v = Math.round((e.from || 0) + ((e.to) - (e.from || 0)) * EZ.out3(p));
      e.num.innerHTML = (e.prefix || '') + v + (e.suffix || '');
      const pulse = p >= 1 ? 1 + 0.07 * Math.exp(-(w.lt - dur) * 9) * (w.lt - dur < 0.6 ? 1 : 0) : 1;
      const ent = EZ.outExpo(cl(w.lt / 0.25));
      e.num.style.transform = `scale(${(1.3 - 0.3 * ent) * pulse})`;
      e.num.style.opacity = cl(w.lt / 0.08) * w.xo;
      e.root.style.transform = exitStyle(e, w.xo);
      return 1;
    },
  };

  // ---- viewfinder corners around a framed shot (gold arms drawn in) + optional caption
  T.brackets = {
    init(e) {
      e.root = mk('div', `position:absolute;left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${e.h}px;`);
      const c = e.color || GOLD, th = e.th || 4;
      e.arms = [];
      for (const [cx, cy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const hz = mk('div', `position:absolute;height:${th}px;background:${c};${cx ? 'right' : 'left'}:-${th * 3}px;${cy ? 'bottom' : 'top'}:-${th * 3}px;`, e.root);
        const vt = mk('div', `position:absolute;width:${th}px;background:${c};${cx ? 'right' : 'left'}:-${th * 3}px;${cy ? 'bottom' : 'top'}:-${th * 3}px;`, e.root);
        e.arms.push([hz, vt]);
      }
      if (e.label) e.lab = mk('div', `position:absolute;left:0;top:${-th * 3 - 56}px;${font({ f: 'jost', w: 600, size: 24, ls: '.42em', color: e.color || GOLD_L, shadow: true })}`, e.root, e.label);
      if (e.label2) e.lab2 = mk('div', `position:absolute;right:0;bottom:${-th * 3 - 52}px;${font({ f: 'jost', w: 600, size: 24, ls: '.42em', color: e.color || GOLD_L, shadow: true })}`, e.root, e.label2);
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      const p = EZ.outExpo(cl(w.lt / 0.4)), len = (e.len || 70) * p;
      for (const [hz, vt] of e.arms) { hz.style.width = len + 'px'; vt.style.height = len + 'px'; }
      const lp = cl((w.lt - 0.15) / 0.35);
      if (e.lab) { e.lab.style.opacity = lp; e.lab.style.clipPath = `inset(0 ${100 - lp * 100}% 0 0)`; }
      if (e.lab2) { e.lab2.style.opacity = lp; e.lab2.style.clipPath = `inset(0 0 0 ${100 - lp * 100}%)`; }
      e.root.style.opacity = w.xo;
      return 1;
    },
  };

  // ---- small tracked label with a gold rule that draws in
  T.kicker = {
    init(e) {
      const al = e.align || 'center';
      e.root = mk('div', `position:absolute;top:${e.y}px;${al === 'center' ? `left:0;width:${W}px;text-align:center;` : al === 'left' ? `left:${e.x || 80}px;` : `right:${e.x || 80}px;text-align:right;`}`);
      const ls = e.ls || '.42em';
      e.inner = mk('div', `display:inline-block;${font({ f: 'jost', w: e.w || 600, size: e.size || 26, ls, color: e.color || GOLD_L, shadow: e.shadow })}padding-left:${ls};`, e.root, e.t);
      e.rule = mk('div', `height:2px;background:${GOLD};margin:${e.size ? e.size * 0.6 : 16}px auto 0;width:0;${al === 'left' ? 'margin-left:0;' : ''}`, e.root);
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      const p = EZ.out3(cl(w.lt / 0.45));
      e.inner.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
      e.rule.style.width = (e.rule_w != null ? e.rule_w : 72) * EZ.outExpo(cl((w.lt - 0.1) / 0.4)) + 'px';
      e.root.style.opacity = w.xo;
      e.root.style.transform = exitStyle(e, w.xo);
      return 1;
    },
  };

  // ---- free text block (Bodoni italic sentence etc.), words appear one per `every` beats when anim = 'words'
  T.text = {
    init(e) {
      const al = e.align || 'center';
      e.root = mk('div', `position:absolute;top:${e.y}px;${al === 'center' ? `left:${(W - (e.wbox || 900)) / 2}px;width:${e.wbox || 900}px;text-align:center;` : `left:${e.x || 80}px;width:${e.wbox || 900}px;text-align:${al};`}${font(Object.assign({ f: 'bodI', size: 72, lh: 1.12 }, e))}white-space:normal;`);
      if (e.anim === 'words') {
        e.words = e.t.split(' ').map(wd => mk('span', 'display:inline-block;opacity:0;margin-right:.25em;', e.root, wd));
      } else e.root.innerHTML = e.t;
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      if (e.words) {
        e.words.forEach((s, i) => {
          const p = cl((t - B(e.at + i * (e.every || 0.5))) / 0.22);
          s.style.opacity = p; s.style.transform = `translateY(${(1 - EZ.outExpo(p)) * 30}px)`;
          s.style.filter = p < 1 ? `blur(${(1 - p) * 8}px)` : 'none';
        });
        e.root.style.opacity = w.xo;
      } else {
        const p = EZ.outExpo(cl(w.lt / 0.4));
        e.root.style.opacity = p * w.xo;
        e.root.style.transform = `translateY(${(1 - p) * 30}px) ${exitStyle(e, w.xo)}`;
      }
      return 1;
    },
  };

  // ---- vertical process timeline (explainer): active step lit in gold, progress line grows
  T.steps = {
    init(e) {
      const x = e.x || 80, y = e.y || 1080, gap = e.gap || 118;
      e.root = mk('div', `position:absolute;left:${x - 40}px;top:${y - 40}px;width:${e.w || 920}px;height:${gap * e.items.length + 30}px;` +
                         `background:rgba(15,14,12,${e.panel != null ? e.panel : 0.82});border:1px solid rgba(201,168,106,.35);`);
      const lx = 46 + 6;
      e.track = mk('div', `position:absolute;left:${lx + 32}px;top:${40 + 34}px;width:2px;height:${gap * (e.items.length - 1)}px;background:rgba(246,243,238,.18);`, e.root);
      e.fill = mk('div', `position:absolute;left:${lx + 32}px;top:${40 + 34}px;width:2px;height:0;background:${GOLD};`, e.root);
      e.rows = e.items.map((it, i) => {
        const row = mk('div', `position:absolute;left:${lx}px;top:${40 + i * gap}px;width:${(e.w || 920) - 80}px;height:${gap}px;`, e.root);
        const dot = mk('div', `position:absolute;left:0;top:0;width:66px;height:66px;border-radius:50%;border:2px solid ${GOLD};box-sizing:border-box;` +
                             `font-family:Bodoni;font-size:40px;line-height:62px;text-align:center;color:${IVORY};background:${INK};`, row, String(it.n || i + 1));
        const tt = mk('div', `position:absolute;left:100px;top:-4px;${font({ f: 'jost', w: 700, size: e.tsize || 44, ls: '.04em', shadow: false })}`, row, it.title);
        const sb = mk('div', `position:absolute;left:100px;top:${(e.tsize || 44) + 6}px;${font({ f: 'jost', w: 400, size: e.ssize || 29, ls: '.04em', upper: false, color: '#ABA59B', shadow: false })}`, row, it.sub || '');
        return { row, dot, tt, sb, at: it.at };
      });
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      const ent = EZ.outExpo(cl(w.lt / 0.45));
      e.root.style.opacity = Math.min(ent, w.xo);
      e.root.style.transform = `translateY(${(1 - ent) * 60}px)`;
      let act = -1;
      e.rows.forEach((r, i) => { if (t >= B(r.at) - 1e-4) act = i; });
      e.rows.forEach((r, i) => {
        const st = cl((w.lt - 0.08 * i) / 0.35);
        const on = i === act, done = i < act;
        const lit = on ? EZ.out3(cl((t - B(r.at)) / 0.25)) : 0;
        r.row.style.opacity = (0.32 + 0.68 * (on ? 1 : done ? 0.55 : 0)) * st;
        r.row.style.transform = `translateX(${(1 - EZ.outExpo(st)) * -40}px)`;
        r.dot.style.background = on || done ? GOLD : INK;
        r.dot.style.color = on || done ? INK : IVORY;
        r.dot.style.transform = `scale(${1 + 0.18 * lit * Math.exp(-Math.max(0, t - B(r.at)) * 5)})`;
        r.tt.style.color = on ? GOLD_L : IVORY;
      });
      const gap = e.gap || 118;
      if (act >= 0) {
        const pa = EZ.inOut(cl((t - B(e.rows[act].at)) / 0.4));
        e.fill.style.height = Math.max(0, (act - 1 + pa)) * gap + 'px';
      } else e.fill.style.height = '0px';
      return 1;
    },
  };

  // ---- comparison table (natural vs lab), checks drawn row by row
  T.compare = {
    init(e) {
      const x = e.x || 70, y = e.y || 900, w = e.w || 940, rh = e.rh || 112;
      e.root = mk('div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;background:rgba(15,14,12,.86);border:1px solid rgba(201,168,106,.35);padding:34px 0 26px;`);
      const c1 = w * 0.58, c2 = w * 0.84;
      const hd = mk('div', `position:relative;height:60px;`, e.root);
      e.cols = e.cols || ['Naturel', 'Laboratoire'];
      [c1, c2].forEach((cx, i) => mk('div', `position:absolute;left:${cx - 120}px;width:240px;text-align:center;top:0;${font({ f: 'jost', w: 600, size: 24, ls: '.3em', color: GOLD_L, shadow: false })}`, hd, e.cols[i]));
      e.rows = e.rows.map((r) => {
        const row = mk('div', `position:relative;height:${rh}px;border-top:1px solid rgba(246,243,238,.12);`, e.root);
        mk('div', `position:absolute;left:44px;top:${rh / 2 - 26}px;${font({ f: 'jost', w: 600, size: e.lsize || 40, ls: '.02em', upper: false, shadow: false })}`, row, r.label);
        const checks = [c1, c2].map(cx => {
          const s = document.createElementNS(SVGNS, 'svg');
          s.setAttribute('width', 60); s.setAttribute('height', 60); s.setAttribute('viewBox', '0 0 60 60');
          s.style.cssText = `position:absolute;left:${cx - 30}px;top:${rh / 2 - 30}px;overflow:visible;`;
          row.appendChild(s);
          svg('circle', { cx: 30, cy: 30, r: 27, fill: 'none', stroke: 'rgba(201,168,106,.45)', 'stroke-width': 2 }, s);
          const p = svg('path', { d: 'M17 31 L26 40 L44 21', fill: 'none', stroke: GOLD_L, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s);
          const L = 46; p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
          return { p, L };
        });
        return { row, checks, at: r.at };
      });
      if (e.foot) e.footEl = mk('div', `position:relative;margin-top:22px;text-align:center;${font({ f: 'bodI', size: e.fsize || 60, lh: 1.1, shadow: false, color: IVORY })}`, e.root, e.foot.t);
      if (e.src) e.srcEl = mk('div', `position:relative;margin-top:16px;text-align:center;${font({ f: 'jost', w: 500, size: 19, ls: '.22em', color: '#8A847A', shadow: false })}`, e.root, e.src);
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      const ent = EZ.outExpo(cl(w.lt / 0.45));
      e.root.style.opacity = Math.min(ent, w.xo);
      e.root.style.transform = `translateY(${(1 - ent) * 50}px)`;
      e.rows.forEach(r => {
        const p = cl((t - B(r.at)) / 0.3);
        r.row.style.opacity = t < B(r.at) ? 0.25 : 0.25 + 0.75 * EZ.out3(cl(p * 2));
        r.checks.forEach((c, j) => { const pj = EZ.out3(cl(p * 1.6 - j * 0.35)); c.p.style.strokeDashoffset = c.L * (1 - pj); });
      });
      if (e.footEl) { const p = EZ.outExpo(cl((t - B(e.foot.at)) / 0.4)); e.footEl.style.opacity = p; e.footEl.style.transform = `translateY(${(1 - p) * 20}px)`; }
      if (e.srcEl) e.srcEl.style.opacity = cl((t - B(e.foot ? e.foot.at : e.at)) / 0.4);
      return 1;
    },
  };

  // ---- rotating diamond-cubic crystal (carbon atoms + bonds) drawn bond by bond
  T.lattice = {
    init(e) {
      const n = e.cells || 2, pts = [], key = p => p.map(v => Math.round(v * 4)).join(',');
      const seen = new Set();
      const add = p => { if (p.some(v => v < -1e-6 || v > n + 1e-6)) return; const k = key(p); if (!seen.has(k)) { seen.add(k); pts.push(p); } };
      const fcc = [[0, 0, 0], [.5, .5, 0], [.5, 0, .5], [0, .5, .5]];
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) for (let k = 0; k <= n; k++)
        for (const f of fcc) for (const sh of [[0, 0, 0], [.25, .25, .25]]) add([i + f[0] + sh[0], j + f[1] + sh[1], k + f[2] + sh[2]]);
      const bonds = [];
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]);
        if (Math.abs(d - Math.sqrt(3) / 4) < 1e-3) bonds.push([i, j]);
      }
      // keep atoms that hold at least 2 bonds (no lonely corners), then order bonds from the centre outwards
      const deg = pts.map(() => 0); bonds.forEach(([i, j]) => { deg[i]++; deg[j]++; });
      const keep = pts.map((_, i) => deg[i] >= 2);
      const c0 = n / 2, dist = p => Math.hypot(p[0] - c0, p[1] - c0, p[2] - c0);
      e.bonds = bonds.filter(([i, j]) => keep[i] && keep[j]).sort((a, b) => (dist(pts[a[0]]) + dist(pts[a[1]])) - (dist(pts[b[0]]) + dist(pts[b[1]])));
      e.pts = pts.map(p => p.map(v => (v - c0) / n)); e.keep = keep;
      const s = document.createElementNS(SVGNS, 'svg');
      s.setAttribute('width', W); s.setAttribute('height', H);
      s.style.cssText = 'position:absolute;left:0;top:0;';
      STAGE.appendChild(s);
      e.root = s;
      e.bondEls = e.bonds.map(() => svg('line', { stroke: GOLD_L, 'stroke-width': 4, 'stroke-linecap': 'round' }, s));
      e.atomEls = e.pts.map(() => svg('circle', { fill: IVORY }, s));
      e.first = e.pts.map((_, i) => e.bonds.findIndex(([a, b]) => a === i || b === i));
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      const S = e.size || 520, cx = e.cx || 540, cy = e.cy || 900;
      const a = 0.62 + w.lt * (e.spin || 0.5), b = 0.42;
      const P = e.pts.map(([x, y, z]) => {
        const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
        const y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b);
        const k = 1 / (1 + z2 * 0.45);
        return [cx + x1 * S * k, cy + y1 * S * k, z2, k];
      });
      const drawDur = B(e.at + (e.draw || 4)) - w.t0;
      const prog = EZ.inOut(cl(w.lt / drawDur)) * e.bonds.length;
      e.bonds.forEach(([i, j], n) => {
        const f = cl((prog - n) / 3), l = e.bondEls[n];
        l.setAttribute('x1', P[i][0]); l.setAttribute('y1', P[i][1]);
        l.setAttribute('x2', P[i][0] + (P[j][0] - P[i][0]) * f); l.setAttribute('y2', P[i][1] + (P[j][1] - P[i][1]) * f);
        const depth = cl(0.5 - (P[i][2] + P[j][2]) / 2.2);
        l.style.opacity = f > 0 ? 0.25 + 0.75 * depth : 0;
        l.setAttribute('stroke-width', 2 + 3.5 * depth);
      });
      e.pts.forEach((_, n) => {
        const c = e.atomEls[n];
        if (!e.keep[n] || e.first[n] < 0) { c.setAttribute('r', 0); return; }
        const ap = EZ.outBack(cl((prog - e.first[n]) / 4));
        c.setAttribute('cx', P[n][0]); c.setAttribute('cy', P[n][1]);
        c.setAttribute('r', Math.max(0, 9.5 * P[n][3] * ap));
        c.style.opacity = 0.35 + 0.65 * cl(0.5 - P[n][2] / 1.1);
      });
      e.root.style.opacity = w.xo;
      return 1;
    },
  };

  // ---- gentle snowfall (deterministic particles), for winter / Christmas edits
  T.snow = {
    init(e) {
      let seed = e.seed || 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      e.root = mk('div', `position:absolute;inset:0;`);
      e.flakes = Array.from({ length: e.n || 70 }, () => {
        const r = 2 + rnd() * (e.rmax || 7);
        const d = mk('div', `position:absolute;left:0;top:0;width:${2 * r}px;height:${2 * r}px;border-radius:50%;background:rgba(246,243,238,${0.35 + rnd() * 0.5});filter:blur(${r > 6 ? 1.5 : 0.4}px);`, e.root);
        return { d, x: rnd() * W, y: rnd() * H, v: 60 + r * 22, sw: 10 + rnd() * 30, ph: rnd() * 6.28 };
      });
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      for (const f of e.flakes) {
        const y = ((f.y + f.v * t) % (H + 40)) - 20, x = f.x + f.sw * Math.sin(t * 1.3 + f.ph);
        f.d.style.transform = `translate(${x}px,${y}px)`;
      }
      e.root.style.opacity = Math.min(cl(w.lt / 0.4), w.xo) * (e.alpha != null ? e.alpha : 1);
      return 1;
    },
  };

  // ---- round seal with rotating text ring (certificate)
  T.stamp = {
    init(e) {
      const r = e.r || 170;
      const s = document.createElementNS(SVGNS, 'svg');
      s.setAttribute('width', 2 * r + 40); s.setAttribute('height', 2 * r + 40);
      s.style.cssText = `position:absolute;left:${(e.cx || 540) - r - 20}px;top:${(e.cy || 900) - r - 20}px;overflow:visible;`;
      STAGE.appendChild(s);
      e.root = s;
      const c = r + 20;
      svg('circle', { cx: c, cy: c, r: r, fill: 'rgba(15,14,12,.88)', stroke: GOLD, 'stroke-width': 3 }, s);
      svg('circle', { cx: c, cy: c, r: r - 62, fill: 'none', stroke: 'rgba(201,168,106,.55)', 'stroke-width': 1.5 }, s);
      const defs = svg('defs', {}, s);
      svg('path', { id: 'ring', d: `M ${c - (r - 32)} ${c} a ${r - 32} ${r - 32} 0 1 1 ${2 * (r - 32)} 0 a ${r - 32} ${r - 32} 0 1 1 ${-2 * (r - 32)} 0` }, defs);
      e.rot = svg('g', {}, s);
      const tx = svg('text', { fill: GOLD_L, 'font-family': 'Jost', 'font-weight': 600, 'font-size': 25, 'letter-spacing': 6 }, e.rot);
      const tp = svg('textPath', { href: '#ring' }, tx);
      tp.textContent = e.ring;
      const ct = svg('text', { x: c, y: c + 22, 'text-anchor': 'middle', fill: IVORY, 'font-family': 'Bodoni', 'font-size': e.csize || 74 }, s);
      ct.textContent = e.center;
      e.c = c;
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      const p = cl(w.lt / 0.5);
      e.root.style.transform = `scale(${0.3 + 0.7 * EZ.outBack(p)}) rotate(${(1 - EZ.outExpo(p)) * -40}deg)`;
      e.root.style.transformOrigin = '50% 50%';
      e.root.style.opacity = cl(p * 3) * w.xo;
      e.rot.setAttribute('transform', `rotate(${w.lt * 22} ${e.c} ${e.c})`);
      return 1;
    },
  };

  // ---- hand-drawn gold ellipse around a word or a stone
  T.circle = {
    init(e) {
      const s = document.createElementNS(SVGNS, 'svg');
      s.setAttribute('width', W); s.setAttribute('height', H);
      s.style.cssText = 'position:absolute;left:0;top:0;';
      STAGE.appendChild(s);
      e.root = s;
      const { cx, cy, rx, ry } = e, rot = e.rot || -6;
      let d = '';
      for (let k = 0; k <= 72; k++) {
        const a = -Math.PI * 0.6 + (k / 72) * Math.PI * 2.12, wob = 1 + 0.035 * Math.sin(k * 0.9);
        const x = cx + rx * wob * Math.cos(a), y = cy + ry * wob * Math.sin(a);
        d += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      e.p = svg('path', { d, fill: 'none', stroke: e.color || GOLD_L, 'stroke-width': e.sw || 6, 'stroke-linecap': 'round', transform: `rotate(${rot} ${cx} ${cy})` }, s);
      e.L = e.p.getTotalLength(); e.p.style.strokeDasharray = e.L;
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      e.p.style.strokeDashoffset = e.L * (1 - EZ.inOut(cl(w.lt / 0.45)));
      e.root.style.opacity = w.xo;
      return 1;
    },
  };


  // ---- image (cut-out ring, photo): entry, slow zoom, float, small rotation, reflection, soft shadow.
  //      Put a marquee BEFORE it in the element list and the text runs behind the ring (the reference effect).
  T.img = {
    init(e) {
      e.root = mk('div', `position:absolute;left:${e.x - e.w / 2}px;top:${e.y}px;width:${e.w}px;transform-origin:50% 50%;`);
      e.baseF = e.shadow === false ? '' : `drop-shadow(0 30px 40px rgba(0,0,0,.55))${e.glow ? ' drop-shadow(0 0 40px rgba(218,189,134,.35))' : ''}`;
      e.im = mk('img', `display:block;width:100%;`, e.root);
      e.im.style.filter = e.baseF || 'none';
      e.im.src = e.data;
      if (e.reflect) {
        e.rf = mk('img', `display:block;width:100%;transform:scaleY(-1);margin-top:${e.rgap || -8}px;opacity:.22;` +
                         `-webkit-mask-image:linear-gradient(to top, rgba(0,0,0,.9) 0%, rgba(0,0,0,0) 45%);`, e.root);
        e.rf.src = e.data;
      }
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      const ent = cl(w.lt / (e.inDur || 0.45)), q = EZ.outExpo(ent);
      const span = Math.max(0.5, (e.until != null ? B(e.until) : w.t0 + 4) - w.t0);
      const z = (e.zoom ? e.zoom[0] + (e.zoom[1] - e.zoom[0]) * (w.lt / span) : 1);
      let tr = '', op = 1;
      const a = e.anim || 'scale';
      if (a === 'scale') { tr = `scale(${0.82 + 0.18 * q})`; op = cl(ent * 3); }
      else if (a === 'slam') { tr = `scale(${1.35 - 0.35 * q})`; op = cl(ent * 5); e.im.style.filter = (e.baseF + (ent < 1 ? ` blur(${(1 - q) * 14}px)` : '')) || 'none'; }
      else if (a === 'rise') { tr = `translateY(${(1 - q) * 160}px)`; op = cl(ent * 2); }
      else if (a === 'fade') { op = q; }
      const fl = e.float ? Math.sin(w.lt * 1.6) * e.float : 0, rot = (e.spin || 0) * w.lt + (e.rot || 0);
      e.root.style.transform = `${tr} translateY(${fl}px) rotate(${rot}deg) scale(${z})`;
      e.root.style.opacity = op * w.xo;
      return 1;
    },
  };

  // ---- full-screen flash on beats (white or ink), quick decay
  T.flash = {
    init(e) { e.root = mk('div', `position:absolute;inset:0;background:${e.color || IVORY};`); },
    render(e, t) {
      let a = 0;
      for (const k of e.beats) { const d = t - B(k); if (d >= 0 && d < 0.3) a = Math.max(a, (e.alpha || 0.85) * Math.exp(-d * (e.decay || 16))); }
      e.root.style.display = a > 0.01 ? '' : 'none';
      e.root.style.opacity = a;
      return a > 0.01 ? 1 : 0;
    },
  };

  // ---- darkening for readability: solid veil or gradient band
  T.scrim = {
    init(e) {
      const bg = e.grad === 'bottom' ? 'linear-gradient(to bottom, rgba(15,14,12,0) 0%, rgba(15,14,12,.85) 100%)' :
        e.grad === 'top' ? 'linear-gradient(to top, rgba(15,14,12,0) 0%, rgba(15,14,12,.85) 100%)' :
        e.grad === 'both' ? 'linear-gradient(to bottom, rgba(15,14,12,.8) 0%, rgba(15,14,12,0) 32%, rgba(15,14,12,0) 58%, rgba(15,14,12,.85) 100%)' :
        `rgba(15,14,12,${e.alpha != null ? e.alpha : 0.6})`;
      e.root = mk('div', `position:absolute;left:0;width:${W}px;top:${e.y || 0}px;height:${e.h || H}px;background:${bg};`);
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      e.root.style.opacity = Math.min(cl(w.lt / (e.fade || 0.25)), w.xo);
      return 1;
    },
  };

  // ---- opaque background (motion-only frames)
  T.bg = {
    init(e) { e.root = mk('div', `position:absolute;inset:0;background:${e.css || e.color || INK};`); },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      // never 100 % opaque: a fully opaque frame is saved as RGB (no alpha) and ffmpeg then rebuilds its whole
      // filter graph mid-video, which breaks the xfade timeline (bug found 12 Nov 2026). 0.995 is invisible.
      e.root.style.opacity = Math.min(e.fadein ? cl(w.lt / e.fadein) : 1, w.xo, 0.995);
      return 1;
    },
  };

  // ---- progress bar at the top (explainers: "where are we")
  T.progress = {
    init(e) {
      e.root = mk('div', `position:absolute;left:80px;top:${e.y || 250}px;width:${W - 160}px;height:4px;background:rgba(246,243,238,.25);`);
      e.bar = mk('div', `height:4px;width:0;background:${GOLD};`, e.root);
    },
    render(e, t) {
      const w = win(e, t);
      if (!w) { e.root.style.display = 'none'; return 0; }
      e.root.style.display = '';
      e.bar.style.width = (100 * cl(w.lt / (B(e.until) - w.t0))) + '%';
      e.root.style.opacity = Math.min(cl(w.lt / 0.3), w.xo);
      return 1;
    },
  };

  window.MOTION = {
    init(spec, logo) {
      BT = spec.beats; LOGO = logo; STAGE = document.getElementById('s');
      let defs = '';
      for (let r = 2; r <= 6; r++) defs += `<filter id="ol${r}" x="-5%" y="-20%" width="110%" height="140%"><feMorphology in="SourceAlpha" operator="erode" radius="${r}" result="er"/><feComposite in="SourceGraphic" in2="er" operator="out"/></filter>`;
      const holder = document.createElement('div');
      holder.innerHTML = `<svg width="0" height="0" style="position:absolute">${defs}</svg>`;
      document.body.appendChild(holder);
      ELS = spec.elements.map(e => Object.assign({}, e));
      for (const e of ELS) { if (!T[e.type]) throw new Error('unknown element ' + e.type); T[e.type].init(e); }
    },
    render(t) {
      let vis = 0;
      for (const e of ELS) vis += T[e.type].render(e, t) || 0;
      return vis;
    },
  };
})();
