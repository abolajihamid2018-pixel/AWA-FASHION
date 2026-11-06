// Builds project.json for "Why pen caps have a hole" (B3 Retro TV, vertical).
// Usage: node build.mjs <skillDir> <projectDir>
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const [skill, proj] = process.argv.slice(2);
const require = createRequire(path.join(skill, 'package.json'));
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
GlobalFonts.registerFromPath(path.join(skill, 'assets/fonts/NotoSans.ttf'), 'N');
const mctx = createCanvas(10, 10).getContext('2d');
const tw = (s, size) => { mctx.font = `700 ${size}px N`; return mctx.measureText(s).width; };

const VOICE = 30.049417, LEAD = 0.15, TAIL = 0.35, END = +(VOICE + LEAD + TAIL).toFixed(6);
const W = 1280, H = 1280 * 1560 / 1080; // ≈1848.9 design units
const C = {bg: '#111316', panel: '#171b20', edge: '#262c33', white: '#eceeef', light: '#d5d8db', mid: '#a9afb5', dim: '#6c737a', dark: '#2a2f35', red: '#e0533d', air: '#9fdcff'};

// ---------- primitives ----------
const rect = (x, y, w, h, fill, o = {}) => ({type: 'rect', x, y, w, h, radius: o.r ?? 0, fill, ...o.extra, ...pick(o)});
const ell = (x, y, w, h, fill, o = {}) => ({type: 'ellipse', x, y, w, h, fill, ...pick(o)});
const grp = (children, o = {}) => ({type: 'group', children, ...pick(o)});
const pathL = (commands, o = {}) => ({type: 'path', commands, ...pick(o)});
const line = (points, o = {}) => ({type: 'line', points, ...pick(o)});
function pick(o) { const r = {}; for (const k of ['fill', 'x', 'y', 'from', 'to', 'keys', 'alpha', 'pivotX', 'pivotY', 'scaleX', 'scaleY', 'angle', 'stroke', 'lineWidth', 'color', 'progress']) if (o[k] !== undefined) r[k] = o[k]; return r; }
const text = (s, x, y, size, o = {}) => ({type: 'text', text: s, x, y, size, bold: o.bold ?? true, color: o.color ?? C.white, w: o.w ?? 1200, ...pick(o)});
const ctext = (s, cy, size, o = {}) => text(s, Math.round((W - tw(s, size)) / 2), cy, size, o);
const fadeIn = (t = 0, d = 0.25) => [{t, alpha: 0}, {t: t + d, alpha: 1}];
const pop = (t, b = 1) => [{t, alpha: 0, scaleX: 0.6 * b, scaleY: 0.6 * b}, {t: t + 0.22, alpha: 1, scaleX: 1.06 * b, scaleY: 1.06 * b}, {t: t + 0.34, alpha: 1, scaleX: b, scaleY: b}];

// ---------- frame chrome (series label, episode counter, stage panel) ----------
const chrome = (n, heading, headingAt = 0.15) => [
  text('HIDDEN DESIGN / EVERYDAY OBJECTS', 70, 70, 26, {color: C.mid}),
  text('EP. 01', 1110, 70, 26, {color: C.dim}),
  rect(70, 170, 1140, 1290, C.panel, {r: 26, stroke: C.edge, lineWidth: 3}),
  ...(heading ? [ctext(heading, 1525, 70, {keys: fadeIn(headingAt, 0.3)})] : []),
];

