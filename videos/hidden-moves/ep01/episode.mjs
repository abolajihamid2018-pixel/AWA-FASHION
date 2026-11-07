// HIDDEN MOVES · EP.01 — "Why do rival gas stations end up next to each other?" (Hotelling's Law)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {W, H, P, F, clamp, lerp, seg, E, track, popIn, fadeIn, rnd, rr, fillStroke, circle, ellipse, line, withT, text, measure,
  tableBg, blueprintBg, player, pawn, ref, board, road, station, cafe, podium, car, coin, shareBar, stamp, kinetic, dust, sparkle, caption, brandBug} from '../engine/hm.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LEAD = 0.15, TAIL = 0.75;
const sents = JSON.parse(fs.readFileSync(path.join(HERE, 'tools/sentences.json')));
const script = JSON.parse(fs.readFileSync(path.join(HERE, 'script.json')));
export const captions = JSON.parse(fs.readFileSync(path.join(HERE, 'captions.json')));
export const EP = 1;
export const DURATION = +(sents.at(-1).end + LEAD + TAIL).toFixed(3);
// T.id = sentence start; C.id = caption-chunk starts (absolute seconds, video time)
export const T = {}, C = {};
{ let ci = 0; script.forEach((s, i) => { T[s.id] = sents[i].start + LEAD; C[s.id] = captions.slice(ci, ci + s.caps.length).map(c => c.start); ci += s.caps.length; }); }

// ---------------------------------------------------------------- game geometry & state
const RX0 = 190, RX1 = 890, ROADY = 1150, GROUND = 1092;   // road ends, road centre, where stations/characters stand
const X = p => lerp(RX0, RX1, p);
const N = 12, DRIVERS = Array.from({length: N}, (_, i) => (i + 0.5) / N);
const r = T.race;
const pA = track([[0, 0], [C.pipmove[0] + 0.25, 0], [C.pipmove[0] + 1.9, 0.30],
  [r + 0.15, 0.30], [r + 0.55, 0.42], [r + 1.25, 0.42], [r + 1.6, 0.46], [r + 1.85, 0.46], [r + 2.4, 0.435],
  [C.twist[4] + 0.2, 0.435], [C.twist[4] + 1.1, 0.25]]);
const pB = track([[0, 1], [C.dotmove[0] + 0.1, 1], [C.dotmove[0] + 1.4, 0.62],
  [r + 0.7, 0.62], [r + 1.1, 0.54], [r + 1.85, 0.54], [r + 2.4, 0.565],
  [C.twist[4] + 0.2, 0.565], [C.twist[4] + 1.1, 0.75]]);
const ghostOn = t => t >= C.stuck[1] && t < C.stuck[3] + 0.6;
const ghostP = track([[C.stuck[1], 0.435], [C.stuck[1] + 0.5, 0.25], [C.stuck[3] + 0.2, 0.25], [C.stuck[3] + 0.6, 0.435]]);
const effA = t => ghostOn(t) ? ghostP(t) : pA(t);
const boundary = t => (effA(t) + pB(t)) / 2;
const moving = (f, t) => Math.abs(f(t + 0.05) - f(t - 0.05)) > 0.002;

