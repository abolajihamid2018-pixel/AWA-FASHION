// HIDDEN MOVES · EP.02 — The Winner's Curse
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {W, H, P, F, clamp, lerp, seg, E, track, popIn, rnd, rr, fillStroke, circle, ellipse, line, withT, text, measure,
  tableBg, blueprintBg, player, pawn, ref, board, coin, stamp, kinetic, dust, sparkle} from '../engine/hm.mjs';
import {loadTiming, camera, shake, sweatDrop, bubble, whistleBeat, insert, endBeat, headline, check, cross, confetti, jar, gavel} from '../engine/kit.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const EP = 2;
export const {T, C, captions, DURATION, captionAt} = loadTiming(HERE);

// example numbers (shown on screen as an example): ten guesses that average exactly $100
const G = [62, 71, 80, 88, 95, 104, 112, 120, 129, 139], TRUE = 100;
const V = v => 140 + (v - 50) * 8, LY = 1180;

function guessRow(ctx, t, {appear = C.guess[0], tint = true, pipIdx = 9, pipPose = null} = {}) {
  line(ctx, [[V(50), LY], [V(150), LY]], P.ink, 6, null, seg(t, appear - 0.3, appear + 0.2));
  for (const v of [60, 80, 100, 120, 140]) { const k = popIn(t, appear - 0.2, 0.3); if (k > 0) { line(ctx, [[V(v), LY - 14], [V(v), LY + 14]], P.ink, 5); text(ctx, `$${v}`, V(v), LY + 52, {font: F.mono, size: 30, col: P.soft}); } }
  G.forEach((g, i) => {
    const k = popIn(t, appear + i * 0.12, 0.35); if (k <= 0) return;
    const low = g < TRUE, col = !tint ? P.crowd : t > C.guess[2] && !low ? '#ffb3a6' : t > C.guess[1] && low ? '#a8dcf0' : P.crowd;
    const tier = i % 2 ? 0 : 1, x = V(g);
    if (i === pipIdx && pipPose) return pipPose(ctx, x, LY - 10, k);
    withT(ctx, x, LY - 10, k, 0, () => {
      pawn(ctx, 0, 0, 0.55, i === pipIdx ? P.pip : col);
      line(ctx, [[0, -60], [0, -150 - tier * 80]], P.ink, 5);
      rr(ctx, -46, -196 - tier * 80, 92, 54, 12); fillStroke(ctx, P.card, P.ink, 4);
      text(ctx, String(g), 0, -168 - tier * 80, {font: F.mono, size: 34});
    });
  });
}
function trueMarker(ctx, t, at, label = 'TRUE VALUE · EXAMPLE') {
  const k = popIn(t, at, 0.35); if (k <= 0) return;
  line(ctx, [[V(TRUE), LY - 330], [V(TRUE), LY + 20]], P.win, 7, [14, 10], k);
  withT(ctx, V(TRUE), LY - 370, k, 0, () => { rr(ctx, -190, -32, 380, 64, 16); fillStroke(ctx, P.win); text(ctx, label, 0, 3, {font: F.mono, size: 28, col: P.card}); });
}

