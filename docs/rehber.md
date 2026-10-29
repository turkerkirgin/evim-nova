# Evim Nova · Eğitim rehberi

**Türkçe** · [English](guide.md)

Bu rehber Evim Nova'yı sıfırdan kurmayı ve günlük kullanımı adım adım anlatır. Home Assistant'ı yeni kurduysan da takip edebilirsin; bilmen gereken tek şey Home Assistant'a tarayıcıdan girmek.

**İçindekiler**

1. [Kurmadan önce](#1-kurmadan-önce)
2. [Paneli yükle](#2-paneli-yükle)
3. [Panoyu oluştur](#3-panoyu-oluştur)
4. [Odalar ve fotoğraflar](#4-odalar-ve-fotoğraflar)
5. [Cihaz eklemek](#5-cihaz-eklemek)
6. [Kartları kullanmak](#6-kartları-kullanmak)
7. [Özelleştir: sırala, gizle, ekle](#7-özelleştir-sırala-gizle-ekle)
8. [Görünüm ve temalar](#8-görünüm-ve-temalar)
9. [Ana ekran](#9-ana-ekran)
10. [Kombi ve klima kartları](#10-kombi-ve-klima-kartları)
11. [Alarm](#11-alarm)
12. [Kamera ve yön ışıkları](#12-kamera-ve-yön-ışıkları)
13. [Senaryolar sayfası](#13-senaryolar-sayfası)
14. [Duvar tableti](#14-duvar-tableti)
15. [Telefonda](#15-telefonda)
16. [Haberler ve piyasalar](#16-haberler-ve-piyasalar)
17. [Ayarları yedekle ve taşı](#17-ayarları-yedekle-ve-taşı)
18. [Sık sorulanlar ve sorun giderme](#18-sık-sorulanlar-ve-sorun-giderme)

---

## 1. Kurmadan önce

- **Home Assistant 2024.4 veya daha yenisi.** Sürümünü **Ayarlar → Hakkında** sayfasında görürsün.
- **HACS** (önerilir). HACS, Home Assistant için topluluk mağazasıdır; kurulumu: [hacs.xyz](https://hacs.xyz/docs/use/). HACS olmadan da elle kurabilirsin.
- **Alanlar (odalar).** Evim Nova odaları Home Assistant'ın **alanlarından** alır. **Ayarlar → Alanlar, etiketler ve bölgeler** sayfasında Salon, Mutfak, Yatak Odası gibi alanların olduğundan emin ol.
- **Dosya erişimi.** Fotoğraf ve ses dosyalarını `/config/www/` klasörüne koyacaksın. En kolay yol **File Editor** ya da **Studio Code Server** eklentisi, ya da **Samba** ile bilgisayardan.

> `/config/www/` klasöründeki dosyalar tarayıcıda `/local/` adresiyle açılır. Yani `/config/www/images/rooms/salon.jpg` = `/local/images/rooms/salon.jpg`.

## 2. Paneli yükle

### HACS ile (önerilen)

1. Sol menüden **HACS**'ı aç.
2. Sağ üstteki **⋮** → **Özel depolar (Custom repositories)**.
3. **Depo** kutusuna `https://github.com/turkerkirgin/evim-nova` yaz, **Tür** olarak **Dashboard** seç, **Ekle**.
4. HACS'ın arama kutusuna **Evim Nova** yaz, aç, **İndir**.
5. HACS tarayıcıyı yenilemeni isterse yenile.

HACS dosyayı indirir ve panoya kaynak olarak kendisi ekler. Yeni sürüm çıkınca da haber verir.

### Elle

1. `evim-nova.js` dosyasını [son sürümden](https://github.com/turkerkirgin/evim-nova/releases/latest) (ya da depodaki `dist/` klasöründen) indir.
2. `/config/www/evim-nova/` klasörü oluştur ve dosyayı içine koy.
3. **Ayarlar → Panolar → ⋮ (sağ üst) → Kaynaklar → Kaynak ekle**.
   - URL: `/local/evim-nova/evim-nova.js`
   - Tür: **JavaScript modülü**
4. Tarayıcıyı yenile (Ctrl+F5).

> **Kaynaklar** menüsünü göremiyorsan profilinde **Gelişmiş mod**'u aç (sol altta adına tıkla → Gelişmiş mod).

## 3. Panoyu oluştur

Evim Nova bir pano kartı olarak çalışır ve bütün ekranı kaplar.

1. **Ayarlar → Panolar → Pano ekle → Sıfırdan yeni pano**.
2. Ad: `Evim Nova`, simge: `mdi:home-heart`. **Oluştur**.
3. Sol menüde yeni panoyu aç. Sağ üstteki ✏️ (düzenle) → **⋮** → **Ham yapılandırma düzenleyicisi**.
4. İçindekini sil ve [`examples/evim-nova-dashboard.yaml`](../examples/evim-nova-dashboard.yaml) dosyasının tamamını yapıştır.
5. **Kaydet**, sonra **Bitti**.

Örnek dosyada uydurma cihaz adları var (`climate.kombi`, `alarm_control_panel.ev_alarmi` …). İki seçeneğin var:

- **Hızlı başla:** `config:` altındaki her şeyi sil, yalnız `type: custom:evim-nova-card` kalsın. Panel odaları, hava durumunu, termostatı ve alarmı kendisi bulur. İlk açılışta kısa bir kurulum sihirbazı çıkar; sonra her şeyi panelin içinden ayarlarsın.
- **Ayrıntılı:** Varlık adlarını kendi cihazlarınla değiştir. Bir varlığın adını öğrenmek için **Ayarlar → Cihazlar ve hizmetler → Varlıklar** sayfasında arat; adı `light.salon_tavan` gibi görünür.

> Panelin içinden yaptığın ayarlar (Daha fazla → Panel ayarları) **kullanıcı başına** Home Assistant'ta saklanır. YAML'daki ayarlar herkes için başlangıç değeridir.

## 4. Odalar ve fotoğraflar

### Odalar

Her Home Assistant alanı bir oda olur. Odanın sayfasında, o alana atanmış bütün cihazlar kart olarak görünür.

- Oda **sırası** ve hangilerinin görüneceği: **Daha fazla → Panel ayarları → Odalar**.
- Oda **adı**: Home Assistant'taki alan adı; değiştirmek için **Ayarlar → Alanlar**.
- Bir cihazı başka odaya taşımak: cihazın sayfasında **alanını** değiştir.

### Fotoğraflar

Fotoğraflar paneli "senin evin" yapan şeydir. Panel her oda için sırayla şunlara bakar:

1. Panelde o oda için seçilen fotoğraf (oda başlığına **basılı tut** ya da **Panel ayarları → Sayfalar**).
2. Home Assistant'taki **alan resmi** (Ayarlar → Alanlar → alan → resim).
3. `/config/www/images/rooms/` klasöründe alanın adıyla bir dosya: `Yatak Odası` → `yatak-odasi.jpg` (`.jpeg`, `.png`, `.webp` de olur).
4. Hiçbiri yoksa sakin bir renk geçişi.

Ana ekranın fotoğrafı `home.jpg` ya da **Panel ayarları → Genel → Ana sayfa fotoğrafı**.

**İpuçları**
- Yatay, 1600–2400 piksel genişliğinde fotoğraflar en iyisidir.
- Akşam, ışıklar açıkken çekilmiş fotoğraflar cam kartlarla çok güzel durur.
- Hemen denemek istersen [`docs/ornek-odalar/`](ornek-odalar) içindeki örnek fotoğrafları kullan.

## 5. Cihaz eklemek

Evim Nova kendi başına cihaz eklemez; Home Assistant'a eklediğin her cihaz kendiliğinden panelde görünür.

1. Panelin üst çubuğunda **＋** düğmesine bas. Home Assistant'ın **Cihaz ekle** penceresi açılır (sol altta **← Evim** düğmesiyle panele dönersin).
2. Markayı seç ve cihazı ekle (ör. Tuya, Sonoff, Philips Hue, Zigbee…).
3. Eklerken **alan** sorulursa odayı seç. Sorulmazsa sonradan cihazın sayfasında alanını ayarla.
4. Panele dön: cihaz o odanın sayfasında kart olarak durur.

Alanı olmayan bir cihazı panele elle de koyabilirsin: **✏️ Özelleştir → Kart ekle → Cihazlar**.

## 6. Kartları kullanmak

| Hareket | Ne olur |
|---|---|
| **Dokun** | Aç/kapat (ışık, priz, anahtar), panjuru aç/kapat, sahneyi çalıştır |
| **Basılı tut** | Ayrıntı penceresi: parlaklık, renk, sıcaklık, geçmiş, ayarlar |
| **25 / 50 / 75 / 100** (ışık kartının altında) | Parlaklığı hemen ayarlar |
| **⋯** (pencerede) | Kart ayarları, Home Assistant'ta aç, cihazı aç, bu sayfada gizle |

Kartın dokunma ve basılı tutma davranışını kart türüne göre **Panel ayarları → Kart varsayılanları**'ndan, tek tek kartlar için pencerenin **⋯ → Kart ayarları**'ndan değiştirebilirsin.

## 7. Özelleştir: sırala, gizle, ekle

![Özelleştir modu](gorseller/duzenle_tr.png)

1. Üst çubukta **✏️ Özelleştir**'e bas (ya da sayfa başlığına basılı tut).
2. **Sürükle**: kartın yerini değiştir.
3. **×**: kartı gizle. Gizlenen kartlar soluk kalır, göz simgesine basınca geri gelir.
4. Sıranın sonundaki **Kart ekle**: cihaz, grup, grafik, hava durumu, takvim, şablon kartı…
5. Karta **dokun**: kart ayarları (ad, simge, görünürlük koşulu…).
6. **Bitti** ile çık.

**Izgara düzeninde** (bkz. 8. bölüm) kartın üstündeki **←** ile kartı başlığın altına, **→** ile sağa alırsın.

**Sahneler** ve **Kısayollar** kartlarında hangi düğmelerin görüneceğini kartın ayarlarındaki **İçerik** bölümünden seçersin (en fazla 5, sırasıyla).

## 8. Görünüm ve temalar

![Görünüm ayarları](gorseller/tema_tr.png)

**Daha fazla → Panel ayarları → Görünüm**

- **Oda düzeni**
  - *Yana kaydır*: kartlar ekranın altında yatay bir şeritte (bilgisayar için).
  - *2 sütun, aşağı*: başlık solda, kartlar sağda aşağı doğru (duvar tableti için).
  - Telefonda her zaman 2 sütundur.
- **Tema**: Buzlu cam, Işıma, Gece, Gün batımı, Orman, Neon, Buz.
- **Vurgu rengi**, **ışıma**, **kart renklenmesi**, **saydamlık**, **bulanıklık**, **köşe yuvarlaklığı**, **fotoğraf karartma**.

Değişiklikler kaydetmeden önce önizlenir. **Kaydet**'e basınca uygulanır.

## 9. Ana ekran

![Ana ekran](gorseller/ana_tr.png)

- **Selamlama ve tarih**, içerideki ortalama sıcaklık ve nem.
- **Durum düğmeleri**: açık ışık sayısı, açık kapı/pencere. Dokununca liste açılır.
- **Hızlı işlemler** (selamlamanın altındaki düğmeler): **Panel ayarları → Hızlı işlemler**. Bir script, sahne ya da "tüm ışıkları kapat"; istersen önce onay sorar.
- **Hava durumu**: dokununca saatlik ve günlük tahmin.
- **Kartlar**: kombi, klima, medya, sahneler, kısayollar, piyasalar… **Panel ayarları → Ana sayfa**'dan seçilir.
- Üst sağda: evdeki kişi sayısı, **alarm** durumu (dokun: kur/kapat), saat.

## 10. Kombi ve klima kartları

### Kombi (gerçek bir termostat)

Kombin Home Assistant'ta bir `climate` varlığıysa (Tuya, Netatmo, Ariston, Baxi… termostatlar), panoya ekle:

```yaml
kombi: { ad: Kombi, entity: climate.kombi, oda: koridor }
cards:
  climate.kombi: { hidden: true }   # odadaki düz termostat kartı yerine
```

Kart **ısıtıyor** (alev ve sıcak hava) ya da **hedefte** (pilot alevi) gösterir. Kombiler "şu an yakıyorum" bilgisi vermediği için kural şu: açık ve oda hedefin altındaysa ısıtıyor sayılır. **−/+** hedefi 0,5° değiştirir, sağdaki düğme aç/kapat, üstteki küçük düğme ön ayarlar arasında geçer.

### Klima (kızılötesi kumandalı)

IR klimalar durumlarını bildirmez. Bu yüzden:

1. IR kumandanla (Tuya IR, Broadlink…) üç sahne ya da script oluştur: **ısıt**, **soğut**, **kapat**.
2. `homeassistant/packages/evim_nova.yaml` paketindeki `input_select.klima_modu` yardımcısını ekle.
3. **IR klima modunu takip et** blueprint'iyle bir otomasyon oluştur: üç sahneyi ve yardımcıyı seç.
4. Panoya ekle:

```yaml
klima:
  ad: Klima
  oda: salon
  oda_adi: Salon
  mod: input_select.klima_modu
  sicaklik: sensor.salon_sicaklik
  isit: scene.klima_isit
  sogut: scene.klima_sogut
  kapat: scene.klima_kapat
```

Kart ısıtmada turuncu ve sıcak hava, soğutmada mavi ve kar taneleri gösterir.

> Klimayı Tuya uygulamasından ya da kumandadan açarsan Home Assistant bunu bilemez; kart son bildiği modda kalır.

## 11. Alarm

![Alarm ekranı](gorseller/alarm_tr.png)

Evim Nova'nın alarm ekranı Home Assistant'ın herhangi bir alarm paneliyle çalışır. Hazır kurulum için:

1. `homeassistant/packages/evim_nova.yaml` dosyasını `/config/packages/` klasörüne koy.
2. `secrets.yaml` dosyasına şifreni yaz: `evim_alarm_kodu: "1234"`.
3. `homeassistant/www/sesler/` klasörünü `/config/www/sesler/` olarak kopyala (siren, uyarı, kurulum sesleri).
4. Home Assistant'ı yeniden başlat. `alarm_control_panel.ev_alarmi` oluşur.
5. **Alarm: sensörle tetikle** blueprint'iyle bir otomasyon oluştur: kapı ve hareket sensörlerini seç.
6. İstersen **Alarm: bildirim ve ışıklar** blueprint'iyle telefon bildirimi ve yanıp sönen ışıklar ekle.
7. Panoda `home.alarm: alarm_control_panel.ev_alarmi` ve `alarm: { cikis: 120, giris: 35 }` olsun (süreler paketteki `arming_time` ve `delay_time` ile aynı).

**Kullanım**

- Üst sağdaki **kalkan** düğmesine dokun → **Dışarıda** (ya da Evde, Gece).
- **Kurulurken**: ekranda 2 dakikalık geri sayım ve "Evden çıkabilirsin". **Gizle** ile kapatabilirsin.
- **Giriş algılandı**: kapı açılınca 35 saniyelik geri sayım ve şifre tuşları. Şifreyi gir, **Kapat**.
- **ALARM**: ekran kırmızı yanıp söner, siren çalar. Şifreyle kapatılır.
- **Ses**: siren ve uyarı her cihazda ayrı açılıp kapanır (alarm penceresi → *Bu cihazda alarm sesi*). Telefonlarda varsayılan kapalıdır. **Sesi dene** ile kontrol et.
- **Deneme**: alarm panelini *Özel bypass* (`armed_custom_bypass`) moduna alıp tetiklersen 15 saniye çalar ve susar.

> Tarayıcılar sesi ancak bir dokunuştan sonra çalar. Duvar tabletinde ekrana bir kez dokunulması yeter. Fully Kiosk Browser kullanıyorsan **Web Content Settings → Autoplay Videos** açık olsun.

## 12. Kamera ve yön ışıkları

**Panel ayarları → Kamera** sekmesinde iki anahtar vardır (paketteki yardımcılar):

- **Kamera sistemi** (`input_boolean.kamera_sistemi`): kendi otomasyonlarında koşul olarak kullan (ör. kapalıyken Frigate'i ve kamera akışını durdur).
- **Kamera ışıkları** (`input_boolean.kamera_isiklari`): yön ışıklarını aç/kapat. Evde misafir varken kapat.

**Yön ışıkları (Frigate)**

1. [Frigate](https://frigate.video) kur ve MQTT ile Home Assistant'a bağla.
2. Kamerada **bölgeler** (zones) çiz: ör. `koridor`, `yatak_kapisi`, `mutfak_yolu`.
3. **Kamera yön ışığı (Frigate)** blueprint'iyle her yön için bir otomasyon oluştur: "koridor'dan yatak_kapisi'na geçince yatak odası tavanını yak" gibi. Saat aralığı ve "yalnız karanlıkta" seçenekleri var.

Durum satırında kamera ve kişi sayısı görünsün istersen panoya ekle:

```yaml
kamera:
  durum: { kamera: camera.koridor, kisi: sensor.koridor_person_count }
```

Kapı açılınca kameranın kendiliğinden açılması için: **Panel ayarları → Hareket ve kapı zili** → kamera, tetikleyiciler ve süre.

## 13. Senaryolar sayfası

![Senaryolar](gorseller/senaryolar_tr.png)

**Daha fazla → Senaryolar**: script'lerin renkli düğmeler olarak durur. Dokun: çalıştır, basılı tut: ayrıntı. Tehlikeli olanlara `confirm` ekle, önce onay sorulsun:

```yaml
scenarios:
  - { entity: script.evden_cikis, label: Evden Çıkış, sub: her şey kapanır, icon: mdi:home-export-outline, color: "#ff5c7a", confirm: "Emin misin?" }
```

Altta otomasyonlar listelenir; anahtarla açıp kapatabilirsin. Adı `Evim ·` ile başlayan otomasyonlar **Ev otomasyonları** bloğunda ayrı durur (`scenarioPrefix` ile değiştirilir).

## 14. Duvar tableti

![Izgara düzeni](gorseller/izgara_tr.png)

Önerilen kurulum (Android tablet):

1. Tablete **Home Assistant** uygulamasını kur ve giriş yap.
2. Uygulamada Evim Nova panosunu aç. **Görünüm → 2 sütun, aşağı** düzenini seç.
3. Tam ekran için: HACS'tan **kiosk-mode** kur ve panoya `kiosk_mode: { kiosk: true }` ekle. Evim Nova kartına `full_height: true` ver. Menüleri geçici açmak için: **Daha fazla → Menüleri göster**.
4. Android ayarlarında ekran zaman aşımını kısa (ör. 1 dk), ekran kilidini **Yok** yap.
5. **Duvar tableti ekranını aç** blueprint'iyle kapı açılınca ve alarmda ekran kendiliğinden yansın. Hareket sensörü ekranı açmaz, böylece şarj ve ekran ömrü korunur.
6. Samsung'da uygulamanın kapanmaması için: pil → **Kısıtlanmamış**, "Hiçbir zaman uyumayan uygulamalar"a ekle.

## 15. Telefonda

![Telefon](gorseller/telefon_ana_tr.png)

Telefonda kartlar iki sütundur. Altta **ana ekran**, **odalar**, **daha fazla** ve **arama** düğmeleri var. Odalar arasında sağa sola kaydırarak da geçebilirsin. Home Assistant uygulamasının Evim Nova ile açılması için: profilinde (sol altta adın) **Pano** olarak Evim Nova'yı seç.

## 16. Haberler ve piyasalar

İsteğe bağlı. `homeassistant/packages/evim_bilgi.yaml` dosyasını `/config/packages/` klasörüne koy ve yeniden başlat. Paket BBC Türkçe, Euronews ve BBC World haberlerini, Yahoo Finance'ten dolar, euro, sterlin, altın, BIST 100 ve Bitcoin'i 15 dakikada bir çeker (anahtar gerekmez). Panoda `piyasa:` ve `haberler:` bölümleri kartı ve sayfayı açar. Kendi RSS kaynağını eklemek için paketteki bir bloğu kopyalayıp adresini değiştir.

## 17. Ayarları yedekle ve taşı

**Panel ayarları → Genel → Ayar dosyası**
- **Dışa aktar**: bütün panel ayarların bir JSON dosyasına iner.
- **İçe aktar**: başka bir kullanıcıda ya da başka bir Home Assistant'ta aynı düzeni kurar.

Her kullanıcının ayarları ayrıdır: evdeki herkes paneli kendine göre düzenleyebilir.

## 18. Sık sorulanlar ve sorun giderme

**"Custom element doesn't exist: evim-nova-card" hatası**
Kaynak eklenmemiş ya da tarayıcı eski dosyayı tutuyor. HACS'tan indirdiğini ya da kaynağı eklediğini kontrol et, sonra **Ctrl+F5** ile yenile. Home Assistant uygulamasında: **Ayarlar → Companion app → Sorun giderme → Önbelleği temizle**.

**Panel çok küçük ya da kenarlarda boşluk var**
Görünüm türü **Panel (tek kart)** olmalı. Panoyu düzenle → görünümün kalemi → Görünüm türü.

**Bir cihaz panelde yok**
Cihazın bir alana atanmış olması gerekir. *Teşhis* ya da *yapılandırma* türündeki varlıklar (pil hariç) bilerek gösterilmez. Yine de istiyorsan **Özelleştir → Kart ekle**.

**Oda fotoğrafı görünmüyor**
Dosya adı alan adının küçük harfli, tireli hâli olmalı: `Çalışma Odası` → `calisma-odasi.jpg`. Dosyayı değiştirdiysen tarayıcıyı yenile (panel saatlik önbellek kullanır).

**Alarm sesi çalmıyor**
Ekrana bir kez dokun (tarayıcı kuralı). Alarm penceresinde *Bu cihazda alarm sesi* açık mı bak. Ses dosyaları `/config/www/sesler/` içinde mi kontrol et (`/local/sesler/siren.wav` adresi tarayıcıda açılmalı).

**Dil yanlış**
Panel dili Home Assistant profilinden alır. Değiştirmek için **Panel ayarları → Genel → Dil** ya da panoda `language: tr`.

**Klima kartı yanlış modu gösteriyor**
Klima Home Assistant dışından (kumanda, Tuya uygulaması) çalıştırıldıysa bilinemez. Karttan bir kez doğru modu seç.

Başka bir sorun mu var? [GitHub'da konu (issue) aç](https://github.com/turkerkirgin/evim-nova/issues): Home Assistant sürümünü, tarayıcını ve tarayıcı konsolundaki (F12) kırmızı satırları yaz.
