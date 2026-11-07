// EP.07 — Why bus seats have such wild patterns
import {C, INK, rect, ell, grp, pathL, line, text, ctext, chrome, fadeIn, pop, draw, ring, star, cross, check, strike,
  actor, bubble, stamp, sweat, marks, shakeLines, hop, jitter, endCard2, ICONS} from '../../hidden-design-series/lib.mjs';
export const ep = 7;

// ---------- procedural fabric ----------
const BASE = '#2f5d8a', PAL = ['#e0a24a', '#6fcf8e', '#e0533d', '#d5d8db', '#b28be0', '#e0a24a'];
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function pattern(x0, y0, w, h, seed, o = {}) {
  const r = rng(seed), out = [], step = o.step ?? 46;
  for (let y = y0 + 14; y < y0 + h - 30; y += step) for (let x = x0 + 14; x < x0 + w - 34; x += step) {
    const k = Math.floor(r() * 4), c = PAL[Math.floor(r() * PAL.length)], jx = x + r() * 14, jy = y + r() * 14;
    if (k === 0) out.push(rect(jx, jy, 26, 12, c, {r: 4, angle: r() * 1.4 - 0.7}));
    else if (k === 1) out.push(pathL([['M', jx, jy + 22], ['L', jx + 13, jy], ['L', jx + 26, jy + 22], ['Z']], {fill: c}));
    else if (k === 2) out.push(ell(jx, jy, 18, 18, c));
    else out.push(pathL([['M', jx, jy + 10], ['Q', jx + 7, jy - 4, jx + 14, jy + 10], ['Q', jx + 21, jy + 24, jx + 28, jy + 10]], {fill: 'none', stroke: c, lineWidth: 5}));
  }
  return out;
}
function blob(cx, cy, rad, col, seed, o = {}) {
  const r = rng(seed), n = 9, pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, q = rad * (0.7 + r() * 0.5); pts.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.8]); }
  const cmd = [['M', ...pts[0]]];
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; cmd.push(['Q', p[0] + (q[0] - p[0]) * 0.5 + (r() - 0.5) * rad * 0.4, p[1] + (q[1] - p[1]) * 0.5 + (r() - 0.5) * rad * 0.4, q[0], q[1]]); }
  cmd.push(['Z']);
  return pathL(cmd, {fill: col, ...o});
}
// Front-view bus seat, local 400×640. back/front split so a sitter can go between them.
const STAINS = [[150, 180, 60, '#7a4a28', 3], [270, 300, 46, '#5b4a32', 7], [110, 330, 34, '#7d9a3a', 11], [260, 440, 52, '#7a4a28', 5], [120, 450, 30, '#5b4a32', 9]];
function seatBack(x, y, s, o = {}) {
  const busy = o.busy ?? true, base = o.base ?? (busy ? BASE : '#4f86bf');
  return grp([
    rect(120, -50, 160, 56, '#9aa3ac', {r: 24, stroke: INK, lineWidth: 5}), rect(150, -30, 100, 20, '#59616a', {r: 10}),
    rect(20, 0, 360, 400, base, {r: 54, stroke: INK, lineWidth: 6}),
    ...(o.stains ?? []).filter(st => st[1] < 380).map((st, i) => blob(st[0], st[1], st[2], st[3], st[4], {keys: o.stainKeys?.[i]})),
    ...(busy ? pattern(30, 10, 340, 380, o.seed ?? 42) : []),
    ...(o.backExtra || []),
  ], {x, y, scaleX: s, scaleY: s, keys: o.keys});
}
function seatFront(x, y, s, o = {}) {
  const busy = o.busy ?? true, base = o.base ?? (busy ? BASE : '#4f86bf');
  return grp([
    rect(46, 500, 30, 150, '#59616a', {stroke: INK, lineWidth: 4}), rect(324, 500, 30, 150, '#59616a', {stroke: INK, lineWidth: 4}), rect(46, 600, 308, 22, '#59616a'),
    rect(0, 380, 400, 130, base, {r: 44, stroke: INK, lineWidth: 6}),
    ...(o.stains ?? []).filter(st => st[1] >= 380).map((st, i) => blob(st[0], st[1], st[2], st[3], st[4], {keys: o.stainKeys?.[i + (o.stains ?? []).filter(q => q[1] < 380).length]})),
    ...(busy ? pattern(10, 390, 380, 110, (o.seed ?? 42) + 1) : []),
    ...(o.frontExtra || []),
  ], {x, y, scaleX: s, scaleY: s, keys: o.keys});
}
const seat = (x, y, s, o = {}) => [seatBack(x, y, s, o), seatFront(x, y, s, o)];
const bus = (o = {}) => [
  rect(72, 172, 1136, 1286, '#3a434d'), rect(72, 260, 1136, 300, '#6d8fb0', {stroke: INK, lineWidth: 5}), ...[0, 1, 2, 3].map(i => rect(72 + i * 284, 260, 16, 300, '#59616a')),
  ...(o.outside || []),
  rect(72, 1250, 1136, 208, '#2a3038'), line([[72, 1250], [1208, 1250]], {color: INK, lineWidth: 4}),
  rect(1080, 172, 30, 1080, '#e0b84a', {r: 12, stroke: INK, lineWidth: 3}), rect(150, 220, 1000, 20, '#e0b84a', {r: 10}),
];
const magnifier = (keys) => grp([ell(0, 0, 200, 200, 'rgba(159,220,255,0.12)', {stroke: '#d5d8db', lineWidth: 16}), rect(170, 170, 40, 150, '#8a6a48', {r: 16, angle: -0.78, stroke: INK, lineWidth: 3})], {keys});
const counter = (vals, t0, gap, x, y) => vals.map((v, i, a) => text(v, x, y, 110, {color: C.amber, from: i ? t0 + i * gap : 0, ...(i < a.length - 1 ? {to: t0 + (i + 1) * gap} : {})}));

