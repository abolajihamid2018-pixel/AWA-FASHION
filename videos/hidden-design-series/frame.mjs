// Render single frames of a layer list for quick design checks: node frame.mjs <skill> <module.mjs> <out.png> [t]
import path from 'node:path'; import fs from 'node:fs'; import {pathToFileURL} from 'node:url';
import {initFonts} from './lib.mjs';
const [skill, mod, out, tt] = process.argv.slice(2);
initFonts(skill);
const {painter} = await import(pathToFileURL(path.join(skill, 'scripts/autopilot-render.mjs')));
const {layers} = await import(pathToFileURL(path.resolve(mod)));
const p = {style: 'B3', width: 1080, height: 1560, fps: 30, base: process.cwd(), shots: [{start: 0, end: 10, layers}], captions: [], television: {enabled: false}};
const f = (await painter(p))(Number(tt ?? 2));
fs.writeFileSync(out, await f.encode('png'));
