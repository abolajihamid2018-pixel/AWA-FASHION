// EP.03 — Why airplane windows have a tiny hole
import {C, rect, ell, grp, pathL, line, text, ctext, chrome, fadeIn, fadeOut, pop, draw, strike, ring, star, cross, check, seated, padlock, iconCap, planeWindow, gauge, endCard} from '../../hidden-design-series/lib.mjs';
export const ep = 3;

const clouds = (d) => [[200, 120, 90], [120, 260, 70], [230, 330, 60]].map(([x, y, w], i) =>
  grp([ell(0, 10, w, w * 0.45, C.light), ell(w * 0.25, 0, w * 0.55, w * 0.45, C.light)], {x, y, alpha: 0.85, keys: [{t: 0, x}, {t: d, x: x - 70 - i * 15}]}));
const PX = {inner: 470, middle: 640, outer: 810};
// Side view of the three panes (cabin on the left, outside on the right).
function panes(o = {}) {
  const pane = (x, keys, kids, hole) => grp(hole
    ? [rect(0, 0, 34, 520, C.light, {r: 17}), rect(0, 550, 34, 90, C.light, {r: 17})]
    : [rect(0, 0, 34, 640, C.light, {r: 17})], {x, y: 480, keys, ...(kids || {})});
  return [
    rect(420, 440, 470, 30, C.dim, {r: 12}), rect(420, 1130, 470, 30, C.dim, {r: 12}),
    text('CABIN', 150, 770, 40, {color: C.mid}), text('OUTSIDE', 930, 770, 40, {color: C.mid}),
    pane(o.x0 ?? PX.inner, o.innerKeys), pane(o.x0 ?? PX.middle, o.middleKeys, null, true), pane(o.x0 ?? PX.outer, o.outerKeys),
    ...(o.labels === false ? [] : [['INNER', PX.inner], ['MIDDLE', PX.middle], ['OUTER', PX.outer]].map(([s, x], i) => ctext(s, 1190, 32, {cx: x + 17, color: C.mid, ...(o.labelAt !== undefined ? {keys: fadeIn(o.labelAt + i * 0.1)} : {})}))),
  ];
}
const push = (x, y, t, color = C.air) => grp([line([[0, 0], [100, 0]], {color, lineWidth: 12}), pathL([['M', 100, -22], ['L', 136, 0], ['L', 100, 22], ['Z']], {fill: color})],
  {x, y, keys: [{t, alpha: 0, x: x - 40}, {t: t + 0.25, alpha: 1, x}, {t: t + 0.6, x: x + 14}, {t: t + 0.9, x}, {t: t + 1.2, x: x + 14}]});
const plane = (keys) => grp([rect(0, 40, 400, 64, C.white, {r: 32}), pathL([['M', 20, 50], ['L', -10, -30], ['L', 40, -30], ['L', 90, 50], ['Z']], {fill: C.white}),
  pathL([['M', 170, 80], ['L', 120, 170], ['L', 170, 170], ['L', 260, 80], ['Z']], {fill: C.soft}), ...[0, 1, 2, 3, 4].map(i => ell(220 + i * 30, 58, 14, 14, C.dark))], {pivotX: 200, pivotY: 70, keys});

