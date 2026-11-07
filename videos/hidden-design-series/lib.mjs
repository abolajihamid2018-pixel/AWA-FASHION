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

// =====================================================================
// v2 additions (EP.05+): jointed actor with IK arms, speech bubbles, reaction marks, detail helpers
// =====================================================================
export const INK = '#0b0d0f';
const L1 = 92, L2 = 96;
function ik(sx, sy, tx, ty, side) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy);
  d = Math.min(Math.max(d, Math.abs(L1 - L2) + 2), L1 + L2 - 0.5);
  const a = Math.atan2(dy, dx), A = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  const cands = [a + A, a - A].map(b => [sx + L1 * Math.cos(b), sy + L1 * Math.sin(b)]);
  const [ex, ey] = cands.sort((p, q) => side * (q[0] - p[0]))[0];        // elbow bends outward
  const th = Math.atan2(-(ex - sx), ey - sy);
  const ph = Math.atan2(-(tx - ex), ty - ey);
  let rel = ph - th; while (rel > Math.PI) rel -= 2 * Math.PI; while (rel < -Math.PI) rel += 2 * Math.PI;
  return [th, rel];
}
const unwrap = (v, prev) => { if (prev === undefined) return v; while (v - prev > Math.PI) v -= 2 * Math.PI; while (v - prev < -Math.PI) v += 2 * Math.PI; return v; };
// Named hand targets in actor-local space (head centre ≈ 73,55; shoulders 26,160 / 120,160)
export const HAND = {
  down: s => [s < 0 ? 4 : 142, 340], hips: s => [s < 0 ? -40 : 186, 270], up: s => [s < 0 ? -60 : 206, -60],
  head: s => [s < 0 ? 22 : 124, 30], face: s => [s < 0 ? 52 : 94, 70], chin: s => [s < 0 ? 60 : 86, 112],
  shrug: s => [s < 0 ? -70 : 216, 150], wave: s => [s < 0 ? -80 : 226, 0], chest: s => [s < 0 ? 60 : 86, 210],
};
function armKeys(spec, side, sx, sy) {
  // spec: [{t, at: 'name' | [x,y]}] → shoulder & elbow keys
  const sh = [], el = []; let p1, p2;
  for (const k of spec) {
    const [tx, ty] = typeof k.at === 'string' ? HAND[k.at](side) : k.at;
    let [a, b] = ik(sx, sy, tx, ty, side); a = unwrap(a, p1); b = unwrap(b, p2); p1 = a; p2 = b;
    sh.push({t: k.t, angle: +a.toFixed(4)}); el.push({t: k.t, angle: +b.toFixed(4)});
  }
  return [sh, el];
}
// Jointed front-view actor. o.L / o.R: arm keyframes [{t, at}], o.hat: 'cowboy'|'cap'|'miner', o.tone, o.keys (whole body), o.headKeys
export function actor(x, y, s = 1, o = {}) {
  const tone = o.tone ?? C.white, back = o.back ?? C.soft;
  const arm = (side) => {
    const sx = side < 0 ? 26 : 120, sy = 160;
    const spec = (side < 0 ? o.L : o.R) ?? [{t: 0, at: 'down'}];
    const [sh, el] = armKeys(spec, side, sx, sy);
    const col = side < 0 ? tone : back;
    return grp([
      rect(0, 0, 36, L1 + 18, col, {r: 18, stroke: INK, lineWidth: 3}),
      grp([rect(0, 0, 34, L2 + 4, col, {r: 17, stroke: INK, lineWidth: 3}), ell(-3, L2 - 14, 40, 40, col, {stroke: INK, lineWidth: 3}), ...(side < 0 ? o.holdL ?? [] : o.holdR ?? [])],
        {x: 1, y: L1, pivotX: 17, pivotY: 0, angle: el[0].angle, keys: el.length > 1 ? el : undefined}),
    ], {x: sx - 18, y: sy - 4, pivotX: 18, pivotY: 4, angle: sh[0].angle, keys: sh.length > 1 ? sh : undefined});
  };
  const hat = o.hat === 'cowboy' ? [grp([pathL([['M', -10, 22], ['Q', 73, 46, 156, 22], ['Q', 150, 40, 73, 44], ['Q', -4, 40, -10, 22], ['Z']], {fill: '#8a6a48', stroke: INK, lineWidth: 3}), pathL([['M', 30, 26], ['L', 38, -22], ['Q', 73, -36, 108, -22], ['L', 116, 26], ['Z']], {fill: '#9c7a55', stroke: INK, lineWidth: 3}), rect(32, 10, 82, 12, '#5d4630')], {y: 12})]
    : o.hat === 'cap' ? [pathL([['M', 18, 40], ['Q', 18, -6, 73, -6], ['Q', 128, -6, 128, 40], ['Z']], {fill: o.hatColor ?? C.red, stroke: INK, lineWidth: 3}), rect(100, 30, 70, 14, o.hatColor ?? C.red, {r: 7, stroke: INK, lineWidth: 3})]
    : o.hat === 'miner' ? [pathL([['M', 14, 44], ['Q', 14, -8, 73, -8], ['Q', 132, -8, 132, 44], ['Z']], {fill: C.amber, stroke: INK, lineWidth: 3}), ell(58, 6, 30, 22, '#fff6c8', {stroke: INK, lineWidth: 2})] : [];
  return grp([
    ell(-10, 572, 170, 26, 'rgba(0,0,0,0.35)'),
    grp([rect(0, 0, 42, 226, o.legs ?? back, {r: 21, stroke: INK, lineWidth: 3})], {x: 30, y: 356, pivotX: 21, pivotY: 14, keys: o.legL}),
    grp([rect(0, 0, 42, 226, o.legs ?? tone, {r: 21, stroke: INK, lineWidth: 3})], {x: 76, y: 356, pivotX: 21, pivotY: 14, keys: o.legR}),
    arm(1),
    rect(56, 96, 34, 50, back, {r: 12, stroke: INK, lineWidth: 3}),
    rect(14, 138, 118, 244, tone, {r: 48, stroke: INK, lineWidth: 3}),
    ...(o.torso || []),
    grp([ell(18, 0, 110, 110, tone, {stroke: INK, lineWidth: 3}), ...hat], {pivotX: 73, pivotY: 110, keys: o.headKeys}),
    arm(-1),
    ...(o.extra || []),
  ], {x, y, scaleX: s, scaleY: s, pivotX: 73, pivotY: 582, keys: o.keys, from: o.from, to: o.to});
}
// Speech label (rounded bubble + tail) centred at cx; text auto-sized
export function bubble(str, cx, y, t = 0, o = {}) {
  const size = o.size ?? 44, w = measure(str, size) + 56, h = size + 40, tx = o.tail ?? 0;
  return grp([
    rect(0, 0, w, h, o.fill ?? '#f4f5f5', {r: 22, stroke: INK, lineWidth: 4}),
    pathL([['M', w / 2 - 20 + tx, h - 2], ['L', w / 2 + tx + (o.tailDx ?? -10), h + 34], ['L', w / 2 + 18 + tx, h - 2], ['Z']], {fill: o.fill ?? '#f4f5f5'}),
    text(str, 28, 20, size, {color: o.color ?? '#15181b'}),
  ], {x: Math.round(cx - w / 2), y, pivotX: w / 2, pivotY: h, keys: [{t: 0, alpha: 0, scaleX: 0.5, scaleY: 0.5}, {t, alpha: 0, scaleX: 0.5, scaleY: 0.5}, {t: t + 0.18, alpha: 1, scaleX: 1.05, scaleY: 1.05}, {t: t + 0.28, alpha: 1, scaleX: 1, scaleY: 1}, ...(o.until ? [{t: o.until, alpha: 1}, {t: o.until + 0.2, alpha: 0}] : [])]});
}
// Big stamped word ("FAKE!") — pops in rotated
export function stamp(str, cx, cy, t, o = {}) {
  const size = o.size ?? 110, w = measure(str, size) + 70, h = size + 50, col = o.color ?? C.red;
  return grp([rect(0, 0, w, h, o.bg ?? 'rgba(17,19,22,0.85)', {r: 20, stroke: col, lineWidth: 10}), text(str, 35, 22, size, {color: col})],
    {x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), angle: o.angle ?? -0.1, pivotX: w / 2, pivotY: h / 2,
      keys: [{t: 0, alpha: 0, scaleX: 2, scaleY: 2}, {t, alpha: 0, scaleX: 2, scaleY: 2}, {t: t + 0.18, alpha: 1, scaleX: 0.94, scaleY: 0.94}, {t: t + 0.3, alpha: 1, scaleX: 1, scaleY: 1}]});
}
export const sweat = (x, y, t) => drop(x, y, 0.22, C.air, {keys: [{t: 0, alpha: 0}, {t, alpha: 0, y}, {t: t + 0.15, alpha: 1}, {t: t + 0.9, y: y + 60, alpha: 0}]});
export const marks = (str, x, y, t, col = C.amber, size = 96) => text(str, x, y, size, {color: col, keys: [{t: 0, alpha: 0}, {t, alpha: 0, y: y + 20}, {t: t + 0.15, alpha: 1, y}]});
// little "shake" lines around a point
export const shakeLines = (cx, cy, r, t) => [0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3 + 0.3; return line([[cx + Math.cos(a) * r, cy + Math.sin(a) * r], [cx + Math.cos(a) * (r + 40), cy + Math.sin(a) * (r + 40)]], {color: C.amber, lineWidth: 8, alpha: 0, keys: [{t: 0, alpha: 0}, {t, alpha: 0}, {t: t + 0.1, alpha: 1}, {t: t + 0.5, alpha: 1}, {t: t + 0.7, alpha: 0}]}); });
export const floor = (y, col = '#1c2228') => rect(72, y, 1136, 1458 - y, col, {r: 0});
export const shadow = (cx, y, w) => ell(cx - w / 2, y - 14, w, 28, 'rgba(0,0,0,0.38)');
// keyframes: bounce (jump), jitter (tantrum)
export const hop = (t, y0, hgt = 60, n = 2, gap = 0.3) => { const k = []; for (let i = 0; i < n; i++) { k.push({t: t + i * gap, y: y0}, {t: t + i * gap + gap / 2, y: y0 - hgt}); } k.push({t: t + n * gap, y: y0}); return k; };
export const jitter = (t, x0, amp = 10, n = 8, gap = 0.07) => [...Array.from({length: n}, (_, i) => ({t: +(t + i * gap).toFixed(3), x: x0 + (i % 2 ? amp : -amp)})), {t: +(t + n * gap).toFixed(3), x: x0}];
// 5-slot end card for EP.05+ (icons are fns returning a layer drawn into a 200×200 box at given origin)
export function endCard2(ep, icons, teaser) {
  const xs = [100, 320, 540, 760, 980];
  return [...chrome(ep, 'FOLLOW FOR MORE', 0.1),
    ctext('HIDDEN DESIGN', 300, 70, {keys: fadeIn(0.15)}),
    ctext(teaser ?? 'NEW EPISODES EVERY WEEK', 400, 36, {color: C.mid, keys: fadeIn(0.4)}),
    ...icons.map((f, i) => grp([rect(0, 0, 200, 200, C.inset, {r: 26, stroke: i + 5 === ep ? C.amber : C.edge, lineWidth: i + 5 === ep ? 6 : 3}), f()], {x: xs[i], y: 640, keys: [{t: 0, alpha: 0}, {t: 0.2 + i * 0.16, alpha: 0, y: 690}, {t: 0.45 + i * 0.16, alpha: 1, y: 640}]})),
    ...['EP.05', 'EP.06', 'EP.07', 'EP.08', 'EP.09'].map((s, i) => ctext(s, 870, 30, {cx: xs[i] + 100, color: i + 5 === ep ? C.amber : C.dim, keys: fadeIn(0.5 + i * 0.16)})),
  ];
}
// ---------- EP.05–09 icons (each fills a 200×200 tile) ----------
export const icon5 = () => grp([rect(40, 30, 120, 140, '#3a4048', {r: 18, stroke: INK, lineWidth: 3}), ell(65, 60, 70, 70, C.light, {stroke: INK, lineWidth: 3}),
  pathL([['M', 78, 80], ['L', 98, 95], ['L', 78, 110], ['Z']], {fill: C.dark}), pathL([['M', 122, 80], ['L', 102, 95], ['L', 122, 110], ['Z']], {fill: C.dark}), line([[60, 60], [140, 140]], {color: C.red, lineWidth: 8})]);