// ---------- characters & props (original vector art) ----------
// Pen cap, local box ≈ 200×470. hole: 'open' | 'none' | {keys} for drilled reveal.
function cap(x, y, s = 1, o = {}) {
  const ch = [
    rect(-34, 74, 30, 300, '#b9bec3', {r: 15}),           // pocket clip
    rect(-14, 74, 26, 46, '#b9bec3', {r: 8}),             // clip joint
    rect(0, 50, 200, 410, C.white, {r: 44}),             // body
    ell(0, 0, 200, 140, C.white),                        // domed top
    rect(150, 90, 34, 340, '#cdd1d5', {r: 17}),          // side shade
    rect(-4, 440, 208, 34, '#bfc4c9', {r: 10}),          // rim
  ];
  if (o.hole !== 'none') ch.push(ell(76, 30, 48, 30, C.bg, {keys: o.holeKeys}));
  if (o.ring) ch.push(ell(46, 8, 108, 74, 'none', {stroke: C.red, lineWidth: 7, keys: o.ring}));
  return grp(ch, {x, y, scaleX: s, scaleY: s, pivotX: 100, pivotY: 230, keys: o.keys, from: o.from, to: o.to});
}
// Pen without cap, horizontal, pointing right. local box ≈ 640×80
function pen(x, y, s = 1, o = {}) {
  return grp([
    rect(0, 0, 470, 80, C.light, {r: 30}),
    rect(0, 52, 470, 28, '#b9bec3', {r: 14}),
    pathL([['M', 466, 6], ['L', 600, 30], ['L', 600, 50], ['L', 466, 74], ['Z']], {stroke: 'none'}),
    rect(596, 32, 34, 16, C.mid, {r: 8}),
    ell(616, 30, 20, 20, C.mid),
  ], {x, y, scaleX: s, scaleY: s, keys: o.keys, angle: o.angle, pivotX: 300, pivotY: 40});
}
// Front-view person, blank round head, rounded limbs. local origin = head top-left; height ≈ 590*s
function person(x, y, s = 1, o = {}) {
  const tone = o.tone ?? C.white;
  const arm = (side, keys, angle = 0) => grp([rect(0, 0, 34, 190, side ? '#c4c8cc' : tone, {r: 17})],
    {x: side ? 118 : -32, y: 150, pivotX: 17, pivotY: 14, keys, angle});
  return grp([
    grp([rect(0, 0, 40, 220, '#c4c8cc', {r: 20})], {x: 28, y: 360, pivotX: 20, pivotY: 16, keys: o.legB}),  // back leg
    grp([rect(0, 0, 40, 220, tone, {r: 20})], {x: 78, y: 360, pivotX: 20, pivotY: 16, keys: o.legF}),       // front leg
    arm(true, o.armR, o.armRAngle),
    rect(14, 140, 118, 240, tone, {r: 46}),            // torso
    ell(18, 0, 110, 110, tone),                        // head (blank)
    arm(false, o.armL, o.armLAngle),
    ...(o.extra || []),
  ], {x, y, scaleX: s, scaleY: s, pivotX: 73, pivotY: 580, keys: o.keys, from: o.from, to: o.to});
}
// Schematic throat cross-section: head + neck with the airway tube. local ≈ 520×1000
function throat(x, y, o = {}) {
  return grp([
    rect(165, 330, 190, 560, '#20262c', {r: 30, stroke: C.dim, lineWidth: 4}), // neck
    ell(60, 0, 400, 400, '#20262c', {stroke: C.dim, lineWidth: 4}),          // head outline
    rect(168, 340, 184, 120, '#20262c'),                                        // merge head into neck
    pathL([['M', 300, 250], ['Q', 230, 260, 230, 330], ['L', 230, 900]], {fill: 'none', stroke: C.mid, lineWidth: 8}),       // airway wall L
    pathL([['M', 380, 240], ['Q', 300, 280, 300, 340], ['L', 300, 900]], {fill: 'none', stroke: C.mid, lineWidth: 8}),       // airway wall R
    pathL([['M', 300, 236], ['L', 470, 230]], {fill: 'none', stroke: C.mid, lineWidth: 8}),  // mouth line
    pathL([['M', 380, 246], ['L', 470, 252]], {fill: 'none', stroke: C.mid, lineWidth: 8}),
    text('AIRWAY', 372, 700, 30, {color: C.mid}),
    ...(o.inside || []),
  ], {x, y, keys: o.keys});
}
const star = (cx, cy, r, keys) => pathL([['M', cx, cy - r], ['Q', cx, cy, cx + r, cy], ['Q', cx, cy, cx, cy + r], ['Q', cx, cy, cx - r, cy], ['Q', cx, cy, cx, cy - r], ['Z']], {fill: C.white, keys});
const heart = (x, y, s, keys) => grp([pathL([['M', 100, 180], ['C', 20, 120, -20, 60, 30, 20], ['C', 60, -4, 95, 10, 100, 40], ['C', 105, 10, 140, -4, 170, 20], ['C', 220, 60, 180, 120, 100, 180], ['Z']], {fill: C.red})], {x, y, scaleX: s, scaleY: s, pivotX: 100, pivotY: 90, keys});
const strike = (x1, y1, x2, y2, t, d = 0.35) => line([[x1, y1], [x2, y2]], {color: C.red, lineWidth: 16, keys: [{t, progress: 0}, {t: t + d, progress: 1}], progress: 0});
// cap seen side-on, small, for inside the airway (local 70×150)
const miniCap = (x, y, keys, hole = true) => grp([rect(0, 10, 70, 140, C.white, {r: 16}), ell(0, 0, 70, 40, C.white), ...(hole ? [ell(25, 6, 20, 12, C.bg)] : [])], {x, y, keys, pivotX: 35, pivotY: 75});

