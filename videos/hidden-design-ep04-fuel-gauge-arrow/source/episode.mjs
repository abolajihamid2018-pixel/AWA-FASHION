// EP.04 — The little arrow next to the fuel gauge
import {C, rect, ell, grp, pathL, line, text, ctext, chrome, fadeIn, pop, draw, ring, cross, check, person, gauge, carTop, padlock, iconCap, planeWindow, endCard} from '../../hidden-design-series/lib.mjs';
export const ep = 4;

const station = () => [
  rect(200, 520, 140, 600, C.dark, {r: 20}),
  rect(225, 600, 90, 130, C.mid, {r: 12}), rect(225, 900, 90, 130, C.mid, {r: 12}),
  ...[0, 1, 2, 3, 4].map(i => rect(880, 260 + i * 240, 16, 140, C.dim, {r: 8})),
];
const blink = (t0, n = 4) => Array.from({length: n * 2}, (_, i) => ({t: +(t0 + i * 0.18).toFixed(2), alpha: i % 2 ? 0.25 : 1}));
const hose = (pts, t, d = 0.6) => line(pts, {color: C.light, lineWidth: 14, ...draw(t, d)});
const split = (dir, o = {}) => [
  gauge(380, 300, 0.9, {dir, needle: -1.0, arrowColor: o.arrowColor, arrowKeys: o.arrowKeys}),
  carTop(530, 840, 0.9, {door: dir, doorKeys: o.doorKeys}),
];