export const scenes = [
  // Ever wondered why / bus seats look like this?
  ({d, cues}) => ({layers: [...chrome(7, 'WHY DO THEY LOOK LIKE THIS?', cues[1]),
    ...bus(),
    ...seat(400, 520, 1.2, {keys: [{t: 0, scaleX: 1.0, scaleY: 1.0, x: 440, y: 600}, {t: cues[1], scaleX: 1.0, scaleY: 1.0, x: 440, y: 600}, {t: cues[1] + 0.4, scaleX: 1.2, scaleY: 1.2, x: 400, y: 520}, {t: d, scaleX: 1.26, scaleY: 1.26, x: 388, y: 500}]}),
  ], sfx: [{time: cues[1] + 0.1, kind: 'pop', gain: 0.04}]}),

  // Like a carpet from 1987 / had a bad dream.
  ({cues}) => ({layers: [...chrome(7, 'A CARPET\'S NIGHTMARE', cues[1]),
    ...bus(),
    grp(seat(560, 620, 1.0), {pivotX: 760, pivotY: 1200, keys: [{t: 0, angle: 0}, {t: cues[1], angle: 0}, {t: cues[1] + 0.25, angle: -0.06}, {t: cues[1] + 0.5, angle: 0.06}, {t: cues[1] + 0.75, angle: -0.04}, {t: cues[1] + 1.0, angle: 0}]}),
    grp([ell(0, 60, 420, 280, '#e9ecee', {stroke: INK, lineWidth: 5}), ell(60, 0, 200, 160, '#e9ecee', {stroke: INK, lineWidth: 5}), ell(200, 20, 220, 170, '#e9ecee', {stroke: INK, lineWidth: 5}), ell(30, 80, 360, 230, '#e9ecee'),
      rect(80, 110, 260, 150, '#8a4b5a', {r: 8, stroke: INK, lineWidth: 4}), ...[0, 1, 2, 3].map(i => pathL([['M', 90, 130 + i * 34], ['L', 120, 116 + i * 34], ['L', 150, 130 + i * 34], ['L', 180, 116 + i * 34], ['L', 210, 130 + i * 34], ['L', 240, 116 + i * 34], ['L', 270, 130 + i * 34], ['L', 300, 116 + i * 34], ['L', 330, 130 + i * 34]], {fill: 'none', stroke: i % 2 ? '#e0a24a' : '#6fcf8e', lineWidth: 6})),
      text('1987', 150, 40, 54, {color: '#2a2f35'}),
      ell(440, 330, 40, 40, '#e9ecee', {stroke: INK, lineWidth: 4}), ell(490, 380, 26, 26, '#e9ecee', {stroke: INK, lineWidth: 4})], {x: 110, y: 290, keys: [{t: 0, alpha: 0, y: 330}, {t: 0.3, alpha: 1, y: 290}]}),
    ...[0, 1, 2].map(i => text('Z', 1000 + i * 40, 520 - i * 60, 50 + i * 14, {color: C.mid, keys: [{t: 0, alpha: 0}, {t: 0.4 + i * 0.2, alpha: 0}, {t: 0.55 + i * 0.2, alpha: 1}]})),
  ], sfx: [{time: 0.3, kind: 'pop', gain: 0.03}, {time: cues[1] + 0.1, kind: 'jingle', gain: 0.025}]}),

  // It's not bad taste. / It's camouflage.
  ({cues}) => ({layers: [...chrome(7, 'IT\'S CAMOUFLAGE', cues[1]),
    ...bus(),
    seatBack(400, 520, 1.2, {stains: [[200, 200, 70, '#7a4a28', 3]], backExtra: [
      grp([ell(-24, -12, 22, 22, C.white, {stroke: INK, lineWidth: 2}), ell(4, -12, 22, 22, C.white, {stroke: INK, lineWidth: 2}), ell(-18, -6, 10, 10, INK), ell(10, -6, 10, 10, INK)], {x: 200, y: 200, keys: [{t: 0, alpha: 1}, {t: cues[1], alpha: 1}, {t: cues[1] + 0.3, alpha: 0}]}),
      ...[[150, 160], [210, 230], [250, 170], [170, 250]].map(([x, y], i) => rect(x, y, 26, 12, PAL[i], {r: 4, keys: [{t: 0, alpha: 0}, {t: cues[1] + i * 0.06, alpha: 0}, {t: cues[1] + 0.2 + i * 0.06, alpha: 1}]}))]}),
    seatFront(400, 520, 1.2),
    text('BAD TASTE?', 100, 640, 50, {color: C.light, keys: fadeIn(0.05)}), strike(92, 668, 384, 668, 0.7, 0.3),
    stamp('CAMOUFLAGE', 640, 1320, cues[1] + 0.1, {size: 84, color: C.green}),
  ], sfx: [{time: 0.7, kind: 'tap', gain: 0.04}, {time: cues[1] + 0.15, kind: 'pop', gain: 0.05}]}),

  // Thousands of people / sit there every week.
  ({d, cues}) => ({layers: [...chrome(7, 'SO. MANY. BUTTS.', cues[1]),
    ...bus(),
    ...seat(140, 640, 0.9, {seed: 7}),
    ...[0, 1, 2, 3, 4].map(i => actor(560 + (i % 2) * 40, 1250 - 582 * 1.0, 1.0, {tone: [C.white, '#f0e6d8', C.light, '#e6efe6', '#f3e1e1'][i], hat: [null, 'cap', null, 'cowboy', null][i], hatColor: '#6fcf8e',
      from: i * 0.4, to: i * 0.4 + 0.42, keys: [{t: i * 0.4, x: 1100, alpha: 1}, {t: i * 0.4 + 0.4, x: 120}],
      legL: [{t: i * 0.4, angle: 0.4}, {t: i * 0.4 + 0.1, angle: -0.4}, {t: i * 0.4 + 0.2, angle: 0.4}, {t: i * 0.4 + 0.3, angle: -0.4}], legR: [{t: i * 0.4, angle: -0.4}, {t: i * 0.4 + 0.1, angle: 0.4}, {t: i * 0.4 + 0.2, angle: -0.4}, {t: i * 0.4 + 0.3, angle: 0.4}]})),
    rect(700, 330, 440, 170, '#1b1f23', {r: 20, stroke: INK, lineWidth: 5}),
    ...counter(['1', '25', '300', '4,000', '10,000+'], 0.1, 0.38, 730, 350),
  ], sfx: [0.1, 0.48, 0.86, 1.24, 1.62].map(t => ({time: t, kind: 'tap', gain: 0.03}))}),

  // Coffee spills. / Muddy bags. / Mystery stains.
  ({cues}) => ({layers: [...chrome(7, 'THE DAILY CRIMES', cues[2]),
    ...bus(),
    ...seat(400, 520, 1.2, {busy: false, stains: STAINS, stainKeys: [cues[0], cues[1], cues[2], cues[0] + 0.3, cues[1] + 0.3].map(t => [{t: 0, alpha: 0}, {t: t + 0.05, alpha: 0}, {t: t + 0.25, alpha: 0.95}])}),
    grp([rect(0, 30, 90, 120, '#e9ecee', {r: 12, stroke: INK, lineWidth: 4}), rect(-6, 16, 102, 26, '#c9ced3', {r: 6, stroke: INK, lineWidth: 3}), rect(18, 70, 56, 40, '#7a4a28', {r: 6})], {x: 220, y: 380, angle: 1.4, keys: [{t: 0, alpha: 0, angle: 0}, {t: 0.05, alpha: 1}, {t: 0.3, angle: 1.4}, {t: cues[1] - 0.1, alpha: 1}, {t: cues[1], alpha: 0}]}),
    text('COFFEE', 110, 640, 52, {color: '#e0a070', keys: fadeIn(cues[0] + 0.2)}), text('MUD', 920, 900, 52, {color: '#c8b08a', keys: fadeIn(cues[1] + 0.2)}), text('???', 180, 1000, 60, {color: '#b8d070', keys: fadeIn(cues[2] + 0.2)}),
  ], sfx: [{time: 0.3, kind: 'paper', gain: 0.03}, {time: cues[1] + 0.15, kind: 'tap', gain: 0.03}, {time: cues[2] + 0.15, kind: 'jingle', gain: 0.025}]}),

  // Is that wet?  (character)
  () => ({layers: [...chrome(7, 'IS THAT WET?!'),
    ...bus(),
    seatBack(420, 560, 1.1, {busy: false, stains: STAINS}),
    actor(500, 1250 - 582 * 1.15 - 30, 1.15, {L: [{t: 0, at: [10, 330]}], R: [{t: 0, at: [150, 360]}], headKeys: [{t: 0, angle: 0}, {t: 0.3, angle: -0.25}], keys: jitter(0.3, 500, 4, 6, 0.08)}),
    seatFront(420, 560, 1.1, {busy: false, stains: STAINS}),
    bubble('IS THAT... WET?', 640, 260, 0.02, {size: 50}),
    sweat(560, 600, 0.15), sweat(700, 580, 0.35),
  ], sfx: [{time: 0.05, kind: 'pop', gain: 0.035}]}),

  // On a plain seat, / you'd see every single mark.
  ({cues}) => ({layers: [...chrome(7, 'PLAIN SEAT: SEE EVERYTHING', cues[1]),
    ...bus(),
    ...seat(400, 520, 1.2, {busy: false, stains: STAINS}),
    ...STAINS.map(([x, y, rr], i) => ring(400 + x * 1.2, 520 + y * 1.2, rr * 1.2 + 26, rr * 1.2 + 20, cues[1] + i * 0.15)),
  ], sfx: [0, 1, 2, 3, 4].map(i => ({time: cues[1] + 0.2 + i * 0.15, kind: 'tap', gain: 0.03}))}),

  // On a busy pattern, / your brain can't find them.
  ({d, cues}) => ({layers: [...chrome(7, 'BUSY SEAT: SEE NOTHING', cues[1]),
    ...bus(),
    ...seat(400, 520, 1.2, {stains: STAINS}),
    magnifier([{t: 0, x: 420, y: 560, alpha: 0}, {t: cues[1] - 0.2, alpha: 0}, {t: cues[1], alpha: 1, x: 420, y: 560}, {t: cues[1] + 0.5, x: 700, y: 700}, {t: cues[1] + 1.0, x: 480, y: 900}, {t: d, x: 720, y: 980}]),
    marks('?', 980, 400, cues[1] + 0.4, C.amber, 120), marks('?', 1040, 520, cues[1] + 0.7, C.amber, 90),
  ], sfx: [{time: cues[1] + 0.3, kind: 'paper', gain: 0.02}, {time: cues[1] + 0.8, kind: 'paper', gain: 0.02}]}),

  // So the seat looks cleaner / than it really is.
  ({cues}) => ({layers: [...chrome(7, 'LOOKS CLEAN... ISH', cues[1]),
    ...bus(),
    ...seat(400, 520, 1.2, {stains: STAINS}),
    ...[[470, 560], [840, 640], [560, 980], [880, 1040], [700, 520]].map(([x, y], i) => star(x, y, 30, [{t: 0, alpha: 0}, {t: 0.1 + i * 0.1, alpha: 0}, {t: 0.3 + i * 0.1, alpha: 1}, {t: 0.6 + i * 0.1, alpha: 0.4}, {t: 0.9 + i * 0.1, alpha: 1}])),
    text('*ISH', 900, 320, 64, {color: C.amber, keys: fadeIn(cues[1] + 0.1)}),
  ], sfx: [{time: 0.2, kind: 'chime', gain: 0.025}]}),

  // The pattern also hides / wear and tear, / and makes scribbles / harder to spot.
  ({cues}) => ({layers: [...chrome(7, 'HIDES WEAR AND SCRIBBLES', cues[1]),
    ...bus(),
    seatBack(140, 560, 0.95, {busy: false, backExtra: [
      ...[[90, 260, 60], [250, 120, 40]].map(([x, y, rr], i) => ell(x, y, rr * 2, rr * 1.4, '#86a9cf', {keys: [{t: 0, alpha: 0}, {t: cues[1] + i * 0.15, alpha: 0}, {t: cues[1] + 0.3 + i * 0.15, alpha: 1}]})),
      pathL([['M', 120, 120], ['Q', 160, 60, 200, 130], ['Q', 240, 200, 280, 110], ['Q', 300, 60, 320, 140]], {fill: 'none', stroke: '#111', lineWidth: 8, ...draw(cues[2], 0.5)})]}),
    seatFront(140, 560, 0.95, {busy: false}),
    seatBack(700, 560, 0.95, {backExtra: [
      ...[[90, 260, 60], [250, 120, 40]].map(([x, y, rr], i) => ell(x, y, rr * 2, rr * 1.4, 'rgba(160,190,220,0.35)', {keys: [{t: 0, alpha: 0}, {t: cues[1] + i * 0.15, alpha: 0}, {t: cues[1] + 0.3 + i * 0.15, alpha: 1}]})),
      pathL([['M', 120, 120], ['Q', 160, 60, 200, 130], ['Q', 240, 200, 280, 110], ['Q', 300, 60, 320, 140]], {fill: 'none', stroke: 'rgba(20,20,20,0.55)', lineWidth: 8, ...draw(cues[2], 0.5)})]}),
    seatFront(700, 560, 0.95),
    ctext('PLAIN', 420, 44, {cx: 330, color: C.light}), ctext('BUSY', 420, 44, {cx: 890, color: C.amber}),
    cross(270, 1270, 0.6, cues[3]), check(830, 1260, 0.8, cues[3] + 0.2),
  ], sfx: [{time: cues[1] + 0.3, kind: 'paper', gain: 0.025}, {time: cues[2] + 0.1, kind: 'paper', gain: 0.03}, {time: cues[3] + 0.25, kind: 'chime', gain: 0.025}]}),

  // So the seats can stay / in service for longer.
  ({cues}) => ({layers: [...chrome(7, 'LASTS LONGER', cues[1]),
    ...bus(),
    ...seat(140, 600, 1.0, {seed: 3}),
    rect(640, 360, 440, 520, '#e9ecee', {r: 20, stroke: INK, lineWidth: 6}), rect(640, 360, 440, 110, C.red, {r: 20}), rect(640, 440, 440, 30, C.red),
    ...['YEAR 1', 'YEAR 2', 'YEAR 3', 'YEAR 4', 'YEAR 5'].map((s, i, a) => ctext(s, 580, 96, {cx: 860, color: '#2a2f35', from: i ? 0.2 + i * 0.32 : 0, ...(i < a.length - 1 ? {to: 0.2 + (i + 1) * 0.32} : {})})),
    check(780, 720, 0.9, cues[1] + 0.4),
  ], sfx: [0.52, 0.84, 1.16, 1.48].map(t => ({time: t, kind: 'paper', gain: 0.025})).concat([{time: cues[1] + 0.45, kind: 'chime', gain: 0.025}])}),

  // Ugly? Maybe. / Genius? Absolutely.
  ({cues}) => ({layers: [...chrome(7, 'UGLY GENIUS', cues[1]),
    ...bus(),
    ...seat(560, 580, 1.0),
    actor(170, 1250 - 582 * 1.15, 1.15, {L: [{t: 0, at: 'chin'}, {t: 0.3, at: 'shrug'}, {t: cues[1], at: 'shrug'}, {t: cues[1] + 0.25, at: 'up'}], R: [{t: 0, at: 'down'}, {t: 0.3, at: 'shrug'}, {t: cues[1], at: 'shrug'}, {t: cues[1] + 0.25, at: 'up'}], keys: hop(cues[1] + 0.3, 1250 - 582 * 1.15, 50, 2, 0.3)}),
    stamp('UGLY?', 820, 380, 0.1, {size: 80, color: C.mid}),
    stamp('GENIUS!', 820, 1320, cues[1] + 0.1, {size: 96, color: C.green}),
  ], sfx: [{time: 0.15, kind: 'pop', gain: 0.03}, {time: cues[1] + 0.15, kind: 'chime', gain: 0.035}]}),

  // Next time you sit down, / maybe don't think about it / too hard.
  ({cues}) => { const Y = 1250 - 582 * 1.1; return {layers: [...chrome(7, 'JUST... SIT.', cues[2]),
    ...bus(),
    seatBack(420, 560, 1.1, {stains: STAINS}),
    actor(500, Y, 1.1, {keys: [{t: 0, x: 900, y: Y}, {t: 0.6, x: 500, y: Y}, {t: cues[2], x: 500, y: Y}, {t: cues[2] + 0.4, x: 500, y: Y + 150}],
      L: [{t: 0, at: 'down'}, {t: cues[1], at: 'chin'}, {t: cues[2] + 0.3, at: 'down'}], R: [{t: 0, at: 'down'}, {t: cues[1], at: 'down'}],
      legL: [{t: 0, angle: 0.3}, {t: 0.15, angle: -0.3}, {t: 0.3, angle: 0.3}, {t: 0.45, angle: -0.3}, {t: 0.6, angle: 0}], legR: [{t: 0, angle: -0.3}, {t: 0.15, angle: 0.3}, {t: 0.3, angle: -0.3}, {t: 0.45, angle: 0.3}, {t: 0.6, angle: 0}]}),
    seatFront(420, 560, 1.1, {stains: STAINS}),
    bubble('...', 600, 300, cues[1], {size: 60, until: cues[2] + 0.1}),
    sweat(620, 560, cues[1] + 0.2),
  ], sfx: [{time: cues[1], kind: 'pop', gain: 0.025}, {time: cues[2] + 0.4, kind: 'paper', gain: 0.04}]}; },

  // Follow for more / hidden designs.
  () => ({layers: endCard2(7, ICONS.map(f => () => f())), sfx: [0.3, 0.46, 0.62, 0.78, 0.94].map(t => ({time: t, kind: 'pop', gain: 0.03}))}),
];
