// Shared vector library for the "Hidden Design" series (B3 Retro TV, vertical 1080×1560 → padded 1080×1920).
import path from 'node:path';
import {createRequire} from 'node:module';

export const W = 1280, H = 1280 * 1560 / 1080;
export const C = {bg: '#111316', panel: '#171b20', edge: '#262c33', inset: '#20262c', white: '#eceeef', light: '#d5d8db', soft: '#c4c8cc', mid: '#a9afb5', dim: '#6c737a', dark: '#2a2f35',
  red: '#e0533d', air: '#9fdcff', amber: '#e0a24a', rust: '#a8552e', ice: '#cfeeff', water: '#5d7fa8', green: '#6fcf8e', sky: '#2c4459'};

let tw = () => 0;
export function initFonts(skill) {
  const require = createRequire(path.join(skill, 'package.json'));
  const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
  GlobalFonts.registerFromPath(path.join(skill, 'assets/fonts/NotoSans.ttf'), 'N');
  const m = createCanvas(10, 10).getContext('2d');
  tw = (s, size, weight = 700) => { m.font = `${weight} ${size}px N`; return m.measureText(s).width; };
  return tw;
}
export const measure = (...a) => tw(...a);

// ---------- primitives ----------
const KEYS = ['fill', 'x', 'y', 'from', 'to', 'keys', 'alpha', 'pivotX', 'pivotY', 'scaleX', 'scaleY', 'angle', 'stroke', 'lineWidth', 'color', 'progress'];
export function pick(o) { const r = {}; for (const k of KEYS) if (o[k] !== undefined) r[k] = o[k]; return r; }
export const rect = (x, y, w, h, fill, o = {}) => ({type: 'rect', x, y, w, h, radius: o.r ?? 0, fill, ...pick(o)});
export const ell = (x, y, w, h, fill, o = {}) => ({type: 'ellipse', x, y, w, h, fill, ...pick(o)});
export const grp = (children, o = {}) => ({type: 'group', children, ...pick(o)});
export const pathL = (commands, o = {}) => ({type: 'path', commands, ...pick(o)});
export const line = (points, o = {}) => ({type: 'line', points, ...pick(o)});
export const text = (s, x, y, size, o = {}) => ({type: 'text', text: s, x, y, size, bold: o.bold ?? true, color: o.color ?? C.white, w: o.w ?? 1200, ...pick(o)});
export const ctext = (s, cy, size, o = {}) => text(s, Math.round(((o.cx ?? W / 2) * 2 - tw(s, size)) / 2), cy, size, o);
export const fadeIn = (t = 0, d = 0.25) => [{t, alpha: 0}, {t: t + d, alpha: 1}];
export const fadeOut = (t, d = 0.25) => [{t, alpha: 1}, {t: t + d, alpha: 0}];
export const pop = (t, b = 1) => [{t, alpha: 0, scaleX: 0.6 * b, scaleY: 0.6 * b}, {t: t + 0.22, alpha: 1, scaleX: 1.06 * b, scaleY: 1.06 * b}, {t: t + 0.34, alpha: 1, scaleX: b, scaleY: b}];
export const draw = (t, d = 0.4) => ({progress: 0, keys: [{t, progress: 0}, {t: t + d, progress: 1}]});
export const strike = (x1, y1, x2, y2, t, d = 0.35) => line([[x1, y1], [x2, y2]], {color: C.red, lineWidth: 16, ...draw(t, d)});
export const ring = (cx, cy, rx, ry, t, o = {}) => ell(cx - rx, cy - ry, rx * 2, ry * 2, 'none', {stroke: o.color ?? C.red, lineWidth: o.lw ?? 8, pivotX: rx, pivotY: ry,
  keys: [{t: 0, alpha: 0, scaleX: 1.7, scaleY: 1.7}, {t, alpha: 0, scaleX: 1.7, scaleY: 1.7}, {t: t + 0.3, alpha: 1, scaleX: 1, scaleY: 1}]});
