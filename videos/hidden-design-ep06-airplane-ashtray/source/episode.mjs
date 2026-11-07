// EP.06 — Why airplane bathrooms still have ashtrays
import {C, INK, rect, ell, grp, pathL, line, text, ctext, chrome, fadeIn, pop, draw, ring, star, cross, check, strike,
  actor, bubble, stamp, sweat, marks, shakeLines, shadow, hop, jitter, endCard2, ICONS} from '../../hidden-design-series/lib.mjs';
export const ep = 6;

// ---------- props ----------
const cig = (o = {}) => grp([rect(0, 0, 120, 18, '#f2f2f0', {r: 4, stroke: INK, lineWidth: 2}), rect(0, 0, 34, 18, '#d79a52', {r: 4}), rect(116, 2, 10, 14, '#ff7a3d', {r: 3}),
  ...(o.smoke === false ? [] : [0, 1].map(i => pathL([['M', 128 + i * 10, 0], ['Q', 150 + i * 10, -30, 128 + i * 10, -60], ['Q', 108 + i * 10, -90, 132 + i * 10, -120]], {fill: 'none', stroke: 'rgba(200,205,210,0.6)', lineWidth: 6,
    keys: [{t: 0, alpha: 0.2}, {t: 0.4, alpha: 0.8}, {t: 0.8, alpha: 0.3}, {t: 1.2, alpha: 0.8}, {t: 1.6, alpha: 0.3}]})))], {...o.g});
const noSmoking = (x, y, s, keys) => grp([rect(0, 0, 220, 160, '#1b1f23', {r: 22, stroke: INK, lineWidth: 5}), ell(50, 20, 120, 120, '#f4f5f5'), rect(62, 74, 96, 14, '#2a2f35', {r: 3}), rect(62, 74, 22, 14, '#d79a52', {r: 3}),
  ell(50, 20, 120, 120, 'none', {stroke: C.red, lineWidth: 12}), line([[72, 42], [148, 118]], {color: C.red, lineWidth: 12})], {x, y, scaleX: s, scaleY: s, pivotX: 110, pivotY: 80, keys});
// Ashtray built into a door: metal plate with flap. local 150×120
const ashtray = (x, y, s = 1, o = {}) => grp([rect(0, 0, 150, 120, '#b9c0c6', {r: 14, stroke: INK, lineWidth: 4}), rect(14, 14, 122, 26, '#e3e7ea', {r: 6}),
  rect(22, 54, 106, 40, '#2a2f35', {r: 8, stroke: INK, lineWidth: 3}), rect(30, 62, 90, 10, '#596169', {r: 4}), ...(o.extra || [])], {x, y, scaleX: s, scaleY: s, keys: o.keys});
// Lavatory door, local 420×900; ashtray at (135,520)
const lavDoor = (x, y, s = 1, o = {}) => grp([rect(0, 0, 420, 900, '#d5dade', {r: 30, stroke: INK, lineWidth: 6}), rect(40, 40, 340, 340, '#c7cdd2', {r: 20}),
  rect(110, 70, 200, 60, '#1b1f23', {r: 10}), text(o.busy ? 'OCCUPIED' : 'VACANT', o.busy ? 130 : 146, 84, 30, {color: o.busy ? C.red : C.green}),
  ...(o.figure === false ? [] : [ell(180, 180, 60, 60, '#5d7fa8'), rect(176, 246, 68, 100, '#5d7fa8', {r: 24})]),
  rect(330, 440, 40, 120, '#9aa3ac', {r: 14, stroke: INK, lineWidth: 3}), ashtray(135, 520, 1, {keys: o.trayKeys}), ...(o.extra || [])], {x, y, scaleX: s, scaleY: s, keys: o.keys});
