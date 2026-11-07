"""Builds the CareRoute AI promo: clips -> transitions -> original music + SFX -> final MP4."""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

RAW = Path(sys.argv[1])
OUT = Path(sys.argv[2])
WORK = RAW / "work"
WORK.mkdir(exist_ok=True)
FPS = 30
T = 0.6  # transition length (s)
SR = 44100

# Per-segment playback speed (keeps the pace snappy without feeling rushed).
SPEED = {"patient-request": 1.12, "staff": 1.3, "patient-result": 1.0}
TRANSITIONS = ["circleopen", "slideleft", "smoothleft", "slideleft", "fadeblack"]


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def probe_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout
    return float(out.strip())


# ---------------------------------------------------------------- 1. clips
segments = json.loads((RAW / "segments.json").read_text())
clips = []
for seg in segments:
    name = seg["name"]
    speed = SPEED.get(name, 1.0)
    clip = WORK / f"{Path(seg['dir']).name}.mp4"
    vf = f"setpts=PTS/{speed},fps={FPS},scale=1920:1080:flags=lanczos,format=yuv420p"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(Path(seg["dir"]) / "list.txt"),
         "-vf", vf, "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-an", str(clip)])
    dur = probe_duration(clip)
    events = [{"type": e["type"], "t": e["t"] / speed} for e in seg["events"]]
    clips.append({"name": name, "path": clip, "dur": dur, "events": events})
    print(f"clip {name:16s} {dur:5.1f}s")

# ---------------------------------------------------------------- 2. transitions
offsets = [0.0]
for i in range(1, len(clips)):
    offsets.append(offsets[-1] + clips[i - 1]["dur"] - T)
total = offsets[-1] + clips[-1]["dur"]

inputs = []
for c in clips:
    inputs += ["-i", str(c["path"])]
chain, prev = [], "[0:v]"
for i in range(1, len(clips)):
    label = f"[v{i}]"
    chain.append(f"{prev}[{i}:v]xfade=transition={TRANSITIONS[(i - 1) % len(TRANSITIONS)]}:duration={T}:offset={offsets[i]:.3f}{label}")
    prev = label
video = WORK / "video.mp4"
run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(chain), "-map", prev,
     "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS), str(video)])
print(f"video {total:.1f}s")

# ---------------------------------------------------------------- 3. original music
rng = np.random.default_rng(7)
N = int((total + 0.5) * SR)
t_all = np.arange(N) / SR
BPM = 116
beat = 60 / BPM
bar = 4 * beat


def env_exp(n, decay):
    return np.exp(-np.arange(n) / SR / decay)


def add(buf, start_s, sig, gain=1.0):
    i = int(start_s * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def note_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for k in range(len(x)):
        acc = (1 - a) * x[k] + a * acc
        y[k] = acc
    return y


drums = np.zeros(N)
bass = np.zeros(N)
pad = np.zeros(N)
arp = np.zeros(N)

# Chord progression (C - G - Am - F), roots + triads in MIDI.
prog = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]

# Building blocks
kick_n = int(0.35 * SR)
kt = np.arange(kick_n) / SR
kick = np.sin(2 * np.pi * (45 * kt + (120 - 45) * 0.04 * (1 - np.exp(-kt / 0.04)))) * env_exp(kick_n, 0.12)
clap_n = int(0.18 * SR)
clap = np.diff(rng.standard_normal(clap_n + 1)) * env_exp(clap_n, 0.05) * 0.35
hat_n = int(0.05 * SR)
hat = np.diff(np.diff(rng.standard_normal(hat_n + 2))) * env_exp(hat_n, 0.012) * 0.12

intro_end = clips[0]["dur"] - T  # drums enter after the intro card
outro_start = offsets[-1]
sidechain = np.ones(N)
n_beats = int(total / beat) + 2
for b in range(n_beats):
    tb = b * beat
    in_body = intro_end - 0.05 <= tb < outro_start + 2.5
    if in_body:
        add(drums, tb, kick, 0.9)
        duck = 1 - 0.55 * env_exp(int(0.25 * SR), 0.09)
        i = int(tb * SR)
        j = min(N, i + len(duck))
        sidechain[i:j] = np.minimum(sidechain[i:j], duck[: j - i])
        if b % 4 in (1, 3):
            add(drums, tb, clap, 1.0)
        add(drums, tb + beat / 2, hat, 1.0)
        add(drums, tb + beat / 4 * 3, hat, 0.5)

