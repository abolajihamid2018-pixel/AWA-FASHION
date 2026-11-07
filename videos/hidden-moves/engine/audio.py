"""Hidden Moves sound kit: original procedural SFX + music bed, mixed under the narration.
Usage: python3 audio.py <episodeDir>  -> writes <episodeDir>/mix.wav"""
import json, sys, numpy as np, soundfile as sf
SR = 48000
rng = np.random.default_rng(7)
def env(n, a=0.002, d=0.15):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d); return e
def tone(f, dur, d=0.2, a=0.002, harm=((1, 1),)):
    n = int(dur * SR); t = np.arange(n) / SR
    f = np.broadcast_to(f, (n,)) if np.ndim(f) else np.full(n, f)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return sum(g * np.sin(ph * k) for k, g in harm) * env(n, a, d)
def noise(dur): return rng.standard_normal(int(dur * SR))
from scipy.signal import lfilter
def lp(x, a):  # one-pole low-pass, a in (0,1): higher = brighter
    return lfilter([a], [1, a - 1], x)
def bp(x, lo, hi): return lp(x, hi) - lp(x, lo)
def sweep_f(f0, f1, dur): n = int(dur * SR); return f0 * (f1 / f0) ** (np.arange(n) / n)
KIT = {}
def k(name):
    def deco(fn): KIT[name] = fn; return fn
    return deco
@k('tick')
def _(): return tone(2400, 0.05, d=0.012, harm=((1, 1), (2.7, 0.3))) * 0.5
@k('pop')
def _(): return tone(sweep_f(420, 900, 0.12), 0.12, d=0.05, harm=((1, 1), (2, 0.25)))
@k('step')
def _(): return lp(noise(0.08), 0.08) * env(int(0.08 * SR), 0.001, 0.02) * 2.2
@k('thunk')
def _():
    body = tone(sweep_f(150, 55, 0.35), 0.35, d=0.14, a=0.001, harm=((1, 1), (2, 0.3)))
    click = lp(noise(0.35), 0.25) * env(int(0.35 * SR), 0.0005, 0.02)
    return body * 1.2 + click * 0.7
@k('whoosh')
def _():
    n = int(0.45 * SR); t = np.arange(n) / n; x = noise(0.45)
    y = lp(x, 0.02) * 0.0 + bp(x, 0.01, 0.12)
    return y * np.sin(np.pi * t) ** 2 * 1.6
@k('sweep')
def _():
    n = int(0.9 * SR); t = np.arange(n) / n; x = bp(noise(0.9), 0.02, 0.2)
    return x * np.sin(np.pi * t) * 1.2 + tone(sweep_f(300, 600, 0.9), 0.9, d=0.6) * 0.12
@k('slide')
def _():
    n = int(0.7 * SR); t = np.arange(n) / n; x = bp(noise(0.7), 0.03, 0.09)
    grit = (rng.random(n) < 0.004) * rng.standard_normal(n) * 0.6
    return (x * 1.6 + lp(grit, 0.3)) * np.minimum(1, t * 8) * np.minimum(1, (1 - t) * 4)
@k('coin')
def _(): return tone(1975, 0.4, d=0.09, harm=((1, 1), (2.01, 0.2))) * 0.5 + np.pad(tone(2637, 0.36, d=0.14, harm=((1, 1),)), (int(0.04 * SR), 0)) [:int(0.4 * SR)] * 0.5
@k('ding')
def _(): return tone(1318.5, 0.9, d=0.35, harm=((1, 1), (2.76, 0.25), (5.4, 0.08))) * 0.6
@k('chime')
def _():
    out = np.zeros(int(0.9 * SR))
    for i, f in enumerate([1046.5, 1318.5, 1568]):
        s = tone(f, 0.9 - i * 0.07, d=0.3, harm=((1, 1), (2, 0.15))) * 0.35; o = int(i * 0.07 * SR); out[o:o + len(s)] += s
    return out
@k('whistle')
def _():
    n = int(0.55 * SR); t = np.arange(n) / SR
    f = 2600 + 120 * np.sin(2 * np.pi * 38 * t) * (t > 0.05)
    x = tone(f, 0.55, d=10, a=0.01) * np.minimum(1, (0.55 - t) * 18) + bp(noise(0.55), 0.2, 0.6) * 0.15
    return x * 0.45
