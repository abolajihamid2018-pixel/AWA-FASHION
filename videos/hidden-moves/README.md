# Hidden Moves — EP.01 "Why do rival gas stations end up next to each other?"

**Watch:** `ep01/hidden-moves-ep01.mp4`. It is 1080×1920 at 30 fps, 60.6 s long, H.264 with AAC audio at about −15 LUFS, and has burned-in captions.

Hidden Moves is an animated Shorts brand about everyday game theory. The research and brand bible are in `brand/hidden-moves-bible.html`.
This episode explains Hotelling's Law (H. Hotelling, "Stability in Competition", 1929) using the simple road model: drivers spread evenly along a road and each fills up at the nearest station.

## What's in the episode
| Time | Beat | What you see |
|---|---|---|
| 0–1 s | Interruption | A coral station falls from the sky and slams down next to its teal rival, with dust and camera shake, while "WHY ALWAYS NEXT TO EACH OTHER?" snaps in |
| 1–7 s | Hook and open loop | The camera pulls out to show every rival pair side by side (cafés, stations). Customers split, half a coin each, and Ref asks "½ EACH?" |
| 7–9 s | Pattern interrupt | Ref blows the whistle with "LET'S PLAY.", then a tile flip into the game board |
| 9–31 s | Escalation | One road and twelve drivers. Pip and Dot drop in, and a live share bar tracks customers. Pip has an "Ooh. Wait." moment, then move and counter-move until they're back to back |
| 31–35 s | Payoff setup | "STUCK." A ghost of Pip stepping away shows −9%, and a padlock appears |
| 35–39 s | Reveal | The board flips to the blueprint Hidden Layer, a 2×2 payoff matrix appears, and "HOTELLING'S LAW" stamps in with 1929 |
| 39–48 s | Twist | The end drivers' long trips. Stations move to the quarter marks: same 50/50 split, average drive ¼ mile → ⅛ mile |
| 48–57 s | Generalise | Real towns add other reasons, like a busy corner with live traffic. A magnet pulls pairs together, cafés slide in, and neutral podiums chase the middle |
| 57–60 s | Callback | The opening image returns, Pip and Dot glance at camera, and the HIDDEN MOVES tiles flip in with "EVERYTHING IS A GAME." |

## How it's built
- `engine/hm.mjs` is the reusable engine. Every component is a pure function of time.
  - Cast: `player` (Pip/Dot with six expressions, blinking, breathing, walking, pushing), `ref`, `pawn`.
  - Environments: `board`, `road`, `station`, `cafe`, `podium`, `car`.
  - Motion graphics: `shareBar`, `kinetic` headlines, `stamp`, `caption`, `dust`, `sparkle`, `coin`.
  - Transitions: `tileFlip`, `coinWipe`. Easing: `E.outBack` and others, plus `track` keyframes.
- `ep01/episode.mjs` is the episode. Scenes are timed from the real narration (`tools/sentences.json`, `captions.json`), and the game state (station positions, customer share) is one set of time tracks shared by every scene.
- `render.mjs` either renders contact sheets of stills (`stills`) or pipes raw frames to ffmpeg (`video`). A full render takes about 30 s.
- `engine/audio.py` generates original sound effects (whoosh, thunk, whistle, coins, stamp, lock, tile flips…) from the episode's cue list, plus an original music bed. The music ducks under the voice and drops out on "Ooh. Wait.", "Stuck." and the law stamp.
- The voice is Kokoro (open-source, Apache-2.0): `af_heart` narrates and `am_puck` voices Pip's line. `tts.py` and `cues.py` generate the voice track and caption timing.
- Fonts: Bricolage Grotesque, Figtree and JetBrains Mono, all under the SIL Open Font License, converted from @fontsource.

## Re-render
```bash
npm install
```
```bash
node render.mjs ep01 video ep01/picture.mp4
```
```bash
python3 engine/audio.py ep01
```
```bash
ffmpeg -i ep01/picture.mp4 -i ep01/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5 -shortest ep01/hidden-moves-ep01.mp4
```
To make a new episode, copy `ep01/`, write a new `script.json`, run `tts.py` and `cues.py` inside it, then write the scenes in `episode.mjs` using the engine components.
