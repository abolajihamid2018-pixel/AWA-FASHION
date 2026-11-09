// Episode kit: timing from the narration, shared beats (whistle, close-up insert, payoff grid, end card), camera, props.
import fs from 'node:fs';
import path from 'node:path';
import {W, H, P, F, clamp, lerp, seg, E, track, popIn, rnd, rr, fillStroke, circle, ellipse, line, withT, text, measure,
  tableBg, blueprintBg, player, pawn, ref, board, coin, stamp, kinetic} from './hm.mjs';

export function loadTiming(dir, {lead = 0.15, tail = 0.75} = {}) {
  const sents = JSON.parse(fs.readFileSync(path.join(dir, 'tools/sentences.json')));
  const script = JSON.parse(fs.readFileSync(path.join(dir, 'script.json')));
  const captions = JSON.parse(fs.readFileSync(path.join(dir, 'captions.json')));
  const T = {}, C = {}; let ci = 0;
  script.forEach((s, i) => { T[s.id] = sents[i].start + lead; C[s.id] = captions.slice(ci, ci + s.caps.length).map(c => c.start); ci += s.caps.length; });
  const DURATION = +(sents.at(-1).end + lead + tail).toFixed(3);
  const captionAt = t => { let cur = null; for (const c of captions) if (t >= c.start && t < c.end) cur = c; return cur; };
  return {T, C, captions, DURATION, captionAt};
}
export function camera(ctx, {z = 1, fx = W / 2, fy = H / 2, sx = 0, sy = 0}, draw) {
  ctx.save(); ctx.translate(W / 2 + sx, H / 2 + sy); ctx.scale(z, z); ctx.translate(-fx, -fy); draw(); ctx.restore();
}
export const shake = (t, at, amp = 14) => t < at ? 0 : amp * Math.exp(-(t - at) * 9) * Math.sin((t - at) * 70);
export function sweatDrop(ctx, x, y, t, at) {
  const k = seg(t, at, at + 0.9); if (k <= 0 || k >= 1) return;
  withT(ctx, x, y + k * 50, 1, 0, () => { ctx.beginPath(); ctx.moveTo(0, -18); ctx.quadraticCurveTo(14, 4, 0, 10); ctx.quadraticCurveTo(-14, 4, 0, -18); fillStroke(ctx, P.cyan, P.ink, 3); }, 1, 1, 1 - k);
}
export function bubble(ctx, str, x, y, k, {size = 54, tail = 0, fill = P.card, col = P.ink} = {}) {
  if (k <= 0) return;
  withT(ctx, x, y, k, 0, () => {
    const w = measure(ctx, str, size, F.display) + 60, h = size + 46;
    rr(ctx, -w / 2, -h / 2, w, h, 26); fillStroke(ctx, fill);
    ctx.beginPath(); ctx.moveTo(tail - 22, h / 2 - 3); ctx.lineTo(tail + 6, h / 2 + 40); ctx.lineTo(tail + 22, h / 2 - 3); ctx.closePath(); fillStroke(ctx, fill, null, 0);
    line(ctx, [[tail - 22, h / 2], [tail + 6, h / 2 + 40], [tail + 22, h / 2]], P.ink, 6);
    text(ctx, str, 0, 4, {font: F.display, size, col});
  });
}
export function rays(ctx, t, cx, cy, cols = ['rgba(255,197,61,0.20)', 'rgba(255,197,61,0.05)'], n = 14, speed = 0.6) {
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + t * speed; ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(1500, -70); ctx.lineTo(1500, 70); ctx.closePath(); ctx.fillStyle = cols[i % 2]; ctx.fill(); ctx.restore();
  }
}
// "Let's play the game." beat (pattern interrupt before every model)
export function whistleBeat(ctx, t, at) {
  tableBg(ctx, t, {drift: 30}); const lt = t - at;
  rays(ctx, lt, W / 2, 960);
  const k = popIn(t, at, 0.4);
  if (k > 0) ref(ctx, W / 2, 1000, 2.6 * k, t, {whistle: lt > 0.15 && lt < 0.9 ? 1 : 0});
  [[300, 1260, P.pip], [780, 1260, P.dot]].forEach(([x, y, c], i) => { const kk = popIn(t, at + 0.2 + i * 0.12, 0.35); if (kk > 0) withT(ctx, x, y - Math.abs(Math.sin(lt * 7 + i)) * 30, kk, 0, () => pawn(ctx, 0, 0, 1.3, c)); });
  kinetic(ctx, [[['LET\'S', at + 0.05], ['PLAY.', at + 0.3]]], W / 2, 520, t, {size: 140});
}
// big character close-up insert (punch-in), e.g. "Ooh. Wait.", "Mine!", "Down in front!"
export function insert(ctx, t, at, {col = P.pip, expr = 'eureka', bg = '#FFE6B0', R = [70, -300], L = [-60, -110], flip = false, line: say, sayCol = P.ink, shakeAmp = 0, prop = null} = {}) {
  const lt = t - at, z = lerp(1.18, 1, E.outCubic(seg(lt, 0, 0.3)));
  tableBg(ctx, t, {col: bg, dot: 'rgba(28,32,48,0.08)'});
  ctx.save(); ctx.translate(W / 2 + shake(t, at + 0.05, shakeAmp), 1000); ctx.scale(z, z);
  rays(ctx, lt * 1.3, 0, 0, ['rgba(255,106,85,0.16)', 'rgba(255,197,61,0.25)'], 16, 0.8);
  player(ctx, 0, 420, {s: 2.0, col, expr, t, seed: col === P.pip ? 1 : 2, tilt: Math.sin(lt * 26) * 0.05, R, L, look: flip ? -0.5 : 0.5, flip});
  if (prop) prop(ctx, lt);
  ctx.restore();
  if (say) bubble(ctx, say, W / 2, 470, popIn(t, at + 0.05, 0.3), {size: 84, col: sayCol});
}
// 2×2 payoff grid on the Hidden Layer. cells: [[label lines…], fill?] in order TL, TR, BL, BR
export function payoffGrid(ctx, t, at, {rows, cols, cells, eq = 3, eqAt = at + 1.2, x0 = 260, y0 = 600, size = 270}) {
  text(ctx, cols[0], x0 + size / 2 + 2, y0 - 30, {font: F.mono, size: 28, col: P.cyan}); text(ctx, cols[1], x0 + size * 1.5 + 22, y0 - 30, {font: F.mono, size: 28, col: P.cyan});
  rows.forEach((r, i) => { ctx.save(); ctx.translate(x0 - 38, y0 + size / 2 + i * (size + 20)); ctx.rotate(-Math.PI / 2); text(ctx, r, 0, 0, {font: F.mono, size: 28, col: P.cyan}); ctx.restore(); });
  cells.forEach((lines, i) => {
    const c = i % 2, r = i >> 1, k = popIn(t, at + 0.25 + i * 0.14, 0.4); if (k <= 0) return;
    const isEq = i === eq && t > eqAt;
    withT(ctx, x0 + c * (size + 20) + size / 2, y0 + r * (size + 20) + size / 2, k, 0, () => {
      rr(ctx, -size / 2, -size / 2, size, size, 26); fillStroke(ctx, isEq ? P.coin : 'rgba(124,216,255,0.08)', isEq ? P.ink : P.cyan, 6);
      lines.forEach(([s, col], j) => text(ctx, s, 0, (j - (lines.length - 1) / 2) * 56, {font: F.mono, size: 40, col: isEq ? P.ink : col}));
    });
  });
}
// End card: callback drawing + logo tiles + tagline + Ref whistle
export function endBeat(ctx, t, at, cues, callback) {
  tableBg(ctx, t);
  callback(ctx, t);
  const word = 'HIDDEN MOVES', tile = 78, gap = 8, tw = word.length * (tile + gap) - gap, x0 = W / 2 - tw / 2;
  [...word].forEach((ch, i) => {
    if (ch === ' ') return; const k = seg(t, at + 0.15 + i * 0.05, at + 0.45 + i * 0.05); if (k <= 0) return;
    withT(ctx, x0 + i * (tile + gap) + tile / 2, 470, 1, 0, () => {
      rr(ctx, -tile / 2, -tile / 2 - 8, tile, tile + 16, 14); fillStroke(ctx, i < 6 ? P.card : P.coin, P.ink, 5);
      text(ctx, ch, 0, 4, {font: F.display, size: 64});
    }, Math.max(0.02, E.outBack(k)), 1);
  });
  kinetic(ctx, [[['EVERYTHING', cues[0] + 0.1], ['IS', cues[0] + 0.35], ['A', cues[0] + 0.45], ['GAME.', cues[0] + 0.6]]], W / 2, 640, t, {size: 64, font: F.cap});
  const rk = popIn(t, cues[1] + 0.2, 0.35); if (rk > 0) ref(ctx, 540, 790, 0.9 * rk, t, {whistle: t > cues[1] + 0.4 && t < cues[1] + 1.1 ? 1 : 0});
}
export const headline = (ctx, t, items, y = 400) => { for (const [a, b, lines, o] of items) if (t >= a && t < b) kinetic(ctx, lines, W / 2, y, t, {size: 104, ...o}); };
export function lockIcon(ctx, x, y, k) {
  withT(ctx, x, y, k, 0, () => {
    ctx.beginPath(); ctx.arc(0, -40, 32, Math.PI, 0); ctx.strokeStyle = P.ink; ctx.lineWidth = 16; ctx.stroke(); ctx.strokeStyle = P.crowd; ctx.lineWidth = 8; ctx.stroke();
    rr(ctx, -50, -44, 100, 80, 16); fillStroke(ctx, P.coin); circle(ctx, 0, -12, 10, P.ink, null, 0);
  });
}
export function check(ctx, x, y, s, k, col = P.win) {
  if (k <= 0) return; line(ctx, [[x - 50 * s, y], [x - 12 * s, y + 38 * s], [x + 60 * s, y - 50 * s]], col, 18 * s, null, k);
}
export function cross(ctx, x, y, s, k, col = P.loss) {
  if (k <= 0) return; line(ctx, [[x - 50 * s, y - 50 * s], [x + 50 * s, y + 50 * s]], col, 18 * s, null, clamp(k * 2)); line(ctx, [[x + 50 * s, y - 50 * s], [x - 50 * s, y + 50 * s]], col, 18 * s, null, clamp(k * 2 - 1));
}
export function confetti(ctx, t, at, n = 40, cx = W / 2, cy = 700) {
  const lt = t - at; if (lt < 0 || lt > 2.2) return;
  for (let i = 0; i < n; i++) {
    const a = rnd(i) * Math.PI * 2, v = 500 + rnd(i + 7) * 700, x = cx + Math.cos(a) * v * lt * 0.6, y = cy + Math.sin(a) * v * lt * 0.5 + 900 * lt * lt;
    withT(ctx, x, y, 1, lt * 10 * (rnd(i + 3) - 0.5), () => { ctx.fillStyle = [P.pip, P.dot, P.coin, P.cyan][i % 4]; ctx.fillRect(-10, -6, 20, 12); }, 1, 1, 1 - seg(lt, 1.5, 2.2));
  }
}