// ---------------------------------------------------------------- shared helpers
function camera(ctx, {z = 1, fx = W / 2, fy = H / 2, sx = 0, sy = 0}, draw) {
  ctx.save(); ctx.translate(W / 2 + sx, H / 2 + sy); ctx.scale(z, z); ctx.translate(-fx, -fy); draw(); ctx.restore();
}
const shake = (t, at, amp = 14) => t < at ? 0 : amp * Math.exp(-(t - at) * 9) * Math.sin((t - at) * 70);
const dropY = (t, at, h = 700) => t < at ? -h : t < at + 0.32 ? -h * (1 - E.inCubic(seg(t, at, at + 0.32))) : 0;
const landSquash = (t, at) => t < at + 0.32 ? 1 : 1 - 0.22 * Math.exp(-(t - at - 0.32) * 7) * Math.cos((t - at - 0.32) * 20);
function lockIcon(ctx, x, y, k) {
  withT(ctx, x, y, k, 0, () => {
    ctx.beginPath(); ctx.arc(0, -40, 32, Math.PI, 0); ctx.strokeStyle = P.ink; ctx.lineWidth = 16; ctx.stroke(); ctx.strokeStyle = P.crowd; ctx.lineWidth = 8; ctx.stroke();
    rr(ctx, -50, -44, 100, 80, 16); fillStroke(ctx, P.coin); circle(ctx, 0, -12, 10, P.ink, null, 0); rr(ctx, -5, -12, 10, 26, 4); fillStroke(ctx, P.ink, null, 0);
  });
}
function sweatDrop(ctx, x, y, t, at) {
  const k = seg(t, at, at + 0.9); if (k <= 0 || k >= 1) return;
  withT(ctx, x, y + k * 50, 1, 0, () => { ctx.beginPath(); ctx.moveTo(0, -18); ctx.quadraticCurveTo(14, 4, 0, 10); ctx.quadraticCurveTo(-14, 4, 0, -18); fillStroke(ctx, P.cyan, P.ink, 3); }, 1, 1, 1 - k);
}
function coinsFly(ctx, from, to, t, at, dur = 0.7) {
  from.forEach(([x, y], i) => {
    const k = seg(t, at + i * 0.06, at + i * 0.06 + dur); if (k <= 0 || k >= 1) return;
    const e = E.inOutCubic(k), cx = lerp(x, to[0], e), cy = lerp(y, to[1], e) - Math.sin(e * Math.PI) * 160;
    coin(ctx, cx, cy, 0.9, t * 9 + i);
  });
}
function marker(ctx, t, b, k, hidden = false) {   // the "split point" between the two catchment areas
  if (k <= 0) return; const x = X(b);
  withT(ctx, x, ROADY - 74, k, 0, () => {
    ctx.beginPath(); ctx.moveTo(-16, -26); ctx.lineTo(16, -26); ctx.lineTo(0, 0); ctx.closePath(); fillStroke(ctx, P.coin, hidden ? P.cyan : P.ink, 4);
  });
  line(ctx, [[x, ROADY - 40], [x, ROADY + 40]], P.coin, 6, [10, 9], k);
}
function driverColour(i, t, hidden) {
  const p = DRIVERS[i];
  if (t < C.setup[2]) return hidden ? 'rgba(124,216,255,0.15)' : P.crowd;
  const wave = C.setup[2] + Math.min(p, 1 - p) * 1.1; if (t < wave) return P.crowd;
  return p < boundary(t) ? P.pip : P.dot;
}
function drivers(ctx, t, {hidden = false, appear = C.road[1], hl = null} = {}) {
  DRIVERS.forEach((p, i) => {
    const k = popIn(t, appear + i * 0.07, 0.3); if (k <= 0) return;
    const near = Math.exp(-Math.pow((p - boundary(t)) / 0.035, 2)), bump = t > C.setup[2] ? 1 + 0.28 * near : 1;
    const hop = hl && hl(i) ? Math.abs(Math.sin((t - hl(i)) * 9)) * 16 * Math.exp(-(t - hl(i)) * 2) : 0;
    const col = hidden ? (t < C.twist[1] ? 'rgba(124,216,255,0.12)' : driverColour(i, t, false)) : driverColour(i, t, hidden);
    withT(ctx, X(p), ROADY + 24 - hop, 0.56 * k * bump, 0, () => {
      if (hidden) { ctx.globalAlpha *= 0.9; }
      pawn(ctx, 0, 0, 1, col);
    });
  });
}
function gameBoard(ctx, t, {hidden = false, roadK = 1} = {}) {
  if (hidden) {
    rr(ctx, 60, 900, 960, 330, 34); fillStroke(ctx, 'rgba(124,216,255,0.05)', P.cyan, 5);
    road(ctx, RX0 - 40, RX1 + 40, ROADY, {col: 'rgba(124,216,255,0.08)', dashCol: P.cyan, stroke: P.cyan, progress: roadK});
  } else {
    board(ctx, 60, 900, 960, 330, {top: P.felt});
    for (let i = 0; i < 7; i++) { const x = 120 + i * 140; ellipse(ctx, x, 950 + (i % 2) * 14, 18, 10, P.felt2); }
    road(ctx, RX0 - 40, RX1 + 40, ROADY, {progress: roadK});
  }
  const col = hidden ? P.cyan : P.soft;
  text(ctx, '0', X(0), 1300, {font: F.mono, size: 32, col}); text(ctx, '1 MILE', X(1), 1300, {font: F.mono, size: 32, col});
  line(ctx, [[X(0), 1280], [X(1), 1280]], col, 3, [6, 10]);
}
function stationsAndPlayers(ctx, t, {hidden = false} = {}) {
  const sA = C.setup[0], sB = C.setup[1];
  // Pip side
  if (t >= sA) {
    const pa = pA(t), yA = dropY(t, sA), qA = landSquash(t, sA), push = moving(pA, t);
    station(ctx, X(pa), GROUND + yA, 0.56, {col: P.pip, squash: qA, hidden});
    if (!hidden) dust(ctx, X(pa), GROUND, t, sA + 0.32, 7);
    const ex = exprPip(t), k = popIn(t, sA + 0.45, 0.3);
    if (k > 0) withT(ctx, X(pa) - 98, GROUND, k, push ? 0.12 : 0, () => player(ctx, 0, 0, {s: 0.6, col: P.pip, expr: ex, t, seed: 1,
      R: push ? [86, -150] : [58, -110], L: push ? [70, -140] : (ex === 'shocked' ? [-60, -240] : [-58, -110]), legs: push ? 'walk' : 'stand', walkPhase: t * 16, look: 0.6}));
    if (ghostOn(t)) {
      const g = ghostP(t);
      station(ctx, X(g), GROUND, 0.5, {col: P.pip, alpha: 0.42, hidden});
      line(ctx, [[X(pa) - 60, GROUND - 200], [X(g) + 40, GROUND - 200]], P.loss, 6, [12, 10], seg(t, C.stuck[1], C.stuck[1] + 0.4));
    }
  }
  if (t >= sB) {
    const pb = pB(t), yB = dropY(t, sB), qB = landSquash(t, sB), push = moving(pB, t);
    station(ctx, X(pb), GROUND + yB, 0.56, {col: P.dot, squash: qB, hidden});
    if (!hidden) dust(ctx, X(pb), GROUND, t, sB + 0.32, 7);
    const ex = exprDot(t), k = popIn(t, sB + 0.45, 0.3);
    if (k > 0) withT(ctx, X(pb) + 98, GROUND, k, push ? -0.12 : 0, () => player(ctx, 0, 0, {s: 0.6, col: P.dot, expr: ex, t, seed: 2, flip: true,
      R: push ? [86, -150] : [58, -110], L: push ? [70, -140] : (ex === 'shocked' ? [-60, -240] : [-58, -110]), legs: push ? 'walk' : 'stand', walkPhase: t * 16, look: 0.6}));
  }
}
function exprPip(t) {
  if (t >= C.stuck[1] && t < C.stuck[3] + 0.6) return 'shocked';
  if (t >= T.stuck) return 'defeated';
  if (t >= T.race) return 'suspicious';
  if (t >= C.dotmove[0] + 1.0) return 'shocked';
  if (t >= T.pipmove) return 'grin';
  return 'neutral';
}
function exprDot(t) {
  if (t >= T.stuck) return t >= C.stuck[2] ? 'smug' : 'defeated';
  if (t >= T.race) return 'suspicious';
  if (t >= T.dotmove) return 'smug';
  if (t >= C.pipmove[3]) return 'shocked';
  if (t >= T.pipmove) return 'suspicious';
  return 'neutral';
}
const headline = (ctx, t, items, y = 430) => {          // items: [[start, end, lines, opts]]
  for (const [a, b, lines, o] of items) if (t >= a && t < b) kinetic(ctx, lines, W / 2, y, t, {size: 104, ...o});
};

