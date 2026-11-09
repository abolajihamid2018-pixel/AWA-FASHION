// Channel assets for Hidden Moves, drawn with the same engine as the episodes.
// Usage: node brand.mjs <outDir>
import fs from 'node:fs'; import path from 'node:path'; import {pathToFileURL} from 'node:url';
import {loadCanvas, W, H, P, F, rr, fillStroke, circle, ellipse, line, withT, text, measure, tableBg, blueprintBg, player, pawn, ref, board, station, coin, kinetic} from './engine/hm.mjs';
import {jar, duck, fan, stage} from './engine/kit.mjs';
const {createCanvas} = loadCanvas(new URL('./package.json', import.meta.url).pathname);
const out = path.resolve(process.argv[2] ?? 'brand-out'); fs.mkdirSync(out, {recursive: true});
const save = async (c, name, fmt = 'png') => { fs.writeFileSync(path.join(out, name), await c.encode(fmt, 92)); console.log('wrote', name, `${c.width}x${c.height}`); };

function dots(ctx, w, h, col = P.cream, dot = 'rgba(28,32,48,0.10)', g = 44) {
  ctx.fillStyle = col; ctx.fillRect(0, 0, w, h); ctx.fillStyle = dot;
  for (let y = g / 2; y < h; y += g) for (let x = g / 2; x < w; x += g) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); }
}
function logoTiles(ctx, cx, cy, tile = 78, {two = false} = {}) {
  const lines = two ? ['HIDDEN', 'MOVES'] : ['HIDDEN MOVES'], gap = tile * 0.1;
  lines.forEach((word, li) => {
    const tw = word.length * (tile + gap) - gap, x0 = cx - tw / 2, y = cy + (li - (lines.length - 1) / 2) * (tile * 1.35);
    [...word].forEach((ch, i) => {
      if (ch === ' ') return; const second = two ? li === 1 : i > 6;
      withT(ctx, x0 + i * (tile + gap) + tile / 2, y, 1, (i % 3 - 1) * 0.03, () => { rr(ctx, -tile / 2, -tile / 2 - tile * 0.1, tile, tile * 1.2, tile * 0.18); fillStroke(ctx, second ? P.coin : P.card, P.ink, Math.max(4, tile * 0.07)); text(ctx, ch, 0, tile * 0.05, {font: F.display, size: tile * 0.82}); });
    });
  });
}

// 1 · profile pictures (1080², circle-safe)
{
  const c = createCanvas(1080, 1080), x = c.getContext('2d');
  x.fillStyle = P.pip; x.fillRect(0, 0, 1080, 1080);
  x.save(); x.beginPath(); x.arc(540, 540, 540, -Math.PI / 4, Math.PI * 3 / 4); x.closePath(); x.fillStyle = P.dot; x.fill(); x.restore();
  for (let i = 0; i < 12; i++) { x.save(); x.translate(540, 540); x.rotate(i * Math.PI / 6); x.beginPath(); x.moveTo(0, 0); x.lineTo(800, -60); x.lineTo(800, 60); x.closePath(); x.fillStyle = 'rgba(255,255,255,0.08)'; x.fill(); x.restore(); }
  withT(x, 540, 540 + 400, 1, 0, () => player(x, 0, 0, {s: 2.55, col: P.coin, expr: 'smug', t: 0.5, seed: 9, R: [70, -130], L: [-70, -130]}));
  await save(c, 'profile-pip.png');
  const c2 = createCanvas(1080, 1080), y = c2.getContext('2d');
  dots(y, 1080, 1080, P.navy, 'rgba(124,216,255,0.16)');
  circle(y, 540, 540, 420, P.coin, P.ink, 22); circle(y, 540, 540, 330, null, '#d99a1a', 18);
  text(y, 'HM', 540, 560, {font: F.display, size: 360, col: P.ink});
  await save(c2, 'profile-mark.png');
  const p = createCanvas(640, 320), z = p.getContext('2d'); z.fillStyle = '#dcdcdc'; z.fillRect(0, 0, 640, 320);   // circle-crop preview
  for (const [img, cx] of [[c, 170], [c2, 470]]) { z.save(); z.beginPath(); z.arc(cx, 160, 130, 0, Math.PI * 2); z.clip(); z.drawImage(img, cx - 130, 30, 260, 260); z.restore(); }
  await save(p, 'profile-preview.png');
}

