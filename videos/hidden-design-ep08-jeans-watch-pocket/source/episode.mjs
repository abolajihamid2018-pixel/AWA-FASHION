// EP.08 — The tiny pocket in your jeans
import {C, INK, rect, ell, grp, pathL, line, text, ctext, chrome, fadeIn, pop, draw, ring, star, cross, check, heart,
  actor, bubble, stamp, sweat, marks, shakeLines, hop, jitter, endCard2, ICONS} from '../../hidden-design-series/lib.mjs';
export const ep = 8;

const DENIM = '#3c5f8f', DENIM2 = '#34547f', FACING = '#4369a0', THREAD = '#e0a24a', COPPER = '#c27a45';
const dashes = (pts, n = 18, col = THREAD, lw = 4) => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; for (let k = 0; k < n; k += 2) { const f0 = k / n, f1 = (k + 1) / n; out.push(line([[a[0] + (b[0] - a[0]) * f0, a[1] + (b[1] - a[1]) * f0], [a[0] + (b[0] - a[0]) * f1, a[1] + (b[1] - a[1]) * f1]], {color: col, lineWidth: lw})); } } return out; };
const curvePts = (p0, c, p1, n = 10) => Array.from({length: n + 1}, (_, i) => { const t = i / n, u = 1 - t; return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]; });
// Jeans hip close-up, local 900×1000. watch pocket box (360,165)-(510,325)
function jeans(x, y, s = 1, o = {}) {
  const open = curvePts([620, 140], [520, 440], [0, 470], 12);
  return grp([
    rect(0, 0, 900, 1000, DENIM, {r: 30, stroke: INK, lineWidth: 6}),
    ...Array.from({length: 16}, (_, i) => line([[i * 60, 1000], [i * 60 + 200, 600]], {color: 'rgba(255,255,255,0.05)', lineWidth: 6})),
    pathL([['M', 0, 140], ['L', 620, 140], ['Q', 520, 440, 0, 470], ['Z']], {fill: FACING}),
    pathL([['M', 620, 140], ['Q', 520, 440, 0, 470]], {fill: 'none', stroke: INK, lineWidth: 6}),
    ...dashes(curvePts([600, 150], [505, 430], [0, 492], 12), 4),
    rect(0, 0, 900, 140, DENIM2, {r: 30, stroke: INK, lineWidth: 5}), ...dashes([[20, 124], [880, 124]], 60),
    rect(120, -10, 56, 170, DENIM2, {r: 10, stroke: INK, lineWidth: 4}), rect(560, -10, 56, 170, DENIM2, {r: 10, stroke: INK, lineWidth: 4}),
    ell(780, 40, 64, 64, COPPER, {stroke: INK, lineWidth: 4}), ell(800, 60, 24, 24, '#8a5230'),
    pathL([['M', 740, 140], ['L', 740, 700], ['Q', 740, 800, 840, 820]], {fill: 'none', stroke: INK, lineWidth: 5}), ...dashes([[712, 150], [712, 690]], 30),
    // watch pocket
    rect(360, 165, 150, 160, '#4a72ab', {r: 8, stroke: INK, lineWidth: 5, keys: o.pocketKeys}), ...dashes([[372, 178], [498, 178]], 10), ...dashes([[372, 312], [498, 312]], 10),
    ell(352, 157, 22, 22, COPPER, {stroke: INK, lineWidth: 3}), ell(496, 157, 22, 22, COPPER, {stroke: INK, lineWidth: 3}),
    ell(608, 128, 26, 26, COPPER, {stroke: INK, lineWidth: 3}), ell(-10, 460, 26, 26, COPPER, {stroke: INK, lineWidth: 3}),
    ...(o.extra || []),
  ], {x, y, scaleX: s, scaleY: s, keys: o.keys});
}
const J = {x: 190, y: 250, s: 1.0};
const WP = [J.x + 435 * J.s, J.y + 245 * J.s];         // watch-pocket centre on screen
const pocketFront = () => [rect(J.x + 360, J.y + 215, 150, 110, '#4a72ab', {r: 8, stroke: INK, lineWidth: 5}), ...dashes([[J.x + 372, J.y + 312], [J.x + 498, J.y + 312]], 10)];
const grape = (x, y, s, keys) => grp([ell(0, 10, 80, 90, '#7b4bb3', {stroke: INK, lineWidth: 4}), ell(16, 26, 22, 30, 'rgba(255,255,255,0.4)'), rect(36, -8, 8, 22, '#5d7f3a', {r: 3}), ell(42, -14, 30, 14, '#6fcf8e', {angle: -0.4})],
  {x, y, scaleX: s, scaleY: s, pivotX: 40, pivotY: 55, keys});