// ---------- timing from narration cues (video time) ----------
const S = [0, 2.269, 3.855, 5.89, 8.14, 9.326, 11.63, 13.681, 15.689, 17.959, 19.399, 21.679, 24.452, 26.718, 28.502, END];
const shots = [];
const add = (layers, sfx = []) => { const i = shots.length; shots.push({start: S[i], end: S[i + 1], layers}); return sfx.map(e => ({...e, time: +(S[i] + e.time).toFixed(3)})); };
const sfx = [];

// 1 · "See this tiny hole / in your pen cap?" — cap pushes in, red ring finds the hole
sfx.push(...add([...chrome(1, 'WHY IS THIS HOLE HERE?', 0.9),
  cap(540, 420, 1.55, {keys: [{t: 0, scaleX: 1.2, scaleY: 1.2, alpha: 0.2}, {t: 0.5, scaleX: 1.55, scaleY: 1.55, alpha: 1}, {t: 2.2, scaleX: 1.68, scaleY: 1.68}],
    ring: [{t: 0, alpha: 0, scaleX: 1.6, scaleY: 1.6}, {t: 1.05, alpha: 0, scaleX: 1.6, scaleY: 1.6}, {t: 1.35, alpha: 1, scaleX: 1, scaleY: 1}]}),
], [{time: 0.15, kind: 'pop', gain: 0.03}, {time: 1.35, kind: 'tap', gain: 0.04}]));

// 2 · "It's not there for the ink." — pen + ink drop, red strike
sfx.push(...add([...chrome(2, 'FOR THE INK?'),
  pen(250, 760, 1.2, {keys: [{t: 0, x: 120, alpha: 0}, {t: 0.35, x: 250, alpha: 1}]}),
  grp([pathL([['M', 60, 0], ['C', 60, 0, 0, 80, 0, 120], ['C', 0, 160, 30, 190, 60, 190], ['C', 90, 190, 120, 160, 120, 120], ['C', 120, 80, 60, 0, 60, 0], ['Z']], {fill: '#5d7fa8'})],
    {x: 900, y: 500, keys: [{t: 0.2, y: 440, alpha: 0}, {t: 0.55, y: 500, alpha: 1}]}),
  strike(820, 470, 1100, 740, 0.9),
], [{time: 0.9, kind: 'tap', gain: 0.045}]));