export const scenes = [
  // See this little arrow / on your fuel gauge?
  ({d, cues}) => ({layers: [...chrome(4, 'SEE THIS ARROW?', cues[1]),
    gauge(380, 635, 1.3, {needle: -1.15, keys: [{t: 0, scaleX: 1.0, scaleY: 1.0, alpha: 0}, {t: 0.4, scaleX: 1.3, scaleY: 1.3, alpha: 1}, {t: d, scaleX: 1.4, scaleY: 1.4}],
      needleKeys: [{t: 0, angle: 1.1}, {t: 0.9, angle: -1.15}]}),
    ring(714, 820, 54, 48, cues[1] - 0.1),
  ], sfx: [{time: 0.2, kind: 'tap', gain: 0.03}, {time: cues[1] + 0.2, kind: 'tap', gain: 0.04}]}),

  // Most drivers never notice it.
  () => ({layers: [...chrome(4, 'MOST DRIVERS MISS IT'),
    person(567, 500, 1.2),
    grp([ell(0, 0, 360, 360, 'none', {stroke: C.mid, lineWidth: 28}), rect(166, 20, 28, 320, C.mid, {r: 14}), rect(20, 166, 320, 28, C.mid, {r: 14}), ell(140, 140, 80, 80, C.dim)],
      {x: 460, y: 760, pivotX: 180, pivotY: 180, keys: [{t: 0, angle: -0.2}, {t: 0.7, angle: 0.25}, {t: 1.4, angle: -0.1}]}),
    gauge(830, 300, 0.5, {needle: -1.0}),
    text('?', 890, 560, 120, {color: C.amber, keys: pop(0.6)}),
  ], sfx: [{time: 0.6, kind: 'pop', gain: 0.03}]}),

  // You pull into a gas station / in a rental car,
  ({cues}) => ({layers: [...chrome(4, 'A RENTAL CAR', cues[1]),
    ...station(),
    carTop(500, 600, 1.1, {door: 'right', keys: [{t: 0, y: 1050, alpha: 0}, {t: 0.3, alpha: 1}, {t: 1.7, y: 600}]}),
    text('RENTAL', 545, 1290, 34, {color: C.amber, keys: fadeIn(cues[1])}),
  ], sfx: [{time: 0.2, kind: 'paper', gain: 0.025}, {time: 1.6, kind: 'tap', gain: 0.03}]}),

  // and park on the wrong side.
  () => ({layers: [...chrome(4, 'WRONG SIDE'),
    ...station(),
    carTop(500, 600, 1.1, {door: 'right', doorKeys: blink(0.1)}),
    ring(745, 879, 50, 60, 0.3),
  ], sfx: [{time: 0.35, kind: 'tap', gain: 0.04}]}),

  // The hose won't reach.
  () => ({layers: [...chrome(4, 'THE HOSE WON\'T REACH'),
    ...station(),
    carTop(500, 600, 1.1, {door: 'right'}),
    hose([[315, 680], [420, 720], [520, 790]], 0.05, 0.5),
    cross(560, 690, 0.8, 0.6),
  ], sfx: [{time: 0.1, kind: 'paper', gain: 0.025}, {time: 0.6, kind: 'tap', gain: 0.045}]}),

  // That arrow was trying / to help you.
  ({cues}) => ({layers: [...chrome(4, 'THE ARROW KNEW', cues[1]),
    gauge(380, 635, 1.3, {needle: -1.15, arrowColor: C.amber, arrowKeys: [{t: 0, alpha: 0.3}, {t: 0.3, alpha: 1}, {t: 0.6, alpha: 0.3}, {t: 0.9, alpha: 1}, {t: 1.2, alpha: 0.3}, {t: 1.5, alpha: 1}]}),
    ring(714, 820, 54, 48, 0.1, {color: C.amber}),
  ], sfx: [{time: 0.3, kind: 'chime', gain: 0.02}]}),

  // In most cars, it points / to the side / your fuel door is on.
  ({cues}) => ({layers: [...chrome(4, 'IT POINTS TO THE DOOR', cues[1]),
    ...split('left', {doorKeys: [{t: 0, alpha: 1}, ...blink(cues[2])]}),
    line([[692, 510], [620, 800], [545, 1070]], {color: C.amber, lineWidth: 6, ...draw(cues[1], 0.6)}),
    ring(537, 1107, 40, 50, cues[2]),
  ], sfx: [{time: cues[1], kind: 'paper', gain: 0.02}, {time: cues[2] + 0.1, kind: 'pop', gain: 0.035}]}),

  // Arrow left, / door on the left.
  ({cues}) => ({layers: [...chrome(4, 'ARROW LEFT = LEFT'),
    ...split('left', {arrowColor: C.green, arrowKeys: [{t: 0, alpha: 0.3}, {t: 0.3, alpha: 1}], doorKeys: [{t: 0, alpha: 1}, ...blink(cues[1], 3)]}),
    ring(537, 1107, 40, 50, cues[1], {color: C.green}),
  ], sfx: [{time: 0.2, kind: 'tap', gain: 0.03}, {time: cues[1] + 0.1, kind: 'pop', gain: 0.03}]}),

  // Arrow right, / door on the right.
  ({cues}) => ({layers: [...chrome(4, 'ARROW RIGHT = RIGHT'),
    ...split('right', {arrowColor: C.green, arrowKeys: [{t: 0, alpha: 0.3}, {t: 0.3, alpha: 1}], doorKeys: [{t: 0, alpha: 1}, ...blink(cues[1], 3)]}),
    ring(743, 1107, 40, 50, cues[1], {color: C.green}),
  ], sfx: [{time: 0.2, kind: 'tap', gain: 0.03}, {time: cues[1] + 0.1, kind: 'pop', gain: 0.03}]}),

  // No more guessing at the pump.
  () => ({layers: [...chrome(4, 'NO MORE GUESSING'),
    ...station(),
    carTop(500, 600, 1.1, {door: 'left', keys: [{t: 0, y: 900, alpha: 0}, {t: 0.2, alpha: 1}, {t: 0.6, y: 600}]}),
    hose([[315, 680], [400, 760], [478, 870]], 0.65, 0.35),
    check(860, 380, 1.4, 1.0),
  ], sfx: [{time: 0.7, kind: 'paper', gain: 0.02}, {time: 1.05, kind: 'chime', gain: 0.03}]}),

  // Follow for more / hidden designs.
  () => ({layers: endCard(4, [() => gauge(-10, 620, 0.45), () => iconCap(460, 688, 1.0), () => padlock(620, 540, 0.55), () => planeWindow(850, 540, 0.5)]),
    sfx: [{time: 0.3, kind: 'pop', gain: 0.03}, {time: 0.6, kind: 'pop', gain: 0.03}, {time: 0.9, kind: 'pop', gain: 0.03}, {time: 1.2, kind: 'pop', gain: 0.03}]}),
];
