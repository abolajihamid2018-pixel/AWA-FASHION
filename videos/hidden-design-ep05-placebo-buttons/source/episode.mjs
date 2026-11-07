// EP.05 — Placebo buttons (elevator close button, crosswalk buttons, fake thermostats)
import {C, INK, rect, ell, grp, pathL, line, text, ctext, chrome, fadeIn, fadeOut, pop, draw, ring, star, cross, check, heart,
  actor, bubble, stamp, sweat, marks, shakeLines, shadow, hop, jitter, endCard2, ICONS} from '../../hidden-design-series/lib.mjs';
export const ep = 5;

// ---------- props ----------
const METAL = '#3a4048';
// Elevator button panel, local 300×640. close button centre (210,445), key slot (150,560)
function elevPanel(x, y, s, o = {}) {
  const num = (n, cx, cy) => [ell(cx - 45, cy - 45, 90, 90, C.light, {stroke: INK, lineWidth: 4}), text(String(n), cx - 13, cy - 26, 46, {color: '#2a2f35'})];
  return grp([
    rect(0, 0, 300, 640, METAL, {r: 26, stroke: INK, lineWidth: 5}), rect(16, 16, 20, 608, '#4a525b', {r: 10}),
    ...num(1, 90, 80), ...num(2, 210, 80), ...num(3, 90, 200), ...num(4, 210, 200), ...num(5, 90, 320), ...num(6, 210, 320),
    // open  ◀|▶
    ell(45, 400, 90, 90, C.light, {stroke: INK, lineWidth: 4}), pathL([['M', 84, 425], ['L', 62, 445], ['L', 84, 465], ['Z']], {fill: '#2a2f35'}), pathL([['M', 96, 425], ['L', 118, 445], ['L', 96, 465], ['Z']], {fill: '#2a2f35'}),
    // close ▶|◀
    ell(165, 400, 90, 90, o.closeFill ?? C.light, {stroke: INK, lineWidth: 4, keys: o.closeKeys}), pathL([['M', 184, 425], ['L', 206, 445], ['L', 184, 465], ['Z']], {fill: '#2a2f35'}), pathL([['M', 236, 425], ['L', 214, 445], ['L', 236, 465], ['Z']], {fill: '#2a2f35'}),
    text('FIRE', 122, 512, 22, {color: C.red}), rect(110, 540, 80, 40, '#22262b', {r: 8, stroke: INK, lineWidth: 3}), rect(146, 548, 8, 24, '#0e1012', {r: 3}),
    ...(o.extra || []),
  ], {x, y, scaleX: s, scaleY: s, keys: o.keys});
}
// Elevator interior seen from inside: hallway, sliding doors, side walls, floor. doorL/doorR = x-keys for the door leaves
function elevator(o = {}) {
  return [
    rect(200, 260, 440, 990, '#2b3540'), rect(200, 1060, 440, 190, '#384452'),                       // hallway beyond
    ...(o.hall || []),
    grp([rect(0, 0, 220, 990, '#8d969f', {stroke: INK, lineWidth: 4}), rect(180, 20, 20, 950, '#7b848d')], {x: 200, y: 260, keys: o.doorL}),
    grp([rect(0, 0, 220, 990, '#8d969f', {stroke: INK, lineWidth: 4}), rect(20, 20, 20, 950, '#7b848d')], {x: 420, y: 260, keys: o.doorR}),
    rect(0, 172, 69, 1286, '#111316'), rect(72, 172, 128, 1286, '#5c656e'), rect(640, 172, 568, 1286, '#5c656e'), rect(72, 172, 1136, 88, '#4a535c'),
    rect(72, 1250, 1136, 208, '#3a4249'), line([[72, 1250], [1208, 1250]], {color: INK, lineWidth: 4}),
    line([[660, 900], [1190, 900]], {color: '#9aa3ac', lineWidth: 12}),                                // handrail
    rect(380, 196, 80, 44, '#1b1f23', {r: 8}), text(o.floorNo ?? '3', 404, 198, 36, {color: C.amber}),
  ];
}
const press = (t0, n, gap, at, rest = 'down') => { const k = [{t: 0, at: rest}]; for (let i = 0; i < n; i++) k.push({t: t0 + i * gap, at}, {t: t0 + i * gap + gap / 2, at: [at[0] - 22, at[1] + 26]}); k.push({t: t0 + n * gap, at}); return k; };
// Crosswalk street: road, zebra, sidewalk, pole with button box. button centre ≈ (930, 800)
function street(o = {}) {
  return [
    rect(72, 172, 1136, 430, '#1f2a36'), ...[[120, 260, 160, 340], [320, 200, 200, 400], [560, 300, 140, 300], [740, 230, 180, 370], [960, 280, 220, 320]].map(([x, y, w, h]) => rect(x, y, w, h, '#28323d', {stroke: '#323d49', lineWidth: 3})),
    rect(72, 600, 1136, 380, '#2a2e33'), ...[0, 1, 2, 3, 4, 5, 6].map(i => rect(110 + i * 150, 760, 90, 160, '#cfd3d6', {alpha: 0.85})),
    ...(o.traffic || []),
    rect(72, 980, 1136, 478, '#454b52'), line([[72, 980], [1208, 980]], {color: INK, lineWidth: 5}),
    rect(915, 300, 34, 1000, '#59616a', {r: 10, stroke: INK, lineWidth: 4}),
    rect(860, 300, 150, 150, '#22262b', {r: 16, stroke: INK, lineWidth: 4}),
    grp([rect(0, 30, 54, 60, C.red, {r: 18}), ...[0, 1, 2, 3].map(i => rect(2 + i * 13, 0, 11, 44, C.red, {r: 5})), rect(-14, 44, 30, 16, C.red, {r: 8, angle: -0.5})], {x: 908, y: 330, keys: o.handKeys}),
    rect(880, 740, 110, 130, '#d6b14a', {r: 18, stroke: INK, lineWidth: 4}), ell(905, 772, 60, 60, '#c0c5ca', {stroke: INK, lineWidth: 4}), text('PUSH', 897, 836, 22, {color: '#2a2f35'}),
  ];
}
const car = (keys, col = C.red) => grp([rect(0, 30, 360, 90, col, {r: 30, stroke: INK, lineWidth: 4}), pathL([['M', 70, 34], ['Q', 110, -30, 240, -6], ['L', 290, 34], ['Z']], {fill: col, stroke: INK, lineWidth: 4}),
  rect(110, 0, 70, 34, C.air, {r: 6}), rect(190, 2, 70, 32, C.air, {r: 6}), ell(50, 90, 76, 76, '#1a1c1f', {stroke: C.mid, lineWidth: 6}), ell(240, 90, 76, 76, '#1a1c1f', {stroke: C.mid, lineWidth: 6})], {y: 660, keys});
