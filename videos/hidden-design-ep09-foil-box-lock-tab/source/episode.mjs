// EP.09 — The lock tab on foil boxes
import {C, INK, rect, ell, grp, pathL, line, text, ctext, chrome, fadeIn, pop, draw, ring, star, cross, check,
  actor, bubble, stamp, sweat, marks, shakeLines, hop, jitter, endCard2, ICONS} from '../../hidden-design-series/lib.mjs';
export const ep = 9;

const CARD = '#d9dfe5', BAND = '#2f6db3', FOIL = '#cfd6dc', FOIL2 = '#aeb7bf', TUBE = '#a8774a';
// Kitchen backdrop: tiles, counter (top at y=760), cabinets
const kitchen = (o = {}) => [
  rect(72, 172, 1136, 1286, '#3d4a52'),
  ...Array.from({length: 9}, (_, i) => line([[72, 300 + i * 52], [1208, 300 + i * 52]], {color: 'rgba(255,255,255,0.06)', lineWidth: 3})),
  ...Array.from({length: 12}, (_, i) => line([[72 + i * 100, 300], [72 + i * 100, 716]], {color: 'rgba(255,255,255,0.06)', lineWidth: 3})),
  rect(72, 172, 1136, 128, '#2f3a42'), ...[0, 1, 2].map(i => rect(110 + i * 370, 186, 330, 100, '#4a5a64', {r: 10, stroke: INK, lineWidth: 3})),
  ...(o.wall || []),
  rect(72, 760, 1136, 40, '#8a6a48', {stroke: INK, lineWidth: 4}), rect(72, 800, 1136, 450, '#5a4a3c'),
  ...[0, 1, 2].map(i => rect(110 + i * 370, 830, 330, 380, '#665444', {r: 10, stroke: INK, lineWidth: 3})), ...[0, 1, 2].map(i => rect(250 + i * 370, 860, 50, 14, '#c9b28a', {r: 7})),
  rect(72, 1250, 1136, 208, '#2c3238'), line([[72, 1250], [1208, 1250]], {color: INK, lineWidth: 4}),
];
// Foil box, front view, local 820×200. lid lifts via lidKeys. o.roll: show roll stub ends.
function box(x, y, s, o = {}) {
  return grp([
    rect(0, 50, 820, 150, CARD, {r: 10, stroke: INK, lineWidth: 5}), rect(0, 110, 820, 50, o.band ?? BAND),
    text(o.label ?? 'FOIL', 330, 112, 44, {color: C.white}),
    grp([rect(0, 0, 820, 80, '#c3cbd3', {r: 10, stroke: INK, lineWidth: 5}), pathL([['M', 10, 80], ...Array.from({length: 40}, (_, i) => ['L', 10 + (i + 0.5) * 20, i % 2 ? 80 : 92]), ['L', 810, 80]], {fill: 'none', stroke: '#7d8893', lineWidth: 4})],
      {pivotX: 0, pivotY: 0, keys: o.lidKeys}),
    ...(o.tabs ? [ell(-8, 100, 22, 40, C.amber, {keys: o.tabKeyL}), ell(806, 100, 22, 40, C.amber, {keys: o.tabKeyR})] : []),
  ], {x, y, scaleX: s, scaleY: s, keys: o.keys});
}
const roll = (keys) => grp([rect(0, 0, 470, 64, FOIL, {r: 12, stroke: INK, lineWidth: 4}), rect(0, 40, 470, 12, FOIL2), ell(-14, 0, 30, 64, FOIL2, {stroke: INK, lineWidth: 3}), ell(-6, 20, 16, 24, TUBE), ell(456, 0, 30, 64, FOIL2, {stroke: INK, lineWidth: 3})],
  {pivotX: 235, pivotY: 32, keys});
const sheet = (x, y, w, keys, h = 190) => grp([rect(0, 0, w, h, FOIL, {stroke: '#7d8893', lineWidth: 3}), ...[0, 1, 2].map(i => line([[20 + i * 60, 30 + i * 40], [w - 40 - i * 30, 60 + i * 40]], {color: 'rgba(255,255,255,0.6)', lineWidth: 4}))],
  {x, y, pivotX: 0, pivotY: 0, keys});