// ---------------------------------------------------------------- props for EP.02–04
export function jar(ctx, x, y, s, {fill = 1, label = '?', t = 0, lid = 0} = {}) {
  withT(ctx, x, y, s, 0, () => {
    ellipse(ctx, 0, 6, 150, 20, 'rgba(74,63,117,0.22)');
    rr(ctx, -140, -380, 280, 380, 60); fillStroke(ctx, 'rgba(207,238,255,0.55)', P.ink, 7);
    ctx.save(); rr(ctx, -132, -372, 264, 366, 54); ctx.clip();
    const top = lerp(0, -330, fill);
    for (let i = 0; i < 70; i++) { const cx = -120 + (i * 37) % 240, cy = -20 - Math.floor(i / 7) * 34; if (cy < top) continue; circle(ctx, cx + (i % 2) * 14, cy, 22, i % 5 === 0 ? '#d9dee3' : P.coin, P.ink, 4); }
    ctx.restore();
    line(ctx, [[-100, -340], [-100, -60]], 'rgba(255,255,255,0.6)', 12);
    withT(ctx, 0, -392 - lid * 120, 1, lid * -0.5, () => { rr(ctx, -120, -26, 240, 46, 14); fillStroke(ctx, P.plum); });
    if (label) { rr(ctx, -80, -250, 160, 110, 14); fillStroke(ctx, P.card); text(ctx, label, 0, -194, {font: F.display, size: 78}); }
  });
}
export function gavel(ctx, x, y, s, ang) {   // pivot at the handle end; ang 0 = upright, +ve swings the head to the right
  withT(ctx, x, y, s, ang, () => {
    rr(ctx, -12, -260, 24, 260, 10); fillStroke(ctx, '#a0714a');
    rr(ctx, -90, -320, 180, 80, 20); fillStroke(ctx, '#8a5a36'); rr(ctx, -100, -326, 26, 92, 8); fillStroke(ctx, '#d4b25a'); rr(ctx, 74, -326, 26, 92, 8); fillStroke(ctx, '#d4b25a');
  });
}
export function card(ctx, x, y, w, h, {fill = P.card, stroke = P.ink, title, titleCol = P.ink, price, priceCol = P.ink, sub, icon, alpha = 1, rot = 0, s = 1, hl = 0} = {}) {
  withT(ctx, x, y, s, rot, () => {
    if (hl > 0) { rr(ctx, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 34); fillStroke(ctx, `rgba(255,197,61,${0.7 * hl})`, null, 0); }
    rr(ctx, -w / 2, -h / 2, w, h, 26); fillStroke(ctx, fill, stroke, 6);
    if (icon) icon(ctx, 0, -h / 2 + 110);
    if (title) text(ctx, title, 0, -h / 2 + 210, {font: F.cap, size: 40, col: titleCol});
    if (price) text(ctx, price, 0, h / 2 - 90, {font: F.display, size: 84, col: priceCol});
    if (sub) text(ctx, sub, 0, h / 2 - 34, {font: F.mono, size: 24, col: P.soft});
  }, s, s, alpha);
}
export function laptopIcon(ctx, x, y) { rr(ctx, x - 60, y - 54, 120, 80, 10); fillStroke(ctx, P.cyan); rr(ctx, x - 80, y + 26, 160, 18, 6); fillStroke(ctx, P.crowd); }
export function magazineIcon(ctx, x, y) { rr(ctx, x - 50, y - 64, 100, 128, 8); fillStroke(ctx, P.loss); rr(ctx, x - 36, y - 50, 72, 22, 4); fillStroke(ctx, P.card, null, 0); for (let i = 0; i < 3; i++) line(ctx, [[x - 34, y + 4 + i * 18], [x + 34, y + 4 + i * 18]], P.card, 6); }
export function bothIcon(ctx, x, y) { magazineIcon(ctx, x - 40, y + 4); withT(ctx, 34, -6, 0.8, 0, () => laptopIcon(ctx, x, y)); }
export function barChart(ctx, x, y, w, rows, k) {   // rows: [[label, value 0..100, col]]
  rows.forEach(([lab, v, col], i) => {
    const yy = y + i * 110, kk = E.outCubic(clamp(k * 1.3 - i * 0.15));
    text(ctx, lab, x, yy, {font: F.mono, size: 32, col: P.soft, align: 'left', base: 'middle'});
    rr(ctx, x + 250, yy - 30, w - 250, 60, 30); fillStroke(ctx, 'rgba(28,32,48,0.06)', P.ink, 4);
    const bw = (w - 250) * v / 100 * kk; if (bw > 8) { rr(ctx, x + 250, yy - 30, bw, 60, 30); fillStroke(ctx, col, P.ink, 4); }
    const la = rows[i][3] ?? 1; if (kk >= 0.999 && la > 0) { ctx.save(); ctx.globalAlpha *= la; text(ctx, `${Math.round(v)}%`, x + 250 + Math.max(bw, 0) + 20, yy + 2, {font: F.mono, size: 40, col: P.ink, align: 'left'}); ctx.restore(); }
  });
}
export function duck(ctx, x, y, s, t) {   // wooden decoy duck
  withT(ctx, x, y + Math.sin(t * 3) * 6, s, Math.sin(t * 2.4) * 0.05, () => {
    ellipse(ctx, 0, 30, 170, 16, 'rgba(28,32,48,0.18)');
    ctx.beginPath(); ctx.moveTo(-170, -10); ctx.quadraticCurveTo(-150, 40, -40, 40); ctx.lineTo(120, 40); ctx.quadraticCurveTo(170, 30, 160, -20); ctx.quadraticCurveTo(80, -70, -60, -50); ctx.quadraticCurveTo(-150, -50, -170, -10); ctx.closePath(); fillStroke(ctx, '#a0714a');
    ctx.beginPath(); ctx.moveTo(-40, -30); ctx.quadraticCurveTo(40, -70, 110, -10); ctx.quadraticCurveTo(40, 10, -40, -30); fillStroke(ctx, '#8a5a36', P.ink, 4);
    circle(ctx, 120, -110, 62, '#3f7a52'); ctx.beginPath(); ctx.moveTo(170, -110); ctx.quadraticCurveTo(250, -100, 240, -76); ctx.quadraticCurveTo(200, -78, 170, -90); ctx.closePath(); fillStroke(ctx, P.coin);
    circle(ctx, 136, -122, 9, P.ink, null, 0); rr(ctx, 70, -60, 90, 20, 8); fillStroke(ctx, P.card, P.ink, 3);
  });
}
export function stage(ctx, t, x, y, w, h, {lights = true} = {}) {   // concert stage (front view), top-left x,y
  rr(ctx, x, y, w, h, 20); fillStroke(ctx, '#2b2346');
  if (lights) for (let i = 0; i < 4; i++) {
    const cx = x + w * (0.2 + i * 0.2), a = Math.sin(t * 1.6 + i * 1.3) * 0.35;
    ctx.save(); ctx.translate(cx, y + 10); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(120, h * 1.3); ctx.lineTo(-120, h * 1.3); ctx.closePath();
    ctx.fillStyle = ['rgba(255,197,61,0.22)', 'rgba(124,216,255,0.22)', 'rgba(255,106,85,0.22)', 'rgba(255,197,61,0.22)'][i]; ctx.fill(); ctx.restore();
  }
  rr(ctx, x - 20, y + h - 30, w + 40, 46, 12); fillStroke(ctx, '#5b4f8c');
  for (let i = 0; i < 3; i++) { const bx = x + w * (0.3 + i * 0.2), bob = Math.abs(Math.sin(t * 8 + i)) * 12; pawn(ctx, bx, y + h - 30 - bob, 0.8, ['#9a6fcf', P.coin, P.cyan][i]); }
  rr(ctx, x + 10, y + h - 160, 70, 130, 10); fillStroke(ctx, P.ink); rr(ctx, x + w - 80, y + h - 160, 70, 130, 10); fillStroke(ctx, P.ink);
}
// concert-goer seen from the side, facing right. stand 0..1
export function fan(ctx, x, y, s, stand, {col = P.crowd, face = false, expr = 'neutral', t = 0, seed = 0, riseMax = 70} = {}) {
  const rise = stand * riseMax;
  withT(ctx, x, y, s, 0, () => {
    rr(ctx, -46, -84, 26, 84, 8); fillStroke(ctx, '#7a6a5a', P.ink, 4); rr(ctx, -46, -40, 80, 16, 6); fillStroke(ctx, '#7a6a5a', P.ink, 4);   // chair
    line(ctx, [[-4, -40 - rise], [lerp(22, 2, stand), -6]], P.ink, 9); line(ctx, [[8, -40 - rise], [lerp(34, 16, stand), -6]], P.ink, 9);
    rr(ctx, -26, -150 - rise, 52, 110, 24); fillStroke(ctx, col);
    circle(ctx, 4, -194 - rise, 40, face ? P.card : col);
    if (face) { ellipse(ctx, 22, -200 - rise, 5, 9, P.ink); if (expr === 'shocked') ellipse(ctx, 26, -176 - rise, 5, 7, P.ink); if (expr === 'tired') line(ctx, [[12, -210 - rise], [30, -206 - rise]], P.ink, 4); }
  });
}