// 3 · "And it's not / to keep the tip dry." — tip with heat lines, second strike
sfx.push(...add([...chrome(3, 'TO KEEP IT FROM DRYING?'),
  pen(130, 760, 1.2),
  ...[0, 1, 2].map(i => pathL([['M', 930 + i * 70, 640], ['Q', 950 + i * 70, 600, 930 + i * 70, 560], ['Q', 910 + i * 70, 520, 930 + i * 70, 480]], {fill: 'none', stroke: '#e0a24a', lineWidth: 8,
    keys: [{t: 0.1 + i * 0.15, alpha: 0, y: 30}, {t: 0.5 + i * 0.15, alpha: 1, y: 0}, {t: 1.3, alpha: 0.9, y: -12}]})),
  strike(850, 470, 1150, 760, 1.15),
], [{time: 1.15, kind: 'tap', gain: 0.045}]));

// 4 · "Kids chew on pen caps, / and sometimes," — child with pen at mouth, cap bobs (chewing)
const chewKeys = []; for (let t = 0; t <= 2.2; t += 0.28) chewKeys.push({t: +t.toFixed(2), angle: (Math.round(t / 0.28) % 2 ? 0.1 : -0.06)});
sfx.push(...add([...chrome(4, 'KIDS CHEW CAPS'),
  person(470, 700, 0.95, {tone: C.white, armL: [{t: 0, angle: 0.15}, {t: 1, angle: 0.3}], armR: [{t: 0, angle: -0.15}, {t: 1, angle: -0.3}], extra: [
      grp([rect(120, 66, 170, 20, '#b9bec3', {r: 10}), rect(92, 60, 62, 32, '#f7f8f8', {r: 10}), ell(270, 66, 30, 20, C.mid)],
        {pivotX: 112, pivotY: 76, keys: [{t: 0, alpha: 0, x: 40}, {t: 0.35, alpha: 1, x: 0}, ...chewKeys.filter(k => k.t > 0.35)]}),
    ]}),
  ell(760, 520, 180, 120, 'none', {stroke: C.dim, lineWidth: 4, keys: fadeIn(1.0)}),
  text('CHOMP', 783, 562, 34, {color: C.light, keys: [{t: 1.0, alpha: 0}, {t: 1.2, alpha: 1}, {t: 1.6, alpha: 0.6}, {t: 1.9, alpha: 1}]}),
], [{time: 0.75, kind: 'tap', gain: 0.025}, {time: 1.05, kind: 'tap', gain: 0.025}, {time: 1.6, kind: 'tap', gain: 0.025}]));

// 5 · "they breathe one in." — throat diagram, cap slides from mouth into airway
sfx.push(...add([...chrome(5, 'INHALED BY ACCIDENT'),
  throat(380, 280, {inside: [miniCap(470, 170, [{t: 0, x: 470, y: 170, angle: 1.4, alpha: 0}, {t: 0.15, alpha: 1}, {t: 0.55, x: 290, y: 250, angle: 0.6}, {t: 1.05, x: 231, y: 470, angle: 0}])]}),
], [{time: 0.5, kind: 'paper', gain: 0.03}]));

// 6 · "So pen makers / put a hole in the cap." — drill comes down, hole appears
sfx.push(...add([...chrome(6, 'SO THEY ADDED A HOLE', 1.2),
  cap(540, 560, 1.5, {holeKeys: [{t: 0, alpha: 0}, {t: 1.3, alpha: 0}, {t: 1.4, alpha: 1}]}),
  grp([rect(0, 0, 120, 190, '#5a626b', {r: 16}), rect(40, 190, 40, 120, C.mid, {r: 8}), rect(52, 300, 16, 60, C.light, {r: 6})],
    {x: 580, y: 150, keys: [{t: 0, y: -150}, {t: 0.7, y: 100}, {t: 1.35, y: 150}, {t: 1.7, y: 150}, {t: 2.2, y: -260}]}),
  ...[0, 1, 2, 3].map(i => ell(620 + (i % 2 ? 60 : -30), 520 - i * 8, 14, 14, C.mid, {keys: [{t: 1.3, alpha: 0, x: 630, y: 530}, {t: 1.45, alpha: 1}, {t: 1.9, alpha: 0, x: 630 + (i - 1.5) * 120, y: 460 - i * 20}]})),
], [{time: 0.8, kind: 'paper', gain: 0.035}, {time: 1.38, kind: 'pop', gain: 0.04}]));