// Pocket watch, local 200×200 + chain
const watch = (x, y, s, o = {}) => grp([
  ...(o.chain === false ? [] : [pathL([['M', 100, 0], ['Q', 40, -120, -140, -60]], {fill: 'none', stroke: '#d4b25a', lineWidth: 8})]),
  rect(84, -24, 32, 30, '#d4b25a', {r: 8, stroke: INK, lineWidth: 3}), ell(0, 0, 200, 200, '#d4b25a', {stroke: INK, lineWidth: 5}), ell(16, 16, 168, 168, '#f6f1e3', {stroke: INK, lineWidth: 3}),
  ...Array.from({length: 12}, (_, i) => grp([rect(-3, -76, 6, i % 3 ? 10 : 18, '#2a2f35')], {x: 100, y: 100, angle: i * Math.PI / 6})),
  grp([rect(-5, -50, 10, 54, '#2a2f35', {r: 4})], {x: 100, y: 100, angle: 0.9}),
  grp([rect(-2, -70, 4, 74, C.red, {r: 2})], {x: 100, y: 100, keys: o.tick ?? [{t: 0, angle: 0}, {t: 3, angle: Math.PI * 1.2}]}),
  ell(92, 92, 16, 16, '#2a2f35'), ...(o.extra || []),
], {x, y, scaleX: s, scaleY: s, pivotX: 100, pivotY: 100, keys: o.keys});
// Sepia frontier scene
const frontier = (d) => [
  rect(72, 172, 1136, 1286, '#d8b47a'), ell(860, 250, 200, 200, '#f1d79a'),
  pathL([['M', 72, 760], ['L', 260, 520], ['L', 420, 700], ['L', 600, 470], ['L', 820, 720], ['L', 1000, 560], ['L', 1208, 760], ['Z']], {fill: '#a9784a', stroke: INK, lineWidth: 4}),
  rect(72, 760, 1136, 698, '#c4955c'), line([[72, 760], [1208, 760]], {color: INK, lineWidth: 4}),
  ...Array.from({length: 12}, (_, i) => rect(90 + i * 100, 1300, 70, 24, '#7a5434', {r: 4})), line([[72, 1296], [1208, 1296]], {color: '#59616a', lineWidth: 10}), line([[72, 1330], [1208, 1330]], {color: '#59616a', lineWidth: 10}),
  grp([rect(30, 0, 60, 300, '#6d8a4a', {r: 30, stroke: INK, lineWidth: 4}), rect(0, 90, 30, 110, '#6d8a4a', {r: 15, stroke: INK, lineWidth: 4}), rect(90, 60, 30, 110, '#6d8a4a', {r: 15, stroke: INK, lineWidth: 4})], {x: 1060, y: 560}),
  ...[0, 1, 2].map(i => line([[200 + i * 380, 172], [200 + i * 380, 1458]], {color: 'rgba(60,40,20,0.25)', lineWidth: 3, alpha: 0, keys: [{t: 0, alpha: 0}, {t: 0.2 + i * 0.3, alpha: 1}, {t: 0.3 + i * 0.3, alpha: 0}, {t: Math.max(0.6 + i * 0.3, d - 0.2), alpha: 0}]})),
];
const sepiaTint = rect(72, 172, 1136, 1286, 'rgba(120,80,30,0.18)');

