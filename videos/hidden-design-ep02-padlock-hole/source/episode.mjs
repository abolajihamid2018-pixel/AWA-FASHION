// EP.02 — Why padlocks have a hole in the bottom
import {C, rect, ell, grp, pathL, line, text, ctext, chrome, fadeIn, fadeOut, pop, draw, strike, ring, star, cross, check, drop, rain, padlock, iconCap, planeWindow, gauge, endCard} from '../../hidden-design-series/lib.mjs';
export const ep = 2;

// Cross-section of a padlock body. hole: drain open at the bottom. water: keys for the pool (scaleY from bottom).
function section(o = {}) {
  const parts = [
    rect(560, 690, 34, 120, C.mid, {r: 8}), rect(620, 690, 34, 150, C.mid, {r: 8}), rect(680, 690, 34, 100, C.mid, {r: 8}),
    pathL([['M', 760, 700], ['L', 800, 720], ['L', 760, 740], ['L', 800, 760], ['L', 760, 780], ['L', 800, 800]], {fill: 'none', stroke: C.mid, lineWidth: 8}),
    ell(470, 670, 50, 50, C.mid), ell(830, 670, 50, 50, C.mid),
    rect(540, 900, 200, 40, C.soft, {r: 12}),
  ];
  return [
    pathL([['M', 440, 650], ['L', 440, 460], ['C', 440, 300, 840, 300, 840, 460], ['L', 840, 650]], {fill: 'none', stroke: C.mid, lineWidth: 44}),
    rect(340, 620, 600, 520, C.inset, {r: 60, stroke: C.light, lineWidth: 10}),
    rect(400, 612, 80, 20, C.inset),                                   // gap where the shackle enters (water gets in)
    ...parts,
    ...(o.rust ? o.rust : []),
    grp([rect(0, 0, 584, 200, C.water, {r: 30, alpha: 0.85, keys: o.waterColorKeys})], {x: 348, y: 932, pivotX: 292, pivotY: 200, scaleY: o.water0 ?? 0.01, keys: o.water}),
    ...(o.ice ? o.ice : []),
    ...(o.hole ? [rect(615, 1128, 50, 20, C.panel)] : []),
    ...(o.extra || []),
  ];
}
const key = (x, y, keys) => grp([ell(0, 0, 90, 90, 'none', {stroke: C.amber, lineWidth: 18}), rect(84, 36, 180, 20, C.amber, {r: 8}), rect(220, 52, 18, 34, C.amber, {r: 4}), rect(180, 52, 18, 26, C.amber, {r: 4})], {x, y, keys});
const fallDrops = (x, y0, y1, t0, n, gap = 0.18, color = C.water) => Array.from({length: n}, (_, i) => drop(x, y0, 0.18, color, {keys: [{t: t0 + i * gap, y: y0, alpha: 0}, {t: t0 + i * gap + 0.05, alpha: 1}, {t: t0 + i * gap + 0.45, y: y1, alpha: 1}, {t: t0 + i * gap + 0.55, alpha: 0}]}));