// ---------------------------------------------------------------- SCENES
// 1 · TOWN: interruption + hook + doubt
function town(ctx, t) {
  tableBg(ctx, t);
  const z = track([[0, 1.28], [1.9, 1.28], [3.5, 0.8, 'inOutCubic'], [T.doubt, 0.8], [T.doubt + 0.7, 1.28]])(t);
  const fy = track([[0, 1010], [1.9, 1010], [3.5, 960], [T.doubt, 960], [T.doubt + 0.7, 1000]])(t);
  const impact = 0.32;
  camera(ctx, {z, fy, sx: shake(t, impact), sy: shake(t, impact) * 0.6}, () => {
    // mini boards (revealed by the pull-out): every pair of rivals sits side by side
    const minis = [[-110, 700, 'cafe'], [890, 720, 'station'], [-90, 1250, 'cafe2'], [870, 1240, 'station']];
    minis.forEach(([x, y, kind], i) => {
      const k = popIn(t, 2.0 + i * 0.16, 0.4); if (k <= 0) return;
      withT(ctx, x + 160, y + 90, k, 0, () => {
        ctx.translate(-160, -90); board(ctx, 0, 0, 320, 180, {d: 26});
        if (kind === 'station') { station(ctx, 120, 150, 0.32, {col: P.pip}); station(ctx, 200, 150, 0.32, {col: P.dot}); }
        else { const c2 = kind === 'cafe2'; cafe(ctx, 118, 150, 0.36, c2 ? '#9a6fcf' : P.pip); cafe(ctx, 202, 150, 0.36, c2 ? P.coin : P.dot); }
      });
    });
    board(ctx, 290, 860, 500, 270);
    for (let i = 0; i < 5; i++) ellipse(ctx, 330 + i * 100, 900 + (i % 2) * 12, 16, 9, P.felt2);
    // doubt beat: customers split between the two
    if (t >= T.doubt) for (let i = 0; i < 6; i++) {
      const a = T.doubt + 0.2 + i * 0.32, k = seg(t, a, a + 0.6); if (k <= 0) continue;
      const left = i % 2 === 0, e = E.inOutCubic(k);
      pawn(ctx, lerp(540, left ? 330 + (i >> 1) * 26 : 750 - (i >> 1) * 26, e), lerp(1250, 1105, e), 0.42, left ? P.pip : P.dot);
    }
    station(ctx, 610, 1100, 0.62, {col: P.dot});
    const yA = t < 0.32 ? -620 * (1 - E.inCubic(seg(t, -0.1, 0.32))) : 0;
    station(ctx, 470, 1100 + yA, 0.62, {col: P.pip, squash: landSquash(t, 0.0)});
    if (t < 0.34) for (let i = 0; i < 4; i++) line(ctx, [[400 + i * 46, 1100 + yA - 330 - i * 30], [400 + i * 46, 1100 + yA - 520 - i * 30]], P.ink, 7);
    dust(ctx, 470, 1100, t, impact, 9);
    // Dot reacts, Pip pops out waving
    const dEx = t < impact ? 'neutral' : t < 1.6 ? 'shocked' : t < T.doubt ? 'suspicious' : 'suspicious';
    player(ctx, 735, 1100, {s: 0.62, col: P.dot, expr: dEx, t, seed: 2, flip: true, look: t < impact ? 0.8 : 1, L: dEx === 'shocked' ? [-60, -240] : [-58, -110]});
    const kP = popIn(t, 0.6, 0.35);
    const wave = t > 1.0 && t < 2.2 ? Math.sin((t - 1) * 12) * 18 : 0;
    const pEx = t < T.doubt ? 'grin' : t < T.doubt + 1.3 ? 'neutral' : 'defeated';
    const shrug = t > T.doubt + 1.3;
    if (kP > 0) withT(ctx, 345, 1100, kP, 0, () => player(ctx, 0, 0, {s: 0.62, col: P.pip, expr: pEx, t, seed: 1,
      R: shrug ? [70, -170] : [58, -110], L: shrug ? [-70, -170] : [-70 + wave * 0.3, -250 + wave], look: 0.4}));
    // half-coin badges over each
    const kh = popIn(t, T.doubt + 1.2, 0.35);
    if (kh > 0) for (const [x, c] of [[470, P.pip], [610, P.dot]]) withT(ctx, x, 830, kh, 0, () => { circle(ctx, 0, 0, 40, P.coin, P.ink, 5); text(ctx, '½', 0, 4, {font: F.mono, size: 48, col: P.ink}); });
  });
  // screen-space: kinetic hook + Ref doubt sign
  if (t < T.doubt + 0.15) kinetic(ctx, [[['WHY', 0.0], ['ALWAYS', 0.16]], [['NEXT', 0.45], ['TO', 0.57], ['EACH', 0.7], ['OTHER?', 0.86]]], W / 2, 420, t, {size: 108, hl: {NEXT: P.pip, TO: P.dot}});
  else kinetic(ctx, [[['TERRIBLE', T.doubt + 0.9], ['BUSINESS?', T.doubt + 1.25]]], W / 2, 430, t, {size: 104});
  const kr = popIn(t, C.doubt[1], 0.35);
  if (kr > 0) ref(ctx, 900, 720, 0.9 * kr, t, {sign: {text: '½ EACH?', k: popIn(t, C.doubt[1] + 0.15, 0.3)}});
}