export const star = (cx, cy, r, keys, fill = C.white) => pathL([['M', cx, cy - r], ['Q', cx, cy, cx + r, cy], ['Q', cx, cy, cx, cy + r], ['Q', cx, cy, cx - r, cy], ['Q', cx, cy, cx, cy - r], ['Z']], {fill, keys});
export const heart = (x, y, s, keys) => grp([pathL([['M', 100, 180], ['C', 20, 120, -20, 60, 30, 20], ['C', 60, -4, 95, 10, 100, 40], ['C', 105, 10, 140, -4, 170, 20], ['C', 220, 60, 180, 120, 100, 180], ['Z']], {fill: C.red})], {x, y, scaleX: s, scaleY: s, pivotX: 100, pivotY: 90, keys});
export const check = (x, y, s, t) => grp([pathL([['M', 0, 60], ['L', 50, 110], ['L', 150, 0]], {fill: 'none', stroke: C.green, lineWidth: 22, ...draw(t, 0.35)})], {x, y, scaleX: s, scaleY: s});
export const cross = (x, y, s, t) => grp([line([[0, 0], [120, 120]], {color: C.red, lineWidth: 20, ...draw(t, 0.2)}), line([[120, 0], [0, 120]], {color: C.red, lineWidth: 20, ...draw(t + 0.15, 0.2)})], {x, y, scaleX: s, scaleY: s});
// drop shape, local 120×190
export const drop = (x, y, s, fill, o = {}) => grp([pathL([['M', 60, 0], ['C', 60, 0, 0, 80, 0, 120], ['C', 0, 160, 30, 190, 60, 190], ['C', 90, 190, 120, 160, 120, 120], ['C', 120, 80, 60, 0, 60, 0], ['Z']], {fill})], {x, y, scaleX: s, scaleY: s, ...pick(o)});
// Falling rain streaks across a box, staggered loops.
export function rain(x0, y0, w, h, dur, n = 14, color = C.air) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + ((i * 97) % w), period = 0.7, off = (i * 0.137) % period;
    for (let t0 = -off; t0 < dur; t0 += period) {
      const a = Math.max(0, t0), b = Math.min(dur, t0 + period);
      if (b - a < 0.08) continue;
      const fy = (t) => y0 + h * (t - t0) / period;
      out.push(line([[0, 0], [-10, 46]], {x, y: fy(a), color, lineWidth: 5, alpha: 0.7, from: +a.toFixed(3), to: +b.toFixed(3), keys: [{t: +a.toFixed(3), y: fy(a)}, {t: +b.toFixed(3), y: fy(b)}]}));
    }
  }
  return out;
}

// ---------- frame chrome ----------
export const chrome = (ep, heading, headingAt = 0.15) => [
  text('HIDDEN DESIGN / EVERYDAY OBJECTS', 70, 70, 26, {color: C.mid}),
  text(`EP. ${String(ep).padStart(2, '0')}`, 1110, 70, 26, {color: C.dim}),
  rect(70, 170, 1140, 1290, C.panel, {r: 26, stroke: C.edge, lineWidth: 3}),
  ...(heading ? [ctext(heading, 1525, 70, {keys: fadeIn(headingAt, 0.3)})] : []),
];

// ---------- characters ----------
// Front-view person, blank round head, rounded limbs. origin = head top-left; height ≈ 590*s
export function person(x, y, s = 1, o = {}) {
  const tone = o.tone ?? C.white;
  const arm = (side, keys, angle = 0) => grp([rect(0, 0, 34, 190, side ? C.soft : tone, {r: 17})], {x: side ? 118 : -32, y: 150, pivotX: 17, pivotY: 14, keys, angle});
  return grp([
    grp([rect(0, 0, 40, 220, C.soft, {r: 20})], {x: 28, y: 360, pivotX: 20, pivotY: 16, keys: o.legB}),
    grp([rect(0, 0, 40, 220, tone, {r: 20})], {x: 78, y: 360, pivotX: 20, pivotY: 16, keys: o.legF}),
    arm(true, o.armR, o.armRAngle),
    rect(14, 140, 118, 240, tone, {r: 46}),
    ell(18, 0, 110, 110, tone, {keys: o.headKeys}),
    arm(false, o.armL, o.armLAngle),
    ...(o.extra || []),
  ], {x, y, scaleX: s, scaleY: s, pivotX: 73, pivotY: 580, keys: o.keys, from: o.from, to: o.to});
}
// Seated person, side-on (facing right). origin = head top-left, height ≈ 470*s
export function seated(x, y, s = 1, o = {}) {
  const tone = o.tone ?? C.white;
  return grp([
    rect(10, 120, 120, 200, tone, {r: 46}),                         // torso
    rect(60, 280, 190, 50, C.soft, {r: 25}),                         // thigh
    rect(210, 290, 46, 180, C.soft, {r: 23}),                        // shin
    ell(16, 0, 110, 110, tone, {keys: o.headKeys}),
    grp([rect(0, 0, 34, 170, tone, {r: 17})], {x: 70, y: 140, pivotX: 17, pivotY: 14, angle: o.armAngle ?? -0.5, keys: o.armKeys}),
  ], {x, y, scaleX: s, scaleY: s, keys: o.keys});
}