// 7 · "If one gets stuck / in someone's airway," — cap lodged, shakes, airway marked
const shake = []; for (let t = 0.3; t <= 1.6; t += 0.12) shake.push({t: +t.toFixed(2), x: 231 + (Math.round(t / 0.12) % 2 ? 4 : -4)});
sfx.push(...add([...chrome(7, 'STUCK', 0.2),
  throat(380, 280, {inside: [miniCap(231, 470, [{t: 0, x: 231}, ...shake, {t: 1.8, x: 231}])]}),
  rect(790, 760, 60, 14, C.red, {r: 20, keys: [{t: 0.6, alpha: 0}, {t: 0.8, alpha: 1}]}),
  text('BLOCKED?', 865, 744, 40, {color: C.red, keys: [{t: 0.7, alpha: 0}, {t: 0.9, alpha: 1}]}),
], [{time: 0.35, kind: 'tap', gain: 0.03}]));

// 8 · "air can still squeeze / through the hole." — air particles stream through the hole
const airDots = []; for (let i = 0; i < 8; i++) { const t0 = 0.1 + i * 0.12; airDots.push(ell(637, 470, 18, 18, C.air, {keys: [{t: t0, x: 637, y: 330, alpha: 0}, {t: t0 + 0.15, alpha: 1}, {t: t0 + 0.55, x: 637, y: 560}, {t: t0 + 0.8, x: 637, y: 760, alpha: 1}, {t: t0 + 1.0, alpha: 0, y: 900}]})); }
sfx.push(...add([...chrome(8, 'AIR STILL GETS THROUGH', 0.3),
  throat(380, 280, {inside: [miniCap(231, 470)]}),
  ...airDots,
  line([[637, 300], [637, 1150]], {color: C.air, lineWidth: 4, keys: [{t: 0, progress: 0, alpha: 0.6}, {t: 1.8, progress: 1, alpha: 0.6}], progress: 0}),
], [{time: 0.4, kind: 'paper', gain: 0.02}]));

// 9 · "That tiny gap / can buy precious seconds" — stopwatch hand sweeps
sfx.push(...add([...chrome(9, 'PRECIOUS SECONDS'),
  ell(390, 420, 500, 500, '#1f252b', {stroke: C.white, lineWidth: 18}),
  rect(600, 340, 80, 70, C.white, {r: 12}),
  ...Array.from({length: 12}, (_, i) => grp([rect(-5, 0, 10, i % 3 ? 22 : 40, i % 3 ? C.dim : C.light, {r: 5})], {x: 640, y: 670, angle: i * Math.PI / 6, pivotX: 0, pivotY: 0, keys: undefined})).map(g => ({...g, children: [{...g.children[0], y: -225}]})),
  grp([rect(-7, -200, 14, 210, C.red, {r: 7})], {x: 640, y: 670, keys: [{t: 0, angle: 0}, {t: 2.2, angle: Math.PI * 1.4}]}),
  ell(615, 645, 50, 50, C.white),
], [{time: 0.2, kind: 'tap', gain: 0.02}, {time: 0.7, kind: 'tap', gain: 0.02}, {time: 1.2, kind: 'tap', gain: 0.02}, {time: 1.7, kind: 'tap', gain: 0.02}]));