// 2 · WHISTLE: "So let's play the game."
function whistle(ctx, t) {
  tableBg(ctx, t, {drift: 30});
  const lt = t - T.play, k = popIn(t, T.play, 0.4), wb = lt > 0.15 && lt < 0.9 ? 1 : 0;
  for (let i = 0; i < 14; i++) {        // radiating rays
    const a = i / 14 * Math.PI * 2 + lt * 0.6; ctx.save(); ctx.translate(W / 2, 960); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(1400, -60); ctx.lineTo(1400, 60); ctx.closePath(); ctx.fillStyle = i % 2 ? 'rgba(255,197,61,0.20)' : 'rgba(255,197,61,0.05)'; ctx.fill(); ctx.restore();
  }
  if (k > 0) ref(ctx, W / 2, 1000, 2.6 * k, t, {whistle: wb});
  [[300, 1260, P.pip], [780, 1260, P.dot]].forEach(([x, y, c], i) => { const kk = popIn(t, T.play + 0.2 + i * 0.12, 0.35); if (kk > 0) withT(ctx, x, y - Math.abs(Math.sin(lt * 7 + i)) * 30, kk, 0, () => pawn(ctx, 0, 0, 1.3, c)); });
  kinetic(ctx, [[['LET\'S', T.play + 0.05], ['PLAY.', T.play + 0.3]]], W / 2, 520, t, {size: 140});
}

// 3 · GAME: the road model (road → stuck), with the "Ooh. Wait." insert
function game(ctx, t) {
  if (t >= T.idea && t < T.pipmove) return idea(ctx, t);
  tableBg(ctx, t);
  const zr = track([[T.road, 1], [r + 1.6, 1], [r + 2.6, 1.14], [C.stuck[3] + 0.4, 1.14], [T.law, 1.05]])(t);
  camera(ctx, {z: zr, fy: track([[T.road, 960], [r + 1.6, 960], [r + 2.6, 1010]])(t)}, () => {
    gameBoard(ctx, t, {roadK: E.outCubic(seg(t, T.road + 0.05, T.road + 0.7))});
    // closest-station demo (before any station exists)
    const dk = seg(t, C.road[2], C.road[2] + 0.3) * (1 - seg(t, C.setup[0] - 0.3, C.setup[0]));
    if (dk > 0) {
      ctx.globalAlpha = dk;
      for (const p of [0, 1]) { ctx.save(); ctx.setLineDash([12, 10]); rr(ctx, X(p) - 56, GROUND - 160, 112, 160, 14); fillStroke(ctx, null, P.ink, 4); ctx.restore(); text(ctx, '?', X(p), GROUND - 80, {font: F.display, size: 70, col: P.soft}); }
      const dp = X(DRIVERS[2]), y = ROADY + 70;
      line(ctx, [[dp, y], [X(0), y]], P.win, 8, null, seg(t, C.road[2] + 0.1, C.road[2] + 0.5));
      line(ctx, [[dp, y], [X(1), y]], P.loss, 8, [14, 12], seg(t, C.road[2] + 0.1, C.road[2] + 0.9));
      const ck = popIn(t, C.road[3] + 0.2); if (ck > 0) withT(ctx, X(0) + 40, y + 46, ck, 0, () => text(ctx, 'CLOSEST', 0, 0, {font: F.mono, size: 30, col: P.win}));
      ctx.globalAlpha = 1;
    }
    drivers(ctx, t, {hl: i => (t > C.pipmove[1] && t < C.pipmove[2] + 0.8 && DRIVERS[i] < pA(t)) ? C.pipmove[1] + i * 0.05 : null});
    marker(ctx, t, boundary(t), popIn(t, C.setup[2] + 0.6));
    stationsAndPlayers(ctx, t);
    // sparkles over "everyone behind"
    if (t > C.pipmove[1] && t < C.pipmove[2] + 0.6) DRIVERS.forEach((p, i) => { if (p < pA(t)) sparkle(ctx, X(p) + 20, ROADY - 70, 22, seg(t, C.pipmove[1] + i * 0.08, C.pipmove[1] + i * 0.08 + 0.6)); });
    // coins: converted drivers pay the mover
    coinsFly(ctx, DRIVERS.filter(p => p > 0.5 && p < 0.65).map(p => [X(p), ROADY - 40]), [X(0.30), GROUND - 150], t, C.pipmove[3] + 0.1);
    coinsFly(ctx, DRIVERS.filter(p => p > 0.46 && p < 0.65).map(p => [X(p), ROADY - 40]), [X(0.62), GROUND - 150], t, C.dotmove[1] + 0.05);
    coinsFly(ctx, DRIVERS.filter(p => p > 0.25 && p < 0.42).map(p => [X(p), ROADY - 40]), [X(0.565), GROUND - 150], t, C.stuck[3] - 0.1);
    // stuck: lock between the two, sweat
    const lk = popIn(t, C.stuck[0] + 0.1, 0.4) * (1 - seg(t, C.stuck[1] - 0.1, C.stuck[1] + 0.1) * 0) ;
    if (lk > 0 && t < T.law) lockIcon(ctx, X(0.5), GROUND - 230, lk);
    if (t >= T.stuck) { sweatDrop(ctx, X(pA(t)) - 70, GROUND - 170, t, C.stuck[0] + 0.3); sweatDrop(ctx, X(pB(t)) + 100, GROUND - 170, t, C.stuck[0] + 0.6); sweatDrop(ctx, X(pA(t)) - 60, GROUND - 170, t, C.stuck[2] + 0.2); }
    // race speed lines
    if (t > r && t < r + 2.4) for (const [f, dir] of [[pA, -1], [pB, 1]]) if (moving(f, t)) for (let i = 0; i < 3; i++) line(ctx, [[X(f(t)) + dir * (80 + i * 16), GROUND - 60 - i * 40], [X(f(t)) + dir * (150 + i * 30), GROUND - 60 - i * 40]], P.ink, 6);
  });
  // share bar + headlines (screen space)
  const kb = popIn(t, C.setup[2] + 0.2, 0.35);
  shareBar(ctx, 110, 690, 860, t >= C.setup[2] ? boundary(t) : 0.5, {k: kb});
  if (ghostOn(t) && t > C.stuck[1] + 0.4) { const kk = popIn(t, C.stuck[1] + 0.45, 0.3); withT(ctx, 260, 600, kk, 0, () => text(ctx, '-9%', 0, 0, {font: F.mono, size: 64, col: P.loss})); }
  headline(ctx, t, [
    [T.road, C.setup[0], [[['ONE', T.road + 0.05], ['ROAD.', T.road + 0.25]]]],
    [C.setup[0], T.idea, [[['PIP', C.setup[0] + 0.1], ['VS', C.setup[1]], ['DOT', C.setup[1] + 0.15]]], {hl: {PIP: P.pip, DOT: '#0f8f85'}}],
    [T.pipmove, T.dotmove, [[['PIP', T.pipmove + 0.05], ['MOVES', T.pipmove + 0.25], ['IN', T.pipmove + 0.45]]], {hl: {PIP: P.pip}}],
    [T.dotmove, T.race, [[['DOT', T.dotmove + 0.05], ['FIRES', T.dotmove + 0.25], ['BACK', T.dotmove + 0.45]]], {hl: {DOT: '#0f8f85'}}],
    [T.race, T.stuck, [[['MOVE.', T.race + 0.1]], [['COUNTER-MOVE.', T.race + 0.7]]], {size: 96}],
    [T.stuck, T.law, [[['STUCK.', T.stuck + 0.05]]], {col: P.loss, size: 130}],
  ], 400);
}
function idea(ctx, t) {
  const lt = t - T.idea, z = lerp(1.18, 1, E.outCubic(seg(lt, 0, 0.3)));
  tableBg(ctx, t, {col: '#FFE6B0', dot: 'rgba(28,32,48,0.08)'});
  ctx.save(); ctx.translate(W / 2, 1000); ctx.scale(z, z);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + lt * 0.8; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1300, -70); ctx.lineTo(1300, 70); ctx.closePath(); ctx.fillStyle = i % 2 ? 'rgba(255,106,85,0.18)' : 'rgba(255,197,61,0.25)'; ctx.fill(); ctx.restore(); }
  const wig = Math.sin(lt * 26) * 0.06;
  player(ctx, 0, 420, {s: 2.0, col: P.pip, expr: 'eureka', t, seed: 1, tilt: wig, R: [70, -300], L: [-60, -110], look: 0.5});
  ctx.restore();
  const k = popIn(t, T.idea + 0.1, 0.3);
  if (k > 0) withT(ctx, 820, 520, k, 0.12, () => text(ctx, '!', 0, 0, {font: F.display, size: 260, col: P.pip, stroke: P.ink, lw: 12}));
}