// ---------- end card ----------
export const iconCap = (x, y, s) => grp([rect(0, 25, 100, 200, C.white, {r: 24}), ell(0, 0, 100, 70, C.white), ell(38, 14, 24, 16, C.bg), rect(-16, 40, 14, 140, C.soft, {r: 7})], {x, y, scaleX: s, scaleY: s});
export function padlock(x, y, s = 1, o = {}) {
  // local ≈ 300×420; body top at y=170
  return grp([
    pathL([['M', 60, 200], ['L', 60, 110], ['C', 60, 20, 240, 20, 240, 110], ['L', 240, 200]], {fill: 'none', stroke: o.shackle ?? C.mid, lineWidth: 34}),
    rect(0, 170, 300, 250, o.body ?? C.white, {r: 40}),
    rect(230, 190, 40, 210, C.soft, {r: 20}),
    ell(128, 250, 44, 44, C.dark), rect(141, 280, 18, 50, C.dark, {r: 6}),
    ...(o.hole === false ? [] : [ell(120, 404, 60, 14, C.dark)]),
    ...(o.extra || []),
  ], {x, y, scaleX: s, scaleY: s, pivotX: 150, pivotY: 260, keys: o.keys, angle: o.angle});
}
export function planeWindow(x, y, s = 1, o = {}) {
  // local 360×520: frame, sky pane, tiny hole near bottom
  return grp([
    rect(0, 0, 360, 520, C.light, {r: 150}),
    rect(30, 30, 300, 460, o.sky ?? C.sky, {r: 125}),
    ...(o.inside || []),
    ...(o.hole === false ? [] : [ell(172, 420, 16, 16, C.bg)]),
  ], {x, y, scaleX: s, scaleY: s, pivotX: 180, pivotY: 260, keys: o.keys});
}
export function gauge(x, y, s = 1, o = {}) {
  // local 520×360: dial arc, E/F, needle, pump icon, arrow (left or right)
  const dir = o.dir ?? 'left';
  const arrow = dir === 'left' ? [['M', 300, 158], ['L', 330, 140], ['L', 330, 176], ['Z']] : [['M', 360, 158], ['L', 330, 140], ['L', 330, 176], ['Z']];
  return grp([
    rect(0, 0, 520, 360, C.inset, {r: 40, stroke: C.dim, lineWidth: 4}),
    pathL([['M', 80, 290], ['C', 80, 60, 440, 60, 440, 290]], {fill: 'none', stroke: C.mid, lineWidth: 10}),
    text('E', 60, 300, 44, {color: C.red}), text('F', 430, 300, 44, {color: C.light}),
    rect(206, 126, 50, 64, C.light, {r: 8}), rect(214, 136, 34, 20, C.inset, {r: 4}), pathL([['M', 256, 140], ['L', 274, 152], ['L', 274, 186]], {fill: 'none', stroke: C.light, lineWidth: 6}),
    pathL(arrow, {fill: o.arrowColor ?? C.light, keys: o.arrowKeys}),
    grp([rect(-6, -170, 12, 176, C.red, {r: 6})], {x: 260, y: 290, angle: o.needle ?? -1.2, keys: o.needleKeys}),
    ell(240, 270, 40, 40, C.light),
  ], {x, y, scaleX: s, scaleY: s, pivotX: 260, pivotY: 180, keys: o.keys});
}
// top-down car, nose up. local 220×420. fuel door on 'left'|'right'
export function carTop(x, y, s = 1, o = {}) {
  const fx = o.door === 'right' ? 214 : -14;
  return grp([
    rect(-10, 70, 24, 70, C.dim, {r: 8}), rect(196, 70, 24, 70, C.dim, {r: 8}), rect(-10, 300, 24, 70, C.dim, {r: 8}), rect(196, 300, 24, 70, C.dim, {r: 8}),
    rect(0, 0, 220, 420, o.body ?? C.white, {r: 60}),
    rect(26, 100, 168, 70, C.dark, {r: 20}), rect(30, 300, 160, 50, C.dark, {r: 18}),
    rect(fx, 250, 20, 46, C.amber, {r: 6, keys: o.doorKeys}),
  ], {x, y, scaleX: s, scaleY: s, pivotX: 110, pivotY: 210, keys: o.keys, angle: o.angle});
}
export const iconWindow = (x, y, s) => planeWindow(x, y, s);
export const iconLock = (x, y, s) => padlock(x, y, s);
export const iconGauge = (x, y, s) => gauge(x, y, s);

export function endCard(ep, icons) {
  // icons: array of builder fns (x,y,s, keys) in display order, current episode first
  return [...chrome(ep, 'FOLLOW FOR MORE', 0.1),
    ctext('HIDDEN DESIGN', 330, 64, {color: C.mid, keys: fadeIn(0.2)}),
    ...icons.map((f, i) => grp([f()], {x: 0, y: 0, alpha: 0, keys: [{t: 0.25 + i * 0.3, alpha: 0, y: 40}, {t: 0.5 + i * 0.3, alpha: 1, y: 0}]})),
  ];
}
