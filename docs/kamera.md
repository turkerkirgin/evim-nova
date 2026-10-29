# Kamera sekmesi / Camera tab

**TR** — Evim Nova'nın **Panel ayarları → Kamera** sekmesi iki yardımcıyı açıp kapatır:

| Yardımcı | Ne işe yarar |
|---|---|
| `input_boolean.kamera_sistemi` | Kendi otomasyonlarında koşul (ör. kapalıyken Frigate ve kamera akışı dursun) |
| `input_boolean.kamera_isiklari` | [Kamera yön ışığı](../homeassistant/blueprints/automation/evim_nova/kamera_yon_isiklari.yaml) otomasyonlarının ana anahtarı |

İkisi de [`homeassistant/packages/evim_nova.yaml`](../homeassistant/packages/evim_nova.yaml) paketinde tanımlı. Başka anahtarlar göstermek için panoda:

```yaml
kamera:
  anahtarlar:
    - { e: input_boolean.misafir_modu, ad: Misafir modu, ikon: mdi:account-group }
  durum: { kamera: camera.koridor, kisi: sensor.koridor_person_count }
```

Ayrıntılı anlatım: [rehber → 12. Kamera ve yön ışıkları](rehber.md#12-kamera-ve-yön-ışıkları)

---

**EN** — **Panel settings → Camera** toggles two helpers: `input_boolean.kamera_sistemi` (a condition for your own automations, e.g. stop Frigate while it is off) and `input_boolean.kamera_isiklari` (master switch of the [camera direction light](../homeassistant/blueprints/automation/evim_nova/kamera_yon_isiklari.yaml) automations). Both come from [`homeassistant/packages/evim_nova.yaml`](../homeassistant/packages/evim_nova.yaml); list other switches under `kamera.anahtarlar` as shown above.

Full walkthrough: [guide → 12. Camera and direction lights](guide.md#12-camera-and-direction-lights)
