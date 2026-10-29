# Katkı / Contributing

Teşekkürler! / Thanks for helping!

## Geliştirme / Development

```bash
npm install
npm run watch                 # dist/evim-nova.js her değişiklikte yeniden derlenir / rebuilds on every change
python -m http.server 8097    # depo kökünde / in the repo root
# http://127.0.0.1:8097/dev/demo.html#/salon       uydurma demo ev / made-up demo home
# ?lang=en · ?tema=neon · ?duzen=izgara · ?alarm=pending · ?tab=gorunum (#/instellingen) · ?shot
npm run deploy:dev            # kendi Home Assistant'ında HACS kurulumunun yanında bir dev paneli / a dev panel next to the HACS install
```

- `dev/shots.py` README ekran görüntülerini, `video/render.py` tanıtım videosunu üretir (Python + Playwright + Edge, ffmpeg).
  `dev/shots.py` makes the README screenshots, `video/render.py` the promo video.
- `dev/index.html` HaCasa Nova'nın kendi demo evidir / is HaCasa Nova's original demo home.

## Kurallar / Rules

- Bir pull request = bir değişiklik / one change per pull request. `npm run build` çalıştır ve `dist/evim-nova.js` dosyasını da gönder (CI kontrol eder) / commit `dist/evim-nova.js` too (CI checks it).
- **Metinler / Text:** temel panelde `t()` (Felemenkçe anahtar, `src/lang/en.js` + `tr.js`); Evim modüllerinde `et()` (Türkçe anahtar, İngilizcesi `src/lang/evim_en.js`). `npm run i18n:check` ikisini de denetler.
  Base panel text goes through `t()` (Dutch key); Evim modules use `et()` (Turkish key, English in `src/lang/evim_en.js`). `npm run i18n:check` checks both.
- Kişisel veri yok: gerçek IP, jeton, konum, cihaz kimliği ya da ev fotoğrafı göndermeyin. / No personal data: no real IPs, tokens, locations, device ids or photos of your home.
- Görsel değişikliklere ekran görüntüsü ekleyin. / Add screenshots for visual changes.

## Çeviriler / Translations

Yeni dil: `src/lang/en.js` dosyasını `src/lang/<kod>.js` olarak kopyala, değerleri çevir, `src/i18n.js` içindeki `LANGS`'a bir satır ekle. Evim modülleri için `evim_en.js` gibi bir sözlük ekleyip `et()`'e bağla.
New language: copy `src/lang/en.js` to `src/lang/<code>.js`, translate the values and add a line to `LANGS` in `src/i18n.js`.

## Lisans / License

Katkın bu projenin [MIT lisansı](LICENSE) ile yayımlanır. / Contributions are released under the project's [MIT license](LICENSE).