// 1 · auction: the gavel lands on frame one
function auction(ctx, t) {
  tableBg(ctx, t, {col: '#F3E3C8'});
  camera(ctx, {z: track([[0, 1.2], [1.2, 1.2], [3.2, 1.0]])(t), fy: 1050, sx: shake(t, 0.18, 16)}, () => {
    rr(ctx, 120, 1180, 840, 60, 18); fillStroke(ctx, '#8a5a36');
    rr(ctx, 640, 980, 220, 200, 18); fillStroke(ctx, '#a0714a'); text(ctx, 'LOT 7', 750, 1080, {font: F.mono, size: 34, col: P.card});
    jar(ctx, 750, 980, 0.62, {fill: 1, label: '?'});
    const ang = t < 0.18 ? lerp(-0.5, 1.5, E.inCubic(seg(t, -0.08, 0.18))) : 1.5 - 0.3 * E.outCubic(seg(t, 0.35, 0.9));
    rr(ctx, 520, 1150, 120, 30, 8); fillStroke(ctx, '#6e4628');
    gavel(ctx, 330, 1150, 0.9, ang);
    dust(ctx, 580, 1170, t, 0.18, 7, '#f6e1b8');
    const cel = t > 0.4 && t < C.hook[2] + 0.2;
    player(ctx, 170, 1180, {s: 0.95, col: P.pip, t, seed: 1, expr: t < C.hook[2] + 0.3 ? 'eureka' : 'shocked',
      R: cel ? [70, -300 + Math.sin(t * 12) * 20] : [60, -150], L: cel ? [-70, -290] : [-70, -240],
      holdR: cel ? () => { rr(ctx, -6, -110, 12, 110, 6); fillStroke(ctx, '#a0714a'); circle(ctx, 0, -140, 40, P.card); text(ctx, '7', 0, -136, {font: F.display, size: 50}); } : null});
    if (t > C.hook[2] + 0.4) sweatDrop(ctx, 330, 790, t, C.hook[2] + 0.4);
  });
  confetti(ctx, t, C.hook[1] - 0.1, 50, W / 2, 760);
  stamp(ctx, 'SOLD!', 300, 660, seg(t, 0.18, 0.4), {size: 110, col: P.loss, bg: P.card, rot: 0.08});
  if (t < C.hook[2]) kinetic(ctx, [[['YOU', 0.3], ['WON!', 0.5]]], W / 2, 420, t, {size: 140, hl: {'WON!': P.pip}});
  else kinetic(ctx, [[['YOU', C.hook[2]], ['PROBABLY', C.hook[2] + 0.2]], [['OVERPAID.', C.hook[2] + 0.55]]], W / 2, 390, t, {size: 110, hl: {'OVERPAID.': P.loss}});
}

// 2 · the model: jar → guesses → who wins → the overpayment
function model(ctx, t) {
  if (t >= T.mine && t < T.wrong) return insert(ctx, t, T.mine, {expr: 'eureka', line: 'MINE! MINE!', R: [40, -200], L: [-40, -200],
    prop: (c) => jar(c, 0, 230, 0.55, {fill: 1, label: '?'})});
  tableBg(ctx, t);
  const jarK = seg(t, C.guess[0] - 0.4, C.guess[0] + 0.3), jx = lerp(540, 870, E.inOutCubic(jarK)), jy = lerp(1300, 760, E.inOutCubic(jarK)), js = lerp(1.25, 0.42, E.inOutCubic(jarK));
  const fill = E.outCubic(seg(t, T.jar, T.jar + 2.2));
  if (t < T.wrong) jar(ctx, jx, jy, js, {fill, label: '?', lid: 0});
  // falling coins into the jar
  if (t < T.jar + 2.2) for (let i = 0; i < 10; i++) { const a = T.jar + i * 0.2, k = seg(t, a, a + 0.45); if (k > 0 && k < 1) coin(ctx, 480 + (i % 5) * 30, lerp(300, 1000, E.inCubic(k)), 1.2, t * 8 + i); }
  if (t > C.jar[1] && t < C.guess[0]) [[250, 700], [830, 640], [300, 1080], [800, 1060]].forEach(([x, y], i) => { const k = popIn(t, C.jar[1] + i * 0.15, 0.3); if (k > 0) withT(ctx, x, y, k, Math.sin(t * 4 + i) * 0.2, () => text(ctx, '?', 0, 0, {font: F.display, size: 120, col: P.dot})); });
  if (t >= C.guess[0]) {
    const winnerPose = t >= C.who[2] ? (c, x, y, k) => {
      const lose = t >= T.wrong;
      player(c, x, y + 8, {s: 0.55, col: P.pip, t, seed: 1, expr: lose ? (t > C.wrong[1] ? 'defeated' : 'shocked') : 'grin', R: lose ? [60, -120] : [70, -300], L: [-60, -120],
        holdR: lose ? null : () => { rr(c, -6, -100, 12, 100, 6); fillStroke(c, '#a0714a'); circle(c, 0, -126, 34, P.card); text(c, '139', 0, -122, {font: F.mono, size: 26}); }});
    } : null;
    guessRow(ctx, t, {pipPose: winnerPose});
    trueMarker(ctx, t, C.guess[3]);
    // "not the average guess" — the average gets crossed out
    if (t >= T.who && t < T.wrong) { cross(ctx, V(TRUE), LY - 420, 0.6, seg(t, C.who[1] + 0.3, C.who[1] + 0.8)); }
    // spotlight on the highest guess
    const sk = seg(t, C.who[2], C.who[2] + 0.3);
    if (sk > 0 && t < T.wrong + 0.4) { ctx.save(); ctx.globalAlpha = 0.3 * sk; ctx.beginPath(); ctx.moveTo(V(139) - 30, 160); ctx.lineTo(V(139) + 30, 160); ctx.lineTo(V(139) + 150, LY + 20); ctx.lineTo(V(139) - 150, LY + 20); ctx.closePath(); ctx.fillStyle = P.coin; ctx.fill(); ctx.restore(); }
    // overpayment bracket
    if (t >= T.wrong) {
      const k = seg(t, C.wrong[1], C.wrong[1] + 0.5);
      line(ctx, [[V(TRUE), LY + 110], [lerp(V(TRUE), V(139), k), LY + 110]], P.loss, 12);
      const kk = popIn(t, C.wrong[1] + 0.4, 0.3); if (kk > 0) withT(ctx, (V(TRUE) + V(139)) / 2, LY + 175, kk, 0, () => text(ctx, 'PAID $39 TOO MUCH', 0, 0, {font: F.mono, size: 40, col: P.loss}));
      jar(ctx, 870, 760, 0.42, {fill: 1, label: '$100', lid: seg(t, T.wrong + 0.2, T.wrong + 0.6)});
    }
  }
  headline(ctx, t, [
    [T.jar, C.guess[0], [[['HOW', C.jar[1]], ['MUCH', C.jar[1] + 0.15]], [['IS', C.jar[1] + 0.3], ['INSIDE?', C.jar[1] + 0.45]]], {size: 110}],
    [C.guess[0], T.who, [[['10', C.guess[0]], ['GUESSES', C.guess[0] + 0.2]]]],
    [T.who, T.wrong, [[['WHO', T.who + 0.05], ['WINS?', T.who + 0.25]]], {hl: {'WINS?': P.pip}}],
    [T.wrong, T.name, [[['THE', T.wrong + 0.05], ['MOST', T.wrong + 0.2]], [['WRONG', T.wrong + 0.45], ['GUESS', T.wrong + 0.6]]], {hl: {WRONG: P.loss}}],
  ], 380);
}