export const scenes = [
  // Look at a plane window. / See the tiny hole?
  ({d, cues}) => ({layers: [...chrome(3, 'WHY IS THERE A HOLE?', cues[1]),
    planeWindow(460, 555, 1.6, {keys: [{t: 0, scaleX: 1.3, scaleY: 1.3, alpha: 0}, {t: 0.4, scaleX: 1.6, scaleY: 1.6, alpha: 1}, {t: d, scaleX: 1.72, scaleY: 1.72}],
      inside: [...clouds(d), ring(180, 428, 36, 30, cues[1])]}),
  ], sfx: [{time: 0.1, kind: 'paper', gain: 0.02}, {time: cues[1] + 0.2, kind: 'tap', gain: 0.04}]}),

  // Don't worry. / It won't suck you out.
  ({d, cues}) => ({layers: [...chrome(3, 'IS IT DANGEROUS?'),
    rect(250, 560, 230, 700, C.dark, {r: 40}),
    seated(300, 640, 1.3, {headKeys: [{t: 0, x: 16}, {t: 0.5, x: 26}]}),
    planeWindow(760, 420, 1.1, {inside: clouds(d)}),
    line([[700, 700], [1000, 640]], {color: C.mid, lineWidth: 10, ...draw(cues[1], 0.4)}),
    pathL([['M', 990, 610], ['L', 1040, 632], ['L', 1000, 670], ['Z']], {fill: C.mid, keys: fadeIn(cues[1] + 0.35, 0.1)}),
    cross(780, 590, 1.1, cues[1] + 0.6),
  ], sfx: [{time: cues[1] + 0.6, kind: 'tap', gain: 0.045}]}),

  // A plane window is actually / three panes.
  ({cues}) => ({layers: [...chrome(3, 'THREE PANES', cues[1]),
    ...panes({x0: undefined, labelAt: cues[1],
      innerKeys: [{t: 0, x: 640}, {t: 0.3, x: 640}, {t: cues[1], x: PX.inner}],
      middleKeys: [{t: 0, x: 640}],
      outerKeys: [{t: 0, x: 640}, {t: 0.3, x: 640}, {t: cues[1], x: PX.outer}]}),
  ], sfx: [{time: cues[1] - 0.2, kind: 'paper', gain: 0.03}]}),

  // Up high, the cabin air / pushes hard against them.
  ({cues}) => ({layers: [...chrome(3, 'CABIN PRESSURE', cues[1]),
    grp([line([[200, 1300], [1080, 400]], {color: C.dim, lineWidth: 4, ...draw(0, cues[1])}), plane([{t: 0, x: 120, y: 1150, angle: -0.6}, {t: cues[1], x: 760, y: 420, angle: -0.6}])], {to: cues[1]}),
    grp([...panes({labels: false}), ...[620, 780, 940].map((y, i) => push(300, y, cues[1] + i * 0.12))], {from: cues[1]}),
  ], sfx: [{time: 0.1, kind: 'paper', gain: 0.025}, {time: cues[1] + 0.1, kind: 'pop', gain: 0.03}]}),

  // The hole sits / in the middle pane.
  ({cues}) => ({layers: [...chrome(3, 'THE HOLE IS HERE', cues[1]),
    ...panes(),
    ring(657, 1015, 60, 44, cues[1]),
  ], sfx: [{time: cues[1] + 0.2, kind: 'pop', gain: 0.04}]}),

  // It lets air through, / so the outer pane / takes the pressure.
  ({cues}) => ({layers: [...chrome(3, 'OUTER PANE TAKES IT', cues[2]),
    ...panes(),
    ...Array.from({length: 6}, (_, i) => ell(0, 0, 18, 18, C.air, {keys: [
      {t: 0.05 + i * 0.16, x: 360, y: 880 + (i % 3) * 30, alpha: 0}, {t: 0.15 + i * 0.16, alpha: 1}, {t: 0.45 + i * 0.16, x: 545, y: 990}, {t: 0.7 + i * 0.16, x: 648, y: 1006}, {t: 0.95 + i * 0.16, x: 724, y: 900 - i * 40}, {t: 2.4, x: 724, y: 900 - i * 40, alpha: 1}]})),
    rect(PX.outer - 6, 474, 46, 652, C.red, {r: 20, keys: [{t: 0, alpha: 0}, {t: cues[2], alpha: 0}, {t: cues[2] + 0.3, alpha: 0.55}]}),
    ...[620, 820, 1020].map(y => push(690, y, cues[1], C.red)),
  ], sfx: [{time: 0.2, kind: 'paper', gain: 0.02}, {time: cues[2], kind: 'pop', gain: 0.035}]}),

  // The middle pane / is the backup.
  ({cues}) => ({layers: [...chrome(3, 'BUILT-IN BACKUP', cues[1]),
    ...panes(),
    pathL([['M', 818, 560], ['L', 842, 640], ['L', 816, 700], ['L', 844, 790], ['L', 820, 860]], {fill: 'none', stroke: C.red, lineWidth: 6, keys: fadeIn(0.1, 0.2)}),
    rect(PX.middle - 10, 470, 54, 660, 'none', {r: 24, stroke: C.green, lineWidth: 8, keys: fadeIn(cues[1], 0.25)}),
    ctext('BACKUP', 360, 48, {cx: PX.middle + 17, color: C.green, keys: fadeIn(cues[1] + 0.1)}),
  ], sfx: [{time: 0.1, kind: 'tap', gain: 0.03}, {time: cues[1] + 0.1, kind: 'chime', gain: 0.025}]}),

  // And the hole / has one more job.
  ({d, cues}) => ({layers: [...chrome(3, 'ONE MORE JOB', cues[1]),
    planeWindow(460, 555, 1.6, {inside: [...clouds(d), ell(144, 392, 72, 72, 'none', {stroke: C.amber, lineWidth: 8, pivotX: 36, pivotY: 36,
      keys: [{t: 0.2, alpha: 0, scaleX: 0.5, scaleY: 0.5}, {t: 0.5, alpha: 1, scaleX: 1.2, scaleY: 1.2}, {t: 0.8, scaleX: 1, scaleY: 1}, {t: 1.1, scaleX: 1.2, scaleY: 1.2}, {t: 1.4, scaleX: 1, scaleY: 1}]})]}),
  ], sfx: [{time: 0.4, kind: 'pop', gain: 0.03}]}),

  // It lets moisture escape, / so your window / doesn't fog up.
  ({d, cues}) => ({layers: [...chrome(3, 'NO FOG', cues[2]),
    planeWindow(460, 555, 1.6, {inside: [...clouds(d),
      ...[[60, 80, 180], [150, 160, 160], [50, 250, 190], [140, 330, 150], [70, 60, 140]].map(([x, y, w], i) => ell(x, y, w, w * 0.7, C.white, {keys: [{t: 0, alpha: 0}, {t: 0.15 + i * 0.08, alpha: 0}, {t: 0.5 + i * 0.08, alpha: 0.35}, {t: cues[1] + 0.1 + i * 0.12, alpha: 0.35}, {t: cues[2] + 0.2 + i * 0.1, alpha: 0}]})),
      ...Array.from({length: 6}, (_, i) => ell(0, 0, 12, 12, C.ice, {keys: [{t: cues[1] + i * 0.12, x: 80 + i * 40, y: 120 + (i % 3) * 60, alpha: 0}, {t: cues[1] + 0.1 + i * 0.12, alpha: 0.9}, {t: cues[1] + 0.6 + i * 0.12, x: 174, y: 422, alpha: 0.9}, {t: cues[1] + 0.7 + i * 0.12, alpha: 0}]}))]}),
  ], sfx: [{time: cues[1] + 0.3, kind: 'paper', gain: 0.025}, {time: cues[2] + 0.3, kind: 'chime', gain: 0.02}]}),

  // So you can enjoy the view.
  ({d}) => ({layers: [...chrome(3, 'ENJOY THE VIEW'),
    rect(250, 560, 230, 700, C.dark, {r: 40}),
    seated(300, 640, 1.3, {armAngle: -0.5, armKeys: [{t: 0, angle: -0.5}, {t: 0.6, angle: -1.3}]}),
    planeWindow(760, 420, 1.1, {inside: clouds(d)}),
    star(700, 500, 26, [{t: 0.6, alpha: 0}, {t: 0.9, alpha: 1}]),
  ], sfx: [{time: 0.6, kind: 'chime', gain: 0.02}]}),

  // Follow for more / hidden designs.
  () => ({layers: endCard(3, [() => planeWindow(70, 540, 0.5), () => padlock(360, 540, 0.55), () => iconCap(720, 688, 1.0), () => gauge(770, 620, 0.45)]),
    sfx: [{time: 0.3, kind: 'pop', gain: 0.03}, {time: 0.6, kind: 'pop', gain: 0.03}, {time: 0.9, kind: 'pop', gain: 0.03}, {time: 1.2, kind: 'pop', gain: 0.03}]}),
];