// 4 · LAW: Hidden Layer, payoff matrix, the named rule
function law(ctx, t) {
  blueprintBg(ctx, t);
  const lt = t - T.law;
  ref(ctx, W / 2, 420, 1.2 * popIn(t, T.law + 0.05, 0.35), t, {whistle: lt > 0.1 && lt < 0.7 ? 1 : 0});
  const cells = [[0, 0, '50', '50'], [1, 0, '62.5', '37.5'], [0, 1, '37.5', '62.5'], [1, 1, '50', '50']];
  text(ctx, 'DOT: MIDDLE', 395, 570, {font: F.mono, size: 30, col: P.cyan}); text(ctx, 'DOT: SIDE', 685, 570, {font: F.mono, size: 30, col: P.cyan});
  cells.forEach(([c, rI, a, b], i) => {
    const k = popIn(t, T.law + 0.3 + i * 0.14, 0.4); if (k <= 0) return;
    const x = 260 + c * 290, y = 600 + rI * 290, eq = c === 0 && rI === 0 && t > C.law[0] + 1.2;
    withT(ctx, x + 135, y + 135, k, 0, () => {
      rr(ctx, -135, -135, 270, 270, 26); fillStroke(ctx, eq ? P.coin : 'rgba(124,216,255,0.08)', eq ? P.ink : P.cyan, 6);
      const fmt = v => v;
      text(ctx, fmt(a), 0, -40, {font: F.mono, size: 66, col: eq ? '#b23a28' : P.pip}); text(ctx, fmt(b), 0, 48, {font: F.mono, size: 66, col: eq ? '#0b6f67' : '#4fe0d2'});
    });
  });
  ctx.save(); ctx.translate(222, 735); ctx.rotate(-Math.PI / 2); text(ctx, 'PIP: MIDDLE', 0, 0, {font: F.mono, size: 30, col: P.cyan}); ctx.restore();
  ctx.save(); ctx.translate(222, 1025); ctx.rotate(-Math.PI / 2); text(ctx, 'PIP: SIDE', 0, 0, {font: F.mono, size: 30, col: P.cyan}); ctx.restore();
  text(ctx, '% OF DRIVERS · SIMPLE ROAD MODEL', W / 2, 1210, {font: F.mono, size: 26, col: P.cyan});
  stamp(ctx, 'HOTELLING\'S LAW', W / 2, 1320, seg(t, C.law[0] + 0.7, C.law[0] + 0.95), {size: 84});
  const ky = popIn(t, C.law[1] + 1.0, 0.3); if (ky > 0) withT(ctx, 900, 1222, ky, 0.08, () => { rr(ctx, -90, -34, 180, 68, 14); fillStroke(ctx, P.navy, P.cyan, 4); text(ctx, '1929', 0, 3, {font: F.mono, size: 44, col: P.cyan}); });
}