const ball = (x, y, r, keys) => grp([pathL([['M', 0, -r], ['L', r * 0.7, -r * 0.6], ['L', r, 0], ['L', r * 0.6, r * 0.8], ['L', -r * 0.2, r], ['L', -r, r * 0.4], ['L', -r * 0.8, -r * 0.5], ['Z']], {fill: FOIL, stroke: INK, lineWidth: 3}), line([[-r * 0.4, -r * 0.2], [r * 0.4, r * 0.3]], {color: '#8d969f', lineWidth: 3})], {x, y, keys});
// Box end close-up: square panel with the perforated tab around (640,700)
function endPanel(o = {}) {
  const arc = Array.from({length: 18}, (_, i) => { const a = Math.PI * (1.05 + i * 0.05); return [640 + Math.cos(a) * 95, 720 + Math.sin(a) * 95]; });
  const perf = []; for (let i = 0; i < arc.length - 1; i += 2) perf.push(line([arc[i], arc[i + 1]], {color: '#4b555e', lineWidth: 6}));
  return [
    rect(370, 380, 540, 640, CARD, {r: 14, stroke: INK, lineWidth: 7}), rect(370, 820, 540, 120, BAND),
    ...[0, 1, 2].map(i => line([[370, 400 + i * 10], [910, 400 + i * 10]], {color: 'rgba(0,0,0,0.05)', lineWidth: 3})),
    grp(perf, {keys: o.perfKeys}), line([[545, 720], [735, 720]], {color: '#4b555e', lineWidth: 4}),
    text('PRESS HERE', 566, 650, 26, {color: '#2a2f35', keys: o.textKeys}), text('TO LOCK END', 560, 682, 26, {color: '#2a2f35', keys: o.textKeys}),
    pathL([['M', 545, 720], ['Q', 640, 560, 735, 720], ['Z']], {fill: '#5d6770', alpha: 0, keys: o.pushKeys}),
    text('FOIL', 590, 850, 56, {color: C.white}),
  ];
}
const finger = (keys) => grp([rect(0, 0, 70, 260, '#f0e6d8', {r: 35, stroke: INK, lineWidth: 4}), rect(12, 14, 46, 40, '#f8f1e8', {r: 14})], {keys});
// Side cross-section: box wall with hinged tab, roll tube
function section(t0, o = {}) {
  return [
    rect(560, 520, 600, 360, FOIL, {r: 20, stroke: INK, lineWidth: 5}), ...[0, 1, 2, 3].map(i => line([[560, 560 + i * 26], [1160, 560 + i * 26]], {color: FOIL2, lineWidth: 4})), ...[0, 1, 2, 3].map(i => line([[560, 760 + i * 26], [1160, 760 + i * 26]], {color: FOIL2, lineWidth: 4})),
    rect(560, 650, 600, 100, TUBE, {stroke: INK, lineWidth: 4, keys: o.tubeKeys}), rect(560, 668, 600, 64, '#3a2c20'),
    rect(500, 380, 30, 260, CARD, {stroke: INK, lineWidth: 4}), rect(500, 760, 30, 300, CARD, {stroke: INK, lineWidth: 4}),
    grp([rect(0, 0, 30, 120, C.amber, {stroke: INK, lineWidth: 4})], {x: 500, y: 640, pivotX: 15, pivotY: 0, keys: [{t: 0, angle: 0}, {t: t0, angle: 0}, {t: t0 + 0.4, angle: -1.15}]}),
    text('BOX END', 250, 420, 40, {color: C.light}), text('TAB', 330, 680, 44, {color: C.amber}), text('TUBE', 830, 900, 44, {color: '#d8a878'}),
  ];
}
const A = {x: 330, y: 1250 - 582 * 1.1, s: 1.1};
const L = (X, Y) => [(X - A.x) / A.s, (Y - A.y) / A.s];