// 3 · Hidden Layer: why the highest guess is the most wrong + the 1983 jars
function hidden(ctx, t) {
  blueprintBg(ctx, t);
  const cx = W / 2, base = 1120, sx = 7.2, sig = 22;
  const curveK = seg(t, T.name + 0.1, T.name + 0.9);
  const fade = 1 - seg(t, T.proof - 0.1, T.proof + 0.4);
  if (fade > 0) {
    ctx.globalAlpha = fade;
    const pts = []; for (let v = 40; v <= 160; v += 2) pts.push([cx + (v - 100) * sx, base - 380 * Math.exp(-Math.pow((v - 100) / sig, 2) / 2)]);
    ctx.save(); ctx.beginPath(); ctx.moveTo(cx + 25 * sx, base); pts.filter(([x]) => x >= cx + 25 * sx).forEach(p => ctx.lineTo(...p)); ctx.lineTo(cx + 60 * sx, base); ctx.closePath(); ctx.fillStyle = `rgba(255,106,85,${0.45 * seg(t, C.name[1], C.name[1] + 0.4)})`; ctx.fill(); ctx.restore();
    line(ctx, pts, P.cyan, 7, null, curveK);
    line(ctx, [[cx - 60 * sx, base], [cx + 60 * sx, base]], P.cyan, 4);
    line(ctx, [[cx, base - 400], [cx, base + 10]], P.win, 6, [12, 10]); text(ctx, 'TRUE VALUE', cx, base + 50, {font: F.mono, size: 30, col: P.win});
    G.forEach((g, i) => { const k = popIn(t, T.name + 0.3 + i * 0.06, 0.3); if (k > 0) circle(ctx, cx + (g - 100) * sx, base - 20, 14 * k, i === 9 ? P.pip : P.cyan, null, 0); });
    const tk = popIn(t, C.name[1] + 0.2, 0.35); if (tk > 0) withT(ctx, cx + 36 * sx, base - 250, tk, 0, () => { text(ctx, 'THE WINNER', 0, -26, {font: F.mono, size: 32, col: P.pip}); text(ctx, 'COMES FROM HERE', 0, 16, {font: F.mono, size: 32, col: P.pip}); });
    stamp(ctx, 'WINNER\'S CURSE', W / 2, 1330, seg(t, C.name[1] + 0.1, C.name[1] + 0.35), {size: 84});
    ctx.globalAlpha = 1;
  }
  if (t >= T.proof - 0.1) {
    const k = popIn(t, T.proof, 0.35);
    if (k > 0) withT(ctx, W / 2, 470, k, -0.04, () => { rr(ctx, -150, -50, 300, 100, 18); fillStroke(ctx, P.navy, P.cyan, 5); text(ctx, '1983', 0, 4, {font: F.mono, size: 64, col: P.cyan}); });
    rr(ctx, 100, 1080, 880, 30, 10); fillStroke(ctx, 'rgba(124,216,255,0.1)', P.cyan, 4);
    for (let i = 0; i < 4; i++) { const kk = popIn(t, C.proof[1] + i * 0.12, 0.35); if (kk > 0) withT(ctx, 220 + i * 215, 1080, kk, 0, () => jar(ctx, 0, 0, 0.42, {fill: 0.8, label: '?'})); }
    for (let i = 0; i < 4; i++) { const kk = popIn(t, C.proof[1] + 0.3 + i * 0.1, 0.35); if (kk > 0) withT(ctx, 220 + i * 215, 1270, kk, 0, () => pawn(ctx, 0, 0, 0.7, P.crowd)); }
    const dk = popIn(t, C.proof[2] + 0.1, 0.35);
    if (dk > 0) withT(ctx, W / 2, 700, dk, 0, () => {
      text(ctx, 'WINNERS', 0, -40, {font: F.display, size: 92, col: P.card}); text(ctx, 'LOST MONEY', 0, 60, {font: F.display, size: 92, col: P.pip});
      line(ctx, [[360, -60], [360, 60]], P.loss, 14); line(ctx, [[325, 25], [360, 64], [395, 25]], P.loss, 14);
    });
    const ak = popIn(t, C.proof[3], 0.3); if (ak > 0) withT(ctx, W / 2, 850, ak, 0, () => text(ctx, 'ON AVERAGE · BAZERMAN & SAMUELSON', 0, 0, {font: F.mono, size: 28, col: P.cyan}));
  }
}