// 5 · TWIST: Hidden Layer road — longer drives vs the quarter marks
function twist(ctx, t) {
  blueprintBg(ctx, t);
  gameBoard(ctx, t, {hidden: true});
  // quarter-mark ticks
  const qk = popIn(t, C.twist[4], 0.35);
  if (qk > 0) for (const [p, s] of [[0.25, '1/4'], [0.75, '3/4']]) withT(ctx, X(p), 1240, qk, 0, () => { line(ctx, [[0, -20], [0, 20]], P.coin, 6); text(ctx, s, 0, 46, {font: F.mono, size: 38, col: P.coin}); });
  drivers(ctx, t, {hidden: true, appear: T.twist - 2});
  marker(ctx, t, boundary(t), seg(t, C.twist[5], C.twist[5] + 0.3), true);
  // ghost of the old spots once they have moved
  if (t > C.twist[3]) { const gk = seg(t, C.twist[3], C.twist[3] + 0.3) * 0.35; for (const p of [0.435, 0.565]) station(ctx, X(p), GROUND, 0.5, {hidden: true, alpha: gk}); }
  station(ctx, X(pA(t)), GROUND, 0.5, {col: P.pip, hidden: false});
  station(ctx, X(pB(t)), GROUND, 0.5, {col: P.dot, hidden: false});
  // end drivers' trips
  const better = seg(t, C.twist[7], C.twist[7] + 0.5);
  const tripCol = better > 0.5 ? P.win : P.loss;
  for (const [i, f] of [[0, pA], [N - 1, pB]]) {
    const y = ROADY + 78, x0 = X(DRIVERS[i]);
    line(ctx, [[x0, y], [X(f(t)), y]], tripCol, 10, null, seg(t, C.twist[2], C.twist[2] + 0.6));
    if (t > C.twist[1]) { const pulse = 1 + 0.15 * Math.sin((t - C.twist[1]) * 8); circle(ctx, x0, ROADY - 10, 44 * pulse, null, P.coin, 6); }
  }
  // kinetic + stats
  if (t < C.twist[3]) kinetic(ctx, [[['THE', T.twist + 0.02], ['TWIST?', T.twist + 0.2]]], W / 2, 420, t, {size: 120, col: P.cyan});
  else if (t < C.twist[5]) kinetic(ctx, [[['QUARTER', C.twist[3] + 0.05]], [['MARKS', C.twist[4]]]], W / 2, 400, t, {size: 104, col: P.cyan});
  else kinetic(ctx, [[['SAME', C.twist[6]], ['SPLIT', C.twist[6] + 0.15]], [['SHORTER', C.twist[7]], ['DRIVES', C.twist[7] + 0.15]]], W / 2, 400, t, {size: 92, col: P.cyan, hl: {SHORTER: P.win, DRIVES: P.win}});
  const lk = popIn(t, C.twist[2] + 0.4, 0.3) * (1 - seg(t, C.twist[3], C.twist[3] + 0.2));
  if (lk > 0) withT(ctx, W / 2, 1385, lk, 0, () => text(ctx, 'LONG DRIVES AT THE ENDS', 0, 0, {font: F.mono, size: 34, col: P.loss}));
  shareBar(ctx, 110, 690, 860, boundary(t), {k: popIn(t, C.twist[5], 0.35), hidden: true});
  const sk = popIn(t, C.twist[7] + 0.3, 0.35);
  if (sk > 0) withT(ctx, W / 2, 1385, sk, 0, () => {
    rr(ctx, -360, -46, 720, 92, 20); fillStroke(ctx, P.navy, P.cyan, 4);
    text(ctx, 'AVG DRIVE', -230, 3, {font: F.mono, size: 36, col: P.cyan}); text(ctx, '1/4 MI', -10, 3, {font: F.mono, size: 40, col: P.loss}); line(ctx, [[80, 3], [140, 3]], P.coin, 6); line(ctx, [[124, -12], [142, 3], [124, 18]], P.coin, 6); text(ctx, '1/8 MI', 250, 3, {font: F.mono, size: 40, col: P.win});
  });
}