@k('flip')
def _():
    out = np.zeros(int(0.6 * SR))
    for i in range(10):
        s = tone(1200 + rng.random() * 900, 0.05, d=0.012) * 0.35; o = int((0.03 + i * 0.05 + rng.random() * 0.01) * SR); out[o:o + len(s)] += s
    return out + bp(noise(0.6), 0.02, 0.15) * np.sin(np.linspace(0, np.pi, int(0.6 * SR))) * 0.5
@k('lock')
def _():
    c1 = tone(1800, 0.12, d=0.02, harm=((1, 1), (1.5, 0.5))) ; c2 = tone(900, 0.3, d=0.08, harm=((1, 1), (2.4, 0.4)))
    out = np.zeros(int(0.4 * SR)); out[:len(c1)] += c1 * 0.6; o = int(0.09 * SR); out[o:o + len(c2)] += c2 * 0.8; return out
@k('buzz')
def _():
    n = int(0.35 * SR); t = np.arange(n) / SR; x = np.sign(np.sin(2 * np.pi * 110 * t)) * 0.3 + np.sign(np.sin(2 * np.pi * 116 * t)) * 0.3
    return lp(x, 0.15) * env(n, 0.005, 0.2)
@k('stamp')
def _():
    body = tone(sweep_f(120, 50, 0.4), 0.4, d=0.12, a=0.0005) * 1.3
    slap = bp(noise(0.4), 0.05, 0.5) * env(int(0.4 * SR), 0.0003, 0.03) * 1.5
    return body + slap

def music(dur, bpm=96):
    """Original light bed: C–Am–F–G, marimba-like plucks, soft bass, offbeat shaker."""
    n = int(dur * SR); out = np.zeros(n + 3 * SR); beat = 60 / bpm
    chords = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]]
    mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
    pattern = [0, 2, 1, 3, 2, 1, 3, 1]
    t = 0.0; bar = 0
    while t < dur:
        ch = chords[(bar // 2) % 4]
        for i in range(8):  # eighth notes
            st = t + i * beat / 2
            if st >= dur: break
            note = ch[pattern[i]] + (12 if i in (3, 7) and bar % 2 else 0)
            s = tone(mtof(note), 0.5, d=0.12, a=0.003, harm=((1, 1), (4, 0.18), (10, 0.03))) * (0.16 if i % 2 == 0 else 0.11)
            o = int(st * SR); out[o:o + len(s)] += s
            if i % 2 == 1:
                h = bp(noise(0.06), 0.3, 0.8) * env(int(0.06 * SR), 0.001, 0.015) * 0.06; out[o:o + len(h)] += h
        for i in (0, 4):
            st = t + i * beat / 2; s = tone(mtof(ch[0] - 24), beat * 1.6, d=0.35, a=0.01, harm=((1, 1), (2, 0.35))) * 0.34
            o = int(st * SR); out[o:o + len(s)] += s
        t += 4 * beat; bar += 1
    return out[:n]

def main(ep):
    meta = json.load(open(f'{ep}/sfx.json')); D = meta['duration']; T = meta['T']; C = meta['C']
    n = int(D * SR)
    v, vsr = sf.read(f'{ep}/narration.wav'); assert vsr == 24000
    v = np.interp(np.arange(int(len(v) * SR / vsr)) / SR, np.arange(len(v)) / vsr, v)
    voice = np.zeros(n); o = int(0.15 * SR); voice[o:o + len(v)] = v[:n - o]
    fx = np.zeros(n)
    for e in meta['sfx']:
        s = KIT[e['kind']]() * e['gain']; o = int(e['t'] * SR)
        if o < n: fx[o:o + len(s)] += s[:n - o]
    m = music(D)
    # duck music under speech; silences for emphasis
    venv = np.sqrt(lp(voice ** 2, 0.0008)); venv /= venv.max() + 1e-9
    gain = 1 - 0.6 * np.clip(venv * 3, 0, 1)
    tt = np.arange(n) / SR
    for a, b in [(T['idea'] - 0.05, T['pipmove'] - 0.1), (C['stuck'][0] - 0.05, C['stuck'][0] + 0.7), (C['law'][0] + 0.6, C['law'][0] + 1.2)]:
        gain *= np.where((tt > a) & (tt < b), 0.05, 1)
    gain = lp(gain, 0.002)
    fade = np.minimum(1, tt / 0.4) * np.minimum(1, (D - tt) / 0.6)
    mix = voice * 1.0 + fx * 0.24 + m * gain * fade * 0.30
    mix /= max(1e-9, np.abs(mix).max()) / 0.9
    sf.write(f'{ep}/mix.wav', mix.astype(np.float32), SR)
    print('mix', D, 'peak ok')
main(sys.argv[1])