// Cabin interior (side view): bins, windows, seat rows with passenger heads
function cabin(o = {}) {
  const heads = o.heads ?? [];
  return [
    rect(72, 172, 1136, 1286, '#323b45'), pathL([['M', 72, 380], ['Q', 640, 170, 1208, 380], ['L', 1208, 172], ['L', 72, 172], ['Z']], {fill: '#262d35'}),
    rect(72, 300, 1136, 120, '#4c5661', {stroke: INK, lineWidth: 4}), ...[0, 1, 2, 3].map(i => line([[72 + 284 * (i + 1), 300], [72 + 284 * (i + 1), 420]], {color: INK, lineWidth: 3})),
    ...[0, 1, 2, 3, 4].map(i => grp([rect(0, 0, 90, 130, '#9fc3e0', {r: 40, stroke: '#cfd5db', lineWidth: 8})], {x: 150 + i * 220, y: 520})),
    rect(72, 1180, 1136, 278, '#2a3038'), line([[72, 1180], [1208, 1180]], {color: INK, lineWidth: 4}),
    ...[0, 1, 2, 3, 4].map(i => grp([...(heads[i] ? [ell(36, -80, 100, 100, C.white, {stroke: INK, lineWidth: 3, keys: heads[i]})] : []),
      rect(0, 0, 70, 420, '#2f6db3', {r: 26, stroke: INK, lineWidth: 4}), rect(40, 300, 150, 70, '#2f6db3', {r: 20, stroke: INK, lineWidth: 4}), rect(150, 360, 20, 120, '#59616a')], {x: 120 + i * 220, y: 760})),
    ...(o.extra || []),
  ];
}
const flame = (x, y, s, keys) => grp([pathL([['M', 60, 0], ['C', 100, 60, 130, 100, 110, 150], ['C', 100, 190, 20, 190, 10, 150], ['C', -10, 100, 30, 60, 60, 0], ['Z']], {fill: '#ff7a3d', stroke: INK, lineWidth: 3}),
  pathL([['M', 60, 70], ['C', 80, 110, 95, 130, 85, 155], ['C', 75, 178, 45, 178, 35, 155], ['C', 25, 130, 45, 110, 60, 70], ['Z']], {fill: '#ffd34d'})],
  {x, y, scaleX: s, scaleY: s, pivotX: 60, pivotY: 180, keys});
const flicker = (t0, s0, s1, dur) => { const k = [{t: 0, alpha: 0, scaleX: 0.01, scaleY: 0.01}, {t: t0, alpha: 0, scaleX: 0.01, scaleY: 0.01}]; for (let t = t0 + 0.1, i = 0; t < t0 + dur; t += 0.12, i++) { const g = s0 + (s1 - s0) * Math.min(1, (t - t0) / dur); k.push({t: +t.toFixed(3), alpha: 1, scaleX: g * (i % 2 ? 0.92 : 1.05), scaleY: g * (i % 2 ? 1.08 : 0.95)}); } return k; };
// Lavatory interior: mirror, sink, smoke detector, trash flap (flap centre ≈ 860,1010)
function lav(o = {}) {
  return [
    rect(72, 172, 1136, 1286, '#cfd5db'), rect(72, 172, 1136, 1286, 'rgba(30,36,44,0.55)'),
    rect(640, 280, 440, 360, '#9fb6c9', {r: 20, stroke: INK, lineWidth: 6}), line([[700, 320], [780, 400]], {color: 'rgba(255,255,255,0.5)', lineWidth: 10}),
    rect(600, 700, 520, 90, '#e3e7ea', {r: 20, stroke: INK, lineWidth: 5}), rect(840, 640, 24, 70, '#9aa3ac', {r: 8}),
    rect(620, 790, 480, 460, '#aeb6be', {stroke: INK, lineWidth: 5}),
    grp([rect(0, 0, 200, 90, '#8d969f', {r: 10, stroke: INK, lineWidth: 4}), text('PUSH', 62, 26, 34, {color: '#2a2f35'})], {x: 760, y: 960, pivotX: 100, pivotY: 0, keys: o.flapKeys}),
    ...(o.binInside || []),
    ell(300, 190, 140, 50, '#e9ecee', {stroke: INK, lineWidth: 4}), ell(355, 200, 30, 30, o.alarm ? C.red : '#9aa3ac', {keys: o.alarm}),
    rect(72, 1250, 1136, 208, '#3a4249'), line([[72, 1250], [1208, 1250]], {color: INK, lineWidth: 4}),
  ];
}
const book = (x, y, s, keys) => grp([rect(0, 0, 520, 360, '#e6e8ea', {r: 16, stroke: INK, lineWidth: 5}), line([[260, 0], [260, 360]], {color: INK, lineWidth: 4}),
  ...[0, 1, 2, 3, 4, 5].map(i => rect(30, 40 + i * 48, i % 3 === 2 ? 150 : 200, 14, C.dim, {r: 7})), ...[0, 1, 2, 3, 4, 5].map(i => rect(290, 40 + i * 48, i % 3 === 1 ? 140 : 200, 14, C.dim, {r: 7})),
  grp([rect(0, 0, 70, 22, C.white), pathL([['M', 10, 11], ['L', 60, 11]], {fill: 'none', stroke: '#2f6db3', lineWidth: 8})], {x: 400, y: 0})], {x, y, scaleX: s, scaleY: s, keys});

