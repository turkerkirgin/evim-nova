# Changelog / Sürüm notları

## 1.0.0

İlk sürüm / First release. Based on [HaCasa Nova](https://github.com/damianeickhoff/HaCasa) 3.0.5 ([its changelog](https://github.com/damianeickhoff/HaCasa/blob/main/CHANGELOG.md)).

- **Türkçe arayüz / Turkish UI**; Evim modülleri Türkçe ve İngilizce / Evim modules in Turkish and English (`src/lang/evim_en.js`).
- **Alarm ekranı / Alarm screen**: tam ekran geri sayım, şifre tuşları, siren ve uyarı sesleri (cihaz başına ses) / full-screen countdown, keypad, siren and warning sounds (per-device sound).
- **Görünüm sekmesi / Appearance tab**: 7 tema, vurgu rengi, ışıma, saydamlık, bulanıklık; "2 sütun, aşağı" ızgara düzeni / 7 themes, accent colour, glow, transparency, blur; grid layout for wall tablets.
- **Kartlar / Cards**: animasyonlu kombi ve IR klima, piyasalar, kısayollar; sahneler/kısayollar kartının içeriği seçilebilir / animated boiler and IR air conditioner, markets, shortcuts; pick the buttons of the scenes/shortcuts cards.
- **Sayfalar / Pages**: Senaryolar, Kat planı, Harita, Haberler / Scenarios, Floor plan, Map, News.
- **Özelleştir ve ＋ Cihaz ekle / Customise and ＋ Add device** in the top bar; "← Evim" back button on Home Assistant pages.
- **Kamera sekmesi / Camera tab** with configurable switches.
- **Home Assistant**: alarm package, 5 blueprints, news/markets package, example dashboard.
- Element renamed to `evim-nova` (card `custom:evim-nova-card`); settings of an existing HaCasa Nova install are taken over once.