// 2 · YouTube banner 2560×1440 (safe area 1546×423 centred) + 3 · X header 1500×500
async function banner(w, h, safeW, safeH, name) {
  const c = createCanvas(w, h), x = c.getContext('2d'); dots(x, w, h);
  const cx = w / 2, cy = h / 2;
  // decorative boards outside the safe area (visible on TV/desktop)
  const deco = [[cx - safeW / 2 - 330, cy + 60, 'station'], [cx + safeW / 2 + 330, cy + 60, 'jar'], [cx - safeW / 2 - 700, cy - 220, 'duck'], [cx + safeW / 2 + 700, cy - 220, 'crowd']];
  for (const [bx, by, kind] of deco) {
    withT(x, bx, by, h / 1440, 0, () => {
      board(x, -230, -40, 460, 230, {d: 30});
      if (kind === 'station') { station(x, -60, 150, 0.5, {col: P.pip}); station(x, 70, 150, 0.5, {col: P.dot}); }
      if (kind === 'jar') jar(x, 0, 160, 0.5, {fill: 1, label: '?'});
      if (kind === 'duck') duck(x, 0, 120, 0.8, 0);
      if (kind === 'crowd') for (let i = 0; i < 5; i++) pawn(x, -160 + i * 80, 160, 0.7, [P.crowd, P.pip, P.crowd, P.dot, P.crowd][i]);
    });
  }
  // safe area content
  const s = safeH / 423;
  withT(x, cx - safeW / 2 + 95 * s, cy + safeH / 2 - 10 * s, 1, 0, () => player(x, 0, 0, {s: 0.95 * s, col: P.pip, expr: 'eureka', t: 0.3, seed: 1, R: [70, -260], L: [-60, -110]}));
  withT(x, cx + safeW / 2 - 95 * s, cy + safeH / 2 - 10 * s, 1, 0, () => player(x, 0, 0, {s: 0.95 * s, col: P.dot, expr: 'smug', t: 0.3, seed: 2, flip: true, R: [60, -120], L: [-60, -120]}));
  logoTiles(x, cx, cy - 70 * s, 72 * s);
  text(x, 'EVERYTHING IS A GAME. HERE ARE THE RULES.', cx, cy + 70 * s, {font: F.cap, size: 46 * s});
  rr(x, cx - 330 * s, cy + 118 * s, 660 * s, 64 * s, 32 * s); fillStroke(x, P.ink, null, 0);
  text(x, 'EVERYDAY GAME THEORY · ANIMATED', cx, cy + 151 * s, {font: F.mono, size: 30 * s, col: P.coin});
  await save(c, name);
  return c;
}
const yb = await banner(2560, 1440, 1546, 423, 'youtube-banner-2560x1440.png');
{ // safe-area guide preview
  const g = createCanvas(1280, 720), x = g.getContext('2d'); x.drawImage(yb, 0, 0, 1280, 720);
  x.strokeStyle = '#ff0066'; x.lineWidth = 3; x.setLineDash([10, 8]); x.strokeRect(640 - 773 / 2, 360 - 423 / 4, 773, 211.5);
  x.strokeRect(640 - 1235 / 2, 360 - 423 / 4, 1235, 211.5); x.setLineDash([]);
  x.font = '700 18px JBMono'; x.fillStyle = '#ff0066'; x.fillText('SAFE AREA (all devices)', 640 - 773 / 2 + 8, 360 - 423 / 4 - 8); x.fillText('DESKTOP MAX', 640 - 1235 / 2 + 8, 360 + 423 / 4 + 22);
  await save(g, 'youtube-banner-safe-area-preview.png');
}
await banner(1500, 500, 1100, 400, 'x-header-1500x500.png');

// 4 · YouTube watermark 150×150 (transparent)
{
  const c = createCanvas(300, 300), x = c.getContext('2d');
  ref(x, 128, 150, 1.85, 0.4, {});
  await save(c, 'youtube-watermark.png');
}