const SM = {x: 470, y: 1250 - 582 * 1.15, s: 1.15};

export const scenes = [
  // Smoking on planes / has been banned for decades.
  ({cues}) => ({layers: [...chrome(6, 'BANNED FOR DECADES', cues[1]),
    ...cabin({heads: [[{t: 0, x: 36}], [{t: 0, x: 36}], [{t: 0, x: 36}], [{t: 0, x: 36}], [{t: 0, x: 36}]]}),
    noSmoking(530, 430, 1.5, [{t: 0, alpha: 0.35, scaleX: 1.5, scaleY: 1.5}, {t: 0.5, alpha: 0.35}, {t: 0.6, alpha: 1, scaleX: 1.65, scaleY: 1.65}, {t: 0.8, scaleX: 1.5, scaleY: 1.5}]),
  ], sfx: [{time: 0.55, kind: 'chime', gain: 0.04}]}),

  // So why is there still / an ashtray in the bathroom?
  ({d, cues}) => ({layers: [...chrome(6, 'SO WHY IS THIS HERE?', cues[1]),
    rect(72, 172, 1136, 1286, '#3a434d'),
    lavDoor(430, 230, 1.15, {keys: [{t: 0, scaleX: 1.15, scaleY: 1.15}, {t: cues[1], scaleX: 1.15, scaleY: 1.15}, {t: d, scaleX: 1.25, scaleY: 1.25}]}),
    ring(430 + 210 * 1.15, 230 + 580 * 1.15, 120, 100, cues[1]),
  ], sfx: [{time: cues[1] + 0.2, kind: 'tap', gain: 0.05}]}),

  // Wait. What?  (character)
  () => ({layers: [...chrome(6, 'WAIT... WHAT?'),
    rect(72, 172, 1136, 1286, '#3a434d'), lavDoor(560, 250, 1.0),
    actor(180, 1250 - 582 * 1.2, 1.2, {L: [{t: 0, at: 'down'}, {t: 0.2, at: 'head'}], R: [{t: 0, at: 'down'}, {t: 0.25, at: 'shrug'}], headKeys: [{t: 0, angle: 0}, {t: 0.3, angle: 0.25}]}),
    bubble('WAIT. WHAT?', 320, 330, 0.02, {size: 52}),
    marks('?', 470, 520, 0.2, C.amber, 120), marks('?', 530, 440, 0.35, C.amber, 90),
  ], sfx: [{time: 0.05, kind: 'pop', gain: 0.04}]}),

  // It's not a mistake. / It's the law.
  ({cues}) => ({layers: [...chrome(6, 'IT\'S REQUIRED', cues[1]),
    rect(72, 172, 1136, 1286, '#3a434d'), lavDoor(430, 230, 1.15),
    text('MISTAKE?', 100, 330, 56, {color: C.mid, keys: fadeIn(0.05)}), strike(92, 362, 390, 362, 0.5, 0.3),
    stamp('IT\'S THE LAW', 640, 1060, cues[1] + 0.05, {size: 96}),
  ], sfx: [{time: 0.5, kind: 'tap', gain: 0.04}, {time: cues[1] + 0.1, kind: 'pop', gain: 0.05}]}),

  // Aviation rules require / an ashtray near / every lavatory door, / even on non-smoking planes.
  ({cues}) => ({layers: [...chrome(6, 'EVERY. SINGLE. DOOR.', cues[2]),
    rect(72, 172, 1136, 1286, '#2b333c'),
    grp([book(380, 240, 1, fadeIn(0, 0.3)), rect(410, 380, 200, 26, 'rgba(224,162,74,0.55)', {r: 6, keys: [{t: 0, alpha: 0}, {t: cues[1], alpha: 0}, {t: cues[1] + 0.3, alpha: 1}]})], {to: cues[2] + 0.05}),
    ...[0, 1, 2].map(i => lavDoor(150 + i * 340, 420, 0.7, {figure: false, keys: [{t: 0, alpha: 0}, {t: cues[2] + i * 0.25, alpha: 0, y: 470}, {t: cues[2] + 0.25 + i * 0.25, alpha: 1, y: 420}],
      extra: [ell(110, 490, 230, 180, 'none', {stroke: C.amber, lineWidth: 10, keys: [{t: 0, alpha: 0}, {t: cues[2] + 0.3 + i * 0.25, alpha: 0}, {t: cues[2] + 0.5 + i * 0.25, alpha: 1}]})]})),
    noSmoking(530, 230, 0.9, [{t: 0, alpha: 0}, {t: cues[3], alpha: 0, scaleX: 0.5, scaleY: 0.5}, {t: cues[3] + 0.25, alpha: 1, scaleX: 0.9, scaleY: 0.9}]),
  ], sfx: [{time: 0.1, kind: 'paper', gain: 0.03}, ...[0, 1, 2].map(i => ({time: cues[2] + 0.3 + i * 0.25, kind: 'pop', gain: 0.03})), {time: cues[3] + 0.1, kind: 'chime', gain: 0.025}]}),

  // Because engineers know / one thing about people.
  ({cues}) => ({layers: [...chrome(6, 'ENGINEERS KNOW PEOPLE', cues[1]),
    rect(72, 172, 1136, 1286, '#3c4650'), rect(72, 1250, 1136, 208, '#2c3238'),
    rect(440, 280, 700, 520, '#eef1f3', {r: 16, stroke: INK, lineWidth: 6}),
    ell(500, 400, 70, 70, 'none', {stroke: '#2a2f35', lineWidth: 8, ...draw(0.2, 0.4)}), line([[535, 470], [535, 600]], {color: '#2a2f35', lineWidth: 8, ...draw(0.4, 0.3)}),
    line([[620, 500], [760, 500]], {color: '#2f6db3', lineWidth: 8, ...draw(cues[1], 0.3)}), pathL([['M', 760, 482], ['L', 790, 500], ['L', 760, 518], ['Z']], {fill: '#2f6db3', keys: fadeIn(cues[1] + 0.3, 0.1)}),
    text('BREAKS', 820, 440, 60, {color: C.red, keys: fadeIn(cues[1] + 0.35)}), text('RULES', 830, 510, 60, {color: C.red, keys: fadeIn(cues[1] + 0.5)}),
    actor(180, 1250 - 582 * 1.15, 1.15, {hat: 'miner', R: [{t: 0, at: 'down'}, {t: 0.3, at: [300, 200]}], L: [{t: 0, at: 'hips'}]}),
  ], sfx: [{time: 0.2, kind: 'paper', gain: 0.025}, {time: cues[1] + 0.4, kind: 'pop', gain: 0.03}]}),

  // Someone will break / the rules anyway.
  ({d, cues}) => ({layers: [...chrome(6, 'SOMEONE ALWAYS DOES', cues[1]),
    rect(72, 172, 1136, 1286, '#3a434d'), lavDoor(740, 250, 1.0, {busy: false}),
    actor(120, 1250 - 582 * 1.1, 1.1, {keys: [{t: 0, x: 120}, {t: d, x: 480}], L: [{t: 0, at: [-30, 240]}, {t: 0.4, at: [-10, 200]}, {t: 0.8, at: [-30, 240]}, {t: 1.2, at: [-10, 200]}], R: [{t: 0, at: [200, 230]}],
      legL: [{t: 0, angle: 0.3}, {t: 0.4, angle: -0.3}, {t: 0.8, angle: 0.3}, {t: 1.2, angle: -0.3}], legR: [{t: 0, angle: -0.3}, {t: 0.4, angle: 0.3}, {t: 0.8, angle: -0.3}, {t: 1.2, angle: 0.3}],
      headKeys: [{t: 0, angle: -0.2}, {t: 0.5, angle: 0.2}, {t: 1.0, angle: -0.2}, {t: 1.5, angle: 0.1}]}),
    noSmoking(900, 230, 0.6),
    marks('SHH...', 140, 360, 0.3, C.mid, 60),
  ], sfx: [{time: 0.4, kind: 'tap', gain: 0.015}, {time: 0.8, kind: 'tap', gain: 0.015}, {time: 1.2, kind: 'tap', gain: 0.015}]}),

  // Just one. Real quick.  (character)
  () => ({layers: [...chrome(6, 'JUST ONE...'),
    ...lav(),
    actor(SM.x, SM.y, SM.s, {R: [{t: 0, at: 'chin'}], L: [{t: 0, at: 'hips'}], holdR: [cig({g: {x: 24, y: 70, angle: -0.3}})], headKeys: [{t: 0, angle: -0.15}, {t: 0.6, angle: 0.15}]}),
    bubble('JUST ONE. REAL QUICK.', 460, 300, 0.02, {size: 46}),
  ], sfx: [{time: 0.05, kind: 'paper', gain: 0.02}]}),

  // And when they panic, / where does that cigarette go?
  ({cues}) => ({layers: [...chrome(6, 'PANIC!', 0.1),
    ...lav({alarm: [{t: 0, alpha: 1}, {t: 0.15, alpha: 0.2}, {t: 0.3, alpha: 1}, {t: 0.45, alpha: 0.2}, {t: 0.6, alpha: 1}, {t: 0.75, alpha: 0.2}, {t: 0.9, alpha: 1}, {t: 1.05, alpha: 0.2}, {t: 1.2, alpha: 1}],
      flapKeys: [{t: 0, angle: 0}, {t: cues[1] + 0.3, angle: 0}, {t: cues[1] + 0.45, angle: 0.5}, {t: cues[1] + 0.8, angle: 0}]}),
    ...shakeLines(370, 215, 60, 0.05),
    actor(SM.x, SM.y, SM.s, {keys: jitter(0.1, SM.x, 10, 10, 0.08), R: [{t: 0, at: 'chin'}, {t: 0.2, at: 'up'}], L: [{t: 0, at: 'hips'}, {t: 0.2, at: 'up'}]}),
    cig({smoke: false, g: {keys: [{t: 0, x: 580, y: 580, angle: 0, alpha: 1}, {t: 0.3, x: 640, y: 340, angle: 2}, {t: cues[1] + 0.1, x: 760, y: 300, angle: 5}, {t: cues[1] + 0.45, x: 850, y: 960, angle: 8, alpha: 1}, {t: cues[1] + 0.5, alpha: 0}]}}),
    sweat(SM.x + 30, SM.y - 20, 0.2), sweat(SM.x + 150, SM.y + 10, 0.35),
    marks('?', 980, 820, cues[1] + 0.1, C.amber, 120),
  ], sfx: [0.05, 0.35, 0.65, 0.95].map(t => ({time: t, kind: 'jingle', gain: 0.03})).concat([{time: cues[1] + 0.45, kind: 'paper', gain: 0.04}])}),

  // Straight into the trash bin, / full of dry paper towels.
  ({d, cues}) => ({layers: [...chrome(6, 'INTO THE TRASH', 0.1),
    rect(72, 172, 1136, 1286, '#2b333c'),
    rect(300, 300, 680, 980, '#aeb6be', {r: 10, stroke: INK, lineWidth: 6}), rect(330, 330, 620, 920, '#1d2227', {r: 6}),
    ...Array.from({length: 14}, (_, i) => grp([pathL([['M', 0, 40], ['L', 30, 0], ['L', 80, 14], ['L', 120, -6], ['L', 150, 40], ['L', 120, 90], ['L', 60, 80], ['L', 20, 100], ['Z']], {fill: i % 2 ? '#f1ece2' : '#e2dbcf', stroke: INK, lineWidth: 3})],
      {x: 350 + (i % 4) * 140, y: 1150 - Math.floor(i / 4) * 110, angle: (i % 3 - 1) * 0.3, keys: [{t: 0, alpha: 1}, {t: cues[1], alpha: 1, scaleX: 1, scaleY: 1}, {t: cues[1] + 0.15 + (i % 4) * 0.05, scaleX: 1.08, scaleY: 1.08}, {t: cues[1] + 0.35 + (i % 4) * 0.05, scaleX: 1, scaleY: 1}]})),
    cig({smoke: false, g: {keys: [{t: 0, x: 560, y: 280, angle: 1.2}, {t: 0.6, x: 600, y: 770, angle: 2.0}]}}),
    flame(560, 640, 1, flicker(cues[1] + 0.4, 0.3, 1.0, d - cues[1] - 0.4)),
    text('DRY. VERY DRY.', 360, 220, 48, {color: C.amber, keys: fadeIn(cues[1] + 0.1)}),
  ], sfx: [{time: 0.6, kind: 'paper', gain: 0.04}, {time: cues[1] + 0.5, kind: 'pop', gain: 0.03}]}),

  // On a plane, a fire / is the last thing you want.
  ({d, cues}) => ({layers: [...chrome(6, 'FIRE + PLANE = NOPE', cues[1]),
    rect(72, 172, 1136, 1286, '#27445e'), ...[[160, 300], [800, 260], [400, 1150], [980, 1100]].map(([x, y], i) => grp([ell(0, 20, 220, 70, '#cdd8e2'), ell(60, 0, 120, 80, '#cdd8e2')], {x, y, keys: [{t: 0, x}, {t: d, x: x - 160}]})),
    grp([rect(0, 120, 900, 180, C.white, {r: 90, stroke: INK, lineWidth: 6}), pathL([['M', 40, 140], ['L', 0, 0], ['L', 110, 0], ['L', 200, 140], ['Z']], {fill: C.white, stroke: INK, lineWidth: 6}),
      pathL([['M', 380, 230], ['L', 300, 420], ['L', 400, 420], ['L', 560, 230], ['Z']], {fill: C.light, stroke: INK, lineWidth: 6}),
      ...[0, 1, 2, 3, 4, 5, 6].map(i => ell(330 + i * 70, 170, 34, 40, i === 1 ? '#ffb070' : '#2b4a66', {stroke: INK, lineWidth: 2})),
      ...[0, 1, 2].map(i => ell(395 - i * 60, 120 - i * 50, 60 + i * 20, 50 + i * 15, '#7d858d', {keys: [{t: 0, alpha: 0}, {t: 0.2 + i * 0.2, alpha: 0}, {t: 0.5 + i * 0.2, alpha: 0.8}]}))],
      {x: 200, y: 560, keys: [{t: 0, y: 560, angle: 0}, {t: 0.5, y: 548, angle: -0.01}, {t: 1.0, y: 566, angle: 0.01}, {t: 1.5, y: 552}, {t: 2.0, y: 560}]}),
    stamp('NOPE.', 640, 1280, cues[1] + 0.3, {size: 100}),
  ], sfx: [{time: 0.4, kind: 'jingle', gain: 0.03}, {time: cues[1] + 0.35, kind: 'pop', gain: 0.05}]}),

  // So the ashtray gives them / a safe place to put it out.
  ({cues}) => ({layers: [...chrome(6, 'A SAFE PLACE FOR IT', cues[1]),
    rect(72, 172, 1136, 1286, '#3a434d'),
    lavDoor(330, 190, 1.4, {figure: false}),
    cig({smoke: true, g: {keys: [{t: 0, x: 1000, y: 700, angle: 0, alpha: 0}, {t: 0.2, alpha: 1}, {t: cues[1], x: 560, y: 980, angle: 0.4}, {t: cues[1] + 0.4, x: 540, y: 1000, angle: 1.5, alpha: 1}, {t: cues[1] + 0.55, alpha: 0}]}}),
    check(820, 360, 1.6, cues[1] + 0.6),
  ], sfx: [{time: cues[1] + 0.45, kind: 'tap', gain: 0.04}, {time: cues[1] + 0.65, kind: 'chime', gain: 0.03}]}),

  // Rules are for most people. / Design is for everyone else.
  ({cues}) => ({layers: [...chrome(6, 'RULES VS DESIGN', cues[1]),
    rect(72, 172, 568, 1286, '#2b333c'), rect(640, 172, 568, 1286, '#363027'),
    ctext('RULES', 250, 64, {cx: 356, color: C.light, keys: fadeIn(0.05)}), ctext('DESIGN', 250, 64, {cx: 924, color: C.amber, keys: fadeIn(cues[1])}),
    ...[0, 1, 2].map(i => actor(110 + i * 150, 1250 - 582 * 0.8, 0.8, {L: [{t: 0, at: 'down'}], R: [{t: 0, at: 'down'}], keys: fadeIn(0.1 + i * 0.12)})),
    noSmoking(270, 420, 0.8, fadeIn(0.05)),
    grp([actor(720, 1250 - 582 * 0.8, 0.8, {R: [{t: 0, at: 'chin'}], holdR: [cig({g: {x: 24, y: 70, angle: -0.3}})]}), ashtray(920, 760, 1.4, {}), line([[860, 860], [920, 820]], {color: C.amber, lineWidth: 8, ...draw(cues[1] + 0.4, 0.3)})], {keys: fadeIn(cues[1], 0.3)}),
    check(980, 1020, 0.9, cues[1] + 0.7),
  ], sfx: [{time: 0.1, kind: 'pop', gain: 0.025}, {time: cues[1] + 0.05, kind: 'pop', gain: 0.03}, {time: cues[1] + 0.75, kind: 'chime', gain: 0.025}]}),

  // And yes, smoking on a plane / can still get you fined. / Big time.
  ({d, cues}) => ({layers: [...chrome(6, 'STILL A HUGE FINE', cues[1]),
    rect(72, 172, 1136, 1286, '#2b333c'),
    rect(560, 240, 520, 60, '#1b1f23', {r: 20, stroke: INK, lineWidth: 4}),
    grp([rect(0, 0, 440, 900, '#f4f2ea', {stroke: INK, lineWidth: 4}), text('FINE', 140, 40, 80, {color: '#2a2f35'}), ...[0, 1, 2, 3, 4, 5, 6].map(i => rect(40, 180 + i * 70, i % 2 ? 260 : 340, 16, '#b8b2a4', {r: 8})), text('$$$$$$', 70, 760, 84, {color: C.red})],
      {x: 600, y: 280, pivotY: 0, scaleY: 0.02, keys: [{t: 0, scaleY: 0.02}, {t: cues[1], scaleY: 0.02}, {t: cues[2], scaleY: 1}]}),
    actor(160, 1250 - 582 * 1.15, 1.15, {L: [{t: 0, at: 'down'}, {t: cues[1] + 0.3, at: 'head'}], R: [{t: 0, at: 'down'}, {t: cues[1] + 0.3, at: 'head'}], keys: jitter(cues[2], 160, 8, 8, 0.08)}),
    stamp('BIG TIME.', 820, 1300, cues[2] + 0.05, {size: 90}),
  ], sfx: [{time: cues[1], kind: 'paper', gain: 0.04}, {time: cues[1] + 0.5, kind: 'paper', gain: 0.04}, {time: cues[2] + 0.1, kind: 'pop', gain: 0.05}]}),

  // Follow for more / hidden designs.
  () => ({layers: endCard2(6, ICONS.map(f => () => f())), sfx: [0.3, 0.46, 0.62, 0.78, 0.94].map(t => ({time: t, kind: 'pop', gain: 0.03}))}),
];
