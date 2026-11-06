# Hidden Design: series pipeline and upload copy

Faceless vertical Shorts explaining why everyday objects are designed the way they are.
They are made with [kaomei/stickman-video-director](https://github.com/kaomei/stickman-video-director)
in Autopilot mode, style **B3 · Retro TV**. EP.01 (pen cap) lives in `../hidden-design-ep01-pen-cap-hole/`.

| EP | Folder | Length | Hook |
|---|---|---|---|
| 01 | `hidden-design-ep01-pen-cap-hole` | 30.6 s | Why does your pen cap have a hole? |
| 02 | `hidden-design-ep02-padlock-hole` | 26.2 s | Flip a padlock over. See that tiny hole? |
| 03 | `hidden-design-ep03-airplane-window-hole` | 26.4 s | Look at a plane window. See the tiny hole? |
| 04 | `hidden-design-ep04-fuel-gauge-arrow` | 23.5 s | See this little arrow on your fuel gauge? |

All episodes are 1080×1920 H.264/AAC at about −15 LUFS, with burned-in single-line captions placed above the Shorts/TikTok UI.
Each folder also has an `.srt` captions file.

Suggested posting order: **04 → 01 → 03 → 02**. Start with the most relatable hook (every driver has seen the fuel gauge).

## Upload copy

### EP.02 Padlock hole
- **Title:** Why do padlocks have a hole in the bottom? 🔒 #shorts
- **Description:** That tiny hole under a padlock isn't a keyhole. It's a drain. Rainwater that gets inside can run
  out instead of rusting the parts or freezing solid, and it can also help you oil the lock.
  Follow for more hidden designs. #hiddendesign #didyouknow #design #padlock #facts #lifehacks #shorts
- **Pinned comment:** Did you know this one? What object should we explain next? 👇

### EP.03 Airplane window hole
- **Title:** Why is there a tiny hole in airplane windows? ✈️ #shorts
- **Description:** Plane windows have three panes. The tiny "breather hole" in the middle pane balances the pressure,
  so the outer pane carries the load and the middle pane stays as a backup. It also lets moisture escape, so the window doesn't fog up.
  #hiddendesign #aviation #didyouknow #design #airplane #travel #facts #shorts
- **Pinned comment:** Window seat or aisle? 👇

### EP.04 Fuel gauge arrow
- **Title:** The fuel gauge arrow most drivers never notice ⛽ #shorts
- **Description:** In most cars, the little arrow next to the fuel pump icon points to the side your fuel door is on.
  No more guessing at the pump in a rental car. Follow for more hidden designs.
  #hiddendesign #cars #carhacks #didyouknow #design #driving #facts #shorts
- **Pinned comment:** Be honest: did you know this? 👇

## Fact notes (check these before you publish)
- **Padlock:** many padlocks have a drain/weep hole that lets water out (preventing rust and freezing), and it can be used for lubrication. Not every padlock model has one.
- **Airplane window:** windows have an outer pane, a middle pane with a small breather hole, and an inner scratch pane. The hole equalizes pressure,
  so the outer pane bears the cabin-pressure load and the middle pane is a fail-safe. It also vents moisture to reduce fogging/frost.
- **Fuel gauge:** the arrow (or triangle) next to the pump icon shows the fuel-door side on most modern cars. The video says "in most cars" because it isn't universal.

## Rebuilding / making new episodes
From this folder, with the skill installed (`npm ci` in `skills/directing-stickman-videos`):

```bash
cd ../hidden-design-epNN-topic/source
python3 ../../hidden-design-series/tts.py /path/to/kokoro-models narration.wav af_heart   # Kokoro v1.0 onnx + voices
python3 ../../hidden-design-series/cues.py                                               # captions.json from real audio
node ../../hidden-design-series/make.mjs <skillDir> .                                     # project.json (CLEAN=1 disables TV finish for QA)
node <skillDir>/scripts/autopilot.mjs preview "$PWD/project.json" --seconds <duration> --replace
ffmpeg -i output/preview.mp4 -vf pad=1080:1920:0:40:color=0x111316 -af loudnorm=I=-14:TP=-1.5 ... final.mp4
```

- `lib.mjs` holds the shared vector library: series chrome, people, padlock, plane window, gauge, top-down car, rain, end card.
- An episode is `script.json` (one entry per sentence, with caption chunks) plus `episode.mjs` (one scene function per sentence;
  it receives the shot length and the caption start times, so animation lands on the spoken words).
- `make.mjs` turns each sentence into one shot, times everything from the actual narration, and rejects captions that would wrap.

Voice: Kokoro `af_heart` (Apache-2.0), the same voice in every episode. The skill's default (Gemini *Bodi*) needs a Gemini API key, which wasn't available.
