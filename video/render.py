"""Renders video/tanitim.html to MP4: seeks the CSS animations frame by frame in a headless browser, then encodes
the frames with ffmpeg and adds a small soundtrack synthesised here (no third-party audio).

Needs Python with Playwright, Microsoft Edge (or --chromium) and ffmpeg on PATH, and the repo served on
http://127.0.0.1:8097 (python -m http.server 8097 in the repo root).
  python video/render.py                 -> docs/evim-nova-tanitim-tr.mp4 and -en.mp4
  python video/render.py tr --fps 30
"""
import math, random, struct, subprocess, sys, tempfile, wave
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
URL = "http://127.0.0.1:8097/video/tanitim.html"
FPS = int(sys.argv[sys.argv.index("--fps") + 1]) if "--fps" in sys.argv else 30
LANGS = [a for a in sys.argv[1:] if a in ("tr", "en")] or ["tr", "en"]
CUTS = [1.6, 3.2, 5.0, 6.8, 8.4, 10.0, 11.8]          # scene changes (same as tanitim.html)
TICKS = [5.55, 5.75, 5.95, 6.15, 6.35, 6.55]          # theme cuts
SR = 44100


def soundtrack(path, dur):
    """soft pad (Am – F – C – G), a low thump and a whoosh on every cut, a tick on every theme cut, fade out at the end"""
    n = int(dur * SR)
    out = [0.0] * n
    chords = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (130.81, 196.0, 261.63), (196.0, 246.94, 293.66)]
    seg = dur / len(chords)
    for i in range(n):
        t = i / SR
        c = chords[min(int(t / seg), len(chords) - 1)]
        tc = t % seg
        env = min(1, tc / 0.6) * min(1, (seg - tc) / 0.4)
        out[i] += 0.07 * env * sum(math.sin(2 * math.pi * f * t) + 0.3 * math.sin(4 * math.pi * f * t) for f in c)
    rnd, lp = random.Random(7), 0.0
    for c in CUTS:
        s = int(c * SR)
        for j in range(int(0.45 * SR)):                       # thump: falling sine
            if s + j >= n: break
            tt = j / SR
            out[s + j] += 0.55 * math.exp(-tt * 9) * math.sin(2 * math.pi * (55 + 90 * math.exp(-tt * 30)) * tt)
        for j in range(int(-0.35 * SR), int(0.15 * SR)):     # whoosh: filtered noise swelling into the cut
            k = s + j
            if not 0 <= k < n: continue
            tt = j / SR
            env = math.exp(-((tt + 0.08) / 0.12) ** 2)
            lp += (rnd.uniform(-1, 1) - lp) * (0.05 + 0.25 * env)
            out[k] += 0.5 * env * lp
    for c in TICKS:
        s = int(c * SR)
        for j in range(int(0.05 * SR)):
            if s + j < n: out[s + j] += 0.25 * math.exp(-j / SR * 80) * math.sin(2 * math.pi * 2400 * j / SR)
    fade = int(0.8 * SR)
    for i in range(n - fade, n): out[i] *= (n - i) / fade
    peak = max(abs(x) for x in out) or 1
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(x / peak * 0.85 * 32767)) for x in out))


def render(lang, browser):
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    page.goto(f"{URL}?lang={lang}")
    page.evaluate("window.ready()")
    dur = page.evaluate("window.DURATION")
    with tempfile.TemporaryDirectory() as tmp:
        frames = int(dur * FPS)
        for f in range(frames):
            page.evaluate(f"window.seek({f / FPS})")
            page.screenshot(path=f"{tmp}/f{f:05d}.jpg", type="jpeg", quality=95)
            if f % 60 == 0: print(f"  {lang}: {f}/{frames}", flush=True)
        soundtrack(Path(tmp) / "ses.wav", dur)
        out = ROOT / "docs" / f"evim-nova-tanitim-{lang}.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", f"{tmp}/f%05d.jpg", "-i", f"{tmp}/ses.wav",
                        "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                        "-c:a", "aac", "-b:a", "128k", "-shortest", "-map_metadata", "-1", str(out)], check=True)
        print("  ->", out.relative_to(ROOT))
    page.close()


with sync_playwright() as pw:
    browser = pw.chromium.launch(channel=None if "--chromium" in sys.argv else "msedge")
    for lang in LANGS:
        render(lang, browser)
    browser.close()
