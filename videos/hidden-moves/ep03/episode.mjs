// HIDDEN MOVES · EP.03 — Why everyone ends up standing at concerts (an arms race)
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {W, H, P, F, clamp, lerp, seg, E, track, popIn, rnd, rr, fillStroke, circle, ellipse, line, withT, text, measure,
  tableBg, blueprintBg, player, pawn, ref, board, coin, stamp, kinetic, sparkle} from '../engine/hm.mjs';
import {loadTiming, camera, shake, sweatDrop, bubble, whistleBeat, insert, payoffGrid, endBeat, headline, check, cross, stage, fan} from '../engine/kit.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const EP = 3;
export const {T, C, captions, DURATION, captionAt} = loadTiming(HERE);

// ---------------------------------------------------------------- side-view sightline model
const ROWS = 6, FLOOR = 1240, FS = 1.3, RISE = 120, FOCUS = [1010, 830];
const RX = i => 840 - i * 136;                                   // row 0 is nearest the stage
const COL = i => i === 1 ? P.pip : i === 2 ? P.dot : P.crowd;
const standAt = i => [T.cruel + 0.1, C.stand[1] - 0.1, T.ripple + 0.1, C.ripple[1], C.ripple[2] + 0.1, C.ripple[3]][i];
const sitAt = T.fix + 0.2;                                         // everyone sits again under the shared rule
function standK(i, t) {
  const up = E.outBack(seg(t, standAt(i), standAt(i) + 0.3), 1.6);
  return t >= sitAt ? up * (1 - E.inOutCubic(seg(t, sitAt + i * 0.08, sitAt + i * 0.08 + 0.4))) : up;
}
const headPos = (i, t) => [RX(i) + 4 * FS, FLOOR - (194 + standK(i, t) * RISE) * FS];
function sideView(ctx, t, {hidden = false, tired = 0} = {}) {
  if (!hidden) {
    rr(ctx, 72, FLOOR, 1136, 230, 0); fillStroke(ctx, '#3a3150', null, 0);
    rr(ctx, 900, 930, 300, 300, 0); fillStroke(ctx, '#2b2346', P.ink, 6);
    for (let i = 0; i < 3; i++) { const a = Math.sin(t * 1.5 + i) * 0.3; ctx.save(); ctx.translate(980 + i * 60, 180); ctx.rotate(a * 0.4 + 0.2); ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.lineTo(120, 750); ctx.lineTo(-120, 750); ctx.closePath(); ctx.fillStyle = ['rgba(255,197,61,0.18)', 'rgba(124,216,255,0.16)', 'rgba(255,106,85,0.16)'][i]; ctx.fill(); ctx.restore(); }
    pawn(ctx, 1030, 930 - Math.abs(Math.sin(t * 7)) * 18, 1.1, '#9a6fcf');
    rr(ctx, 1080, 800, 70, 130, 10); fillStroke(ctx, P.ink);
  }
  for (let i = ROWS - 1; i >= 0; i--) {
    const [hx, hy] = headPos(i, t), front = i > 0 ? headPos(i - 1, t) : null;
    const blocked = i > 0 && standK(i - 1, t) > standK(i, t) + 0.5;
    const end = blocked ? [front[0] + 10, front[1] + 6] : FOCUS;
    const col = blocked ? P.loss : (i === 1 && standK(1, t) > 0.5 && standK(2, t) < 0.5 ? P.coin : P.win);
    line(ctx, [[hx + 44, hy - 4], end], col, blocked ? 9 : 7, blocked ? null : [18, 12], seg(t, T.seated + 0.4 + i * 0.07, T.seated + 0.9 + i * 0.07));
    if (blocked) cross(ctx, end[0] - 4, end[1] - 6, 0.4, 1);
  }
  for (let i = ROWS - 1; i >= 0; i--) {
    const wob = tired ? Math.sin(t * 5 + i) * 4 * tired : 0;
    fan(ctx, RX(i) + wob, FLOOR, FS, standK(i, t), {riseMax: RISE, col: COL(i), face: i === 1 || i === 2, expr: i === 2 && standK(1, t) > 0.5 && standK(2, t) < 0.5 ? 'shocked' : tired > 0.3 ? 'tired' : 'neutral', t, seed: i});
    if (tired > 0.3) sweatDrop(ctx, RX(i) - 30, FLOOR - 470, t, T.cruel + 2.4 + i * 0.13);
  }
}

