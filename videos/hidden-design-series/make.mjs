// Usage: node make.mjs <skillDir> <episodeDir>
// Builds <episodeDir>/project.json: one shot per narrated sentence, timed from the real audio.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {initFonts} from './lib.mjs';

const [skill, epDir] = process.argv.slice(2).map(p => path.resolve(p));
const tw = initFonts(skill);
const {scenes, ep} = await import(pathToFileURL(path.join(epDir, 'episode.mjs')));
const LEAD = 0.15, TAIL = 0.35;
const voice = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(epDir, 'narration.wav')]).toString());
const END = +(voice + LEAD + TAIL).toFixed(6);
const sents = JSON.parse(fs.readFileSync(path.join(epDir, 'tools/sentences.json')));
const script = JSON.parse(fs.readFileSync(path.join(epDir, 'script.json')));
const cues = JSON.parse(fs.readFileSync(path.join(epDir, 'captions.json')));
if (scenes.length !== sents.length) throw new Error(`${scenes.length} scenes for ${sents.length} sentences`);
for (const c of cues) if (tw(c.text.toUpperCase(), 56, 600) > 1110) throw new Error(`caption too wide: ${c.text}`);

const starts = sents.map((s, i) => i ? +(s.start + LEAD - 0.01).toFixed(3) : 0);
const shots = [], sfx = [];
let ci = 0;
scenes.forEach((scene, i) => {
  const start = starts[i], end = i + 1 < starts.length ? starts[i + 1] : END, d = +(end - start).toFixed(3);
  const n = script[i].caps.length, mine = cues.slice(ci, ci + n); ci += n;
  const rel = mine.map(c => +Math.max(0, c.start - start).toFixed(3));
  const out = scene({d, cues: rel});
  // clamp any key/visibility beyond the shot (keeps validation strict without hand-tuning every number)
  const clampTree = (ls) => ls.forEach(l => {
    if (l.keys) { l.keys = l.keys.filter(k => k.t <= d - 0.001).reduce((acc, k) => { if (acc.length && k.t <= acc.at(-1).t) acc[acc.length - 1] = {...acc.at(-1), ...k, t: acc.at(-1).t}; else acc.push(k); return acc; }, []); if (!l.keys.length) delete l.keys; }
    if (l.from !== undefined && l.from > d) l.from = d - 0.01;
    if (l.to !== undefined && l.to > d) l.to = d;
    if (l.children) clampTree(l.children);
  });
  clampTree(out.layers);
  if (ep >= 5) out.layers.push(  // mask anything drawn outside the stage panel, then redraw its edge
    {type: 'rect', x: 0, y: 150, w: 70, h: 1330, radius: 0, fill: '#111316'}, {type: 'rect', x: 1210, y: 150, w: 70, h: 1330, radius: 0, fill: '#111316'},
    {type: 'rect', x: 70, y: 170, w: 1140, h: 1290, radius: 26, fill: 'none', stroke: '#262c33', lineWidth: 3});
  shots.push({start, end, layers: out.layers});
  for (const e of out.sfx || []) if (e.time < d) sfx.push({...e, time: +(start + e.time).toFixed(3)});
});
const project = {
  version: 1, style: 'B3', width: 1080, height: 1560, fps: 30,
  voice: {path: 'narration.wav', lead: LEAD, tail: TAIL}, captionSize: 56,
  television: {enabled: !process.env.CLEAN, intensity: 0.45},
  captions: cues.map((c, i, a) => i === a.length - 1 ? {...c, end: +(END - 0.05).toFixed(3)} : c),
  shots, sfx: sfx.sort((a, b) => a.time - b.time),
};
fs.writeFileSync(path.join(epDir, 'project.json'), JSON.stringify(project, null, 1));
console.log(`EP${ep}: ${shots.length} shots, ${sfx.length} sfx, ${END}s`);
