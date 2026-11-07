// Usage: node render.mjs <episodeDir> stills <out.png> [t1,t2,...]   |   node render.mjs <episodeDir> video <out.mp4>
import path from 'node:path'; import {spawn} from 'node:child_process'; import {pathToFileURL} from 'node:url'; import fs from 'node:fs';
import {loadCanvas, W, H, FPS, caption, brandBug, tileFlip, coinWipe, clamp, seg} from './engine/hm.mjs';
const {createCanvas} = loadCanvas(new URL('./package.json', import.meta.url).pathname);
const [epDir, mode, out, times] = process.argv.slice(2);
const ep = await import(pathToFileURL(path.resolve(epDir, 'episode.mjs')));
const main = createCanvas(W, H), ctx = main.getContext('2d');
const offA = createCanvas(W, H), offB = createCanvas(W, H);
const S = ep.SCENES;
function frame(t) {
  let i = 0; for (let j = 0; j < S.length; j++) if (t >= S[j].start) i = j;
  const tr = ep.TRANSITIONS.find(([j, , b, a]) => t >= S[j].start - b && t < S[j].start + a);
  ctx.save(); ctx.resetTransform(); ctx.globalAlpha = 1;
  if (tr) {
    const [j, type, b, a] = tr, k = clamp((t - (S[j].start - b)) / (a + b));
    const ca = offA.getContext('2d'), cb = offB.getContext('2d');
    ca.save(); S[j - 1].draw(ca, t); ca.restore(); cb.save(); S[j].draw(cb, t); cb.restore();
    if (type === 'wipe') coinWipe(ctx, offA, offB, k); else tileFlip(ctx, offA, offB, k);
  } else S[i].draw(ctx, t);
  ctx.restore();
  const hidden = !!S[i].hidden && !(tr && tr[1] === 'flip' && t < S[tr[0]].start);
  brandBug(ctx, ep.EP, hidden);
  const c = ep.captionAt(t);
  if (c) caption(ctx, c.text, seg(t, c.start, c.start + 0.15), {hidden});
}
if (mode === 'stills') {
  const ts = times.split(',').map(Number), cols = Math.min(6, ts.length), rows = Math.ceil(ts.length / cols), sw = 270, sh = 480;
  const sheet = createCanvas(cols * sw, rows * sh), sc = sheet.getContext('2d'); sc.fillStyle = '#000'; sc.fillRect(0, 0, sheet.width, sheet.height);
  ts.forEach((t, n) => { frame(t); sc.drawImage(main, (n % cols) * sw, Math.floor(n / cols) * sh, sw, sh); sc.fillStyle = '#ff0'; sc.font = '20px JBMono'; sc.fillText(t.toFixed(2), (n % cols) * sw + 6, Math.floor(n / cols) * sh + 22); });
  fs.writeFileSync(out, await sheet.encode('png')); console.log('wrote', out);
} else {
  const total = Math.ceil(ep.DURATION * FPS);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], {stdio: ['pipe', 'inherit', 'inherit']});
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    frame(f / FPS);
    const buf = main.data();
    if (!ff.stdin.write(Buffer.from(buf))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log(`frame ${f}/${total} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