// 1 · hook: a standing crowd, front view, lights sweeping from frame one
function hook(ctx, t) {
  tableBg(ctx, t, {col: '#1d1830', dot: 'rgba(255,255,255,0.05)'});
  stage(ctx, t, 140, 560, 800, 330);
  const c = C.nobody;
  for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) {
    const x = 90 + i * 150 + (r % 2) * 70, y = 1130 + r * 120, jump = Math.abs(Math.sin(t * 6 + i * 1.7 + r)) * 22;
    const isPip = r === 2 && i === 3;
    if (isPip) { player(ctx, x, y + 40 - Math.abs(Math.sin(t * 9)) * 40, {s: 0.75, col: P.pip, t, seed: 1, expr: t < T.nobody ? 'suspicious' : 'defeated', R: [60, -240], L: [-60, -240]}); continue; }
    pawn(ctx, x, y - jump, 1.25 + r * 0.15, ['#4a4466', '#5b5578', '#6c668a'][r]);
  }
  // thought bubbles: everyone would rather sit
  if (t > c[1] && t < T.play) [[230, 980], [560, 960], [880, 990]].forEach(([x, y], i) => { const k = popIn(t, c[1] + i * 0.12, 0.3); if (k > 0) withT(ctx, x, y, k, 0, () => { circle(ctx, 0, 0, 62, P.card); rr(ctx, -28, -10, 16, 44, 4); fillStroke(ctx, '#a0714a', P.ink, 4); rr(ctx, -28, 6, 56, 14, 4); fillStroke(ctx, '#a0714a', P.ink, 4); line(ctx, [[22, 20], [22, 34]], P.ink, 5); }); });
  if (t < T.nobody) kinetic(ctx, [[['WHY', 0.0], ['IS', 0.12], ['EVERYONE', 0.25]], [['STANDING?', 0.6]]], W / 2, 330, t, {size: 108, col: P.card, hl: {'STANDING?': P.coin}});
  else if (t < c[2]) kinetic(ctx, [[['NOBODY', c[0]]], [['WANTS', c[1]], ['IT.', c[1] + 0.2]]], W / 2, 330, t, {size: 110, col: P.card});
  else kinetic(ctx, [[['IT', c[2]], ['JUST', c[2] + 0.15]], [['HAPPENS.', c[2] + 0.35]]], W / 2, 330, t, {size: 110, col: P.card, hl: {'HAPPENS.': P.coin}});
}

// 2 · the model
function model(ctx, t) {
  if (t >= T.down && t < T.ripple) return insert(ctx, t, T.down, {col: P.dot, expr: 'suspicious', bg: '#cfeeea', line: 'HEY! DOWN IN FRONT!', R: [80, -260], L: [-50, -120], shakeAmp: 10, flip: true});
  tableBg(ctx, t, {col: '#251f3a', dot: 'rgba(255,255,255,0.05)'});
  const tired = seg(t, T.cruel + 2.2, T.cruel + 3.2);
  camera(ctx, {z: track([[T.seated, 1], [C.stand[0], 1], [C.stand[1], 1.12], [T.down, 1.12], [T.ripple, 1], [T.cruel, 1]])(t), fx: track([[T.seated, 540], [C.stand[1], 640], [T.ripple, 540]])(t), fy: track([[T.seated, 960], [C.stand[1], 1000], [T.ripple, 960]])(t)}, () => sideView(ctx, t, {tired}));
  // comparison meters during "cruel"
  if (t >= T.cruel) {
    const k = popIn(t, C.cruel[1], 0.35);
    if (k > 0) withT(ctx, W / 2, 640, k, 0, () => {
      rr(ctx, -440, -110, 880, 230, 24); fillStroke(ctx, P.card);
      text(ctx, 'VIEW', -330, -50, {font: F.mono, size: 34, align: 'left'}); text(ctx, 'COMFORT', -330, 50, {font: F.mono, size: 34, align: 'left'});
      rr(ctx, -110, -74, 480, 48, 24); fillStroke(ctx, 'rgba(28,32,48,0.08)', P.ink, 4); rr(ctx, -110, -74, 480 * 0.8, 48, 24); fillStroke(ctx, P.win, P.ink, 4);
      text(ctx, 'SAME', 320, -50, {font: F.mono, size: 30, col: P.ink});
      const comfy = lerp(0.9, 0.25, E.inOutCubic(seg(t, C.cruel[3], C.cruel[3] + 0.9)));
      rr(ctx, -110, 26, 480, 48, 24); fillStroke(ctx, 'rgba(28,32,48,0.08)', P.ink, 4); rr(ctx, -110, 26, Math.max(48, 480 * comfy), 48, 24); fillStroke(ctx, comfy < 0.5 ? P.loss : P.win, P.ink, 4);
    });
  }
  headline(ctx, t, [
    [T.seated, T.stand, [[['ALL', T.seated + 0.05], ['SEATED', T.seated + 0.2]], [['ALL', C.seated[1]], ['SEE', C.seated[1] + 0.15]]], {col: P.card, hl: {SEE: P.win}}],
    [T.stand, T.down, [[['ONE', T.stand + 0.05], ['STANDS', C.stand[1]]]], {col: P.card, hl: {STANDS: P.pip}}],
    [T.ripple, T.cruel, [[['ROW', C.ripple[2]], ['BY', C.ripple[2] + 0.15], ['ROW', C.ripple[2] + 0.3]]], {col: P.card}],
    [T.cruel, C.cruel[1], [[['EVERYONE', T.cruel + 0.05]], [['STANDING', T.cruel + 0.3]]], {col: P.card, hl: {STANDING: P.coin}}],
  ], 360);
}