// 10 · "until help arrives." — helper runs in to the person
sfx.push(...add([...chrome(10, 'UNTIL HELP ARRIVES'),
  rect(110, 1250, 1060, 6, C.dim),
  person(740, 660, 1.0, {tone: C.light, armL: [{t: 0, angle: 0.4}], armR: [{t: 0, angle: -0.4}]}),
  person(160, 660, 1.0, {tone: C.white,
    keys: [{t: 0, x: -150}, {t: 0.9, x: 500}, {t: 1.4, x: 530}],
    armL: [{t: 0, angle: 0.6}, {t: 0.25, angle: -0.6}, {t: 0.5, angle: 0.6}, {t: 0.75, angle: -0.6}, {t: 1.0, angle: 0.1}],
    armR: [{t: 0, angle: -0.6}, {t: 0.25, angle: 0.6}, {t: 0.5, angle: -0.6}, {t: 0.75, angle: 0.6}, {t: 1.0, angle: 0}, {t: 1.3, angle: -1.3}],
    legF: [{t: 0, angle: -0.5}, {t: 0.25, angle: 0.5}, {t: 0.5, angle: -0.5}, {t: 0.75, angle: 0.5}, {t: 1.0, angle: 0}],
    legB: [{t: 0, angle: 0.5}, {t: 0.25, angle: -0.5}, {t: 0.5, angle: 0.5}, {t: 0.75, angle: -0.5}, {t: 1.0, angle: 0}]}),
  heart(940, 560, 0.5, [{t: 1.0, alpha: 0, scaleX: 0.3, scaleY: 0.3}, {t: 1.2, alpha: 1, scaleX: 0.5, scaleY: 0.5}]),
], [{time: 0.2, kind: 'tap', gain: 0.02}, {time: 0.45, kind: 'tap', gain: 0.02}, {time: 0.7, kind: 'tap', gain: 0.02}, {time: 1.2, kind: 'chime', gain: 0.02}]));

// 11 · "It's even written into" — a standards document writes itself
const docLines = (from) => Array.from({length: 8}, (_, i) => line([[0, 0], [i % 3 === 2 ? 340 : 480, 0]], {x: 400, y: 560 + i * 70, color: C.dim, lineWidth: 12, progress: 0, keys: [{t: from + i * 0.2, progress: 0}, {t: from + i * 0.2 + 0.35, progress: 1}]}));
const doc = (from) => [rect(340, 360, 600, 880, '#e6e8ea', {r: 18, keys: from === 0 ? [{t: 0, y: 420, alpha: 0}, {t: 0.35, y: 360, alpha: 1}] : undefined}), rect(400, 420, 300, 40, '#9aa1a8', {r: 8}), ...docLines(from)];
sfx.push(...add([...chrome(11, 'IT\'S IN THE RULES'), ...doc(0)], [{time: 0.1, kind: 'paper', gain: 0.035}]));

// 12 · "a safety standard: / ISO 11540." — stamp lands on cue
sfx.push(...add([...chrome(12, 'A REAL SAFETY STANDARD'),
  rect(340, 360, 600, 880, '#e6e8ea', {r: 18}), rect(400, 420, 300, 40, '#9aa1a8', {r: 8}),
  ...Array.from({length: 8}, (_, i) => line([[0, 0], [i % 3 === 2 ? 340 : 480, 0]], {x: 400, y: 560 + i * 70, color: C.dim, lineWidth: 12})),
  grp([rect(0, 0, 520, 170, 'rgba(224,83,61,0.08)', {r: 18, stroke: C.red, lineWidth: 10}), text('ISO 11540', 48, 42, 86, {color: C.red})],
    {x: 380, y: 760, angle: -0.12, pivotX: 260, pivotY: 85, keys: [{t: 1.6, alpha: 0, scaleX: 2.2, scaleY: 2.2}, {t: 1.82, alpha: 1, scaleX: 0.95, scaleY: 0.95}, {t: 1.95, scaleX: 1, scaleY: 1}]}),
], [{time: 1.8, kind: 'pop', gain: 0.05}]));

// 13 · "Not every design / is about looks." — sparkles fade, focus returns to the hole
sfx.push(...add([...chrome(13, 'NOT ABOUT LOOKS', 1.3),
  cap(540, 520, 1.45, {ring: [{t: 1.4, alpha: 0}, {t: 1.7, alpha: 1}]}),
  ...[[400, 470, 40], [900, 620, 52], [430, 900, 32], [880, 1050, 44], [960, 400, 28]].map(([x, y, r], i) => star(x, y, r, [{t: 0, alpha: 0}, {t: 0.2 + i * 0.1, alpha: 1}, {t: 0.6 + i * 0.1, alpha: 0.4}, {t: 0.9 + i * 0.1, alpha: 1}, {t: 1.36, alpha: 1}, {t: 1.55, alpha: 0}])),
], [{time: 0.2, kind: 'jingle', gain: 0.02}, {time: 1.5, kind: 'tap', gain: 0.03}]));

