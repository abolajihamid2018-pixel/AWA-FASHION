// Hidden Moves animation engine: pure functions of time drawn on a 1080×1920 canvas.
// Every component is (ctx, props) → draws; every animation is f(t). No hidden state, so any frame renders independently.
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const W = 1080, H = 1920, FPS = 30;
export const P = {cream: '#F6EEDF', card: '#FFF8EF', ink: '#1C2030', pip: '#FF6A55', dot: '#16B3A6', coin: '#FFC53D', navy: '#12203A', cyan: '#7CD8FF',
  plum: '#4A3F75', plum2: '#5b4f8c', crowd: '#B9B4C7', loss: '#D7263D', felt: '#9BD58A', felt2: '#86c776', road: '#5e6378', soft: '#4b5066', win: '#3cbf6a'};
export const F = {display: 'Bricolage', cap: 'Figtree', capSemi: 'FigtreeSemi', mono: 'JBMono'};

export function loadCanvas(skillPkg) {
  const require = createRequire(skillPkg);
  const lib = require('@napi-rs/canvas');
  const fd = path.join(HERE, '..', 'fonts');
  lib.GlobalFonts.registerFromPath(path.join(fd, 'Bricolage-800.ttf'), F.display);
  lib.GlobalFonts.registerFromPath(path.join(fd, 'Figtree-800.ttf'), F.cap);
  lib.GlobalFonts.registerFromPath(path.join(fd, 'Figtree-600.ttf'), F.capSemi);
  lib.GlobalFonts.registerFromPath(path.join(fd, 'JBMono-700.ttf'), F.mono);
  return lib;
}

// ---------------------------------------------------------------- time & easing
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => clamp((t - a) / Math.max(1e-6, b - a));
export const E = {
  linear: k => k,
  outCubic: k => 1 - Math.pow(1 - k, 3),
  inCubic: k => k * k * k,
  inOutCubic: k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  outBack: (k, s = 1.70158) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2),
  outElastic: k => k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
  inOutSine: k => -(Math.cos(Math.PI * k) - 1) / 2,
};
// value track: keys [[t, v, ease?], ...] with absolute times
export function track(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i], [t0, v0] = keys[i - 1];
      if (t <= t1) return lerp(v0, v1, (E[e ?? 'inOutCubic'])(seg(t, t0, t1)));
    }
    return keys.at(-1)[1];
  };
}
// pop-in scale with overshoot: 0 before `at`, overshoots then settles
export const popIn = (t, at, dur = 0.38) => t < at ? 0 : E.outBack(seg(t, at, at + dur), 2.2);
export const fadeIn = (t, at, dur = 0.25) => seg(t, at, at + dur);
// deterministic pseudo-random
export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// natural blinking: closed amount 0..1
export function blinkAt(t, seed = 0) {
  const period = 3.1 + rnd(seed) * 1.7, ph = (t + rnd(seed + 9) * period) % period;
  return ph < 0.14 ? Math.sin(ph / 0.14 * Math.PI) : 0;
}