// 3 · Hidden Layer: the payoff grid
function hidden(ctx, t) {
  blueprintBg(ctx, t);
  ref(ctx, W / 2, 400, 1.1 * popIn(t, T.name, 0.35), t, {whistle: t > T.name + 0.1 && t < T.name + 0.6 ? 1 : 0});
  payoffGrid(ctx, t, T.name, {rows: ['ME: SIT', 'ME: STAND'], cols: ['OTHERS: SIT', 'OTHERS: STAND'], eq: 3, eqAt: C.name[2],
    cells: [[['VIEW OK', P.win], ['COMFY', P.win]], [['BLOCKED', P.loss], ['COMFY', P.win]], [['BEST VIEW', P.coin], ['TIRED', P.loss]], [['VIEW OK', P.win], ['TIRED', P.loss]]]});
  const ak = seg(t, C.name[2] - 0.2, C.name[2] + 0.5);
  if (ak > 0) { line(ctx, [[395, 735], [690, 1025]], P.coin, 8, [16, 12], ak); }
  const lk = popIn(t, C.name[1], 0.3); if (lk > 0) withT(ctx, W / 2, 1230, lk, 0, () => text(ctx, 'STANDING ALWAYS LOOKS BETTER FOR ME', 0, 0, {font: F.mono, size: 30, col: P.cyan}));
  stamp(ctx, 'ARMS RACE', W / 2, 1340, seg(t, C.name[4], C.name[4] + 0.25), {size: 96});
}

// 4 · world: louder restaurants, bigger ads
function world(ctx, t) {
  tableBg(ctx, t);
  const c = C.world, slide = track([[c[3] - 0.3, 0], [c[3] + 0.2, -W]])(t);
  ctx.save(); ctx.translate(slide, 0);
  board(ctx, 80, 760, 920, 520, {top: '#f1d9b5'});
  const vol = seg(t, T.world, c[3]);
  [[300, P.pip], [780, P.dot]].forEach(([x, col], j) => {
    rr(ctx, x - 130, 1040, 260, 30, 10); fillStroke(ctx, '#a0714a'); rr(ctx, x - 12, 1070, 24, 120, 6); fillStroke(ctx, '#8a5a36');
    pawn(ctx, x - 160, 1190, 0.9, col); pawn(ctx, x + 160, 1190, 0.9, col);
    const n = 1 + Math.floor((vol + j * 0.15) * 4);
    for (let k = 0; k < n; k++) { ctx.beginPath(); ctx.arc(x - 160 + 40, 1050, 40 + k * 26 + Math.sin(t * 8) * 4, -0.7, 0.7); ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.stroke(); }
    const mh = 60 + vol * 260; rr(ctx, x - 20, 960 - mh, 40, mh, 12); fillStroke(ctx, vol > 0.6 ? P.loss : P.coin);
  });
  text(ctx, 'VOLUME', 300, 1250, {font: F.mono, size: 28, col: P.soft}); text(ctx, 'VOLUME', 780, 1250, {font: F.mono, size: 28, col: P.soft});
  ctx.restore();
  ctx.save(); ctx.translate(slide + W, 0);
  board(ctx, 80, 900, 920, 360);
  const grow = seg(t, c[3], c[4] + 1.2);
  [[300, P.pip, 0], [780, P.dot, 0.25]].forEach(([x, col, off]) => {
    const g = 1 + 0.9 * E.inOutSine(clamp(grow * 1.2 - off)), w = 220 * g, h = 150 * g;
    line(ctx, [[x, 1150], [x, 1150 - 120 * g]], P.ink, 10);
    rr(ctx, x - w / 2, 1150 - 120 * g - h, w, h, 14); fillStroke(ctx, col); text(ctx, 'BUY!', x, 1150 - 120 * g - h / 2, {font: F.display, size: 48 * g, col: P.card});
    const coins = Math.max(0, 5 - Math.floor(grow * 5)); for (let k = 0; k < coins; k++) coin(ctx, x - 60 + k * 30, 1220, 0.8, 0);
  });
  ctx.restore();
  if (t < c[3]) kinetic(ctx, [[['LOUDER', T.world + 0.2]], [['AND', c[1] + 0.2], ['LOUDER', c[1] + 0.4]]], W / 2, 380, t, {size: 110, hl: {LOUDER: P.loss}});
  else kinetic(ctx, [[['BIGGER', c[3] + 0.05]], [['AND', c[4]], ['BIGGER', c[4] + 0.2]]], W / 2, 380, t, {size: 110, hl: {BIGGER: P.pip}});
}