// Office wall with thermostat (local 220×300) at (860,520). display text swaps
function office(o = {}) {
  return [
    rect(72, 172, 1136, 1078, '#3c4650'), rect(140, 300, 360, 420, '#9fc3e0', {stroke: INK, lineWidth: 6}), ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => rect(140, 310 + i * 52, 360, 30, '#d9dde1')),
    rect(72, 1250, 1136, 208, '#2c3238'), line([[72, 1250], [1208, 1250]], {color: INK, lineWidth: 4}),
    rect(160, 1080, 330, 30, '#7a5a3c', {r: 6, stroke: INK, lineWidth: 3}), rect(180, 1110, 24, 140, '#5d4630'), rect(446, 1110, 24, 140, '#5d4630'),
    ...(o.cutaway || []),
    rect(860, 520, 220, 300, '#e9ecee', {r: 30, stroke: INK, lineWidth: 5}), rect(890, 560, 160, 100, '#1b2a22', {r: 12}),
    ...(o.display || [text('70°', 912, 572, 64, {color: C.green})]),
    ell(900, 700, 64, 64, C.light, {stroke: INK, lineWidth: 4}), pathL([['M', 916, 742], ['L', 932, 716], ['L', 948, 742], ['Z']], {fill: '#2a2f35'}),
    ell(1000, 700, 64, 64, C.light, {stroke: INK, lineWidth: 4}), pathL([['M', 1016, 718], ['L', 1032, 744], ['L', 1048, 718], ['Z']], {fill: '#2a2f35'}),
  ];
}
const wheelchair = (keys) => grp([
  ell(0, 260, 230, 230, 'none', {stroke: '#9aa3ac', lineWidth: 14}), ell(70, 330, 90, 90, '#59616a'), ell(250, 410, 70, 70, 'none', {stroke: '#9aa3ac', lineWidth: 10}),
  pathL([['M', 40, 300], ['L', 230, 300], ['L', 280, 420]], {fill: 'none', stroke: '#9aa3ac', lineWidth: 12}),
  rect(30, 100, 110, 220, C.white, {r: 44, stroke: INK, lineWidth: 3}), ell(35, -14, 110, 110, C.white, {stroke: INK, lineWidth: 3}),
  rect(90, 260, 170, 52, C.soft, {r: 26, stroke: INK, lineWidth: 3}), rect(220, 270, 46, 150, C.soft, {r: 23, stroke: INK, lineWidth: 3}),
  rect(80, 140, 34, 150, C.white, {r: 17, stroke: INK, lineWidth: 3, angle: -0.4}),
], {keys, scaleX: 0.9, scaleY: 0.9});