export const scenes = [
  // Flip a padlock over. / See that tiny hole?
  ({cues}) => ({layers: [...chrome(2, 'WHY IS THIS HOLE HERE?', cues[1]),
    padlock(490, 520, 1.7, {keys: [{t: 0, angle: 0, alpha: 0}, {t: 0.2, alpha: 1}, {t: 0.35, angle: 0}, {t: 1.0, angle: Math.PI}],
      extra: [ell(95, 386, 110, 52, 'none', {stroke: C.red, lineWidth: 8, keys: [{t: 0, alpha: 0}, {t: cues[1], alpha: 0}, {t: cues[1] + 0.25, alpha: 1}]})]}),
  ], sfx: [{time: 0.4, kind: 'paper', gain: 0.03}, {time: cues[1] + 0.2, kind: 'tap', gain: 0.04}]}),

  // It's not a second keyhole.
  ({d}) => ({layers: [...chrome(2, 'A SECOND KEYHOLE?'),
    padlock(440, 470, 1.5),
    key(900, 1130, [{t: 0, x: 980, alpha: 0}, {t: 0.2, alpha: 1}, {t: 0.7, x: 680}]),
    cross(560, 1000, 1.2, 0.85),
  ], sfx: [{time: 0.8, kind: 'tap', gain: 0.045}]}),

  // And it's not / for picking the lock.
  ({cues}) => ({layers: [...chrome(2, 'FOR LOCKPICKS?'),
    padlock(440, 470, 1.5),
    grp([line([[0, 0], [300, 0], [330, -30]], {color: C.light, lineWidth: 10}), rect(-120, -16, 130, 32, C.dim, {r: 10})],
      {x: 820, y: 1180, angle: -0.35, keys: [{t: 0, x: 980, alpha: 0}, {t: 0.2, alpha: 1}, {t: 0.7, x: 720}]}),
    strike(520, 980, 900, 1260, cues[1] + 0.1),
  ], sfx: [{time: cues[1] + 0.1, kind: 'tap', gain: 0.045}]}),

  // Padlocks live outside, / in the rain.
  ({d}) => ({layers: [...chrome(2, 'OUTSIDE, IN THE RAIN'),
    ...[180, 340, 900, 1060].map(x => rect(x, 300, 40, 1100, C.dark, {r: 12})),
    rect(130, 420, 1020, 34, C.dark, {r: 12}), rect(130, 1240, 1020, 34, C.dark, {r: 12}),
    ...Array.from({length: 6}, (_, i) => ell(480 + i * 56, 380 + (i % 2) * 10, 70, 40, 'none', {stroke: C.mid, lineWidth: 10})),
    padlock(490, 520, 1.3, {keys: [{t: 0, angle: -0.05}, {t: 0.9, angle: 0.05}, {t: 1.8, angle: -0.03}]}),
    ...rain(120, 200, 1040, 1250, d, 16),
  ], sfx: [{time: 0.1, kind: 'paper', gain: 0.02}]}),

  // Water sneaks inside the lock.
  () => ({layers: [...chrome(2, 'WATER GETS IN'),
    ...section({water: [{t: 0, scaleY: 0.01}, {t: 0.5, scaleY: 0.01}, {t: 1.6, scaleY: 0.85}],
      extra: fallDrops(418, 520, 900, 0.1, 6, 0.2)}),
    text('INSIDE', 380, 1180, 32, {color: C.mid}),
  ], sfx: [{time: 0.3, kind: 'tap', gain: 0.02}, {time: 0.7, kind: 'tap', gain: 0.02}, {time: 1.1, kind: 'tap', gain: 0.02}]}),

  // With no way out, / it just sits there,
  ({cues}) => ({layers: [...chrome(2, 'NO WAY OUT'),
    ...section({water0: 0.85, water: [{t: 0, scaleY: 0.85}, {t: 0.5, scaleY: 0.87}, {t: 1.0, scaleY: 0.85}, {t: 1.5, scaleY: 0.87}, {t: 2.0, scaleY: 0.86}]}),
    cross(580, 1170, 0.7, 0.35),
    ...['DAY 1', 'DAY 3', 'DAY 7'].map((s, i, a) => text(s, 960, 260, 44, {color: C.light, from: cues[1] + i * 0.35, ...(i < a.length - 1 ? {to: cues[1] + (i + 1) * 0.35} : {})})),
  ], sfx: [{time: 0.4, kind: 'tap', gain: 0.03}, {time: cues[1], kind: 'tap', gain: 0.02}, {time: cues[1] + 0.35, kind: 'tap', gain: 0.02}, {time: cues[1] + 0.7, kind: 'tap', gain: 0.02}]}),

  // rusting the parts, / or freezing solid in winter.
  ({cues}) => ({layers: [...chrome(2, 'RUST... OR ICE', 0.1),
    ...section({water0: 0.86,
      rust: [[565, 720, 30], [630, 790, 34], [690, 700, 26], [480, 870, 36], [770, 880, 30], [600, 905, 40], [780, 730, 22]].map(([x, y, r], i) => ell(x, y, r, r * 0.8, C.rust, {keys: [{t: 0, alpha: 0}, {t: 0.15 + i * 0.08, alpha: 0}, {t: 0.4 + i * 0.08, alpha: 0.95}]})),
      ice: [rect(348, 932, 584, 200, C.ice, {r: 30, keys: [{t: 0, alpha: 0}, {t: cues[1], alpha: 0}, {t: cues[1] + 0.5, alpha: 0.9}]}),
        ...[[420, 990], [560, 1050], [700, 980], [850, 1060]].map(([x, y], i) => star(x, y, 26, [{t: 0, alpha: 0}, {t: cues[1] + 0.2 + i * 0.1, alpha: 0}, {t: cues[1] + 0.45 + i * 0.1, alpha: 1}], C.white))]}),
    ...[[200, 300], [1050, 340], [160, 1300], [1080, 1250]].map(([x, y], i) => star(x, y, 30, [{t: 0, alpha: 0}, {t: cues[1] + 0.1 * i, alpha: 0}, {t: cues[1] + 0.3 + 0.1 * i, alpha: 0.9}], C.ice)),
  ], sfx: [{time: 0.3, kind: 'paper', gain: 0.025}, {time: cues[1] + 0.15, kind: 'chime', gain: 0.02}]}),

  // That little hole is a drain.
  () => ({layers: [...chrome(2, 'IT\'S A DRAIN'),
    ...section({hole: true, water0: 0.86}),
    ring(640, 1138, 70, 40, 0.3),
    text('DRAIN', 590, 1210, 48, {color: C.red, keys: fadeIn(0.6)}),
  ], sfx: [{time: 0.4, kind: 'pop', gain: 0.04}]}),

  // The water simply runs out / the bottom.
  () => ({layers: [...chrome(2, 'WATER RUNS OUT'),
    ...section({hole: true, water0: 0.86, water: [{t: 0, scaleY: 0.86}, {t: 1.7, scaleY: 0.02}]}),
    ...fallDrops(629, 1130, 1380, 0.05, 9, 0.17),
  ], sfx: [{time: 0.2, kind: 'tap', gain: 0.02}, {time: 0.6, kind: 'tap', gain: 0.02}, {time: 1.0, kind: 'tap', gain: 0.02}, {time: 1.4, kind: 'tap', gain: 0.02}]}),

  // It can even help you / oil the lock.
  ({cues}) => ({layers: [...chrome(2, 'OIL GOES IN, TOO', 0.1),
    padlock(390, 640, 1.3, {angle: Math.PI}),
    grp([ell(0, 60, 200, 140, C.dim), rect(60, 20, 80, 50, C.dim, {r: 10}), pathL([['M', 30, 100], ['L', -130, 222], ['L', -122, 238], ['L', 40, 140], ['Z']], {fill: C.mid})],
      {x: 680, y: 320, pivotX: 100, pivotY: 130, keys: [{t: 0, angle: 0, x: 760, alpha: 0}, {t: 0.2, alpha: 1}, {t: 0.5, angle: 0.25, x: 680}]}),
    drop(516, 490, 0.25, C.amber, {keys: [{t: 0, alpha: 0}, {t: cues[1], alpha: 0, y: 490}, {t: cues[1] + 0.05, alpha: 1}, {t: cues[1] + 0.4, y: 670, alpha: 1}, {t: cues[1] + 0.5, alpha: 0}]}),
  ], sfx: [{time: cues[1] + 0.4, kind: 'pop', gain: 0.03}]}),

  // Small hole. / Big reason.
  ({cues}) => ({layers: [...chrome(2, null),
    padlock(490, 520, 1.5, {extra: [ell(95, 386, 110, 52, 'none', {stroke: C.red, lineWidth: 8})]}),
    ctext('SMALL HOLE.', 1505, 72, {keys: fadeIn(0.05)}),
    ctext('BIG REASON.', 1600, 72, {color: C.red, keys: fadeIn(cues[1])}),
  ], sfx: [{time: cues[1], kind: 'chime', gain: 0.025}]}),

  // Follow for more / hidden designs.
  () => ({layers: endCard(2, [() => padlock(100, 540, 0.55), () => iconCap(460, 688, 1.0), () => planeWindow(590, 540, 0.5), () => gauge(770, 620, 0.45)]),
    sfx: [{time: 0.3, kind: 'pop', gain: 0.03}, {time: 0.6, kind: 'pop', gain: 0.03}, {time: 0.9, kind: 'pop', gain: 0.03}, {time: 1.2, kind: 'pop', gain: 0.03}]}),
];
