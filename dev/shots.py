"""Screenshots of the demo page (dev/demo.html) for the README and docs.

Needs Python with Playwright and Microsoft Edge (or `--chromium` for Playwright's own browser), plus the repo served
on http://127.0.0.1:8097 (python -m http.server 8097 in the repo root).
  python dev/shots.py            all shots into docs/gorseller/
  python dev/shots.py salon_tr   only the shots whose name contains "salon_tr"
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8097/dev/demo.html"
OUT = Path(__file__).resolve().parent.parent / "docs" / "gorseller"
DESKTOP, TABLET, PHONE = (1600, 900), (1280, 800), (390, 844)

# name, size, query, hash, extra wait (ms)
SHOTS = []
for lang in ("tr", "en"):
    SHOTS += [
        (f"ana_{lang}", DESKTOP, f"lang={lang}", "/", 0),
        (f"salon_{lang}", DESKTOP, f"lang={lang}", "/salon", 0),
        (f"izgara_{lang}", TABLET, f"lang={lang}&duzen=izgara", "/koridor", 0),
        (f"tema_{lang}", DESKTOP, f"lang={lang}&tab=gorunum", "/instellingen", 0),
        (f"kamera_{lang}", DESKTOP, f"lang={lang}&tab=kamera", "/instellingen", 0),
        (f"senaryolar_{lang}", DESKTOP, f"lang={lang}", "/senaryolar", 0),
        (f"alarm_{lang}", TABLET, f"lang={lang}&alarm=pending", "/", 0),
        (f"duzenle_{lang}", DESKTOP, f"lang={lang}&edit", "/salon", 600),
        (f"telefon_ana_{lang}", PHONE, f"lang={lang}", "/", 0),
        (f"telefon_salon_{lang}", PHONE, f"lang={lang}", "/salon", 0),
    ]
for tema in ("cam", "isima", "gece", "gunbatimi", "orman", "neon", "buz"):
    SHOTS.append((f"tema_{tema}", DESKTOP, f"lang=tr&tema={tema}", "/salon", 0))

only = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else ""
OUT.mkdir(parents=True, exist_ok=True)
with sync_playwright() as pw:
    browser = pw.chromium.launch(channel=None if "--chromium" in sys.argv else "msedge")
    for name, (w, h), query, route, wait in SHOTS:
        if only and only not in name:
            continue
        scale = 2 if w < 600 else 1
        page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=scale, is_mobile=w < 600, has_touch=w < 600)
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"{BASE}?shot&{query}#{route}")
        page.wait_for_function("() => window.panel && window.panel.shadowRoot && window.panel.shadowRoot.querySelector('.nav')", timeout=20000)
        page.wait_for_timeout(2600 + wait)   # photos, icons and the weather forecast
        page.screenshot(path=str(OUT / f"{name}.png"))
        print(name, f"{w}x{h}", "ERRORS: " + "; ".join(errors) if errors else "ok")
        page.close()
    browser.close()