// 5 · the fix: a shared rule
function fix(ctx, t) {
  tableBg(ctx, t, {col: '#251f3a', dot: 'rgba(255,255,255,0.05)'});
  sideView(ctx, t);
  const k = popIn(t, C.fix[0] + 0.2, 0.35);
  if (k > 0) ref(ctx, 470, 720, 1.0 * k, t, {sign: {text: 'PLEASE STAY SEATED', k: popIn(t, C.fix[0] + 0.35, 0.3)}});
  check(ctx, 860, 600, 1.2, seg(t, C.fix[2], C.fix[2] + 0.4));
  kinetic(ctx, [[['A', T.fix + 0.05], ['SHARED', T.fix + 0.2]], [['RULE', T.fix + 0.45]]], W / 2, 330, t, {size: 110, col: P.card, hl: {RULE: P.coin}});
}

function end(ctx, t) {
  endBeat(ctx, t, T.end, C.end, (c, tt) => {
    rr(c, 160, 900, 760, 330, 30); fillStroke(c, '#251f3a');
    stage(c, tt, 520, 930, 360, 220, {lights: true});
    fan(c, 400, 1200, 0.75, 0, {col: P.dot, face: true, t: tt}); fan(c, 270, 1200, 0.75, 0, {col: P.pip, face: true, t: tt});
  });
}

export const SCENES = [
  {id: 'hook', start: 0, draw: hook},
  {id: 'whistle', start: T.play, draw: (c, t) => whistleBeat(c, t, T.play)},
  {id: 'model', start: T.seated, draw: model},
  {id: 'hidden', start: T.name, draw: hidden, hidden: true},
  {id: 'world', start: T.world, draw: world},
  {id: 'fix', start: T.fix, draw: fix},
  {id: 'end', start: T.end, draw: end},
];
export const TRANSITIONS = [[2, 'flip', 0.3, 0.3], [3, 'flip', 0.3, 0.3], [4, 'flip', 0.3, 0.3], [5, 'wipe', 0.3, 0.35], [6, 'wipe', 0.3, 0.35]];
export const SILENCES = [[T.down - 0.05, T.ripple - 0.1], [C.cruel[3] - 0.1, C.cruel[3] + 0.9], [C.name[4], C.name[4] + 0.6]];
export function SFX() {
  const s = [], add = (t, kind, gain = 1) => s.push({t: +Math.max(0, t).toFixed(3), kind, gain});
  add(0.0, 'sweep', 0.5); [0.0, 0.12, 0.25, 0.6].forEach(t => add(t, 'tick', 0.35)); add(C.nobody[1], 'pop', 0.4); add(C.nobody[2] + 0.35, 'thunk', 0.5);
  add(T.play + 0.12, 'whistle', 0.9);
  for (const i of [2, 3, 4]) add(SCENES[i].start - 0.3, 'flip', 0.7); for (const i of [5, 6]) add(SCENES[i].start - 0.3, 'whoosh', 0.7);
  for (let i = 0; i < 7; i++) add(T.seated + 0.4 + i * 0.07, 'tick', 0.25);
  add(C.stand[1] - 0.1, 'pop', 0.6); add(C.stand[3], 'buzz', 0.45);
  add(T.down, 'thunk', 0.6);
  [T.ripple + 0.1, C.ripple[1], C.ripple[2] + 0.1, C.ripple[3], C.ripple[3] + 0.35, T.cruel + 0.1].forEach(t => add(t, 'pop', 0.45));
  add(C.cruel[1], 'pop', 0.4); add(C.cruel[3], 'slide', 0.4);
  add(T.name + 0.1, 'whistle', 0.6); for (let i = 0; i < 4; i++) add(T.name + 0.25 + i * 0.14, 'pop', 0.4); add(C.name[2], 'ding', 0.5); add(C.name[4], 'stamp', 1);
  add(C.world[1], 'tick', 0.3); add(C.world[3] - 0.3, 'whoosh', 0.5); add(C.world[4], 'sweep', 0.4);
  add(C.fix[0] + 0.2, 'pop', 0.5); add(T.fix + 0.2, 'slide', 0.5); add(C.fix[2], 'chime', 0.5);
  for (let i = 0; i < 11; i++) add(T.end + 0.2 + i * 0.05, 'tick', 0.25); add(C.end[1] + 0.45, 'whistle', 0.6);
  return s.sort((a, b) => a.t - b.t);
}