// close button in screen space for panel at (860,520) s=0.75
const CB = [860 + 210 * 0.75, 520 + 445 * 0.75];
const A = {x: 680, y: 1250 - 582 * 1.2, s: 1.2};
const toLocal = ([X, Y], a = A) => [(X - a.x) / a.s, (Y - a.y) / a.s];

export const scenes = [
  // That door close button / in the elevator?
  ({d, cues}) => ({layers: [...chrome(5, 'THE "CLOSE" BUTTON', 0.2),
    rect(72, 172, 1136, 1286, '#5c656e'), rect(72, 172, 1136, 1286, 'rgba(0,0,0,0.15)'),
    elevPanel(490, 230, 1.6, {keys: [{t: 0, scaleX: 1.35, scaleY: 1.35, alpha: 0}, {t: 0.35, scaleX: 1.6, scaleY: 1.6, alpha: 1}, {t: d, scaleX: 1.68, scaleY: 1.68}]}),
    ring(490 + 210 * 1.6, 230 + 445 * 1.6, 92, 92, cues[1]),
  ], sfx: [{time: 0.1, kind: 'pop', gain: 0.03}, {time: cues[1] + 0.2, kind: 'tap', gain: 0.045}]}),

  // Bad news.
  () => ({layers: [...chrome(5, null),
    rect(72, 172, 1136, 1286, '#5c656e'), elevPanel(490, 230, 1.6),
    stamp('BAD NEWS.', 640, 820, 0.05, {size: 120}),
  ], sfx: [{time: 0.1, kind: 'pop', gain: 0.05}]}),

  // Come on, come on, come on!  (character)
  ({d}) => ({layers: [...chrome(5, 'WE ALL DO THIS'),
    ...elevator({doorL: [{t: 0, x: 120}], doorR: [{t: 0, x: 500}], hall: [shadow(420, 1250, 300)]}),
    elevPanel(860, 520, 0.75, {closeKeys: [{t: 0, alpha: 1}]}),
    actor(A.x, A.y, A.s, {R: press(0.05, 4, 0.26, toLocal(CB)), L: [{t: 0, at: 'hips'}], keys: jitter(0.05, A.x, 6, 12, 0.09)}),
    bubble('COME ON, COME ON!', 560, 300, 0.05, {size: 48, tail: 40}),
    ...shakeLines(CB[0], CB[1], 60, 0.1),
  ], sfx: [0.12, 0.38, 0.64, 0.9].map(t => ({time: t, kind: 'tap', gain: 0.05}))}),

  // In many elevators, / it doesn't do anything.
  ({cues}) => ({layers: [...chrome(5, 'IT\'S NOT CONNECTED', cues[1]),
    rect(72, 172, 1136, 1286, '#5c656e'),
    rect(150, 260, 980, 1100, '#22282e', {r: 30, stroke: INK, lineWidth: 5, keys: fadeIn(0.1, 0.3)}),
    elevPanel(220, 330, 1.25),
    pathL([['M', 495, 890], ['C', 640, 900, 700, 760, 820, 820], ['C', 900, 860, 900, 980, 980, 1000]], {fill: 'none', stroke: C.amber, lineWidth: 12, ...draw(0.2, 0.5)}),
    grp([rect(0, 0, 70, 46, '#c9ced3', {r: 10, stroke: INK, lineWidth: 3}), rect(70, 8, 30, 8, C.amber), rect(70, 30, 30, 8, C.amber)], {x: 960, y: 980, angle: 0.5, keys: [{t: 0.7, alpha: 0}, {t: 0.8, alpha: 1}, {t: 1.0, angle: 0.4}, {t: 1.3, angle: 0.6}, {t: 1.6, angle: 0.45}]}),
    stamp('DOES NOTHING', 640, 1230, cues[1] + 0.1, {size: 80}),
  ], sfx: [{time: 0.3, kind: 'paper', gain: 0.025}, {time: cues[1] + 0.15, kind: 'pop', gain: 0.045}]}),

  // In the US, / accessibility rules say / the doors must stay open / long enough for everyone.
  ({d, cues}) => ({layers: [...chrome(5, 'DOORS WAIT FOR EVERYONE', cues[2]),
    ...elevator({doorL: [{t: 0, x: 200}, {t: cues[2] - 0.3, x: 200}, {t: cues[2] + 0.3, x: -20}], doorR: [{t: 0, x: 420}, {t: cues[2] - 0.3, x: 420}, {t: cues[2] + 0.3, x: 640}],
      hall: [wheelchair([{t: 0, x: 210, y: 820, alpha: 0}, {t: cues[3] - 0.1, x: 210, alpha: 0}, {t: cues[3] + 0.1, alpha: 1}, {t: d, x: 340, y: 820}])]}),
    elevPanel(860, 520, 0.75),
    grp([rect(0, 0, 260, 320, '#e6e8ea', {r: 16, stroke: INK, lineWidth: 4}), rect(24, 24, 140, 26, '#9aa1a8', {r: 6}), ...[0, 1, 2, 3, 4].map(i => rect(24, 80 + i * 44, i % 2 ? 160 : 210, 14, C.dim, {r: 7})),
      ell(170, 220, 70, 70, '#2f6db3'), ell(196, 228, 18, 18, C.white), rect(200, 248, 10, 24, C.white, {r: 4})], {x: 860, y: 260, angle: 0.08, keys: [{t: 0, alpha: 0}, {t: cues[1], alpha: 0, y: 300}, {t: cues[1] + 0.25, alpha: 1, y: 260}]}),
    ...[0, 1, 2, 3].map(i => rect(250 + i * 90, 1150, 70, 30, C.green, {r: 8, keys: [{t: 0, alpha: 0}, {t: cues[3] + i * 0.25, alpha: 0}, {t: cues[3] + 0.1 + i * 0.25, alpha: 1}]})),
  ], sfx: [{time: cues[1] + 0.1, kind: 'paper', gain: 0.03}, {time: cues[2] + 0.1, kind: 'chime', gain: 0.02}]}),

  // So the close button / often only works / with a firefighter's key.
  ({cues}) => ({layers: [...chrome(5, 'FIREFIGHTERS ONLY', cues[2]),
    rect(72, 172, 1136, 1286, '#5c656e'),
    elevPanel(380, 220, 1.6, {closeKeys: [{t: 0, alpha: 1}],
      extra: [ell(165, 400, 90, 90, C.green, {alpha: 0, keys: [{t: 0, alpha: 0}, {t: cues[2] + 0.75, alpha: 0}, {t: cues[2] + 0.9, alpha: 0.8}]})]}),
    grp([pathL([['M', 0, 70], ['Q', 0, 0, 90, 0], ['Q', 180, 0, 180, 70], ['L', 210, 90], ['L', -30, 90], ['Z']], {fill: C.red, stroke: INK, lineWidth: 4}), rect(70, 20, 40, 50, C.amber, {r: 6})],
      {x: 840, y: 330, keys: [{t: 0, alpha: 0}, {t: cues[1], alpha: 0, y: 290}, {t: cues[1] + 0.25, alpha: 1, y: 330}]}),
    grp([ell(0, 0, 70, 70, 'none', {stroke: C.amber, lineWidth: 14}), rect(64, 28, 120, 16, C.amber, {r: 6}), rect(150, 40, 14, 22, C.amber)],
      {x: 900, y: 1080, pivotX: 164, pivotY: 36, keys: [{t: 0, alpha: 0, angle: 0}, {t: cues[2], alpha: 0, x: 900, y: 1080}, {t: cues[2] + 0.15, alpha: 1}, {t: cues[2] + 0.55, x: 456, y: 1080, angle: 0}, {t: cues[2] + 0.75, angle: 1.2}]}),
  ], sfx: [{time: cues[1] + 0.1, kind: 'pop', gain: 0.03}, {time: cues[2] + 0.55, kind: 'jingle', gain: 0.04}, {time: cues[2] + 0.8, kind: 'chime', gain: 0.025}]}),

  // You're not pressing a button. / You're pressing a feeling.
  ({cues}) => ({layers: [...chrome(5, 'PRESSING A FEELING', cues[1]),
    ...elevator({doorL: [{t: 0, x: 200}], doorR: [{t: 0, x: 420}]}),
    elevPanel(860, 520, 0.75),
    actor(A.x, A.y, A.s, {R: [{t: 0, at: 'down'}, {t: 0.4, at: toLocal(CB)}, {t: 1.4, at: toLocal(CB)}], L: [{t: 0, at: 'down'}, {t: cues[1] + 0.2, at: 'chest'}]}),
    heart(CB[0] - 60, CB[1] - 220, 0.7, [{t: 0, alpha: 0}, {t: cues[1], alpha: 0, scaleX: 0.3, scaleY: 0.3}, {t: cues[1] + 0.25, alpha: 1, scaleX: 0.8, scaleY: 0.8}, {t: cues[1] + 0.5, scaleX: 0.65, scaleY: 0.65}, {t: cues[1] + 0.75, scaleX: 0.8, scaleY: 0.8}]),
    ...[[CB[0] + 90, CB[1] - 120], [CB[0] - 140, CB[1] - 60], [CB[0] + 40, CB[1] - 300]].map(([x, y], i) => star(x, y, 22, [{t: 0, alpha: 0}, {t: cues[1] + 0.2 + i * 0.1, alpha: 0}, {t: cues[1] + 0.4 + i * 0.1, alpha: 1}])),
  ], sfx: [{time: 0.45, kind: 'tap', gain: 0.04}, {time: cues[1] + 0.2, kind: 'chime', gain: 0.025}]}),

  // And it's not just elevators.
  ({d}) => ({layers: [...chrome(5, 'NOT JUST ELEVATORS'),
    grp([...street()], {keys: [{t: 0, x: 1140, alpha: 0}, {t: 0.15, alpha: 1}, {t: 0.7, x: 0}]}),
    grp([rect(72, 172, 1136, 1286, '#5c656e'), elevPanel(490, 230, 1.6)], {keys: [{t: 0, x: 0}, {t: 0.7, x: -1140, alpha: 0.4}], to: 0.75}),
  ], sfx: [{time: 0.1, kind: 'paper', gain: 0.035}]}),

  // In New York, a 2004 report / found most crosswalk buttons / did nothing at all.
  ({d, cues}) => { const B = {x: 690, y: 1250 - 582 * 1.15, s: 1.15}; return {layers: [...chrome(5, 'CROSSWALK BUTTONS TOO', cues[1]),
    ...street({traffic: [car([{t: 0, x: -420}, {t: 1.6, x: 1250}], C.red), car([{t: 2.0, x: 1300}, {t: 3.8, x: -420}], '#2f6db3')]}),
    actor(B.x, B.y, B.s, {hat: 'cap', hatColor: '#2f6db3', R: press(0.3, 6, 0.32, toLocal([935, 800], B)), L: [{t: 0, at: 'down'}, {t: cues[2], at: 'hips'}]}),
    grp([rect(0, 0, 240, 300, '#e6e8ea', {r: 14, stroke: INK, lineWidth: 4}), text('2004', 52, 24, 52, {color: C.red}), ...[0, 1, 2, 3].map(i => rect(24, 110 + i * 40, i % 2 ? 140 : 190, 14, C.dim, {r: 7}))],
      {x: 150, y: 1010, angle: -0.08, keys: [{t: 0, alpha: 0}, {t: 0.3, alpha: 0, y: 1060}, {t: 0.6, alpha: 1, y: 1010}]}),
    stamp('NOTHING.', 640, 520, cues[2] + 0.1, {size: 110}),
  ], sfx: [{time: 0.3, kind: 'paper', gain: 0.025}, ...[0.3, 0.62, 0.94, 1.26, 1.58, 1.9].map(t => ({time: t, kind: 'tap', gain: 0.035})), {time: cues[2] + 0.15, kind: 'pop', gain: 0.05}]}; },

  // Any minute now.  (character)
  ({d}) => { const B = {x: 690, y: 1250 - 582 * 1.15, s: 1.15}; return {layers: [...chrome(5, 'STILL WAITING...'),
    ...street(),
    actor(B.x, B.y, B.s, {hat: 'cap', hatColor: '#2f6db3', L: [{t: 0, at: 'chest'}], R: [{t: 0, at: 'chest'}], legR: [{t: 0, angle: 0}, {t: 0.15, angle: -0.25}, {t: 0.3, angle: 0}, {t: 0.45, angle: -0.25}, {t: 0.6, angle: 0}, {t: 0.75, angle: -0.25}, {t: 0.9, angle: 0}]}),
    bubble('ANY MINUTE NOW...', 560, 360, 0.05, {size: 48, tail: 60}),
    ...[0, 1, 2].map(i => text('Z', 560 + i * 50, 560 - i * 50, 50 + i * 10, {color: C.mid, keys: [{t: 0, alpha: 0}, {t: 0.3 + i * 0.2, alpha: 0}, {t: 0.45 + i * 0.2, alpha: 1}]})),
  ], sfx: [{time: 0.15, kind: 'tap', gain: 0.02}, {time: 0.45, kind: 'tap', gain: 0.02}, {time: 0.75, kind: 'tap', gain: 0.02}]}; },

  // Some office thermostats / are fake too, / installed just to stop people / complaining about / the temperature.
  ({d, cues}) => { const T = {x: 560, y: 1250 - 582 * 1.15, s: 1.15}; const up = toLocal([932, 732], T); return {layers: [...chrome(5, 'FAKE THERMOSTATS', cues[1]),
    ...office({display: [68, 69, 70, 71, 72].map((n, i, a) => text(`${n}°`, 912, 572, 64, {color: C.green, from: i ? 0.4 + i * 0.3 : 0, ...(i < a.length - 1 ? {to: 0.4 + (i + 1) * 0.3} : {})})),
      cutaway: [rect(820, 820, 300, 380, '#15191d', {r: 20, stroke: C.amber, lineWidth: 5, keys: [{t: 0, alpha: 0}, {t: cues[2], alpha: 0}, {t: cues[2] + 0.3, alpha: 1}]}),
        ...[[940, C.red], [990, C.air]].map(([x, col], i) => pathL([['M', x, 820], ['C', x, 920, x + (i ? 60 : -60), 960, x + (i ? 30 : -40), 1060]], {fill: 'none', stroke: col, lineWidth: 10, keys: [{t: 0, alpha: 0}, {t: cues[2] + 0.2, alpha: 0}, {t: cues[2] + 0.4, alpha: 1}]})),
        text('NOT CONNECTED', 836, 1120, 30, {color: C.amber, keys: [{t: 0, alpha: 0}, {t: cues[2] + 0.4, alpha: 0}, {t: cues[2] + 0.6, alpha: 1}]})]}),
    actor(T.x, T.y, T.s, {tone: '#f0e6d8', R: press(0.35, 5, 0.3, up), L: [{t: 0, at: 'hips'}]}),
    actor(120, 1250 - 582 * 0.95, 0.95, {L: [{t: 0, at: 'down'}, {t: cues[3], at: 'hips'}], R: [{t: 0, at: 'down'}, {t: cues[3], at: 'hips'}], keys: [{t: 0, alpha: 0}, {t: cues[3] - 0.2, alpha: 0}, {t: cues[3], alpha: 1}]}),
    actor(330, 1250 - 582 * 0.95, 0.95, {tone: C.light, L: [{t: 0, at: 'down'}, {t: cues[4], at: 'up'}], R: [{t: 0, at: 'down'}, {t: cues[4], at: 'up'}], keys: [{t: 0, alpha: 0}, {t: cues[3], alpha: 0}, {t: cues[3] + 0.2, alpha: 1}]}),
    bubble('TOO COLD!', 210, 520, cues[3], {size: 40, fill: '#d8f0ff'}),
    bubble('TOO HOT!', 420, 400, cues[4], {size: 40, fill: '#ffd9c9'}),
    stamp('FAKE!', 980, 360, cues[2] + 0.5, {size: 90}),
  ], sfx: [...[0.4, 0.7, 1.0, 1.3, 1.6].map(t => ({time: t, kind: 'tap', gain: 0.035})), {time: cues[2] + 0.55, kind: 'pop', gain: 0.05}, {time: cues[3] + 0.05, kind: 'pop', gain: 0.025}, {time: cues[4] + 0.05, kind: 'pop', gain: 0.025}]}; },

  // They're called placebo buttons.
  () => ({layers: [...chrome(5, null),
    grp([rect(0, 0, 200, 140, C.red, {r: 70, stroke: INK, lineWidth: 6}), rect(160, 0, 200, 140, C.white, {r: 70, stroke: INK, lineWidth: 6}), rect(160, 6, 40, 128, C.red)],
      {x: 460, y: 620, angle: -0.35, pivotX: 180, pivotY: 70, keys: [{t: 0, alpha: 0, angle: -1.2, scaleX: 0.5, scaleY: 0.5}, {t: 0.35, alpha: 1, angle: -0.35, scaleX: 1, scaleY: 1}]}),
    ctext('PLACEBO', 980, 120, {color: C.white, keys: fadeIn(0.2)}),
    ctext('BUTTONS', 1120, 120, {color: C.red, keys: fadeIn(0.4)}),
  ], sfx: [{time: 0.3, kind: 'pop', gain: 0.04}, {time: 0.5, kind: 'chime', gain: 0.025}]}),

  // And honestly? / They kind of work, / because you feel in control.
  ({cues}) => ({layers: [...chrome(5, 'THEY KIND OF WORK', cues[1]),
    ...elevator({doorL: [{t: 0, x: 200}, {t: cues[1], x: 200}, {t: cues[1] + 0.8, x: 200}], doorR: [{t: 0, x: 420}]}),
    elevPanel(860, 520, 0.75),
    actor(A.x, A.y, A.s, {R: [{t: 0, at: 'down'}, {t: 0.3, at: toLocal(CB)}, {t: cues[2], at: toLocal(CB)}, {t: cues[2] + 0.3, at: 'up'}], L: [{t: 0, at: 'chin'}, {t: cues[2], at: 'chin'}, {t: cues[2] + 0.3, at: 'up'}], keys: hop(cues[2] + 0.3, A.y, 50, 2, 0.32)}),
    grp([rect(0, 0, 380, 50, C.inset, {r: 25, stroke: INK, lineWidth: 4}), grp([rect(6, 6, 368, 38, C.green, {r: 19})], {pivotX: 6, scaleX: 0.05, keys: [{t: 0, scaleX: 0.05}, {t: cues[1], scaleX: 0.05}, {t: cues[2] + 0.5, scaleX: 1}]}), text('IN CONTROL', 90, 66, 36, {color: C.green})],
      {x: 140, y: 300, keys: fadeIn(cues[1] - 0.2)}),
  ], sfx: [{time: 0.35, kind: 'tap', gain: 0.035}, {time: cues[2] + 0.3, kind: 'chime', gain: 0.03}]}),

  // Now go press one. / You know you want to.
  ({d, cues}) => ({layers: [...chrome(5, 'GO ON. PRESS IT.', cues[1]),
    ell(390, 760, 500, 200, '#2a2f35', {stroke: INK, lineWidth: 6}),
    rect(390, 640, 500, 220, '#2a2f35'),
    grp([ell(0, 0, 440, 180, '#e0533d', {stroke: INK, lineWidth: 6}), ell(80, 26, 180, 50, 'rgba(255,255,255,0.35)')], {x: 420, y: 560, pivotX: 220, pivotY: 90,
      keys: [{t: 0, scaleX: 1, scaleY: 1}, {t: 0.4, scaleX: 1.06, scaleY: 1.06}, {t: 0.8, scaleX: 1, scaleY: 1}, {t: 1.2, scaleX: 1.06, scaleY: 1.06}, {t: 1.6, scaleX: 1, scaleY: 1}, {t: 2.0, scaleX: 1.06, scaleY: 1.06}]}),
    ...shakeLines(640, 650, 270, 0.3),
    marks('!', 920, 360, cues[1], C.amber, 140),
  ], sfx: [{time: 0.3, kind: 'pop', gain: 0.03}, {time: cues[1], kind: 'jingle', gain: 0.03}]}),

  // Follow for more / hidden designs.
  () => ({layers: endCard2(5, ICONS.map(f => () => f())), sfx: [0.3, 0.46, 0.62, 0.78, 0.94].map(t => ({time: t, kind: 'pop', gain: 0.03}))}),
];