// 4 · world: oil leases and bidding wars
function world(ctx, t) {
  tableBg(ctx, t);
  const c0 = C.world, c = [c0[0], c0[1], c0[3], c0[4]], slide = track([[c[2] - 0.3, 0], [c[2] + 0.2, -W]])(t);
  ctx.save(); ctx.translate(slide, 0);
  board(ctx, 90, 780, 900, 470, {top: '#e7c98f'});
  // oil derrick
  withT(ctx, 360, 1150, 1, 0, () => {
    line(ctx, [[-120, 0], [0, -420], [120, 0]], P.ink, 12); for (let i = 1; i < 5; i++) line(ctx, [[-120 + i * 24, -i * 84], [120 - i * 24, -i * 84]], P.ink, 8);
    const bob = Math.sin(t * 3) * 0.25; withT(ctx, 0, -300, 1, bob, () => { rr(ctx, -150, -16, 300, 32, 10); fillStroke(ctx, P.loss); circle(ctx, 150, 0, 34, P.ink, null, 0); });
    ellipse(ctx, 0, 6, 160, 22, '#2b2346');
  });
  rr(ctx, 620, 1010, 260, 180, 16); fillStroke(ctx, P.card); text(ctx, 'SEALED BIDS', 750, 1060, {font: F.mono, size: 30}); rr(ctx, 680, 1010, 140, 18, 6); fillStroke(ctx, P.ink, null, 0);
  for (let i = 0; i < 5; i++) { const a = c[0] + 0.3 + i * 0.25, k = seg(t, a, a + 0.6); if (k > 0 && k < 1) withT(ctx, lerp(150 + i * 150, 750, E.inOutCubic(k)), lerp(500, 1010, E.inOutCubic(k)) - Math.sin(k * Math.PI) * 120, 1, k * 3, () => { rr(ctx, -50, -32, 100, 64, 8); fillStroke(ctx, P.card); line(ctx, [[-50, -32], [0, 4], [50, -32]], P.ink, 4); }); }
  ctx.restore();
  ctx.save(); ctx.translate(slide + W, 0);
  board(ctx, 90, 780, 900, 470);
  withT(ctx, 540, 1080, 1, 0, () => { ctx.beginPath(); ctx.moveTo(-170, -150); ctx.lineTo(0, -300); ctx.lineTo(170, -150); ctx.closePath(); fillStroke(ctx, P.loss); rr(ctx, -150, -150, 300, 170, 8); fillStroke(ctx, P.card); rr(ctx, -30, -80, 60, 100, 6); fillStroke(ctx, P.dot); rr(ctx, -120, -120, 60, 50, 6); fillStroke(ctx, P.cyan); rr(ctx, 60, -120, 60, 50, 6); fillStroke(ctx, P.cyan); });
  const bids = [[200, 1220, P.crowd], [400, 1240, P.dot], [700, 1240, P.crowd], [880, 1220, P.pip]];
  bids.forEach(([x, y, col], i) => {
    const up = Math.max(0, Math.sin((t - c[2]) * 5 - i * 1.3));
    pawn(ctx, x, y, 0.7, col);
    withT(ctx, x + 30, y - 120 - up * 40, 1, 0, () => { line(ctx, [[0, 0], [0, 70]], P.ink, 6); circle(ctx, 0, -10, 34, P.card); text(ctx, '$', 0, -6, {font: F.display, size: 44}); });
  });
  const price = Math.round(lerp(300, 560, seg(t, c[2] + 0.2, c[3] + 1.5)));
  rr(ctx, 380, 740, 320, 90, 20); fillStroke(ctx, P.ink); text(ctx, `$${price}K`, 540, 787, {font: F.mono, size: 52, col: P.coin});
  ctx.restore();
  if (t < c[2]) kinetic(ctx, [[['OIL', T.world + 0.1], ['FIELDS', T.world + 0.3]], [['FIRST', c[1] - 0.2]]], W / 2, 400, t, {size: 110});
  else kinetic(ctx, [[['BIDDING', c[2] + 0.1]], [['WARS', c[3]]]], W / 2, 400, t, {size: 120, hl: {WARS: P.loss}});
}