// 5 · episode covers 1080×1920 (Shorts / TikTok / Reels)
const covers = [
  {ep: 1, dir: 'ep01', t: 1.6, lines: [['WHY', 'GAS STATIONS'], ['COME IN', 'PAIRS']], hl: 'PAIRS', hlCol: P.pip},
  {ep: 2, dir: 'ep02', t: 1.4, lines: [['THE', 'WINNER'], ['ACTUALLY', 'LOST']], hl: 'LOST', hlCol: P.loss},
  {ep: 3, dir: 'ep03', t: 14.6, lines: [['WHY', 'EVERYONE'], ['STANDS AT', 'CONCERTS']], hl: 'STANDS AT', hlCol: P.coin},
  {ep: 4, dir: 'ep04', t: 16.6, lines: [['THE OPTION'], ['NOBODY', 'BUYS']], hl: 'NOBODY', hlCol: P.loss},
];
for (const cv of covers) {
  const ep = await import(pathToFileURL(path.resolve(cv.dir, 'episode.mjs')));
  const S = ep.SCENES; let i = 0; for (let j = 0; j < S.length; j++) if (cv.t >= S[j].start) i = j;
  const art = createCanvas(W, H), ax = art.getContext('2d'); S[i].draw(ax, cv.t);
  const c = createCanvas(W, H), x = c.getContext('2d');
  x.drawImage(art, 0, 170);
  // cover the scene's own headline band, then the title block
  const dark = S[i].hidden || cv.ep === 3;
  dots(x, W, 780, dark ? '#16142a' : P.cream, dark ? 'rgba(255,255,255,0.05)' : 'rgba(28,32,48,0.10)'); line(x, [[0, 780], [W, 780]], P.ink, 6);
  rr(x, 70, 250, 190, 70, 35); fillStroke(x, P.ink, null, 0); text(x, `EP.0${cv.ep}`, 165, 287, {font: F.mono, size: 36, col: P.coin});
  let y = 440;
  cv.lines.forEach(ws => { const str = ws.join(' '); let size = 150; const mw = measure(x, str, size, F.display); if (mw > 960) size = Math.floor(size * 960 / mw);
    let xx = W / 2 - measure(x, str, size, F.display) / 2;
    ws.forEach(w => { const ww = measure(x, w, size, F.display); text(x, w, xx + ww / 2, y, {font: F.display, size, col: w === cv.hl ? cv.hlCol : dark ? P.card : P.ink, stroke: P.ink, lw: w === cv.hl ? 10 : 0}); xx += ww + size * 0.3; });
    y += size * 1.05; });
  logoTiles(x, W / 2, 1720, 44);
  await save(c, `cover-ep0${cv.ep}.jpg`, 'jpeg');
}

// 6 · Instagram highlight covers (1080×1920, icon centred in the circle-crop zone)
const HL = [['START HERE', P.pip, (x) => player(x, 0, 230, {s: 1.4, col: P.pip, expr: 'grin', t: 0.2, seed: 1, R: [70, -280], L: [-60, -110]})],
  ['PRICES', P.coin, (x) => { coin(x, -60, 40, 4, 0); coin(x, 90, -20, 3, 0.6); }],
  ['CROWDS', P.dot, (x) => { for (let i = 0; i < 5; i++) pawn(x, -200 + i * 100, 140 - (i % 2) * 40, 1.6, i === 2 ? P.pip : P.crowd); }],
  ['AUCTIONS', '#9a6fcf', (x) => jar(x, 0, 200, 0.85, {fill: 1, label: '?'})]];
for (const [name, col, draw] of HL) {
  const c = createCanvas(W, H), x = c.getContext('2d'); dots(x, W, H, col, 'rgba(28,32,48,0.12)');
  circle(x, 540, 960, 420, P.card, P.ink, 14);
  withT(x, 540, 960, 1, 0, () => draw(x));
  text(x, name, 540, 1520, {font: F.display, size: 96, col: P.ink});
  await save(c, `ig-highlight-${name.toLowerCase().replace(' ', '-')}.png`);
}