export const scenes = [
  // That tiny pocket / inside your jeans pocket?
  ({d, cues}) => ({layers: [...chrome(8, 'THIS TINY POCKET', cues[1]),
    rect(72, 172, 1136, 1286, '#2b333c'),
    jeans(J.x, J.y, J.s, {keys: [{t: 0, scaleX: 0.85, scaleY: 0.85, x: 260, y: 330}, {t: 0.5, scaleX: 1, scaleY: 1, x: J.x, y: J.y}]}),
    ring(WP[0], WP[1], 120, 120, cues[1]),
  ], sfx: [{time: 0.1, kind: 'paper', gain: 0.03}, {time: cues[1] + 0.2, kind: 'tap', gain: 0.045}]}),

  // What is it even for?
  () => ({layers: [...chrome(8, 'WHAT IS IT FOR?!'),
    rect(72, 172, 1136, 1286, '#2b333c'), jeans(J.x, J.y, J.s, {pocketKeys: [{t: 0, alpha: 1}]}),
    ring(WP[0], WP[1], 120, 120, 0),
    marks('?', 800, 280, 0.15, C.amber, 140), marks('?', 930, 380, 0.3, C.amber, 100), marks('?', 300, 300, 0.45, C.amber, 110),
  ], sfx: [{time: 0.15, kind: 'pop', gain: 0.03}, {time: 0.45, kind: 'pop', gain: 0.03}]}),

  // Is it for / one single grape?  (character)
  ({cues}) => ({layers: [...chrome(8, 'A GRAPE POCKET?'),
    rect(72, 172, 1136, 1286, '#2b333c'), jeans(J.x, J.y, J.s),
    grape(WP[0] - 40, WP[1] - 60, 1.4, [{t: 0, alpha: 0, y: WP[1] - 300}, {t: cues[1], alpha: 0, y: WP[1] - 300}, {t: cues[1] + 0.3, alpha: 1, y: WP[1] - 60}]),
    bubble('ONE SINGLE GRAPE?', 640, 1040, 0.02, {size: 50}),
  ], sfx: [{time: cues[1] + 0.3, kind: 'pop', gain: 0.04}]}),

  // Let's go back to the 1800s.
  ({d}) => ({layers: [...chrome(8, 'BACK TO THE 1800s', 0.9),
    rect(72, 172, 1136, 1286, '#2b333c'), rect(72, 172, 1136, 1286, 'rgba(216,180,122,1)', {keys: [{t: 0, alpha: 0}, {t: d - 0.8, alpha: 0}, {t: d, alpha: 1}]}),
    ell(390, 380, 500, 500, '#e9ecee', {stroke: INK, lineWidth: 10}), ...Array.from({length: 12}, (_, i) => grp([rect(-5, -230, 10, i % 3 ? 20 : 40, '#2a2f35')], {x: 640, y: 630, angle: i * Math.PI / 6})),
    grp([rect(-8, -150, 16, 156, '#2a2f35', {r: 6})], {x: 640, y: 630, keys: [{t: 0, angle: 0}, {t: d, angle: -Math.PI * 6}]}),
    grp([rect(-6, -200, 12, 206, C.red, {r: 6})], {x: 640, y: 630, keys: [{t: 0, angle: 0}, {t: d, angle: -Math.PI * 24}]}), ell(620, 610, 40, 40, '#2a2f35'),
    ...['2024', '1990', '1950', '1920', '1890'].map((s, i, a) => ctext(s, 1000, 110, {color: C.amber, from: i * 0.45, ...(i < a.length - 1 ? {to: (i + 1) * 0.45} : {})})),
  ], sfx: [0.1, 0.55, 1.0, 1.45, 1.9].map(t => ({time: t, kind: 'tap', gain: 0.03})).concat([{time: 2.0, kind: 'chime', gain: 0.03}])}),

  // Cowboys, miners, / and railroad workers / wore tough denim jeans.
  ({d, cues}) => ({layers: [...chrome(8, 'TOUGH WORKERS, TOUGH JEANS', cues[2]),
    ...frontier(d),
    actor(140, 1250 - 582 * 1.05, 1.05, {hat: 'cowboy', tone: '#e9d8c0', legs: DENIM, R: [{t: 0, at: 'hips'}], L: [{t: 0, at: 'hips'}], keys: [{t: 0, alpha: 0, x: 60}, {t: 0.25, alpha: 1, x: 140}]}),
    actor(500, 1250 - 582 * 1.05, 1.05, {hat: 'miner', tone: '#e2d2b8', legs: DENIM, R: [{t: 0, at: 'down'}, {t: cues[1], at: [200, 60]}], L: [{t: 0, at: 'down'}], keys: [{t: 0, alpha: 0}, {t: cues[1] - 0.3, alpha: 0, y: 1250 - 582 * 1.05 + 40}, {t: cues[1], alpha: 1, y: 1250 - 582 * 1.05}],
      holdR: [grp([rect(0, 0, 14, 150, '#7a5434', {r: 6}), pathL([['M', -60, 150], ['Q', 7, 110, 74, 150], ['L', 7, 168], ['Z']], {fill: '#9aa3ac', stroke: INK, lineWidth: 3})], {x: 10, y: 20})]}),
    actor(860, 1250 - 582 * 1.05, 1.05, {hat: 'cap', hatColor: '#59616a', tone: '#e6dcc8', legs: DENIM, L: [{t: 0, at: 'down'}], R: [{t: 0, at: 'down'}, {t: cues[1] + 0.3, at: 'wave'}], keys: [{t: 0, alpha: 0}, {t: cues[1] + 0.1, alpha: 0, y: 1250 - 582 * 1.05 + 40}, {t: cues[1] + 0.4, alpha: 1, y: 1250 - 582 * 1.05}]}),
    stamp('DENIM', 640, 380, cues[2] + 0.1, {size: 90, color: '#2f5d8a', bg: 'rgba(241,228,200,0.92)'}),
    sepiaTint,
  ], sfx: [{time: 0.15, kind: 'pop', gain: 0.03}, {time: cues[1], kind: 'pop', gain: 0.03}, {time: cues[1] + 0.35, kind: 'pop', gain: 0.03}, {time: cues[2] + 0.2, kind: 'chime', gain: 0.025}]}),

  // And many of them / carried pocket watches.
  ({d, cues}) => ({layers: [...chrome(8, 'POCKET WATCHES', cues[1]),
    ...frontier(d),
    actor(220, 1250 - 582 * 1.2, 1.2, {hat: 'cowboy', tone: '#e9d8c0', legs: DENIM, L: [{t: 0, at: 'hips'}], R: [{t: 0, at: 'hips'}, {t: 0.4, at: [190, 120]}],
      holdR: [watch(-10, 70, 0.35, {chain: false, keys: [{t: 0, alpha: 0}, {t: 0.45, alpha: 0}, {t: 0.55, alpha: 1}]})]}),
    grp([ell(0, 0, 420, 420, '#f1e4c8', {stroke: INK, lineWidth: 6}), watch(110, 110, 1.0, {chain: false, tick: [{t: 0, angle: 0}, {t: d, angle: Math.PI * 0.5}]})], {x: 660, y: 360, keys: [{t: 0, alpha: 0}, {t: cues[1] - 0.1, alpha: 0, x: 700, y: 420}, {t: cues[1] + 0.2, alpha: 1, x: 660, y: 360}]}),
    line([[600, 720], [690, 640]], {color: INK, lineWidth: 5, ...draw(cues[1], 0.2)}),
    sepiaTint,
  ], sfx: [{time: 0.5, kind: 'jingle', gain: 0.03}, {time: cues[1] + 0.1, kind: 'tap', gain: 0.02}, {time: cues[1] + 0.6, kind: 'tap', gain: 0.02}]}),

  // But a watch in a big pocket / gets scratched, / smashed, or lost.
  ({d, cues}) => ({layers: [...chrome(8, 'BIG POCKET = BIG TROUBLE', cues[1]),
    rect(72, 172, 1136, 1286, '#2b333c'),
    pathL([['M', 260, 260], ['L', 1020, 260], ['L', 980, 1260], ['Q', 640, 1360, 300, 1260], ['Z']], {fill: DENIM, stroke: INK, lineWidth: 6}),
    ...dashes([[290, 290], [990, 290]], 40), pathL([['M', 300, 1230], ['Q', 640, 1330, 960, 1230]], {fill: 'none', stroke: THREAD, lineWidth: 4}),
    watch(540, 600, 1.1, {chain: false, keys: [{t: 0, x: 540, y: 400, angle: 0, alpha: 1}, {t: 0.5, x: 540, y: 700, angle: 0.3}, {t: cues[1], x: 420, y: 760, angle: -0.4}, {t: cues[2], x: 600, y: 820, angle: 0.5}, {t: cues[2] + 0.6, x: 640, y: 1180, angle: 2, alpha: 1}, {t: cues[2] + 0.8, alpha: 0}],
      extra: [...[[40, 70, 120, 40], [60, 130, 150, 100], [90, 30, 170, 110]].map(([x1, y1, x2, y2], i) => line([[x1, y1], [x2, y2]], {color: '#8a8a8a', lineWidth: 4, ...draw(cues[1] + i * 0.1, 0.15)})),
        pathL([['M', 100, 20], ['L', 80, 70], ['L', 120, 100], ['L', 90, 150], ['L', 110, 185]], {fill: 'none', stroke: INK, lineWidth: 5, ...draw(cues[2] - 0.05, 0.2)})]}),
    text('SCRATCH!', 160, 640, 50, {color: C.amber, keys: [{t: 0, alpha: 0}, {t: cues[1], alpha: 0}, {t: cues[1] + 0.1, alpha: 1}]}),
    text('SMASH!', 860, 760, 50, {color: C.red, keys: [{t: 0, alpha: 0}, {t: cues[2] - 0.1, alpha: 0}, {t: cues[2], alpha: 1}]}),
    text('BYE...', 560, 1320, 50, {color: C.mid, keys: [{t: 0, alpha: 0}, {t: cues[2] + 0.6, alpha: 0}, {t: cues[2] + 0.8, alpha: 1}]}),
  ], sfx: [{time: cues[1] + 0.05, kind: 'paper', gain: 0.04}, {time: cues[2], kind: 'pop', gain: 0.05}, {time: cues[2] + 0.85, kind: 'jingle', gain: 0.03}]}),

  // So jeans got a tiny pocket, / just the right size.
  ({cues}) => ({layers: [...chrome(8, 'A TINY WATCH HOME', cues[1]),
    rect(72, 172, 1136, 1286, '#2b333c'), jeans(J.x, J.y, J.s),
    watch(0, 0, 0.5, {keys: [{t: 0, x: 860, y: 900, scaleX: 1.1, scaleY: 1.1}, {t: 0.3, x: 860, y: 900}, {t: cues[1] - 0.1, x: WP[0] - 100, y: WP[1] - 180, scaleX: 0.6, scaleY: 0.6}]}),
    ...pocketFront(),
    line([[WP[0] - 75, WP[1] + 100], [WP[0] + 75, WP[1] + 100]], {color: C.green, lineWidth: 6, ...draw(cues[1], 0.3)}),
    line([[WP[0] - 75, WP[1] + 86], [WP[0] - 75, WP[1] + 114]], {color: C.green, lineWidth: 6, keys: fadeIn(cues[1])}), line([[WP[0] + 75, WP[1] + 86], [WP[0] + 75, WP[1] + 114]], {color: C.green, lineWidth: 6, keys: fadeIn(cues[1] + 0.25)}),
    check(WP[0] + 140, WP[1] - 60, 0.8, cues[1] + 0.4),
  ], sfx: [{time: 0.4, kind: 'paper', gain: 0.03}, {time: cues[1], kind: 'tap', gain: 0.035}, {time: cues[1] + 0.45, kind: 'chime', gain: 0.03}]}),

  // That's why it's called / the watch pocket.
  ({cues}) => ({layers: [...chrome(8, null),
    rect(72, 172, 1136, 1286, '#2b333c'), jeans(J.x, J.y, J.s),
    watch(WP[0] - 100, WP[1] - 180, 0.6, {chain: false}), ...pocketFront(),
    line([[WP[0] + 100, WP[1] + 90], [WP[0] + 230, WP[1] + 380]], {color: C.amber, lineWidth: 8, ...draw(0.1, 0.3)}),
    stamp('THE WATCH POCKET', 640, 1080, cues[1] - 0.1, {size: 80, color: C.amber, angle: -0.05}),
  ], sfx: [{time: cues[1], kind: 'pop', gain: 0.05}]}),

  // Pocket watches disappeared. / The pocket didn't.
  ({cues}) => ({layers: [...chrome(8, 'THE POCKET STAYED', cues[1]),
    rect(72, 172, 1136, 1286, '#2b333c'), jeans(J.x, J.y, J.s),
    watch(WP[0] - 100, WP[1] - 180, 0.6, {chain: false, keys: [{t: 0, alpha: 1, scaleX: 0.6, scaleY: 0.6}, {t: 0.6, alpha: 1, scaleX: 0.6, scaleY: 0.6}, {t: 0.9, alpha: 0, scaleX: 0.2, scaleY: 0.2}]}), ...pocketFront(),
    ...[0, 1, 2, 3, 4, 5].map(i => ell(WP[0] - 20 + Math.cos(i) * 10, WP[1] - 20, 40, 40, 'rgba(220,225,230,0.7)', {keys: [{t: 0, alpha: 0}, {t: 0.75, alpha: 0, x: WP[0] - 20, y: WP[1] - 20}, {t: 0.9, alpha: 0.8}, {t: 1.4, alpha: 0, x: WP[0] - 20 + Math.cos(i * 1.05) * 140, y: WP[1] - 20 + Math.sin(i * 1.05) * 140}]})),
    ring(WP[0], WP[1], 110, 110, cues[1], {color: C.green}),
    text('STILL HERE.', WP[0] + 150, WP[1] - 40, 52, {color: C.green, keys: fadeIn(cues[1] + 0.2)}),
  ], sfx: [{time: 0.8, kind: 'pop', gain: 0.04}, {time: cues[1] + 0.2, kind: 'chime', gain: 0.025}]}),

  // Today it holds coins, / keys, guitar picks, / and mostly, / absolutely nothing.
  ({d, cues}) => ({layers: [...chrome(8, 'WHAT IT HOLDS TODAY', 0.1),
    rect(72, 172, 1136, 1286, '#2b333c'), jeans(J.x, J.y, J.s),
    ...[
      [grp([ell(0, 0, 90, 90, '#d4b25a', {stroke: INK, lineWidth: 4}), ell(16, 16, 58, 58, 'none', {stroke: '#a88a3a', lineWidth: 4})]), cues[0] + 0.3],
      [grp([ell(0, 0, 70, 70, 'none', {stroke: '#b9c0c6', lineWidth: 14}), rect(60, 26, 110, 18, '#b9c0c6', {r: 6}), rect(140, 40, 14, 26, '#b9c0c6'), rect(116, 40, 14, 20, '#b9c0c6')]), cues[1]],
      [grp([pathL([['M', 0, 0], ['Q', 50, -16, 100, 0], ['Q', 90, 70, 50, 110], ['Q', 10, 70, 0, 0], ['Z']], {fill: C.red, stroke: INK, lineWidth: 4})]), cues[1] + 0.5],
    ].map(([g, t], i) => ({...g, keys: [{t: 0, alpha: 0, x: 900, y: 900}, {t, alpha: 0, x: 900, y: 900}, {t: t + 0.1, alpha: 1}, {t: t + 0.4, x: WP[0] - 50 + i * 10, y: WP[1] - 110 - i * 10}, {t: cues[2], alpha: 1}, {t: cues[2] + 0.3, alpha: 0}]})),
    ...pocketFront(),
    grp([ell(0, 0, 200, 200, 'none', {stroke: '#a9784a', lineWidth: 8}), ...[0, 1, 2, 3].map(i => pathL([['M', 20 + i * 30, 40], ['Q', 100, 200 - i * 30, 180, 60 + i * 20]], {fill: 'none', stroke: '#8a6a48', lineWidth: 6}))],
      {x: -200, y: 1060, pivotX: 100, pivotY: 100, keys: [{t: 0, x: -200, angle: 0}, {t: cues[3], x: -200, angle: 0}, {t: d, x: 1300, angle: 9}]}),
    text('*crickets*', 760, 1300, 44, {color: C.mid, keys: [{t: 0, alpha: 0}, {t: cues[3] + 0.4, alpha: 0}, {t: cues[3] + 0.6, alpha: 1}]}),
  ], sfx: [{time: cues[0] + 0.5, kind: 'jingle', gain: 0.03}, {time: cues[1] + 0.3, kind: 'jingle', gain: 0.03}, {time: cues[1] + 0.8, kind: 'tap', gain: 0.03}, {time: cues[3] + 0.4, kind: 'paper', gain: 0.03}]}),

  // I'm keeping the grape.  (character)
  () => ({layers: [...chrome(8, 'GRAPE POCKET: OFFICIAL'),
    rect(72, 172, 1136, 1286, '#2b333c'), jeans(J.x, J.y, J.s),
    grape(WP[0] - 40, WP[1] - 60, 1.1, [{t: 0, y: WP[1] - 300, alpha: 0}, {t: 0.1, alpha: 1}, {t: 0.45, y: WP[1] - 130}]), ...pocketFront(),
    heart(WP[0] + 120, WP[1] - 200, 0.5, pop(0.5, 0.5)),
    bubble('I\'M KEEPING THE GRAPE.', 640, 1040, 0.02, {size: 48}),
  ], sfx: [{time: 0.45, kind: 'pop', gain: 0.04}, {time: 0.55, kind: 'chime', gain: 0.02}]}),

  // Follow for more / hidden designs.
  () => ({layers: endCard2(8, ICONS.map(f => () => f())), sfx: [0.3, 0.46, 0.62, 0.78, 0.94].map(t => ({time: t, kind: 'pop', gain: 0.03}))}),
];