for bi in range(int(total / bar) + 2):
    root, triad = prog[bi % 4]
    t0 = bi * bar
    # pad: detuned sines with slow attack
    pn = int(bar * SR)
    pt = np.arange(pn) / SR
    penv = np.minimum(1, pt / 0.6) * np.minimum(1, (bar - pt) / 0.4)
    sig = sum(np.sin(2 * np.pi * note_hz(m) * pt * d) for m in triad for d in (1.0, 1.003))
    add(pad, t0, sig * penv / 6, 0.22)
    if t0 >= intro_end - 0.1:
        # bass: 8th-note pulses, soft square-ish tone
        for k in range(8):
            bn = int(beat / 2 * SR)
            bt = np.arange(bn) / SR
            f = note_hz(root - 12 if k % 4 else root)
            tone = np.sin(2 * np.pi * f * bt) + 0.3 * np.sin(2 * np.pi * 2 * f * bt) + 0.15 * np.sin(2 * np.pi * 3 * f * bt)
            add(bass, t0 + k * beat / 2, tone * env_exp(bn, 0.11), 0.32)
        # arpeggio plucks on 16ths
        notes = triad + [triad[0] + 12]
        for k in range(16):
            an = int(0.22 * SR)
            at = np.arange(an) / SR
            f = note_hz(notes[[0, 1, 2, 3, 2, 1, 0, 2][k % 8]] + 12)
            pluck = (np.sin(2 * np.pi * f * at) + 0.4 * np.sin(2 * np.pi * 2 * f * at)) * env_exp(an, 0.07)
            add(arp, t0 + k * beat / 4, pluck, 0.07 if k % 2 else 0.1)

music = drums + (bass + pad + arp) * sidechain
# riser into the first drop
rn = int(intro_end * SR)
riser = lowpass(rng.standard_normal(rn), 2500) * np.linspace(0, 1, rn) ** 3 * 0.25
add(music, 0, riser)
music *= np.clip(np.minimum(t_all / 0.8, (total - t_all) / 2.5), 0, 1)  # fade in / out

# ---------------------------------------------------------------- 4. sound effects
sfx = np.zeros(N)


def whoosh(dur=0.7, bright=3500, gain=0.45):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    y = lowpass(x, bright) - lowpass(x, 300)
    e = np.sin(np.linspace(0, np.pi, n)) ** 2
    return y * e * gain


def blip(f0, f1, dur, gain):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = np.linspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, dur / 4) * gain


def chime(notes, gain=0.3):
    out = np.zeros(int(1.2 * SR))
    for k, m in enumerate(notes):
        n = int(1.0 * SR)
        tt = np.arange(n) / SR
        f = note_hz(m)
        s = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.01 * f * tt)) * env_exp(n, 0.35)
        i = int(k * 0.11 * SR)
        out[i:i + n] += s[: len(out) - i]
    return out * gain


for i, c in enumerate(clips):
    base = offsets[i]
    if i > 0:
        add(sfx, base - 0.15, whoosh())
    for e in c["events"]:
        at = base + e["t"]
        if e["type"] == "click":
            add(sfx, at, blip(2200, 1500, 0.035, 0.18))
        elif e["type"] == "caption":
            add(sfx, at + 0.05, blip(520, 980, 0.12, 0.12))
        elif e["type"] == "success":
            add(sfx, at, chime([76, 81, 88], 0.28))
        elif e["type"] == "ding":
            add(sfx, at, chime([84, 91], 0.25))
        elif e["type"] == "zoom":
            add(sfx, at, whoosh(0.9, 2200, 0.25))
add(sfx, offsets[-1] + 1.0, chime([72, 76, 79, 84], 0.3))  # outro sparkle

mix = music * 0.8 + sfx
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.4) * 0.89  # soft limiter
stereo = np.stack([mix, mix], axis=1)
# subtle stereo width on the arp/hats via tiny delay
d = int(0.012 * SR)
stereo[d:, 1] = 0.85 * stereo[d:, 1] + 0.15 * mix[:-d]
audio = WORK / "audio.wav"
with wave.open(str(audio), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())

# ---------------------------------------------------------------- 5. mux
run(["ffmpeg", "-y", "-i", str(video), "-i", str(audio), "-map", "0:v", "-map", "1:a",
     "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
     "-movflags", "+faststart", "-shortest", str(OUT)])
print(f"done -> {OUT} ({total:.1f}s)")
