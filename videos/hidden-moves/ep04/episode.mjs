// HIDDEN MOVES · EP.04 — The decoy: why companies sell an option nobody buys
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {W, H, P, F, clamp, lerp, seg, E, track, popIn, rnd, rr, fillStroke, circle, ellipse, line, withT, text, measure,
  tableBg, blueprintBg, player, pawn, ref, board, coin, stamp, kinetic, sparkle} from '../engine/hm.mjs';
import {loadTiming, camera, shake, sweatDrop, bubble, whistleBeat, insert, endBeat, headline, check, cross, card, laptopIcon, magazineIcon, bothIcon, barChart, duck} from '../engine/kit.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const EP = 4;
export const {T, C, captions, DURATION, captionAt} = loadTiming(HERE);

const OFFERS = [
  {title: 'WEB ONLY', price: '$59', icon: laptopIcon, col: '#dff4ff'},
  {title: 'PRINT ONLY', price: '$125', icon: magazineIcon, col: '#ffe1dc'},
  {title: 'PRINT + WEB', price: '$125', icon: bothIcon, col: '#fff0c4'},
];
function cobweb(ctx, x, y, s, k) {
  if (k <= 0) return; ctx.globalAlpha = k;
  for (let i = 0; i < 5; i++) line(ctx, [[x, y], [x + Math.cos(i * 0.35) * 90 * s, y + Math.sin(i * 0.35) * 90 * s]], 'rgba(28,32,48,0.5)', 3);
  for (let r = 1; r < 4; r++) { ctx.beginPath(); ctx.arc(x, y, r * 26 * s, 0, Math.PI / 2 + 0.1); ctx.strokeStyle = 'rgba(28,32,48,0.5)'; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function offerRow(ctx, t, {appear = [C.offer[1], C.offer[2], C.offer[3]], y = 1000, s = 1, dusty = 0, wobble = 0, yank = 0, hl = -1} = {}) {
  OFFERS.forEach((o, i) => {
    const k = popIn(t, appear[i], 0.4); if (k <= 0) return;
    let x = 200 + i * 340, yy = y, rot = 0;
    if (i === 1) { rot = Math.sin(t * 14) * 0.05 * wobble; if (yank > 0) { x += -900 * E.inCubic(yank); rot -= yank * 0.8; } }
    card(ctx, x, yy, 290, 520, {title: o.title, price: o.price, icon: o.icon, fill: o.col, s: k * s, rot, hl: hl === i ? 1 : 0});
    if (i === 1 && dusty > 0) cobweb(ctx, x - 150 * s, yy - 260 * s, s, dusty);
  });
}

// 1 · shop: the shelf with one product nobody touches, then the decoy pun
function shop(ctx, t) {
  tableBg(ctx, t);
  if (t < T.decoy) {
    rr(ctx, 80, 1000, 920, 40, 10); fillStroke(ctx, '#a0714a'); rr(ctx, 80, 1300, 920, 40, 10); fillStroke(ctx, '#a0714a');
    [[230, P.cyan, 'A'], [540, P.crowd, 'B'], [850, P.coin, 'C']].forEach(([x, col, lab], i) => {
      const k = popIn(t, i * 0.06 - 0.36, 0.35); if (k <= 0) return;
      withT(ctx, x, 1000, k, 0, () => { for (let j = 0; j < 3; j++) { rr(ctx, -110 + j * 74, -220, 70, 220, 10); fillStroke(ctx, col); text(ctx, lab, -75 + j * 74, -110, {font: F.display, size: 54}); } });
      if (i === 1) cobweb(ctx, x + 110, 780, 1, seg(t, 0.3, 0.9));
    });
    // shoppers grab A or C, never B
    for (let i = 0; i < 5; i++) {
      const a = -0.5 + i * 0.55, k = seg(t, a, a + 1.4); if (k <= 0 || k >= 1) continue;
      const toC = i % 2 === 1, x = lerp(-80, 1160, k), lift = Math.abs(x - (toC ? 850 : 230)) < 60 ? 1 : 0;
      pawn(ctx, x, 1300 - Math.abs(Math.sin(k * 30)) * 10, 1.0, [P.pip, P.dot, '#9a6fcf', P.crowd, P.coin][i]);
    }
    sparkle(ctx, 640, 860, 30, seg(t, 1.2, 1.8), '#b9b4c7');
    kinetic(ctx, [[['AN', 0.0], ['OPTION', 0.12]], [['NOBODY', 0.5], ['BUYS?', 0.75]]], W / 2, 400, t, {size: 120, hl: {NOBODY: P.loss}});
  } else {
    rr(ctx, 72, 1060, 1136, 400, 0); fillStroke(ctx, '#9fd3e8', null, 0);
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(100 + i * 180, 1120 + (i % 2) * 40); ctx.quadraticCurveTo(140 + i * 180, 1100 + (i % 2) * 40, 180 + i * 180, 1120 + (i % 2) * 40); ctx.strokeStyle = '#6fb6d3'; ctx.lineWidth = 6; ctx.stroke(); }
    const k = popIn(t, T.decoy + 0.1, 0.45);
    if (k > 0) withT(ctx, 540, 1100 + (1 - k) * 300, 1, 0, () => duck(ctx, 0, 0, 2.0, t));
    if (t < C.decoy[1]) kinetic(ctx, [[['NOT', T.decoy + 0.05], ['A', T.decoy + 0.2]], [['MISTAKE.', T.decoy + 0.35]]], W / 2, 400, t, {size: 120});
    stamp(ctx, 'IT\'S A DECOY', W / 2, 520, seg(t, C.decoy[1], C.decoy[1] + 0.25), {size: 100, col: P.pip, bg: P.card});
  }
}

// 2 · the offer + "pointless"
function offer(ctx, t) {
  tableBg(ctx, t);
  const k = popIn(t, T.offer + 0.05, 0.35);
  if (k > 0) withT(ctx, W / 2, 560, k, 0, () => { rr(ctx, -400, -60, 800, 120, 18); fillStroke(ctx, P.loss); text(ctx, 'THE ECONOMIST · SUBSCRIPTIONS', 0, 4, {font: F.mono, size: 38, col: P.card}); });
  const pointless = t >= T.pointless;
  offerRow(ctx, t, {dusty: seg(t, T.pointless, T.pointless + 0.6), wobble: pointless ? 1 : 0});
  if (pointless) {
    cross(ctx, 540, 1000, 1.4, seg(t, C.pointless[0] + 0.6, C.pointless[0] + 1.1));
    [[180, 1430], [880, 1430]].forEach(([x, y], i) => { const kk = popIn(t, C.pointless[1] + i * 0.15, 0.3); if (kk > 0) withT(ctx, x, y, kk, 0, () => pawn(ctx, 0, 0, 0.8, [P.pip, P.dot][i])); });
  }
  headline(ctx, t, [
    [T.offer, T.pointless, [[['A', T.offer + 0.05], ['REAL', T.offer + 0.2], ['OFFER', T.offer + 0.35]]]],
    [T.pointless, T.me, [[['WHO', C.pointless[1]], ['WOULD', C.pointless[1] + 0.15]], [['PICK', C.pointless[1] + 0.3], ['THAT?', C.pointless[1] + 0.45]]], {hl: {'THAT?': P.loss}}],
  ], 360);
}

// 3 · the experiment: 84% → 32%
function experiment(ctx, t) {
  if (t >= T.me && t < T.test) return insert(ctx, t, T.me, {expr: 'suspicious', bg: '#ffe1dc', line: 'NOT ME.', R: [60, -110], L: [-60, -110]});
  tableBg(ctx, t);
  // blackboard + students
  rr(ctx, 110, 520, 860, 300, 22); fillStroke(ctx, '#2f4a3a');
  const nk = popIn(t, T.test + 0.1, 0.35); if (nk > 0) withT(ctx, W / 2, 610, nk, 0, () => text(ctx, 'DAN ARIELY\'S TEST', 0, 0, {font: F.display, size: 64, col: P.card}));
  for (let i = 0; i < 8; i++) { const kk = popIn(t, C.test[1] + i * 0.06, 0.3); if (kk > 0) withT(ctx, 200 + i * 98, 790, kk, 0, () => pawn(ctx, 0, 0, 0.62, [P.crowd, P.pip, P.crowd, P.dot][i % 4])); }
  const removing = t >= T.remove;
  const web = removing ? lerp(16, 68, E.inOutCubic(seg(t, C.remove[2], C.remove[2] + 1.0))) : 16;
  const both = removing ? lerp(84, 32, E.inOutCubic(seg(t, C.remove[3], C.remove[3] + 1.0))) : 84;
  const kChart = seg(t, C.test[2], C.test[3] + 0.8);
  if (kChart > 0) {
    const printFade = 1 - seg(t, C.remove[0] + 0.2, C.remove[1] + 0.3);
    const moving = removing && t < C.remove[3] + 1.0, settled = removing ? seg(t, C.remove[3] + 1.0, C.remove[3] + 1.3) : 1;
    const rows = [['WEB ONLY', web, P.cyan, moving ? 0 : settled]];
    if (printFade > 0.02) rows.push(['PRINT ONLY', 0, P.loss, removing ? 0 : 1]);
    rows.push(['PRINT + WEB', both, P.coin, moving ? 0 : settled]);
    ctx.save(); barChart(ctx, 110, 980, 860, rows, kChart); ctx.restore();
    // the hook yanks the useless option
    const hk = seg(t, C.remove[0] + 0.1, C.remove[1] + 0.2);
    if (hk > 0 && hk < 1) { const hx = lerp(-200, 380, Math.sin(hk * Math.PI)); line(ctx, [[hx - 300, 1090], [hx, 1090]], '#a0714a', 18); ctx.beginPath(); ctx.arc(hx, 1050, 40, Math.PI / 2, -Math.PI / 2, true); ctx.strokeStyle = '#a0714a'; ctx.lineWidth = 18; ctx.stroke(); }
    if (removing) { const rk = popIn(t, C.remove[4], 0.3); if (rk > 0) withT(ctx, 760, 1310, rk, -0.06, () => { rr(ctx, -190, -40, 380, 80, 16); fillStroke(ctx, P.loss); text(ctx, 'WAS 84%, NOW 32%', 0, 4, {font: F.cap, size: 44, col: P.card}); }); }
  }
  headline(ctx, t, [
    [T.test, T.remove, [[['THREE', C.test[2]], ['OPTIONS', C.test[2] + 0.15]]], {size: 96}],
    [T.remove, T.same, [[['DECOY', T.remove + 0.05], ['REMOVED', T.remove + 0.25]]], {size: 96, hl: {DECOY: P.loss}}],
  ], 400);
}

// 4 · same products, same prices
function same(ctx, t) {
  tableBg(ctx, t);
  [[300, 'WITH DECOY', 84], [780, 'WITHOUT', 32]].forEach(([x, lab, pct], j) => {
    const k = popIn(t, T.same + j * 0.15, 0.35); if (k <= 0) return;
    withT(ctx, x, 1000, k, 0, () => {
      rr(ctx, -210, -330, 420, 600, 26); fillStroke(ctx, P.card);
      text(ctx, lab, 0, -280, {font: F.mono, size: 34, col: j ? P.soft : P.loss});
      OFFERS.forEach((o, i) => { if (j === 1 && i === 1) return; withT(ctx, -130 + i * 130, -150, 0.42, 0, () => card(ctx, 0, 0, 300, 520, {title: '', price: o.price, icon: o.icon, fill: o.col})); });
      if (j === 1) { ctx.save(); ctx.setLineDash([12, 10]); rr(ctx, -63, -260, 126, 220, 12); fillStroke(ctx, null, P.soft, 4); ctx.restore(); }
      text(ctx, `${pct}%`, 0, 120, {font: F.display, size: 140, col: j ? P.ink : P.coin, stroke: j ? null : P.ink, lw: 6});
      text(ctx, 'CHOSE PRINT + WEB', 0, 210, {font: F.mono, size: 28, col: P.soft});
    });
  });
  const c = C.same;
  [[c[0], 'SAME PRODUCTS'], [c[1], 'SAME PRICES']].forEach(([a, s], i) => { const k = popIn(t, a, 0.3); if (k > 0) withT(ctx, W / 2, 470 + i * 90, k, 0, () => { const w = measure(ctx, s, 64, F.display); text(ctx, s, 30, 0, {font: F.display, size: 64}); check(ctx, 30 - w / 2 - 50, 4, 0.45, 1); }); });
  const ak = popIn(t, c[2], 0.35); if (ak > 0) { ctx.save(); ctx.translate(300, 850); ctx.scale(ak, ak); ctx.beginPath(); ctx.ellipse(0, 0, 90, 140, 0, 0, Math.PI * 2); ctx.strokeStyle = P.loss; ctx.lineWidth = 9; ctx.stroke(); ctx.restore(); }
  const dk = popIn(t, c[3], 0.3); if (dk > 0) withT(ctx, W / 2, 1390, dk, 0, () => text(ctx, 'ONE USELESS OPTION', 0, 0, {font: F.mono, size: 40, col: P.loss}));
}

// 5 · Hidden Layer: why it works
function why(ctx, t) {
  blueprintBg(ctx, t);
  const c = C.why;
  // balance: decoy vs bundle are easy to compare; web-only is set aside
  const tilt = 0.12 * E.inOutCubic(seg(t, c[1], c[1] + 0.8));
  withT(ctx, W / 2, 900, 1, 0, () => {
    line(ctx, [[0, 0], [0, 380]], P.cyan, 10); line(ctx, [[-120, 380], [120, 380]], P.cyan, 10);
    withT(ctx, 0, 0, 1, -tilt, () => {
      line(ctx, [[-340, 0], [340, 0]], P.cyan, 10);
      for (const [x, i] of [[-300, 1], [300, 2]]) { line(ctx, [[x, 0], [x - 90, 120]], P.cyan, 4); line(ctx, [[x, 0], [x + 90, 120]], P.cyan, 4); withT(ctx, x, 120, 1, tilt, () => card(ctx, 0, -140, 300, 520, {title: OFFERS[i].title, price: OFFERS[i].price, icon: OFFERS[i].icon, fill: OFFERS[i].col, s: 0.5})); }
    });
  });
  const fk = popIn(t, c[2] - 0.1, 0.35); if (fk > 0) withT(ctx, 840, 740, fk, 0.08, () => { rr(ctx, -150, -42, 300, 84, 18); fillStroke(ctx, P.win); text(ctx, '+ WEB FREE', 0, 4, {font: F.cap, size: 44, col: P.card}); });
  withT(ctx, 160, 1250, 0.38, -0.1, () => card(ctx, 0, 0, 300, 520, {title: OFFERS[0].title, price: OFFERS[0].price, icon: OFFERS[0].icon, fill: OFFERS[0].col, alpha: 0.5}));
  text(ctx, 'HARDER TO COMPARE', 330, 1360, {font: F.mono, size: 28, col: P.cyan});
  if (t < c[2]) kinetic(ctx, [[['NEXT', T.why + 0.05], ['TO', T.why + 0.18], ['THE', T.why + 0.3], ['DECOY', T.why + 0.45]]], W / 2, 420, t, {size: 100, col: P.cyan});
  stamp(ctx, 'THE DECOY EFFECT', W / 2, 520, seg(t, c[2] + 0.4, c[2] + 0.65), {size: 84});
}

// 6 · spot it
function spot(ctx, t) {
  tableBg(ctx, t);
  const c = C.spot, plans = [['BASIC', '$9'], ['PLUS', '$19'], ['PREMIUM', '$20']];
  plans.forEach(([n, p], i) => { const k = popIn(t, T.spot + i * 0.12, 0.35); if (k > 0) card(ctx, 190 + i * 350, 1000, 300, 460, {title: n, price: p, fill: [P.card, '#ffe1dc', '#fff0c4'][i], s: k, hl: i === 2 && t > c[1] ? 1 : 0, icon: (cc, x, y) => { for (let j = 0; j <= i; j++) circle(cc, x - 40 * i + j * 80, y, 26, P.coin); }}); });
  text(ctx, 'EXAMPLE', 540, 1290, {font: F.mono, size: 26, col: P.soft});
  const mx = lerp(900, 540, E.inOutCubic(seg(t, c[0], c[0] + 0.9)));
  withT(ctx, mx, 930, 1, 0, () => { circle(ctx, 0, 0, 120, 'rgba(124,216,255,0.15)', P.ink, 14); rr(ctx, 80, 80, 40, 160, 16); fillStroke(ctx, '#8a5a36'); }, 1, 1, seg(t, c[0], c[0] + 0.3));
  const rk = popIn(t, c[2], 0.35); if (rk > 0) ref(ctx, 860, 640, 0.9 * rk, t, {sign: {text: 'WHO IS IT FOR?', k: popIn(t, c[2] + 0.15, 0.3)}});
  kinetic(ctx, [[['SPOT', T.spot + 0.05], ['THE', T.spot + 0.2]], [['DECOY', T.spot + 0.4]]], W / 2, 380, t, {size: 110, hl: {DECOY: P.pip}});
}

function end(ctx, t) {
  endBeat(ctx, t, T.end, C.end, (c, tt) => {
    rr(c, 160, 1060, 760, 170, 40); fillStroke(c, '#9fd3e8');
    duck(c, 640, 1110, 0.9, tt);
    player(c, 330, 1180, {s: 0.62, col: P.pip, expr: tt > C.end[1] ? 'smug' : 'suspicious', t: tt, seed: 1, R: [70, -120], L: [-60, -110], look: tt > C.end[1] ? -1 : 1});
  });
}

export const SCENES = [
  {id: 'shop', start: 0, draw: shop},
  {id: 'offer', start: T.offer, draw: offer},
  {id: 'experiment', start: T.me, draw: experiment},
  {id: 'same', start: T.same, draw: same},
  {id: 'why', start: T.why, draw: why, hidden: true},
  {id: 'spot', start: T.spot, draw: spot},
  {id: 'end', start: T.end, draw: end},
];
export const TRANSITIONS = [[1, 'flip', 0.3, 0.3], [3, 'wipe', 0.3, 0.35], [4, 'flip', 0.3, 0.3], [5, 'flip', 0.3, 0.3], [6, 'wipe', 0.3, 0.35]];
export const SILENCES = [[T.me - 0.05, T.test - 0.1], [C.remove[4], C.remove[4] + 0.7], [C.why[2] + 0.35, C.why[2] + 0.95]];
export function SFX() {
  const s = [], add = (t, kind, gain = 1) => s.push({t: +Math.max(0, t).toFixed(3), kind, gain});
  [0, 0.08, 0.16].forEach(t => add(t, 'pop', 0.4)); [0.0, 0.12, 0.5, 0.75].forEach(t => add(t, 'tick', 0.35));
  for (let i = 0; i < 5; i++) add(0.25 + i * 0.55, 'step', 0.3);
  add(T.decoy + 0.1, 'whoosh', 0.5); add(T.decoy + 0.45, 'pop', 0.6); add(C.decoy[1], 'stamp', 1);
  add(SCENES[1].start - 0.3, 'flip', 0.7); add(T.offer + 0.05, 'pop', 0.5); [C.offer[1], C.offer[2], C.offer[3]].forEach(t => { add(t, 'pop', 0.5); add(t + 0.2, 'coin', 0.3); });
  add(T.pointless + 0.1, 'sweep', 0.3); add(C.pointless[0] + 0.6, 'buzz', 0.5);
  add(T.me, 'thunk', 0.5); add(T.test + 0.1, 'pop', 0.5); for (let i = 0; i < 8; i++) add(C.test[1] + i * 0.06, 'tick', 0.25);
  add(C.test[2], 'sweep', 0.4); add(C.test[3] + 0.3, 'ding', 0.5);
  add(C.remove[0] + 0.15, 'whoosh', 0.7); add(C.remove[1], 'thunk', 0.5); add(C.remove[2], 'slide', 0.4); add(C.remove[3], 'slide', 0.4); add(C.remove[4], 'stamp', 0.7);
  add(SCENES[3].start - 0.3, 'whoosh', 0.6); add(C.same[0], 'ding', 0.4); add(C.same[1], 'ding', 0.4); add(C.same[3], 'buzz', 0.4);
  add(SCENES[4].start - 0.3, 'flip', 0.7); add(C.why[1], 'slide', 0.4); add(C.why[2] - 0.1, 'coin', 0.5); add(C.why[2] + 0.4, 'stamp', 1);
  add(SCENES[5].start - 0.3, 'flip', 0.7); add(C.spot[0], 'slide', 0.4); add(C.spot[2], 'pop', 0.5);
  add(SCENES[6].start - 0.3, 'whoosh', 0.7); for (let i = 0; i < 11; i++) add(T.end + 0.2 + i * 0.05, 'tick', 0.25); add(C.end[1] + 0.45, 'whistle', 0.6);
  return s.sort((a, b) => a.t - b.t);
}
