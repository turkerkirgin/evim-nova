// Demo home for dev/demo.html: a made-up house with Evim Nova's own features (boiler, air conditioner, alarm, cameras,
// scenarios, markets). Names follow ?lang=tr|en (default tr). Nothing here comes from a real home.
// Room photos: docs/ornek-odalar/ (AI-generated examples, free to use).
const now = () => new Date().toISOString();
const ago = min => new Date(Date.now() - min * 60000).toISOString();
export const LANG = new URLSearchParams(location.search).get("lang") || "tr";
const L = (tr, en) => LANG === "tr" ? tr : en;

export const ROOMS = [   // area id, photo file
  ["salon", "salon"], ["mutfak", "mutfak"], ["yatak_odasi", "yatak-odasi"], ["oturma_odasi", "oturma-odasi"],
  ["koridor", "koridor"], ["banyo", "banyo"], ["bahce", "dis-mekan"],
];
const AREA_NAMES = { salon: L("Salon", "Living room"), mutfak: L("Mutfak", "Kitchen"), yatak_odasi: L("Yatak Odası", "Bedroom"),
  oturma_odasi: L("Çalışma Odası", "Study"), koridor: L("Koridor", "Hallway"), banyo: L("Banyo", "Bathroom"), bahce: L("Bahçe", "Garden") };
const PHOTO = f => `../docs/ornek-odalar/${f}.jpg`;