// 6 · WORLD: busy corners, then the same pull everywhere
function world(ctx, t) {
  tableBg(ctx, t);
  const c = C.world, slide = track([[c[2] - 0.35, 0], [c[2] + 0.15, -W], [c[5] - 0.35, -W], [c[5] + 0.15, -2 * W]])(t);
  ctx.save(); ctx.translate(slide, 0);
  // panel A: busy corner
  if (slide > -W + 1) {
    board(ctx, 90, 760, 900, 560);
    rr(ctx, 90, 980, 900, 110, 0); fillStroke(ctx, P.road, null, 0); rr(ctx, 560, 760, 110, 560, 0); fillStroke(ctx, P.road, null, 0);
    for (let i = 0; i < 8; i++) { const x = ((t * 260 + i * 260) % 1160) - 80; if (x < 560 - 90 || x > 670 + 90) car(ctx, x, 1060, 0.55, [P.cyan, P.coin, P.crowd][i % 3], 1); }
    for (let i = 0; i < 4; i++) { const y = ((t * 220 + i * 300) % 760) + 700; if (y > 820 && y < 1300 && (y < 960 || y > 1120)) car(ctx, 615, y, 0.5, [P.pip, P.coin][i % 2], 1); }
    station(ctx, 320, 960, 0.48, {col: P.pip}); station(ctx, 450, 960, 0.48, {col: P.dot});
    const ck = popIn(t, c[1], 0.35); if (ck > 0) { circle(ctx, 615, 1035, 110 * ck, null, P.coin, 8); withT(ctx, 800, 870, ck, -0.05, () => { rr(ctx, -150, -36, 300, 72, 16); fillStroke(ctx, P.coin); text(ctx, 'BUSY CORNER', 0, 3, {font: F.mono, size: 34}); }); }
  }
  // panel B: the pull is everywhere
  ctx.save(); ctx.translate(W, 0);
  const pairs = [[90, 700, 'station'], [570, 700, 'cafe'], [90, 1060, 'cafe2'], [570, 1060, 'station2']];
  pairs.forEach(([x, y, kind], i) => {
    const k = popIn(t, c[3] + i * 0.12, 0.35); const focus = kind === 'cafe' ? seg(t, c[4], c[4] + 0.4) : 0;
    if (k <= 0) return;
    withT(ctx, x + 210, y + 130, k * (1 + 0.15 * focus), 0, () => {
      ctx.translate(-210, -130); board(ctx, 0, 0, 420, 250, {d: 28, top: kind === 'cafe' ? '#ffd98a' : P.felt});
      const gap = lerp(95, 0, E.inOutCubic(seg(t, kind === 'cafe' ? c[4] : c[2] + 0.2, (kind === 'cafe' ? c[4] : c[2] + 0.2) + 0.9)));
      if (kind.startsWith('station')) { station(ctx, 150 - gap, 210, 0.4, {col: P.pip}); station(ctx, 270 + gap, 210, 0.4, {col: P.dot}); }
      else { const c2 = kind === 'cafe2'; cafe(ctx, 155 - gap, 210, 0.45, c2 ? '#9a6fcf' : P.pip); cafe(ctx, 265 + gap, 210, 0.45, c2 ? P.coin : P.dot); }
    });
  });
  const mk = popIn(t, c[2] + 0.1, 0.4) * (1 - seg(t, c[3], c[3] + 0.3));
  if (mk > 0) withT(ctx, W / 2, 1000, mk * 1.4, Math.sin(t * 6) * 0.08, () => {   // magnet
    ctx.beginPath(); ctx.arc(0, 0, 80, Math.PI, 0); ctx.lineTo(80, 70); ctx.lineTo(40, 70); ctx.lineTo(40, 0); ctx.arc(0, 0, 40, 0, Math.PI, true); ctx.lineTo(-40, 70); ctx.lineTo(-80, 70); ctx.closePath(); fillStroke(ctx, P.loss);
    rr(ctx, -80, 50, 40, 26, 4); fillStroke(ctx, P.card); rr(ctx, 40, 50, 40, 26, 4); fillStroke(ctx, P.card);
  });
  ctx.restore();
  // panel C: politicians chasing the middle (neutral colours, no parties)
  ctx.save(); ctx.translate(2 * W, 0);
  board(ctx, 70, 860, 940, 380, {top: '#e8e1f2'});
  line(ctx, [[130, 1130], [950, 1130]], P.ink, 6);
  line(ctx, [[540, 1100], [540, 1160]], P.coin, 8); text(ctx, 'MIDDLE', 540, 1200, {font: F.mono, size: 30, col: P.soft});
  for (let i = 0; i < 13; i++) { const x = 150 + i * 65; pawn(ctx, x, 1120, 0.38, P.crowd); }
  const g = lerp(380, 70, E.inOutCubic(seg(t, c[6] - 0.1, c[6] + 1.1)));
  podium(ctx, 540 - g, 1060, 0.7, P.pip); podium(ctx, 540 + g, 1060, 0.7, P.dot);
  ctx.restore();
  ctx.restore();
  // headlines
  if (t < c[2]) kinetic(ctx, [[['REAL', T.world + 0.05], ['TOWNS', T.world + 0.25]], [['ADD', T.world + 0.5], ['REASONS', T.world + 0.7]]], W / 2, 400, t, {size: 96});
  else if (t < c[5]) kinetic(ctx, [[['SAME', c[2] + 0.1], ['PULL,', c[2] + 0.3]], [['EVERYWHERE', c[3] + 0.05]]], W / 2, 400, t, {size: 96, hl: {EVERYWHERE: P.pip}});
  else kinetic(ctx, [[['CHASING', c[5] + 0.1]], [['THE', c[6]], ['MIDDLE', c[6] + 0.15]]], W / 2, 400, t, {size: 104, hl: {MIDDLE: P.coin}});
}

// 7 · END: callback to the opening image + brand lockup
function end(ctx, t) {
  tableBg(ctx, t);
  const lt = t - T.end;
  board(ctx, 290, 900, 500, 270);
  station(ctx, 470, 1140, 0.62, {col: P.pip}); station(ctx, 610, 1140, 0.62, {col: P.dot});
  const look = seg(t, C.end[1], C.end[1] + 0.3);
  player(ctx, 345, 1140, {s: 0.62, col: P.pip, expr: look > 0.5 ? 'smug' : 'grin', t, seed: 1, look: -look * 1.5, L: [-60, -110]});
  player(ctx, 735, 1140, {s: 0.62, col: P.dot, expr: 'smug', t, seed: 2, flip: true, look: -look * 1.5});
  const word = 'HIDDEN MOVES';
  const tile = 78, gap = 8, tw = word.length * (tile + gap) - gap, x0 = W / 2 - tw / 2;
  [...word].forEach((ch, i) => {
    if (ch === ' ') return; const k = seg(t, T.end + 0.15 + i * 0.05, T.end + 0.45 + i * 0.05); if (k <= 0) return;
    const sx = Math.abs(Math.cos((1 - k) * Math.PI / 2 * (k < 1 ? 1 : 0)));
    withT(ctx, x0 + i * (tile + gap) + tile / 2, 470, 1, 0, () => {
      rr(ctx, -tile / 2, -tile / 2 - 8, tile, tile + 16, 14); fillStroke(ctx, i < 6 ? P.card : P.coin, P.ink, 5);
      text(ctx, ch, 0, 4, {font: F.display, size: 64});
    }, Math.max(0.02, E.outBack(k)), 1);
  });
  kinetic(ctx, [[['EVERYTHING', C.end[0] + 0.1], ['IS', C.end[0] + 0.35], ['A', C.end[0] + 0.45], ['GAME.', C.end[0] + 0.6]]], W / 2, 640, t, {size: 64, font: F.cap});
  const rk = popIn(t, C.end[1] + 0.2, 0.35); if (rk > 0) ref(ctx, 540, 790, 0.9 * rk, t, {whistle: t > C.end[1] + 0.4 && t < C.end[1] + 1.1 ? 1 : 0});
}