export const scenes = [
  // You've been fighting / your foil box for years.
  ({d, cues}) => ({layers: [...chrome(9, 'THE FOIL WAR', 0.1),
    ...kitchen({wall: [text('IIII IIII IIII', 760, 380, 60, {color: C.amber, keys: fadeIn(cues[1])}), text('YEARS', 800, 450, 36, {color: C.mid, keys: fadeIn(cues[1] + 0.2)})]}),
    box(600, 640, 0.6),
    sheet(612, 742, 470, [{t: 0, scaleY: 0.05}, {t: 0.5, scaleY: 0.8}, {t: 0.7, scaleY: 0.6}, {t: 1.1, scaleY: 0.95}, {t: 1.3, scaleY: 0.7}, {t: 1.8, scaleY: 1}]),
    actor(A.x, A.y, A.s, {R: [{t: 0, at: L(640, 760)}, {t: 0.5, at: L(640, 900)}, {t: 0.7, at: L(640, 860)}, {t: 1.1, at: L(640, 920)}, {t: 1.3, at: L(640, 870)}, {t: 1.8, at: L(640, 930)}], L: [{t: 0, at: 'hips'}], keys: jitter(0.4, A.x, 5, 14, 0.1)}),
    ...[[200, 1220, 30], [980, 1230, 26], [1100, 1210, 34], [140, 1236, 22]].map(([x, y, r], i) => ball(x, y, r, [{t: 0, alpha: 0}, {t: 0.3 + i * 0.35, alpha: 0, y: y - 60}, {t: 0.5 + i * 0.35, alpha: 1, y}])),
    sweat(A.x + 140, A.y + 10, 0.6),
  ], sfx: [0.5, 1.1, 1.8].map(t => ({time: t, kind: 'paper', gain: 0.035}))}),

  // You pull the foil, / and the whole roll jumps out.
  ({cues}) => ({layers: [...chrome(9, 'THE GREAT ESCAPE', cues[1]),
    ...kitchen(),
    box(600, 640, 0.6, {lidKeys: [{t: 0, angle: 0}, {t: cues[1], angle: 0}, {t: cues[1] + 0.15, angle: -0.6}, {t: cues[1] + 0.6, angle: -0.2}]}),
    grp([roll([{t: 0, x: 612, y: 676, angle: 0}, {t: cues[1], x: 612, y: 676, angle: 0}, {t: cues[1] + 0.35, x: 640, y: 380, angle: -0.6}, {t: cues[1] + 0.8, x: 700, y: 1150, angle: -2.6}])], {}),
    sheet(612, 742, 470, [{t: 0, scaleY: 0.05}, {t: cues[1], scaleY: 0.8}, {t: cues[1] + 0.2, alpha: 1}, {t: cues[1] + 0.3, alpha: 0}]),
    actor(A.x, A.y, A.s, {R: [{t: 0, at: L(640, 760)}, {t: cues[1], at: L(640, 900)}, {t: cues[1] + 0.25, at: 'up'}], L: [{t: 0, at: 'hips'}, {t: cues[1] + 0.25, at: 'up'}]}),
    ...shakeLines(880, 560, 80, cues[1] + 0.2),
  ], sfx: [{time: 0.2, kind: 'paper', gain: 0.03}, {time: cues[1] + 0.05, kind: 'pop', gain: 0.05}, {time: cues[1] + 0.8, kind: 'tap', gain: 0.05}]}),

  // Get back in there!  (character)
  ({d}) => ({layers: [...chrome(9, 'GET BACK IN THERE!'),
    ...kitchen(),
    box(600, 640, 0.6),
    roll([{t: 0, x: 600, y: 1170, angle: 0}, {t: d, x: 980, y: 1170, angle: 0}]),
    actor(A.x, A.y, A.s, {R: [{t: 0, at: [250, 330]}, {t: 0.15, at: [260, 300]}, {t: 0.3, at: [250, 330]}, {t: 0.45, at: [260, 300]}], L: [{t: 0, at: 'hips'}], keys: jitter(0, A.x, 8, 10, 0.08)}),
    bubble('GET BACK IN THERE!', 460, 300, 0.02, {size: 50}),
  ], sfx: [{time: 0.05, kind: 'pop', gain: 0.04}, {time: 0.3, kind: 'tap', gain: 0.03}]}),

  // But look at / the ends of the box.
  ({d, cues}) => ({layers: [...chrome(9, 'LOOK AT THE ENDS', cues[1]),
    ...kitchen(),
    box(230, 560, 1.0, {keys: [{t: 0, x: 600, y: 640, scaleX: 0.6, scaleY: 0.6}, {t: 0.6, x: 230, y: 560, scaleX: 1, scaleY: 1}]}),
    ring(230, 700, 70, 120, cues[1]), ring(1050, 700, 70, 120, cues[1] + 0.15),
  ], sfx: [{time: 0.2, kind: 'paper', gain: 0.025}, {time: cues[1] + 0.2, kind: 'tap', gain: 0.04}, {time: cues[1] + 0.35, kind: 'tap', gain: 0.04}]}),

  // On many foil / and plastic wrap boxes, / there's a little tab.
  ({cues}) => ({layers: [...chrome(9, 'THE SECRET TAB', cues[2]),
    rect(72, 172, 1136, 1286, '#2b333c'),
    grp([box(180, 300, 0.5)], {to: cues[2], keys: fadeIn(0, 0.2)}),
    grp([box(180, 520, 0.5, {band: '#3f9a63', label: 'WRAP'})], {to: cues[2], keys: [{t: 0, alpha: 0}, {t: cues[1], alpha: 0}, {t: cues[1] + 0.2, alpha: 1}]}),
    grp([...endPanel({perfKeys: [{t: 0, alpha: 0}, {t: cues[2] + 0.3, alpha: 0}, {t: cues[2] + 0.6, alpha: 1}], textKeys: [{t: 0, alpha: 0}, {t: cues[2] + 0.6, alpha: 0}, {t: cues[2] + 0.8, alpha: 1}]})], {from: cues[2], keys: [{t: cues[2], alpha: 0}, {t: cues[2] + 0.25, alpha: 1}]}),
    ring(640, 690, 150, 110, cues[2] + 0.6),
  ], sfx: [{time: 0.1, kind: 'pop', gain: 0.03}, {time: cues[1] + 0.1, kind: 'pop', gain: 0.03}, {time: cues[2] + 0.7, kind: 'chime', gain: 0.03}]}),

  // It often says: / press here to lock end.
  ({cues}) => ({layers: [...chrome(9, 'IT LITERALLY SAYS IT', cues[1]),
    rect(72, 172, 1136, 1286, '#2b333c'),
    ...endPanel(),
    grp([rect(0, 0, 180, 30, 'rgba(224,162,74,0.55)', {r: 6})], {x: 558, y: 646, pivotX: 0, scaleX: 0.01, keys: [{t: 0, scaleX: 0.01}, {t: cues[1], scaleX: 0.01}, {t: cues[1] + 0.4, scaleX: 1}]}),
    grp([rect(0, 0, 196, 30, 'rgba(224,162,74,0.55)', {r: 6})], {x: 552, y: 678, pivotX: 0, scaleX: 0.01, keys: [{t: 0, scaleX: 0.01}, {t: cues[1] + 0.4, scaleX: 0.01}, {t: cues[1] + 0.8, scaleX: 1}]}),
    marks('!!', 960, 520, cues[1] + 0.9, C.amber, 110),
  ], sfx: [{time: cues[1] + 0.1, kind: 'paper', gain: 0.025}, {time: cues[1] + 0.9, kind: 'pop', gain: 0.035}]}),

  // Push it in, / and it pokes into / the roll's cardboard tube.
  ({cues}) => ({layers: [...chrome(9, 'IT HOOKS THE TUBE', cues[2]),
    rect(72, 172, 1136, 1286, '#2b333c'),
    grp([...endPanel({pushKeys: [{t: 0, alpha: 0}, {t: 0.45, alpha: 0}, {t: 0.55, alpha: 1}]}), finger([{t: 0, x: 690, y: 980, angle: 0.5}, {t: 0.45, x: 610, y: 700, angle: 0.3}, {t: 0.7, x: 610, y: 700}, {t: cues[1] - 0.1, x: 760, y: 980}])], {to: cues[1]}),
    grp(section(cues[1] + 0.3, {tubeKeys: [{t: 0, alpha: 1}]}), {from: cues[1], keys: [{t: cues[1], alpha: 0}, {t: cues[1] + 0.2, alpha: 1}]}),
    ring(860, 700, 330, 80, cues[2], {color: C.green}),
  ], sfx: [{time: 0.5, kind: 'tap', gain: 0.05}, {time: cues[1] + 0.5, kind: 'paper', gain: 0.03}, {time: cues[2] + 0.2, kind: 'chime', gain: 0.025}]}),

  // Now the roll stays put, / and only the foil comes out.
  ({cues}) => ({layers: [...chrome(9, 'ROLL STAYS. FOIL GOES.', cues[1]),
    ...kitchen(),
    box(600, 640, 0.6, {tabs: true, lidKeys: [{t: 0, angle: 0}, {t: 0.5, angle: -0.08}, {t: 0.7, angle: 0}]}),
    sheet(612, 742, 470, [{t: 0, scaleY: 0.05}, {t: cues[1], scaleY: 0.5}, {t: cues[1] + 0.8, scaleY: 1}]),
    actor(A.x, A.y, A.s, {R: [{t: 0, at: L(640, 760)}, {t: cues[1], at: L(640, 840)}, {t: cues[1] + 0.8, at: L(640, 930)}], L: [{t: 0, at: 'hips'}]}),
    check(980, 380, 1.2, cues[1] + 0.9),
  ], sfx: [{time: 0.5, kind: 'tap', gain: 0.03}, {time: cues[1] + 0.3, kind: 'paper', gain: 0.035}, {time: cues[1] + 0.95, kind: 'chime', gain: 0.03}]}),

  // It was there the whole time?!  (character)
  () => ({layers: [...chrome(9, 'THE WHOLE TIME?!'),
    ...kitchen(),
    box(600, 640, 0.6, {tabs: true}),
    actor(A.x, A.y, A.s, {R: [{t: 0, at: 'down'}, {t: 0.15, at: 'face'}], L: [{t: 0, at: 'down'}, {t: 0.2, at: 'shrug'}], headKeys: [{t: 0, angle: 0}, {t: 0.3, angle: 0.2}]}),
    bubble('IT WAS THERE THE WHOLE TIME?!', 600, 300, 0.02, {size: 44}),
    sweat(A.x + 20, A.y + 10, 0.2),
  ], sfx: [{time: 0.15, kind: 'tap', gain: 0.04}]}),

  // Yep. Right there. / The whole time.
  ({cues}) => ({layers: [...chrome(9, 'YEP. RIGHT THERE.'),
    rect(72, 172, 1136, 1286, '#2b333c'),
    pathL([['M', 560, 172], ['L', 720, 172], ['L', 820, 900], ['L', 460, 900], ['Z']], {fill: 'rgba(255,240,180,0.18)', keys: fadeIn(0.05, 0.2)}),
    ...endPanel(),
    ring(640, 690, 150, 110, 0.15, {color: C.amber}),
    stamp('THE WHOLE TIME.', 640, 1230, cues[1], {size: 80}),
  ], sfx: [{time: 0.1, kind: 'chime', gain: 0.025}, {time: cues[1] + 0.05, kind: 'pop', gain: 0.045}]}),

  // Some boxes even have / one on each end.
  ({cues}) => ({layers: [...chrome(9, 'CHECK BOTH ENDS', cues[1]),
    rect(72, 172, 1136, 1286, '#2b333c'),
    box(230, 600, 1.0, {tabs: true, tabKeyL: [{t: 0, alpha: 0}, {t: cues[1], alpha: 0}, {t: cues[1] + 0.2, alpha: 1}], tabKeyR: [{t: 0, alpha: 0}, {t: cues[1] + 0.35, alpha: 0}, {t: cues[1] + 0.55, alpha: 1}]}),
    ring(232, 720, 60, 90, cues[1] + 0.1, {color: C.amber}), ring(1048, 720, 60, 90, cues[1] + 0.45, {color: C.amber}),
    text('LEFT', 170, 860, 40, {color: C.amber, keys: fadeIn(cues[1] + 0.2)}), text('RIGHT', 980, 860, 40, {color: C.amber, keys: fadeIn(cues[1] + 0.55)}),
  ], sfx: [{time: cues[1] + 0.2, kind: 'pop', gain: 0.035}, {time: cues[1] + 0.55, kind: 'pop', gain: 0.035}]}),

  // Small tab. / Zero foil tantrums.
  ({cues}) => ({layers: [...chrome(9, 'PEACE IN THE KITCHEN', 0.1),
    ...kitchen(),
    box(600, 640, 0.6, {tabs: true}),
    sheet(612, 742, 470, [{t: 0, scaleY: 1}]),
    ...[[200, 1220, 30], [980, 1230, 26], [1100, 1210, 34], [140, 1236, 22]].map(([x, y, r], i) => ball(x, y, r, [{t: 0, alpha: 1}, {t: cues[1] + i * 0.1, alpha: 1}, {t: cues[1] + 0.2 + i * 0.1, alpha: 0}])),
    actor(A.x, A.y, A.s, {R: [{t: 0, at: 'hips'}], L: [{t: 0, at: 'hips'}], headKeys: [{t: 0, angle: 0}, {t: 0.5, angle: -0.1}]}),
    ...[[700, 860], [1000, 980], [820, 1080]].map(([x, y], i) => star(x, y, 26, [{t: 0, alpha: 0}, {t: 0.2 + i * 0.12, alpha: 1}])),
    stamp('ZERO TANTRUMS', 640, 420, cues[1] + 0.1, {size: 80, color: C.green}),
  ], sfx: [{time: 0.2, kind: 'chime', gain: 0.025}, {time: cues[1] + 0.15, kind: 'pop', gain: 0.045}]}),

  // Follow for more / hidden designs.
  () => ({layers: endCard2(9, ICONS.map(f => () => f())), sfx: [0.3, 0.46, 0.62, 0.78, 0.94].map(t => ({time: t, kind: 'pop', gain: 0.03}))}),
];