// 14 · "Some are about / saving a life." — person breathes easy, heartbeat pulse
sfx.push(...add([...chrome(14, 'SOME SAVE LIVES', 0.6),
  person(380, 600, 1.1, {tone: C.white, armL: [{t: 0, angle: 0.2}, {t: 0.8, angle: 0.5}], armR: [{t: 0, angle: -0.2}, {t: 0.8, angle: -0.5}], keys: [{t: 0, scaleX: 1.1, scaleY: 1.1}, {t: 0.6, scaleX: 1.1, scaleY: 1.13}, {t: 1.2, scaleX: 1.1, scaleY: 1.1}]}),
  heart(760, 520, 1.1, [{t: 0.3, alpha: 0, scaleX: 0.5, scaleY: 0.5}, {t: 0.55, alpha: 1, scaleX: 1.1, scaleY: 1.1}, {t: 0.8, scaleX: 0.95, scaleY: 0.95}, {t: 1.05, scaleX: 1.15, scaleY: 1.15}, {t: 1.3, scaleX: 0.95, scaleY: 0.95}, {t: 1.55, scaleX: 1.12, scaleY: 1.12}]),
], [{time: 0.55, kind: 'chime', gain: 0.025}]));

// 15 · "Follow for more / hidden designs." — next-episode teaser objects
sfx.push(...add([...chrome(15, 'FOLLOW FOR MORE', 0.1),
  ctext('NEXT:', 330, 54, {color: C.mid, keys: fadeIn(0.3)}),
  cap(250, 560, 0.7, {keys: pop(0.2, 0.7)}),
  grp([rect(0, 0, 220, 300, '#1f252b', {r: 20, stroke: C.light, lineWidth: 6}), ell(60, 60, 100, 100, 'none', {stroke: C.light, lineWidth: 6}), ell(60, 170, 100, 100, 'none', {stroke: C.light, lineWidth: 6}), text('?', 93, 80, 54, {color: C.light})],
    {x: 530, y: 640, pivotX: 110, pivotY: 150, keys: pop(0.55)}),
  grp([ell(0, 0, 220, 220, 'none', {stroke: C.light, lineWidth: 10}), rect(100, 30, 20, 160, C.light, {r: 10}), rect(30, 100, 160, 20, C.light, {r: 10}), text('?', 150, 150, 54, {color: C.light})],
    {x: 850, y: 680, pivotX: 110, pivotY: 110, keys: pop(0.9)}),
], [{time: 0.2, kind: 'pop', gain: 0.03}, {time: 0.55, kind: 'pop', gain: 0.03}, {time: 0.9, kind: 'pop', gain: 0.03}, {time: 1.3, kind: 'chime', gain: 0.025}]));

if (shots.length !== S.length - 1) throw new Error(`shot count ${shots.length} vs ${S.length - 1}`);
const project = {
  version: 1, style: 'B3', width: 1080, height: 1560, fps: 30,
  voice: {path: 'narration.wav', lead: LEAD, tail: TAIL},
  captionSize: 56,
  television: {enabled: process.env.CLEAN ? false : true, intensity: 0.45},
  captions: JSON.parse(fs.readFileSync(path.join(proj, 'captions.json'), 'utf8')).map((c, i, a) => i === a.length - 1 ? {...c, end: +(END - 0.05).toFixed(3)} : c),
  shots, sfx,
};
fs.writeFileSync(path.join(proj, 'project.json'), JSON.stringify(project, null, 1));
console.log('shots', shots.length, 'sfx', sfx.length, 'end', END);