// ---------------------------------------------------------------- timeline
export const SCENES = [
  {id: 'town', start: 0, draw: town},
  {id: 'whistle', start: T.play, draw: whistle},
  {id: 'game', start: T.road, draw: game, hiddenCap: false},
  {id: 'law', start: T.law, draw: law, hidden: true},
  {id: 'twist', start: T.twist, draw: twist, hidden: true},
  {id: 'world', start: T.world, draw: world},
  {id: 'end', start: T.end, draw: end},
];
// transitions around a scene start: [sceneIndex, type, before, after]
export const TRANSITIONS = [[2, 'flip', 0.32, 0.30], [3, 'flip', 0.32, 0.30], [4, 'flip', 0.25, 0.25], [5, 'flip', 0.32, 0.3], [6, 'wipe', 0.3, 0.35]];

// ---------------------------------------------------------------- sound cues (absolute seconds)
export function SFX() {
  const s = [];
  const add = (t, kind, gain = 1) => s.push({t: +t.toFixed(3), kind, gain});
  add(0.0, 'whoosh', 0.7); add(0.31, 'thunk', 1); [0.0, 0.16, 0.45, 0.57, 0.7, 0.86].forEach(t => add(t, 'tick', 0.35));
  add(0.6, 'pop', 0.6); [2.0, 2.16, 2.32, 2.48].forEach(t => add(t, 'pop', 0.45)); add(2.0, 'whoosh', 0.35);
  for (let i = 0; i < 6; i++) add(T.doubt + 0.4 + i * 0.32, 'step', 0.35);
  add(T.doubt + 0.9, 'tick', 0.4); add(T.doubt + 1.25, 'tick', 0.4); add(C.doubt[1], 'pop', 0.6); add(T.doubt + 1.2, 'coin', 0.5);
  add(T.play + 0.12, 'whistle', 0.9); add(T.play + 0.05, 'tick', 0.4); add(T.play + 0.3, 'tick', 0.4);
  for (const i of [2, 3, 4, 5]) add(SCENES[i].start - [0, 0, 0.32, 0.32, 0.25, 0.32][i], 'flip', 0.7);
  add(T.road + 0.05, 'whoosh', 0.4); for (let i = 0; i < N; i++) add(C.road[1] + i * 0.07, 'tick', 0.22);
  add(C.road[2] + 0.1, 'whoosh', 0.3); add(C.road[3] + 0.2, 'ding', 0.5);
  for (const c of [C.setup[0], C.setup[1]]) { add(c, 'whoosh', 0.55); add(c + 0.31, 'thunk', 0.85); }
  add(C.setup[2], 'sweep', 0.5); add(C.setup[2] + 0.2, 'pop', 0.5);
  add(T.idea, 'ding', 0.8);
  add(C.pipmove[0] + 0.25, 'slide', 0.6); add(C.pipmove[1], 'chime', 0.35); for (let i = 0; i < 2; i++) add(C.pipmove[3] + 0.75 + i * 0.06, 'coin', 0.55);
  add(C.dotmove[0] + 0.1, 'slide', 0.6); for (let i = 0; i < 3; i++) add(C.dotmove[1] + 0.7 + i * 0.06, 'coin', 0.5);
  for (const [a, b] of [[r + 0.15, 0.4], [r + 0.7, 0.4], [r + 1.25, 0.35], [r + 1.85, 0.5]]) add(a, 'slide', 0.45 * (b / 0.4));
  add(r + 0.1, 'tick', 0.4); add(r + 0.7, 'tick', 0.4); add(r + 2.3, 'thunk', 0.5);
  add(C.stuck[0] + 0.12, 'lock', 0.8); add(C.stuck[1], 'slide', 0.4); add(C.stuck[1] + 0.45, 'buzz', 0.5); add(C.stuck[3] - 0.1, 'coin', 0.5); add(C.stuck[3] + 0.2, 'slide', 0.3);
  add(T.law + 0.1, 'whistle', 0.7); for (let i = 0; i < 4; i++) add(T.law + 0.3 + i * 0.14, 'pop', 0.4);
  add(C.law[0] + 0.7, 'stamp', 1); add(C.law[0] + 1.2, 'ding', 0.4); add(C.law[1] + 1.0, 'tick', 0.5);
  add(T.twist + 0.2, 'pop', 0.4); add(C.twist[2], 'whoosh', 0.35); add(C.twist[4] + 0.2, 'slide', 0.5); add(C.twist[5], 'pop', 0.4); add(C.twist[6], 'ding', 0.5); add(C.twist[7] + 0.3, 'chime', 0.5);
  add(C.world[1], 'pop', 0.5); for (const c of [C.world[2] - 0.35, C.world[5] - 0.35]) add(c, 'whoosh', 0.55);
  for (let i = 0; i < 4; i++) add(C.world[3] + i * 0.12, 'pop', 0.4); add(C.world[4], 'slide', 0.4); add(C.world[6], 'slide', 0.55);
  add(T.end - 0.3, 'whoosh', 0.7); for (let i = 0; i < 11; i++) add(T.end + 0.2 + i * 0.05, 'tick', 0.25); add(C.end[1] + 0.45, 'whistle', 0.6);
  return s.sort((a, b) => a.t - b.t);
}
export {captionAt};
function captionAt(t) { let cur = null; for (const c of captions) if (t >= c.start && t < c.end) cur = c; return cur; }