export function makeHass(onChange, { alarm = "disarmed" } = {}) {
  const areas = Object.fromEntries(ROOMS.map(([id]) => [id, { area_id: id, name: AREA_NAMES[id], picture: null, floor_id: null }]));
  const devices = {}, entities = {}, states = {};
  const add = (id, area, state, attributes = {}, { reg = {}, changed = ago(60) } = {}) => {
    entities[id] = { entity_id: id, area_id: area, device_id: null, ...reg };
    states[id] = { entity_id: id, state, attributes: { friendly_name: id.split(".")[1], ...attributes }, last_changed: changed, last_updated: changed };
  };
  const light = (id, area, tr, en, on, extra = {}) => add(`light.${id}`, area, on ? "on" : "off", { friendly_name: L(tr, en), supported_color_modes: ["brightness"], brightness: on ? 200 : undefined, ...extra }, { changed: ago(on ? 25 : 300) });

  // salon
  light("salon_tavan", "salon", "Tavan", "Ceiling", true);
  light("salon_led", "salon", "Ledler", "LED strip", true, { supported_color_modes: ["hs"], color_mode: "hs", hs_color: [32, 80] });
  light("salon_abajur", "salon", "Abajur", "Floor lamp", false);
  add("media_player.salon_tv", "salon", "playing", { friendly_name: L("Televizyon", "TV"), app_name: "YouTube", media_title: L("Doğa belgeseli", "Nature documentary"), volume_level: .25, entity_picture: PHOTO("dis-mekan") });
  add("cover.salon_panjur", "salon", "open", { friendly_name: L("Panjur", "Blind"), current_position: 100 });
  add("sensor.salon_sicaklik", "salon", "22.4", { friendly_name: L("Salon sıcaklık", "Living room temperature"), device_class: "temperature", unit_of_measurement: "°C" });
  add("sensor.salon_nem", "salon", "46", { friendly_name: L("Salon nem", "Living room humidity"), device_class: "humidity", unit_of_measurement: "%" });
  add("binary_sensor.salon_hareket", "salon", "on", { friendly_name: L("Salon hareket", "Living room motion"), device_class: "motion" }, { changed: ago(1) });
  add("binary_sensor.balkon_kapisi", "salon", "off", { friendly_name: L("Balkon kapısı", "Balcony door"), device_class: "door" }, { changed: ago(200) });
  // klima (IR): son mod bir input_select'te, düğmeler sahne çalıştırır
  add("input_select.klima_modu", null, L("Soğutma", "Cool"), { friendly_name: L("Klima modu", "AC mode"), options: L(["Kapalı", "Isıtma", "Soğutma"], ["Off", "Heat", "Cool"]) });
  for (const [k, tr, en] of [["klima_isit", "Klimayı ısıtmada aç", "AC heat"], ["klima_sogut", "Klimayı soğutmada aç", "AC cool"], ["klima_kapat", "Klimayı kapat", "AC off"]])
    add(`scene.${k}`, null, "unknown", { friendly_name: L(tr, en), icon: k.endsWith("isit") ? "mdi:fire" : k.endsWith("sogut") ? "mdi:snowflake" : "mdi:power" });

  // mutfak
  light("mutfak_tavan", "mutfak", "Tavan", "Ceiling", true);
  light("mutfak_tezgah", "mutfak", "Tezgah", "Counter", false);
  add("switch.kahve_makinesi", "mutfak", "off", { friendly_name: L("Kahve makinesi", "Coffee maker"), icon: "mdi:coffee-maker" });
  add("sensor.mutfak_sicaklik", "mutfak", "21.1", { friendly_name: L("Mutfak sıcaklık", "Kitchen temperature"), device_class: "temperature", unit_of_measurement: "°C" });
  add("sensor.mutfak_nem", "mutfak", "52", { friendly_name: L("Mutfak nem", "Kitchen humidity"), device_class: "humidity", unit_of_measurement: "%" });
  add("binary_sensor.su_kacagi", "mutfak", "off", { friendly_name: L("Su kaçağı", "Water leak"), device_class: "moisture" });
  add("cover.mutfak_panjur", "mutfak", "closed", { friendly_name: L("Panjur", "Blind"), current_position: 0 });

  // yatak odası
  light("yatak_tavan", "yatak_odasi", "Tavan", "Ceiling", false);
  light("gece_lambasi", "yatak_odasi", "Gece lambası", "Night light", true, { brightness: 60 });
  add("cover.yatak_panjur", "yatak_odasi", "open", { friendly_name: L("Panjur", "Blind"), current_position: 60 });
  add("sensor.yatak_sicaklik", "yatak_odasi", "20.6", { friendly_name: L("Yatak odası sıcaklık", "Bedroom temperature"), device_class: "temperature", unit_of_measurement: "°C" });
  add("binary_sensor.yatak_pencere", "yatak_odasi", "off", { friendly_name: L("Pencere", "Window"), device_class: "window" });

  // çalışma odası
  light("calisma_masa", "oturma_odasi", "Masa lambası", "Desk lamp", true);
  add("switch.bilgisayar", "oturma_odasi", "on", { friendly_name: L("Bilgisayar prizi", "PC plug"), icon: "mdi:desktop-tower-monitor" });
  add("sensor.calisma_sicaklik", "oturma_odasi", "22.9", { friendly_name: L("Çalışma odası sıcaklık", "Study temperature"), device_class: "temperature", unit_of_measurement: "°C" });

  // koridor: kombi + kapı + webcam
  light("koridor", "koridor", "Koridor ışığı", "Hall light", true);
  add("climate.kombi", "koridor", "heat", { friendly_name: L("Kombi", "Boiler"), temperature: 22, current_temperature: 20.9, hvac_modes: ["off", "heat"], preset_modes: ["auto", "eco", "manual"], preset_mode: "eco", min_temp: 5, max_temp: 30, target_temp_step: 0.5 });
  add("binary_sensor.giris_kapisi", "koridor", "off", { friendly_name: L("Giriş kapısı", "Front door"), device_class: "door" }, { changed: ago(42) });
  add("lock.giris_kilidi", "koridor", "locked", { friendly_name: L("Kapı kilidi", "Door lock") });
  add("camera.koridor", "koridor", "streaming", { friendly_name: L("Koridor kamerası", "Hallway camera"), entity_picture: PHOTO("koridor") });

  // banyo
  light("banyo", "banyo", "Ayna ışığı", "Mirror light", false);
  add("fan.banyo_fani", "banyo", "off", { friendly_name: L("Aspiratör", "Extractor fan"), percentage: 0 });
  add("sensor.banyo_nem", "banyo", "64", { friendly_name: L("Banyo nem", "Bathroom humidity"), device_class: "humidity", unit_of_measurement: "%" });

  // bahçe
  light("bahce_aydinlatma", "bahce", "Bahçe aydınlatma", "Garden lights", true);
  add("switch.sulama", "bahce", "off", { friendly_name: L("Sulama", "Irrigation"), icon: "mdi:sprinkler-variant" });
  add("camera.bahce", "bahce", "streaming", { friendly_name: L("Bahçe kamerası", "Garden camera"), entity_picture: PHOTO("dis-mekan") });
  add("camera.giris", "bahce", "idle", { friendly_name: L("Giriş kamerası", "Entrance camera"), entity_picture: PHOTO("home") });

  // ev geneli
  for (const [p, st] of [["ayse", "home"], ["mert", "not_home"]]) add(`person.${p}`, null, st, { friendly_name: L(p === "ayse" ? "Ayşe" : "Mert", p === "ayse" ? "Alex" : "Sam") }, { changed: ago(st === "home" ? 300 : 90) });
  add("alarm_control_panel.ev_alarmi", null, alarm, { friendly_name: L("Ev Alarmı", "Home alarm"), code_format: "number", code_arm_required: false, changed_by: null }, { changed: ago(alarm === "disarmed" ? 600 : 0.25) });
  add("input_text.alarm_sebep", null, L("Giriş kapısı açıldı", "Front door opened"), { friendly_name: L("Alarm sebebi", "Alarm reason") });
  add("input_boolean.kamera_sistemi", null, "on", { friendly_name: L("Kamera sistemi", "Camera system") });
  add("input_boolean.kamera_isiklari", null, "on", { friendly_name: L("Kamera ışıkları", "Camera lights") });
  add("sensor.koridor_kisi_sayisi", null, "1", { friendly_name: L("Koridorda kişi", "People in hallway") });
  add("weather.ev", null, "partlycloudy", { friendly_name: L("Ev", "Home"), temperature: 18, humidity: 58, wind_speed: 12, wind_speed_unit: "km/h", attribution: L("Demo hava durumu", "Demo weather") });
  add("sun.sun", null, "below_horizon", { next_rising: new Date(Date.now() + 9 * 3600000).toISOString(), next_setting: new Date(Date.now() + 15 * 3600000).toISOString() });
  const scripts = [
    ["gunaydin", "Günaydın", "Good morning", "mdi:weather-sunset-up"], ["aksam", "Akşam Işığı", "Evening light", "mdi:lamp"],
    ["film", "Film Gecesi", "Movie night", "mdi:movie-open"], ["iyi_geceler", "İyi Geceler", "Good night", "mdi:weather-night"],
    ["eve_donus", "Hoş Geldin", "Welcome home", "mdi:home-import-outline"], ["evden_cikis", "Evden Çıkış", "Leaving home", "mdi:home-export-outline"],
    ["panjur_ac", "Panjurları Aç", "Open blinds", "mdi:window-shutter-open"], ["panjur_kapat", "Panjurları Kapat", "Close blinds", "mdi:window-shutter"],
    ["isiklari_kapat", "Tüm Işıkları Kapat", "All lights off", "mdi:lightbulb-group-off-outline"],
  ];
  for (const [id, tr, en, icon] of scripts) add(`script.evim_${id}`, null, "off", { friendly_name: L(tr, en), icon, last_triggered: ago(60 * 7) });
  for (const [id, tr, en] of [["tv", "TV aç", "TV on"], ["film_sahnesi", "Film", "Movie"], ["oku", "Okuma", "Reading"]])
    add(`scene.${id}`, "salon", "unknown", { friendly_name: L(tr, en), icon: id === "tv" ? "mdi:television" : id === "oku" ? "mdi:book-open-variant" : "mdi:movie-open-outline" });
  for (const [id, tr, en, on] of [["isiklar_gun_batimi", "Gün batımında ışıklar", "Lights at sunset", true], ["kapi_bildirimi", "Kapı açılınca bildir", "Notify on door open", true],
    ["kamera_isiklari", "Kamera yön ışıkları", "Camera direction lights", true], ["tablet_ekrani", "Tablet ekranını aç", "Wake wall tablet", true], ["sulama", "Sabah sulama", "Morning watering", false]])
    add(`automation.evim_${id}`, null, on ? "on" : "off", { friendly_name: "Evim · " + L(tr, en), last_triggered: ago(45) });
  // piyasalar (Yahoo Finance tarzı: değer + önceki kapanış)
  for (const [id, tr, en, v, prev] of [["dolar", "Dolar", "USD", 41.92, 41.80], ["euro", "Euro", "EUR", 48.71, 48.95], ["gram_altin", "Gram altın", "Gold (g)", 5480, 5402], ["bitcoin", "Bitcoin", "Bitcoin", 104250, 101900]])
    add(`sensor.piyasa_${id}`, null, String(v), { friendly_name: L(tr, en), chartPreviousClose: prev });
  add("update.evim_nova_update", null, "off", { friendly_name: "Evim Nova update", title: "Evim Nova", installed_version: "v1.0.0", latest_version: "v1.0.0", supported_features: 1 });

  const fc = (type) => { const out = [], t0 = new Date(); t0.setMinutes(0, 0, 0);
    const conds = ["partlycloudy", "sunny", "cloudy", "partlycloudy", "rainy", "sunny", "clear-night"];
    for (let i = 0; i < (type === "hourly" ? 12 : 6); i++) out.push(type === "hourly"
      ? { datetime: new Date(t0.getTime() + (i + 1) * 3600000).toISOString(), condition: conds[i % 7], temperature: 18 - Math.round(i / 3), precipitation_probability: i === 4 ? 40 : 0 }
      : { datetime: new Date(t0.getTime() + i * 86400000).toISOString(), condition: conds[(i + 1) % 7], temperature: 21 + (i % 3), templow: 12 + (i % 2), precipitation_probability: i === 3 ? 60 : 0 });
    return out; };

  const hass = {
    user: { id: "demo", name: L("Ayşe", "Alex"), is_admin: true },
    areas, devices, entities, states, floors: {}, language: LANG, locale: { language: LANG },
    connection: { subscribeMessage(cb, msg) { if (msg.type === "render_template") { setTimeout(() => cb({ result: "" }), 30); return Promise.resolve(() => {}); } setTimeout(() => cb({ notifications: {} }), 50); return () => {}; } },
    callService(domain, service, data) {
      for (const id of [].concat(data.entity_id || [])) {
        const s = states[id]; if (!s) continue;
        const set = (st, attrs = {}) => { states[id] = { ...s, state: st, attributes: { ...s.attributes, ...attrs }, last_changed: now() }; };
        if (service === "toggle") set(s.state === "on" ? "off" : "on");
        if (service === "turn_on" && domain === "scene" && id.startsWith("scene.klima_")) states["input_select.klima_modu"] = { ...states["input_select.klima_modu"], state: { klima_isit: L("Isıtma", "Heat"), klima_sogut: L("Soğutma", "Cool"), klima_kapat: L("Kapalı", "Off") }[id.slice(6)] };
        else if (service === "turn_on") set("on");
        if (service === "turn_off") set("off");
        if (service === "open_cover") set("open", { current_position: 100 });
        if (service === "close_cover") set("closed", { current_position: 0 });
        if (service === "set_temperature") set(s.state, { temperature: data.temperature });
        if (service === "set_hvac_mode") set(data.hvac_mode);
        if (service === "set_preset_mode") set(s.state, { preset_mode: data.preset_mode });
        if (service.startsWith("alarm_")) set({ alarm_disarm: "disarmed", alarm_arm_home: "armed_home", alarm_arm_away: "arming", alarm_arm_night: "armed_night" }[service] || s.state);
      }
      hass.states = { ...states }; onChange(hass); return Promise.resolve();
    },
    callWS(msg) {
      if (msg.type === "call_service" && msg.domain === "weather") return Promise.resolve({ response: { [msg.target.entity_id]: { forecast: fc(msg.service_data.type) } } });
      if (msg.type === "history/history_during_period" && msg.entity_ids[0].startsWith("sensor.")) { const t = Date.now(), hrs = (t - Date.parse(msg.start_time)) / 3600000, id = msg.entity_ids[0], base = parseFloat(hass.states[id]?.state) || 20;
        return Promise.resolve({ [id]: Array.from({ length: Math.round(hrs * 4) + 1 }, (_, i) => { const h = i / 4 - hrs; return { s: String(base + Math.sin((h + 9) / 3.8) * 1.2 - .3), lu: (t + h * 3600000) / 1000 }; }) }); }
      if (msg.type === "history/history_during_period") { const t = Date.now(); return Promise.resolve({ [msg.entity_ids[0]]: [2, 5, 9].flatMap(h => [{ s: "on", lu: (t - h * 3600000) / 1000 }, { s: "off", lu: (t - h * 3600000 + 30 * 60000) / 1000 }]) }); }
      if (msg.type === "frontend/get_user_data") return Promise.resolve({ value: null });   // demo: always a fresh user, settings come from the card config
      if (msg.type === "frontend/set_user_data") return Promise.resolve({});
      return Promise.resolve({ response: {} });
    },
  };
  return hass;
}