export const icon6 = () => grp([rect(40, 70, 120, 80, '#c9ced3', {r: 14, stroke: INK, lineWidth: 3}), rect(56, 82, 88, 26, C.dark, {r: 6}), rect(92, 40, 14, 40, C.light, {r: 4}), rect(92, 32, 14, 10, C.amber, {r: 3}),
  ...[0, 1, 2].map(i => pathL([['M', 98 + i * 6, 28], ['Q', 108 + i * 6, 14, 98 + i * 6, 2]], {fill: 'none', stroke: C.mid, lineWidth: 3}))]);
export const icon7 = () => grp([rect(45, 30, 110, 140, '#2f5d8a', {r: 16, stroke: INK, lineWidth: 3}), ...[[60, 45, '#e0a24a'], [100, 60, '#6fcf8e'], [70, 95, '#e0533d'], [115, 110, '#e0a24a'], [62, 135, '#6fcf8e'], [110, 145, '#e0533d'], [88, 80, '#d5d8db']].map(([x, y, c]) => rect(x, y, 22, 14, c, {r: 4}))]);
export const icon8 = () => grp([pathL([['M', 30, 40], ['L', 170, 40], ['L', 165, 170], ['L', 35, 170], ['Z']], {fill: '#3c5f8f', stroke: INK, lineWidth: 3}), pathL([['M', 40, 40], ['Q', 70, 110, 120, 40]], {fill: 'none', stroke: '#e0a24a', lineWidth: 5}),
  rect(95, 55, 50, 50, '#34547f', {r: 6, stroke: '#e0a24a', lineWidth: 3}), ell(110, 62, 22, 22, C.light)]);
export const icon9 = () => grp([rect(20, 80, 160, 60, '#b9c3cc', {r: 10, stroke: INK, lineWidth: 3}), pathL([['M', 20, 80], ['L', 180, 80], ['L', 170, 70], ['L', 30, 70], ['Z']], {fill: '#9aa6b0'}), ell(26, 92, 20, 36, C.amber), rect(30, 140, 140, 30, '#dfe5ea', {r: 4})]);
export const ICONS = [icon5, icon6, icon7, icon8, icon9];