// 5 · the fix: shade your bid
function fix(ctx, t) {
  tableBg(ctx, t);
  const c = C.fix;
  guessRow(ctx, t, {appear: T.fix - 3, tint: false, pipPose: (cc, x, y, k) => player(cc, x, y + 8, {s: 0.55, col: P.pip, t, seed: 1, expr: t > c[3] + 0.6 ? 'smug' : t > c[1] ? 'suspicious' : 'neutral', R: [60, -120], L: [-60, -120]})});
  trueMarker(ctx, t, T.fix - 3);
  const bk = popIn(t, c[1] + 0.2, 0.35);
  if (bk > 0) bubble(ctx, '"I PROBABLY GUESSED HIGH"', 560, 600, bk, {size: 44, tail: 200});
  const shadeK = E.inOutCubic(seg(t, c[3], c[3] + 1.0)), bx = lerp(V(139), V(115), shadeK);
  if (t > c[3]) {
    line(ctx, [[V(139), LY + 110], [bx, LY + 110]], P.win, 12); line(ctx, [[bx + 26, LY + 84], [bx, LY + 110], [bx + 26, LY + 136]], P.win, 12);
    withT(ctx, bx, LY + 180, popIn(t, c[3] + 0.6, 0.3), 0, () => text(ctx, 'YOUR BID', 0, 0, {font: F.mono, size: 36, col: P.win}));
    check(ctx, 900, 560, 1.2, seg(t, c[3] + 1.0, c[3] + 1.4));
  }
  if (t < c[3]) kinetic(ctx, [[['THE', T.fix + 0.05], ['FIX', T.fix + 0.25]]], W / 2, 400, t, {size: 130, hl: {FIX: P.win}});
  else kinetic(ctx, [[['BID', c[3] + 0.05], ['BELOW', c[3] + 0.2]], [['YOUR', c[3] + 0.4], ['GUESS', c[3] + 0.55]]], W / 2, 380, t, {size: 110, hl: {BELOW: P.win}});
}

