# Hidden Design — EP. 01: Why pen caps have a hole

A 30-second vertical Short (1080×1920, H.264/AAC, −14 LUFS) made with
[kaomei/stickman-video-director](https://github.com/kaomei/stickman-video-director)
in Autopilot mode, style **B3 · Retro TV**.

- `pen-cap-hole-short.mp4` — upload-ready for YouTube Shorts, TikTok and Reels
- `pen-cap-hole-short.srt` — caption sidecar (captions are also burned in)
- `source/` — everything needed to re-render or make the next episode

## The niche: "Hidden Design" (everyday objects designed on purpose)

Why this niche is a good bet:

- **Few direct competitors.** Faceless stickman channels mostly do psychology, dark history and what-ifs.
  "Why is X designed like that?" is popular as a topic (Reddit's r/DesignDesign, "you've been using it wrong"
  posts) but almost nobody runs it as a consistent animated-explainer channel.
- **Built for virality.** Every episode opens on an object the viewer owns and has never questioned.
  That gives an instant curiosity gap, high rewatch and share rates ("I didn't know that"), and strong comments.
- **An endless, evergreen supply of topics** that are cheap to produce: no faces, no licensed footage, original vector art.
- **Brand- and advertiser-safe**, and suits every age group.

### Next episode ideas (fact-check each one before scripting)
1. The hole in a padlock's bottom (drainage, so it doesn't rust or freeze)
2. The tiny hole in an airplane window
3. Why elevator "door close" buttons often don't do anything
4. The little arrow next to the fuel gauge
5. Why mirrors in public restrooms are slightly tilted / why stall doors have gaps
6. The pocket on your jeans' pocket (watch pocket)
7. Why shopping carts have a flip-down child seat with leg holes

## Upload copy

**Title:** Why does your pen cap have a hole? 🖊️ #shorts

**Description:**
That tiny hole in your pen cap isn't for the ink. It's there so you can still breathe if a cap is ever inhaled.
It's even part of a safety standard: ISO 11540.
Follow for more hidden designs in everyday objects.

#hiddendesign #didyouknow #design #facts #pen #lifehacks #animation #shorts

**Pinned comment:** What everyday object should we explain next? 👇

## Facts used
- Pen-cap holes let air pass if a cap is accidentally inhaled. Major manufacturers (e.g. BIC) state this.
- **ISO 11540** is the international standard for writing-instrument caps that reduce the risk of asphyxiation
  (it requires minimum airflow or a cap size that can't block the airway). Check the current edition's exact wording before you cite it in more detail.

## How it was made
1. `source/script.json` holds the narration (TTS text plus caption chunks).
2. `source/tts.py` produces the narration with **Kokoro** (open-source, Apache-2.0, voice `af_heart`). Each sentence is
   synthesized separately and joined with 0.32 s pauses. The recording is never sped up or slowed down.
3. `source/cues.py` times the captions to the real audio: sentence times are exact, and in-sentence splits snap to the quietest point.
4. `source/build.mjs` writes `project.json`: 15 shots of original vector art with timed local motion and procedural SFX.
5. To render, run `node scripts/autopilot.mjs preview project.json --seconds 30.549` from the skill's directory. Then
   run `ffmpeg … -vf pad=1080:1920:0:40 … -af loudnorm=I=-14:TP=-1.5`. The padding keeps the burned-in captions
   above the Shorts/TikTok UI.

Notes: the skill's default B3 voice is Google Gemini *Bodi*. No Gemini key was available, so Kokoro was used instead.
Caption splits inside a sentence come from energy-based snapping, not forced alignment.