// ---------------------------------------------------------------- primitives
export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
export function fillStroke(ctx, fill, stroke = P.ink, lw = 6) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke && lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
export function circle(ctx, x, y, r, fill, stroke = P.ink, lw = 6) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); fillStroke(ctx, fill, stroke, lw); }
export function ellipse(ctx, x, y, rx, ry, fill, stroke = null, lw = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), 0, 0, Math.PI * 2); fillStroke(ctx, fill, stroke, lw); }
export function line(ctx, pts, col = P.ink, lw = 6, dash = null, progress = 1) {
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let left = tot * clamp(progress); if (left <= 0) return;
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 1; i < pts.length && left > 0; i++) { const f = Math.min(1, left / L[i - 1]); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); left -= L[i - 1]; }
  ctx.setLineDash(dash || []); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.setLineDash([]);
}
export function withT(ctx, x, y, s, rot, fn, sx = s, sy = s, alpha = 1) {
  if (alpha <= 0.001 || sx === 0 || sy === 0) return;
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(sx, sy); ctx.globalAlpha *= clamp(alpha); fn(); ctx.restore();
}
export function text(ctx, str, x, y, {font = F.cap, size = 60, col = P.ink, align = 'center', base = 'middle', stroke = null, lw = 0, track: tr = 0} = {}) {
  ctx.font = `800 ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = base;
  if (tr) ctx.letterSpacing = `${tr}px`;
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
  ctx.fillStyle = col; ctx.fillText(str, x, y);
  if (tr) ctx.letterSpacing = '0px';
}
export const measure = (ctx, str, size, font = F.cap) => { ctx.font = `800 ${size}px ${font}`; return ctx.measureText(str).width; };

// ---------------------------------------------------------------- backgrounds
export function tableBg(ctx, t, {col = P.cream, dot = 'rgba(28,32,48,0.10)', drift = 0} = {}) {
  ctx.fillStyle = col; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = dot; const g = 44, ox = (drift * t) % g;
  for (let y = 22; y < H; y += g) for (let x = 22 - ox; x < W + g; x += g) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); }
}
export const blueprintBg = (ctx, t) => {
  tableBg(ctx, t, {col: P.navy, dot: 'rgba(124,216,255,0.16)'});
  ctx.strokeStyle = 'rgba(124,216,255,0.07)'; ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 132) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 132) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
};

// ---------------------------------------------------------------- cast
const CREAM = P.card;
function face(ctx, expr, blink, look) {
  const ink = P.ink, lx = look * 4;
  const eye = (x) => { ellipse(ctx, x + lx, -252, 8, 12 * (1 - 0.9 * blink), ink); if (blink < 0.5) circle(ctx, x + 3 + lx, -257, 3, '#fff', null, 0); };
  const stroke = (pts, lw = 7) => line(ctx, pts, ink, lw);
  const quad = (x0, y0, cx, cy, x1, y1, lw = 7) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke(); };
  switch (expr) {
    case 'smug':
      ellipse(ctx, -18 + lx, -250, 8, 10, ink); ellipse(ctx, 18 + lx, -250, 8, 10, ink);
      ctx.fillStyle = CREAM; ctx.fillRect(-30, -264, 60, 13);
      stroke([[-30, -252], [-6, -252]], 5); stroke([[6, -252], [30, -252]], 5);
      stroke([[-30, -276], [-8, -272]]); quad(8, -284, 20, -290, 32, -282); quad(-6, -222, 8, -214, 20, -226, 5); break;
    case 'shocked':
      circle(ctx, -18, -252, 13, '#fff', ink, 4); circle(ctx, 18, -252, 13, '#fff', ink, 4); circle(ctx, -18 + lx, -252, 4, ink, null, 0); circle(ctx, 18 + lx, -252, 4, ink, null, 0);
      quad(-32, -282, -20, -294, -8, -284); quad(8, -284, 20, -294, 32, -282); ellipse(ctx, 0, -219, 9, 12, ink); break;
    case 'suspicious':
      stroke([[-28, -252], [-8, -252]], 8); stroke([[8, -252], [28, -252]], 8); stroke([[-32, -276], [-8, -266]]); stroke([[8, -266], [32, -276]]); stroke([[-4, -222], [14, -222]], 5); break;
    case 'eureka':
      quad(-28, -250, -18, -264, -8, -250); quad(8, -250, 18, -264, 28, -250); quad(-30, -284, -18, -292, -6, -284); quad(6, -284, 18, -292, 30, -284);
      ctx.beginPath(); ctx.moveTo(-16, -230); ctx.quadraticCurveTo(0, -204, 16, -230); ctx.closePath(); ctx.fillStyle = ink; ctx.fill(); break;
    case 'defeated':
      ellipse(ctx, -18 + lx, -246, 7, 9 * (1 - 0.9 * blink), ink); ellipse(ctx, 18 + lx, -246, 7, 9 * (1 - 0.9 * blink), ink);
      stroke([[-30, -262], [-8, -270]]); stroke([[8, -270], [30, -262]]); quad(-12, -214, 0, -226, 12, -214, 5); break;
    case 'grin':
      eye(-18); eye(18); quad(-30, -280, -19, -288, -8, -281); quad(8, -281, 19, -288, 30, -280);
      ctx.beginPath(); ctx.moveTo(-18, -228); ctx.quadraticCurveTo(0, -208, 18, -228); ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.stroke(); break;
    default:
      eye(-18); eye(18); quad(-30, -276, -19, -282, -8, -277); quad(8, -277, 19, -282, 30, -276);
  }
}
// Player (Pip/Dot). Feet at (x,y). o: {s, col, expr, L, R, tilt (rad), squash, t, seed, look, flip, legs: 'stand'|'walk', walkPhase, holdR(fn)}
export function player(ctx, x, y, o) {
  const s = o.s ?? 1, t = o.t ?? 0, sq = o.squash ?? 1, col = o.col;
  const breathe = 1 + Math.sin(t * 2.6 + (o.seed ?? 0)) * 0.012;
  withT(ctx, x, y, 1, 0, () => {
    ctx.scale(s * (o.flip ? -1 : 1) / Math.sqrt(sq), s * sq);
    ellipse(ctx, 0, 2, 56, 9, 'rgba(74,63,117,0.25)');
    const wp = o.walkPhase ?? 0, sw = o.legs === 'walk' ? Math.sin(wp) * 16 : 0;
    ctx.beginPath(); ctx.moveTo(-14, -108); ctx.quadraticCurveTo(-22 + sw * 0.5, -54, -26 + sw, -10); ctx.moveTo(14, -108); ctx.quadraticCurveTo(22 - sw * 0.5, -54, 26 - sw, -10);
    ctx.strokeStyle = P.ink; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke();
    ellipse(ctx, -32 + sw, -6, 17, 8, P.ink); ellipse(ctx, 32 - sw, -6, 17, 8, P.ink);
    const arm = (sx, h, bend) => {
      ctx.beginPath(); ctx.moveTo(sx, -176); ctx.quadraticCurveTo((sx + h[0]) / 2 + bend, (-176 + h[1]) / 2 + 18, h[0], h[1]);
      ctx.strokeStyle = P.ink; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke(); circle(ctx, h[0], h[1], 12, CREAM, P.ink, 5);
    };
    const R = o.R ?? [58, -110], L = o.L ?? [-58, -110];
    arm(26, R, 14);
    if (o.holdR) withT(ctx, R[0], R[1], 1, 0, o.holdR);
    ctx.save(); ctx.translate(0, -146); ctx.scale(1, breathe); ctx.translate(0, 146);
    rr(ctx, -30, -194, 60, 96, 30); fillStroke(ctx, col);
    ctx.restore();
    withT(ctx, 0, -200, 1, o.tilt ?? 0, () => {
      ctx.translate(0, 200);
      ellipse(ctx, 0, -198, 46, 13, col, P.ink, 6);
      circle(ctx, 0, -252, 58, CREAM);
      face(ctx, o.expr ?? 'neutral', blinkAt(t, o.seed ?? 0), o.look ?? 0);
    });
    arm(-26, L, -14);
  });
}
export function pawn(ctx, x, y, s, col = P.crowd, alpha = 1) {
  withT(ctx, x, y, s, 0, () => {
    ctx.beginPath(); ctx.moveTo(-30, 0); ctx.quadraticCurveTo(-24, -60, 0, -64); ctx.quadraticCurveTo(24, -60, 30, 0); ctx.closePath(); fillStroke(ctx, col, P.ink, 6);
    ellipse(ctx, 0, -66, 26, 8, col, P.ink, 5); circle(ctx, 0, -96, 26, col, P.ink, 6);
  }, s, s, alpha);
}
// Ref: yellow referee token. o.whistle 0..1 (blowing), o.sign {text, k}
export function ref(ctx, x, y, s, t, o = {}) {
  withT(ctx, x, y, s, Math.sin(t * 3) * 0.04, () => {
    ellipse(ctx, 0, 70, 50, 9, 'rgba(74,63,117,0.25)');
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.fillStyle = P.coin; ctx.fill(); ctx.clip();
    ctx.fillStyle = P.ink; for (const v of [-44, -26, -8, 10, 28, 46]) ctx.fillRect(v, 14, 10, 44);
    ctx.restore(); circle(ctx, 0, 0, 52, null);
    const b = blinkAt(t, 5); ellipse(ctx, -14, -14, 6, 9 * (1 - 0.9 * b), P.ink); ellipse(ctx, 14, -14, 6, 9 * (1 - 0.9 * b), P.ink);
    const wb = o.whistle ?? 0;
    ctx.beginPath(); ctx.moveTo(30, -2); ctx.quadraticCurveTo(60 - wb * 40, 10 - wb * 20, 70 - wb * 60, 34 - wb * 40); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke();
    withT(ctx, 70 - wb * 60, 30 - wb * 40, 1, -wb * 0.6, () => { rr(ctx, -8, 0, 34, 18, 8); fillStroke(ctx, P.crowd, P.ink, 4); });
    if (wb > 0.3) for (let i = 0; i < 3; i++) line(ctx, [[46 + i * 8, -60 - i * 14], [70 + i * 14, -84 - i * 18]], P.ink, 6);
  });
  if (o.sign) {
    const k = o.sign.k; if (k <= 0) return;
    withT(ctx, x, y - 120 * s, k, 0, () => {
      const w = measure(ctx, o.sign.text, 54, F.display) + 70;
      rr(ctx, -w / 2, -64, w, 100, 18); fillStroke(ctx, P.card, P.ink, 6);
      text(ctx, o.sign.text, 0, -14, {font: F.display, size: 54, col: o.sign.col ?? P.ink});
      line(ctx, [[0, 36], [0, 120]], P.ink, 8);
    });
  }
}

// ---------------------------------------------------------------- world props
// Board slab (toy board floating on the table). top-left (x,y), size w×h, thickness d
export function board(ctx, x, y, w, h, {d = 44, top = P.felt, side = P.plum, side2 = P.plum2, shadow = true, stroke = P.ink} = {}) {
  if (shadow) ellipse(ctx, x + w / 2, y + h + d + 30, w * 0.48, 26, 'rgba(74,63,117,0.20)');
  rr(ctx, x, y + d * 0.2, w, h + d * 0.8, 34); fillStroke(ctx, side, stroke, 6);
  rr(ctx, x, y, w, h, 34); fillStroke(ctx, top, stroke, 6);
}
export function road(ctx, x0, x1, y, {h = 64, col = P.road, dashCol = P.card, progress = 1, stroke = P.ink} = {}) {
  const x1p = lerp(x0, x1, progress); if (x1p - x0 < 4) return;
  rr(ctx, x0, y - h / 2, x1p - x0, h, h / 2); fillStroke(ctx, col, stroke, 5);
  ctx.save(); ctx.setLineDash([26, 22]); line(ctx, [[x0 + 30, y], [Math.max(x0 + 31, x1p - 30), y]], dashCol, 6, [26, 22]); ctx.restore();
}
// Gas station token, bottom-centre (x,y). o.col team colour, o.hidden blueprint mode, o.ghost alpha
export function station(ctx, x, y, s, o = {}) {
  const hid = o.hidden, ink = hid ? P.cyan : P.ink, body = hid ? 'rgba(124,216,255,0.06)' : P.card, col = hid ? 'rgba(124,216,255,0.10)' : o.col;
  withT(ctx, x, y, s, o.rot ?? 0, () => {
    ctx.scale(1 / Math.sqrt(o.squash ?? 1), o.squash ?? 1);
    if (!hid) ellipse(ctx, 0, 4, 110, 14, 'rgba(74,63,117,0.22)');
    rr(ctx, -100, -16, 200, 18, 8); fillStroke(ctx, hid ? 'none' : '#d9cdb8', ink, 5);
    rr(ctx, -82, -170, 20, 156, 6); fillStroke(ctx, body, ink, 5); rr(ctx, 62, -170, 20, 156, 6); fillStroke(ctx, body, ink, 5);
    rr(ctx, -26, -96, 52, 82, 10); fillStroke(ctx, body, ink, 5); rr(ctx, -16, -86, 32, 22, 4); fillStroke(ctx, hid ? 'none' : P.ink, ink, 3);
    ctx.beginPath(); ctx.moveTo(26, -60); ctx.quadraticCurveTo(48, -50, 44, -20); ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.stroke();
    rr(ctx, -112, -212, 224, 48, 14); fillStroke(ctx, col, ink, 6); rr(ctx, -96, -200, 192, 12, 6); fillStroke(ctx, hid ? 'none' : 'rgba(255,255,255,0.45)', null, 0);
    line(ctx, [[0, -212], [0, -262]], ink, 7); circle(ctx, 0, -292, 34, col, ink, 6);
    ctx.beginPath(); ctx.moveTo(0, -312); ctx.quadraticCurveTo(-16, -290, -12, -282); ctx.quadraticCurveTo(0, -268, 12, -282); ctx.quadraticCurveTo(16, -290, 0, -312); ctx.closePath(); fillStroke(ctx, hid ? 'none' : P.card, hid ? ink : null, hid ? 3 : 0);
  }, s, s, o.alpha ?? 1);
}
export function cafe(ctx, x, y, s, col) {
  withT(ctx, x, y, s, 0, () => {
    ellipse(ctx, 0, 4, 100, 12, 'rgba(74,63,117,0.22)');
    rr(ctx, -90, -150, 180, 150, 10); fillStroke(ctx, P.card);
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-100 + i * 40, -150); ctx.lineTo(-60 + i * 40, -150); ctx.lineTo(-80 + i * 40, -110); ctx.closePath(); fillStroke(ctx, i % 2 ? P.card : col, P.ink, 4); }
    rr(ctx, -100, -170, 200, 26, 8); fillStroke(ctx, col); rr(ctx, -30, -90, 60, 90, 6); fillStroke(ctx, P.ink);
    circle(ctx, 0, -215, 30, col); rr(ctx, -14, -228, 26, 24, 5); fillStroke(ctx, P.card, P.ink, 3);
  });
}
export function podium(ctx, x, y, s, col) {
  withT(ctx, x, y, s, 0, () => {
    ellipse(ctx, 0, 4, 80, 12, 'rgba(74,63,117,0.22)');
    ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(-44, -130); ctx.lineTo(44, -130); ctx.lineTo(60, 0); ctx.closePath(); fillStroke(ctx, col);
    rr(ctx, -70, -150, 140, 26, 8); fillStroke(ctx, P.card); line(ctx, [[20, -150], [36, -196]], P.ink, 6); circle(ctx, 38, -204, 10, P.ink, null, 0);
  });
}
export function car(ctx, x, y, s, col, dir = 1) {
  withT(ctx, x, y, s, 0, () => {
    ctx.scale(dir, 1);
    rr(ctx, -80, -60, 160, 46, 20); fillStroke(ctx, col); rr(ctx, -46, -92, 90, 40, 16); fillStroke(ctx, col);
    rr(ctx, -36, -84, 30, 26, 6); fillStroke(ctx, P.cyan, P.ink, 4); rr(ctx, 2, -84, 30, 26, 6); fillStroke(ctx, P.cyan, P.ink, 4);
    circle(ctx, -46, -14, 18, P.ink, null, 0); circle(ctx, 46, -14, 18, P.ink, null, 0); circle(ctx, -46, -14, 7, P.crowd, null, 0); circle(ctx, 46, -14, 7, P.crowd, null, 0);
  });
}
export function coin(ctx, x, y, s, spin = 0) {
  withT(ctx, x, y, 1, 0, () => { ctx.scale(s * Math.max(0.15, Math.abs(Math.cos(spin))), s); circle(ctx, 0, 0, 24, P.coin, P.ink, 5); circle(ctx, 0, 0, 13, null, '#d99a1a', 4); });
}
// share bar (Pip left / Dot right). share = Pip's fraction
export function shareBar(ctx, x, y, w, share, {k = 1, hidden = false} = {}) {
  if (k <= 0) return;
  withT(ctx, x + w / 2, y, k, 0, () => {
    const h = 74, x0 = -w / 2;
    rr(ctx, x0, -h / 2, w, h, h / 2); fillStroke(ctx, hidden ? 'rgba(124,216,255,0.08)' : P.dot, hidden ? P.cyan : P.ink, 6);
    ctx.save(); rr(ctx, x0, -h / 2, w, h, h / 2); ctx.clip(); ctx.fillStyle = P.pip; ctx.fillRect(x0, -h / 2, w * share, h);
    ctx.fillStyle = hidden ? 'rgba(18,32,58,0.15)' : 'rgba(255,255,255,0.18)'; ctx.fillRect(x0, -h / 2, w, h * 0.35); ctx.restore();
    rr(ctx, x0, -h / 2, w, h, h / 2); fillStroke(ctx, null, hidden ? P.cyan : P.ink, 6);
    line(ctx, [[x0 + w * share, -h / 2 - 10], [x0 + w * share, h / 2 + 10]], P.coin, 8);
    text(ctx, `${Math.round(share * 100)}%`, x0 + 28, 2, {font: F.mono, size: 44, col: P.card, align: 'left'});
    text(ctx, `${Math.round((1 - share) * 100)}%`, -x0 - 28, 2, {font: F.mono, size: 44, col: P.card, align: 'right'});
    text(ctx, 'PIP', x0 + 6, -h / 2 - 30, {font: F.mono, size: 30, col: hidden ? P.cyan : P.pip, align: 'left'});
    text(ctx, 'DOT', -x0 - 6, -h / 2 - 30, {font: F.mono, size: 30, col: hidden ? P.cyan : '#0f8f85', align: 'right'});
  });
}
// stamped label (rule cards, punchlines)
export function stamp(ctx, str, x, y, k, {size = 96, col = P.coin, bg = P.navy, rot = -0.06, font = F.display} = {}) {
  if (k <= 0) return;
  const s = k < 1 ? lerp(2.2, 1, E.outCubic(k)) : 1;
  withT(ctx, x, y, s, rot, () => {
    const w = measure(ctx, str, size, font) + 80, h = size + 54;
    rr(ctx, -w / 2, -h / 2, w, h, 22); fillStroke(ctx, bg, col, 9);
    text(ctx, str, 0, 4, {font, size, col});
  }, s, s, clamp(k * 3));
}
// kinetic headline: lines of words; each word pops at its own time. hl: set of words to colour
export function kinetic(ctx, lines, cx, y, t, {size = 110, lh = 1.08, col = P.ink, hl = {}, font = F.display, stroke = null} = {}) {
  const maxW = 940;
  const widest = Math.max(...lines.map(words => words.reduce((a, [w]) => a + measure(ctx, w, size, font), 0) + size * 0.36 * (words.length - 1)));
  if (widest > maxW) size = Math.floor(size * maxW / widest);
  lines.forEach((words, li) => {
    const ws = words.map(([w]) => measure(ctx, w, size, font)), gap = size * 0.36, tot = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
    let x = cx - tot / 2;
    words.forEach(([w, at], i) => {
      const k = popIn(t, at, 0.32);
      if (k > 0) withT(ctx, x + ws[i] / 2, y + li * size * lh, k, (1 - Math.min(1, k)) * -0.2, () => text(ctx, w, 0, 0, {font, size, col: hl[w] ?? col, stroke, lw: stroke ? 14 : 0}));
      x += ws[i] + gap;
    });
  });
}
// dust puff on impact
export function dust(ctx, x, y, t, at, n = 9, col = '#e9dcc5') {
  const k = seg(t, at, at + 0.6); if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = Math.PI + (i / (n - 1)) * Math.PI, r = 30 + 150 * E.outCubic(k) * (0.7 + rnd(i) * 0.6);
    circle(ctx, x + Math.cos(a) * r * 1.4, y + Math.sin(a) * r * 0.35 - 10, (26 + rnd(i + 3) * 18) * (1 - k), col, P.ink, 4 * (1 - k));
  }
}
export function sparkle(ctx, x, y, r, k, col = P.coin) {
  if (k <= 0 || k >= 1) return; const s = Math.sin(k * Math.PI) * r;
  ctx.beginPath(); ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s); ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}

// ---------------------------------------------------------------- captions & brand
export function caption(ctx, str, k, {y = 1515, hidden = false} = {}) {
  if (!str || k <= 0) return;
  const up = str.toUpperCase(); let size = 58; const mw = measure(ctx, up, size); if (mw > 960) size = Math.floor(size * 960 / mw); const w = measure(ctx, up, size) + 64;
  withT(ctx, W / 2, y + (1 - E.outCubic(k)) * 18, 1, 0, () => {
    rr(ctx, -w / 2, -48, w, 96, 24); fillStroke(ctx, hidden ? P.cyan : P.ink, null, 0);
    text(ctx, up, 0, 3, {size, col: hidden ? P.navy : P.card});
  }, 1, 1, clamp(k * 2));
}
export function brandBug(ctx, ep, hidden = false) {
  text(ctx, 'HIDDEN MOVES', 72, 252, {font: F.mono, size: 26, col: hidden ? P.cyan : P.soft, align: 'left'});
  text(ctx, `EP.${String(ep).padStart(2, '0')}`, W - 72, 252, {font: F.mono, size: 26, col: hidden ? P.cyan : P.soft, align: 'right'});
}

// ---------------------------------------------------------------- transitions
// Tile flip: grid of tiles flips from frame A to frame B, staggered diagonally. k: 0..1
export function tileFlip(ctx, A, B, k, {cols = 6, rows = 10} = {}) {
  const tw = W / cols, th = H / rows;
  ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const delay = (c + r) / (cols + rows - 2) * 0.5, kk = clamp((k - delay) / 0.5), sx = Math.abs(Math.cos(kk * Math.PI));
    const src = kk < 0.5 ? A : B, x = c * tw, y = r * th;
    ctx.save(); ctx.translate(x + tw / 2, y + th / 2); ctx.scale(Math.max(0.001, sx), 1 - 0.06 * Math.sin(kk * Math.PI));
    ctx.drawImage(src, x, y, tw, th, -tw / 2, -th / 2, tw, th); ctx.restore();
  }
}
// Coin wipe: a big yellow coin rolls across the frame; B is revealed behind its trailing edge
export function coinWipe(ctx, A, B, k) {
  const e = E.inOutCubic(k), cx = lerp(-320, W + 320, e), r = 300;
  ctx.drawImage(A, 0, 0);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Math.max(0, cx), H); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
  ctx.fillStyle = P.coin; ctx.fillRect(cx - 70, 0, 140, H); line(ctx, [[cx - 70, 0], [cx - 70, H]], P.ink, 8); line(ctx, [[cx + 70, 0], [cx + 70, H]], P.ink, 8);
  withT(ctx, cx, H / 2, 1, e * 9, () => { circle(ctx, 0, 0, r, P.coin, P.ink, 12); circle(ctx, 0, 0, r * 0.72, null, '#d99a1a', 14); text(ctx, 'HM', 0, 8, {font: F.display, size: 170, col: '#d99a1a'}); });
}