function end(ctx, t) {
  endBeat(ctx, t, T.end, C.end, (c, tt) => {
    board(c, 290, 900, 500, 270);
    jar(c, 600, 1140, 0.48, {fill: 1, label: '$100'});
    player(c, 420, 1140, {s: 0.62, col: P.pip, expr: tt > C.end[1] ? 'smug' : 'defeated', t: tt, seed: 1, R: [80, -120], L: [-60, -110], look: tt > C.end[1] ? -1 : 0});
  });
}

export const SCENES = [
  {id: 'auction', start: 0, draw: auction},
  {id: 'whistle', start: T.play, draw: (c, t) => whistleBeat(c, t, T.play)},
  {id: 'model', start: T.jar, draw: model},
  {id: 'hidden', start: T.name, draw: hidden, hidden: true},
  {id: 'world', start: T.world, draw: world},
  {id: 'fix', start: T.fix, draw: fix},
  {id: 'end', start: T.end, draw: end},
];
export const TRANSITIONS = [[2, 'flip', 0.3, 0.3], [3, 'flip', 0.3, 0.3], [4, 'flip', 0.3, 0.3], [5, 'wipe', 0.3, 0.35], [6, 'wipe', 0.3, 0.35]];
export function SFX() {
  const s = [], add = (t, kind, gain = 1) => s.push({t: +Math.max(0, t).toFixed(3), kind, gain});
  add(0.02, 'whoosh', 0.6); add(0.17, 'stamp', 1); add(0.3, 'tick', 0.4); add(0.5, 'tick', 0.4); add(C.hook[1] - 0.1, 'chime', 0.6);
  add(C.hook[2], 'tick', 0.4); add(C.hook[2] + 0.55, 'buzz', 0.4);
  add(T.play + 0.12, 'whistle', 0.9);
  for (const i of [2, 3, 4]) add(SCENES[i].start - 0.3, 'flip', 0.7); for (const i of [5, 6]) add(SCENES[i].start - 0.3, 'whoosh', 0.7);
  for (let i = 0; i < 10; i++) add(T.jar + i * 0.2 + 0.4, 'coin', 0.3);
  add(C.jar[1], 'pop', 0.4); for (let i = 0; i < 10; i++) add(C.guess[0] + i * 0.12, 'tick', 0.3);
  add(C.guess[1], 'pop', 0.35); add(C.guess[2], 'pop', 0.35); add(C.guess[3], 'ding', 0.5);
  add(C.who[1] + 0.3, 'buzz', 0.4); add(C.who[2], 'sweep', 0.5); add(T.mine, 'ding', 0.7); add(T.mine + 0.1, 'coin', 0.6);
  add(C.wrong[1], 'slide', 0.4); add(C.wrong[1] + 0.4, 'buzz', 0.5);
  add(C.name[1] + 0.1, 'stamp', 1); add(T.proof, 'pop', 0.5); for (let i = 0; i < 4; i++) add(C.proof[1] + i * 0.12, 'pop', 0.35); add(C.proof[2] + 0.1, 'thunk', 0.6);
  for (let i = 0; i < 5; i++) add(C.world[0] + 0.3 + i * 0.25, 'tick', 0.3); add(C.world[3] - 0.3, 'whoosh', 0.5);
  for (let i = 0; i < 6; i++) add(C.world[3] + 0.3 + i * 0.4, 'tick', 0.3);
  add(C.fix[1] + 0.2, 'pop', 0.4); add(C.fix[3], 'slide', 0.5); add(C.fix[3] + 1.0, 'chime', 0.5);
  for (let i = 0; i < 11; i++) add(T.end + 0.2 + i * 0.05, 'tick', 0.25); add(C.end[1] + 0.45, 'whistle', 0.6);
  return s.sort((a, b) => a.t - b.t);
}

export const SILENCES = [[T.mine - 0.05, T.wrong - 0.1], [C.name[1] + 0.05, C.name[1] + 0.7], [C.proof[2], C.proof[2] + 0.6]];