/** the card config a user would put in the dashboard (same shape as examples/evim-nova-dashboard.yaml) */
export function demoConfig() {
  return {
    title: L("Evim", "Home"), language: LANG,
    rooms: ROOMS.map(([area, f]) => ({ area, name: AREA_NAMES[area], image: PHOTO(f) })),
    homeImage: PHOTO("home"), mediaIdleImage: PHOTO("salon"), idleMinutes: 0, hintSeen: true, setupDone: true,
    home: {
      weather: "weather.ev", climate: "climate.kombi", alarm: "alarm_control_panel.ev_alarmi",
      scenes: ["scene.klima_isit", "scene.klima_sogut", "scene.klima_kapat", "scene.tv"],
      shortcuts: ["script.evim_panjur_ac", "script.evim_panjur_kapat", "script.evim_isiklari_kapat"],
      quick: [
        { type: "script", entity: "script.evim_gunaydin", label: L("Günaydın", "Morning"), icon: "mdi:weather-sunset-up" },
        { type: "script", entity: "script.evim_film", label: L("Film", "Movie"), icon: "mdi:movie-open-outline" },
        { type: "script", entity: "script.evim_iyi_geceler", label: L("İyi geceler", "Good night"), icon: "mdi:weather-night" },
        { type: "script", entity: "script.evim_evden_cikis", label: L("Çıkış", "Leave"), icon: "mdi:home-export-outline", confirm: true },
      ],
    },
    noPresets: true,
    cards: { "climate.kombi": { hidden: true } },   // the room shows the animated boiler card (kombi) instead of the plain thermostat
    graphs: [{ id: "mutfak-sicaklik", room: "mutfak", entity: "sensor.mutfak_sicaklik", name: L("Sıcaklık", "Temperature"), hours: 24 }],
    scenarios: [
      ["gunaydin", "panjurlar açılır, karanlıksa ışıklar yanar", "blinds open, lights on if dark", "#f6b73c"],
      ["aksam", "ledler ve sıcak abajur", "LED strip and a warm lamp", "#ff8a50"],
      ["film", "tavan kapanır, panjur iner, TV açılır", "ceiling off, blinds down, TV on", "#a66bff"],
      ["iyi_geceler", "ışıklar kapanır, kombi ekoya", "lights off, boiler to eco", "#5b8cff"],
      ["eve_donus", "karanlıksa koridor ve salon yanar", "hall and living room on if dark", "#36d399"],
      ["evden_cikis", "ışıklar ve klima kapanır, alarm kurulur", "lights and AC off, alarm armed", "#ff5c7a"],
      ["panjur_ac", "bütün panjurlar", "all blinds", "#5ad8ff"],
      ["isiklari_kapat", "evdeki bütün ışıklar", "every light in the house", "#ffd166"],
    ].map(([id, tr, en, color]) => ({ entity: `script.evim_${id}`, label: hassName(`script.evim_${id}`), sub: L(tr, en), color, ...(id === "evden_cikis" ? { confirm: true } : {}) })),
    alarm: { cikis: 120, giris: 35, sebep: "input_text.alarm_sebep" },
    kombi: { ad: L("Kombi", "Boiler"), entity: "climate.kombi", oda: "koridor" },
    klima: { ad: L("Klima", "Air conditioner"), oda: "salon", oda_adi: AREA_NAMES.salon, mod: "input_select.klima_modu", sicaklik: "sensor.salon_sicaklik",
      isit: "scene.klima_isit", sogut: "scene.klima_sogut", kapat: "scene.klima_kapat" },
    piyasa: { kartta: 4, liste: [
      { e: "sensor.piyasa_dolar", ad: L("Dolar", "USD"), birim: "₺", ikon: "mdi:currency-usd", basamak: 2 },
      { e: "sensor.piyasa_euro", ad: L("Euro", "EUR"), birim: "₺", ikon: "mdi:currency-eur", basamak: 2 },
      { e: "sensor.piyasa_gram_altin", ad: L("Gram altın", "Gold (g)"), birim: "₺", ikon: "mdi:gold", basamak: 0 },
      { e: "sensor.piyasa_bitcoin", ad: "Bitcoin", birim: "$", ikon: "mdi:bitcoin", basamak: 0 },
    ] },
    kamera: { durum: { kamera: "camera.koridor", kisi: "sensor.koridor_kisi_sayisi" } },
    hidePages: ["energie", "haberler", "katplani", "harita"],
  };
}
const hassName = id => ({ gunaydin: L("Günaydın", "Good morning"), aksam: L("Akşam Işığı", "Evening light"), film: L("Film Gecesi", "Movie night"), iyi_geceler: L("İyi Geceler", "Good night"),
  eve_donus: L("Hoş Geldin", "Welcome home"), evden_cikis: L("Evden Çıkış", "Leaving home"), panjur_ac: L("Panjurları Aç", "Open blinds"), isiklari_kapat: L("Tüm Işıkları Kapat", "All lights off") })[id.slice("script.evim_".length)];
