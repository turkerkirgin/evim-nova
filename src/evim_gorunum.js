// Evim yaması: Görünüm sekmesi (oda düzeni + temalar), tema motoru ve HA sayfalarından "← Evim" dönüş düğmesi.
import { html, nothing } from "lit";
import { navigate } from "./util.js";
import { et } from "./i18n.js";

/* ---------- temalar ----------
   Kartlar buzlu cam; tema, kartın rengini (vurgu karışımı), saydamlığı, bulanıklığı, köşe yuvarlaklığını ve
   aktif kartın "ışıma"sını (Windows'taki vurgu rengi / akrilik etkisi gibi) belirler. Fotoğraf karartması da ayarlanır. */
export const TEMALAR = {
  cam:     { ad: "Buzlu cam",  alt: "varsayılan, sade",            vurgu: "#f2b63a", renk: 0,  saydam: 10, isima: false, bulanik: 16, kose: 8,  karart: 0 },
  isima:   { ad: "Işıma",      alt: "vurgu rengiyle parlayan kartlar", vurgu: "#4cc2ff", renk: 18, saydam: 12, isima: true,  bulanik: 24, kose: 12, karart: 10 },
  gece:    { ad: "Gece",       alt: "koyu, sakin, göz yormaz",      vurgu: "#8ea8ff", renk: 8,  saydam: 6,  isima: true,  bulanik: 20, kose: 10, karart: 35, koyu: true },
  gunbatimi:{ ad: "Gün batımı", alt: "sıcak turuncu tonlar",         vurgu: "#ff8a50", renk: 22, saydam: 12, isima: true,  bulanik: 22, kose: 14, karart: 10 },
  orman:   { ad: "Orman",      alt: "yeşil, doğal",                 vurgu: "#36d399", renk: 20, saydam: 11, isima: true,  bulanik: 22, kose: 12, karart: 10 },
  neon:    { ad: "Neon",       alt: "mor-pembe, canlı ışıma",       vurgu: "#d16bff", renk: 26, saydam: 9,  isima: true,  bulanik: 26, kose: 16, karart: 25, koyu: true },
  buz:     { ad: "Buz",        alt: "açık, bembeyaz cam",           vurgu: "#9be7ff", renk: 6,  saydam: 24, isima: false, bulanik: 30, kose: 14, karart: 0 },
};
export const VURGULAR = ["#f2b63a", "#ff8a50", "#ff5c7a", "#d16bff", "#8ea8ff", "#4cc2ff", "#36d399", "#a3e635", "#ffffff"];

const hex2rgb = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ""); if (!m) return [242, 182, 58]; const n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
/** temanın son hali: hazır tema + kullanıcının üzerine yazdıkları */
export const temaCoz = c => { const t = c?.tema || {}; return { ...(TEMALAR[t.ad] || TEMALAR.cam), ...Object.fromEntries(Object.entries(t).filter(([k, v]) => k !== "ad" && v !== undefined && v !== null && v !== "")) }; };

/** tema değişkenlerini panelin kök öğesine yazar */
export function temaUygula(host, cfg) {
  const t = temaCoz(cfg), [r, g, b] = hex2rgb(t.vurgu), mix = Math.max(0, Math.min(60, +t.renk || 0)) / 100;
  const a = Math.max(2, Math.min(60, +t.saydam || 10)) / 100;
  // kart zemini: beyaz cam ile vurgu renginin karışımı (koyu temada siyaha yakın cam)
  const base = t.koyu ? [20, 22, 28] : [255, 255, 255];
  const mixc = base.map((v, i) => Math.round(v * (1 - mix) + [r, g, b][i] * mix));
  const s = host.style;
  s.setProperty("--accent", t.vurgu);
  s.setProperty("--ev-vurgu-rgb", `${r},${g},${b}`);
  s.setProperty("--card", `rgba(${mixc.join(",")},${t.koyu ? Math.min(.85, a * 4) : a})`);
  s.setProperty("--card-on", t.isima ? `rgba(${r},${g},${b},${Math.min(.6, a + .3)})` : `rgba(255,255,255,${Math.min(.6, a + .24)})`);
  s.setProperty("--line", t.isima ? `rgba(${r},${g},${b},.28)` : "rgba(255,255,255,.14)");
  s.setProperty("--line-on", t.isima ? `rgba(${r},${g},${b},.75)` : "rgba(255,255,255,.38)");
  s.setProperty("--r", `${+t.kose || 8}px`); s.setProperty("--r-sm", `${Math.max(4, (+t.kose || 8) - 2)}px`);
  s.setProperty("--ev-blur", `${+t.bulanik || 16}px`);
  s.setProperty("--ev-karart", String((+t.karart || 0) / 100));
  host.classList.toggle("ev-isima", !!t.isima);
}

/* ---------- "← Evim" düğmesi: Evim Nova'dan HA'nın kendi sayfasına (Ayarlar vb.) gidince ---------- */
const DONUS_ID = "evim-donus";
export function evimDonus(hedef) {
  if (document.getElementById(DONUS_ID)) return;
  const b = document.createElement("button");
  b.id = DONUS_ID; b.type = "button";
  b.innerHTML = `<ha-icon icon="mdi:home-heart"></ha-icon><span>${et("Evim")}</span>`;
  b.setAttribute("style", "position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom, 0px));z-index:9999;display:flex;align-items:center;gap:8px;"
    + "height:48px;padding:0 18px 0 14px;border:1px solid rgba(255,255,255,.25);border-radius:999px;background:rgba(22,24,29,.88);color:#fff;"
    + "font:600 15px 'Hanken Grotesk',Roboto,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);cursor:pointer");
  const kaldir = () => { b.remove(); window.removeEventListener("location-changed", kontrol); window.removeEventListener("popstate", kontrol); };
  const kontrol = () => { if (location.pathname.startsWith(hedef)) kaldir(); };
  b.addEventListener("click", () => { kaldir(); navigate(hedef); });
  window.addEventListener("location-changed", kontrol); window.addEventListener("popstate", kontrol);
  document.body.appendChild(b);
}

/* ---------- Görünüm sekmesi ---------- */
export function gorunumSekmesi(p, d, set, sec, field, pills) {
  const tm = d.tema || {}, cozulen = temaCoz(d);
  const setT = (k, v) => set("tema", { ...tm, [k]: v });
  const hazir = ad => set("tema", { ad });   // hazır tema seçilince özelleştirmeler sıfırlanır
  const kaydir = (k, min, max, birim = "") => html`<div class="evkay"><input type="range" min=${min} max=${max} .value=${String(cozulen[k] ?? 0)} @input=${e => setT(k, +e.target.value)}><b>${cozulen[k] ?? 0}${birim}</b></div>`;
  return html`
    ${sec(et("Oda düzeni"), et("odalardaki kartların dizilişi"), html`
      ${field(et("Düzen"), pills([{ v: "serit", l: et("Yana kaydır") }, { v: "izgara", l: et("2 sütun, aşağı") }], d.duzen, "serit", v => set("duzen", v)), et("telefonda her zaman 2 sütun"))}
      <div class="evduzen">
        <div class=${d.duzen !== "izgara" ? "on" : ""} @click=${() => set("duzen", undefined)}><i class="t"></i><i class="s"><b></b><b></b><b></b><b></b></i><span>${et("Yana kaydır")}</span></div>
        <div class=${d.duzen === "izgara" ? "on" : ""} @click=${() => set("duzen", "izgara")}><i class="t l"></i><i class="g"><b></b><b></b><b></b><b></b><b></b><b></b></i><span>${et("2 sütun, aşağı")}</span></div>
      </div>`)}
    ${sec(et("Tema"), et("kaydetmeden önizlenir"), html`
      <div class="evtema">${Object.entries(TEMALAR).map(([k, v]) => html`<button class=${(tm.ad || "cam") === k ? "on" : ""} @click=${() => hazir(k)}
          style="--v:${v.vurgu}"><i></i><span>${et(v.ad)}<small>${et(v.alt)}</small></span></button>`)}</div>
      ${field(et("Vurgu rengi"), html`<div class="evrenk">${VURGULAR.map(c => html`<button class=${cozulen.vurgu === c ? "on" : ""} style="background:${c}" @click=${() => setT("vurgu", c)}></button>`)}
        <input type="color" .value=${cozulen.vurgu} @input=${e => setT("vurgu", e.target.value)}></div>`, et("aktif kartlar, düğmeler, ışıma"))}
      ${field(et("Işıma"), pills([{ v: true, l: et("Açık") }, { v: false, l: et("Kapalı") }], cozulen.isima, null, v => setT("isima", v)), et("açık cihazların kartı vurgu rengiyle parlar"))}
      ${field(et("Kart renklenmesi"), kaydir("renk", 0, 60, "%"), et("kart zeminine karışan vurgu rengi"))}
      ${field(et("Saydamlık"), kaydir("saydam", 2, 40, "%"), et("düşük = daha şeffaf cam"))}
      ${field(et("Bulanıklık"), kaydir("bulanik", 0, 40, "px"), et("camın arkasındaki fotoğrafın bulanıklığı"))}
      ${field(et("Köşe yuvarlaklığı"), kaydir("kose", 0, 28, "px"), "")}
      ${field(et("Fotoğraf karartma"), kaydir("karart", 0, 70, "%"), et("yazıların okunurluğu için arka planı karartır"))}
      <div class="f"><span>${et("Sıfırla")}<small>${et("hazır temanın ayarlarına dön")}</small></span><button @click=${() => hazir(tm.ad || "cam")}>${et("Özelleştirmeleri sıfırla")}</button></div>`)}`;
}

export const gorunumStyles = `
  /* tema motoru */
  .card{backdrop-filter:blur(var(--ev-blur,16px)) saturate(1.2);-webkit-backdrop-filter:blur(var(--ev-blur,16px)) saturate(1.2)}
  .bg::before{content:"";position:absolute;inset:0;z-index:1;background:rgba(8,10,14,var(--ev-karart,0));pointer-events:none}
  :host(.ev-isima) .card.on{box-shadow:0 0 0 1px rgba(var(--ev-vurgu-rgb),.65) inset,0 0 26px -2px rgba(var(--ev-vurgu-rgb),.55),0 12px 30px rgba(0,0,0,.25)}
  :host(.ev-isima) .card.on .i ha-icon,:host(.ev-isima) .card.on .i .ico{color:rgb(var(--ev-vurgu-rgb));filter:drop-shadow(0 0 6px rgba(var(--ev-vurgu-rgb),.8))}
  :host(.ev-isima) .links a.active,:host(.ev-isima) .btabs a.active{box-shadow:0 0 14px -2px rgba(var(--ev-vurgu-rgb),.7)}
  :host(.ev-isima) .quick button:active,:host(.ev-isima) .quick button.on{background:rgba(var(--ev-vurgu-rgb),.45)}
  /* üst menü: sayfanın ortası yerine logo ile sağdaki düğmeler arasındaki boşluğun ortasına yerleşir ("Ana ekran" sekmesiyle taşmasın) */
  @media (min-width:901px){ .nav .links{position:static;transform:none;margin:0 auto;max-width:none;flex:0 1 auto;min-width:0} }
  /* başlık + hava bloğu: üst menünün hemen altından başlar; kısa ekranda kartlara çarpmayacak kadar yukarı çekilir (blok ≈ 370px) */
  @media (min-width:901px){
    .title{top:min(calc(86px + 7vh), calc(100% - 85px - var(--card-h) - 370px)) !important;bottom:auto;transform:none !important}
    :host(.izgara) .title{top:50% !important;bottom:auto;transform:translateY(-50%) !important}
  }
  /* ızgara düzeni (tablet/masaüstü): başlık solda, kartlar sağda 2 sütun aşağı akar */
  @media (min-width:901px){
    :host(.izgara) .title{right:auto;width:min(38vw,560px);top:50%}
    :host(.izgara) .title .aside,:host(.izgara) .title .wx{display:none}
    :host(.izgara) .strip{top:120px;bottom:24px;left:calc(var(--pad) + min(38vw,560px) + 32px);right:var(--pad);display:grid;grid-template-columns:1fr 1fr;
      grid-auto-rows:var(--card-h);align-content:start;gap:8px;overflow-x:hidden;overflow-y:auto;scrollbar-width:thin;padding:4px 6px 40px 4px;
      -webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 18px,#000 calc(100% - 36px),transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,#000 18px,#000 calc(100% - 36px),transparent 100%)}
    :host(.izgara) .strip > *{width:auto;min-width:0}
    :host(.izgara) .strip .card{width:auto}
    :host(.izgara) .sfade{display:none}
    :host(.izgara) .banner{left:var(--pad);right:auto}
  }
  /* Görünüm sekmesi */
  .evkay{display:flex;align-items:center;gap:12px} .evkay input{flex:1;accent-color:var(--accent)} .evkay b{min-width:48px;text-align:right;font-variant-numeric:tabular-nums}
  .evrenk{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .evrenk button{width:30px;height:30px;border-radius:50%;border:2px solid rgba(255,255,255,.25);cursor:pointer;padding:0}
  .evrenk button.on{border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.25),0 0 14px var(--accent)}
  .evrenk input[type=color]{width:38px;height:32px;border:0;background:none;padding:0;cursor:pointer}
  .evtema{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-bottom:10px}
  .evtema button{display:flex;align-items:center;gap:10px;text-align:left;padding:12px;border-radius:var(--r-sm);border:1px solid var(--line);background:rgba(255,255,255,.07);color:#fff;cursor:pointer;font:inherit;font-weight:700;font-size:14px}
  .evtema button i{flex:none;width:26px;height:26px;border-radius:50%;background:var(--v);box-shadow:0 0 14px var(--v)}
  .evtema button small{display:block;font-size:11px;font-weight:500;opacity:.75;margin-top:2px}
  .evtema button.on{background:rgba(255,255,255,.2);border-color:#fff}
  .evduzen{display:flex;gap:10px;margin:4px 0 8px}
  .evduzen > div{flex:1;max-width:220px;cursor:pointer;padding:10px;border-radius:var(--r-sm);border:1px solid var(--line);background:rgba(255,255,255,.06);display:grid;grid-template-columns:1fr 1fr;grid-template-rows:56px auto;gap:6px}
  .evduzen > div.on{border-color:#fff;background:rgba(255,255,255,.16)}
  .evduzen span{grid-column:1/-1;font-size:13px;font-weight:700;text-align:center}
  .evduzen i{display:block;border-radius:4px}
  .evduzen i.t{grid-column:1/-1;height:14px;width:55%;background:rgba(255,255,255,.55);align-self:center}
  .evduzen i.t.l{grid-column:1;grid-row:1;width:80%;height:16px}
  .evduzen i.s{grid-column:1/-1;display:flex;gap:4px;align-self:end} .evduzen i.s b{flex:1;height:18px;border-radius:3px;background:rgba(255,255,255,.35)}
  .evduzen i.g{grid-column:2;grid-row:1;display:grid;grid-template-columns:1fr 1fr;gap:3px} .evduzen i.g b{height:15px;border-radius:3px;background:rgba(255,255,255,.35)}
`;

/* ---------- "Cihaz ekle": HA'nın Cihazlar sayfasını açıp "Cihaz ekle" düğmesine kendisi basar (bulamazsa sayfa açık kalır) ---------- */
const derinBul = (kok, f) => { const yigin = [kok]; while (yigin.length) { const n = yigin.pop(); if (!n) continue; if (n.nodeType === 1 && f(n)) return n;
  if (n.shadowRoot) yigin.push(n.shadowRoot); for (const c of n.children || []) yigin.push(c); } return null; };
export function cihazEkle(donus) {
  evimDonus(donus); navigate("/config/devices/dashboard");
  let n = 0; const dene = () => {
    const fab = derinBul(document.body, el => (el.tagName === "HA-FAB" || (el.tagName === "HA-BUTTON" && el.getAttribute("slot") === "fab")) && /cihaz|device/i.test(el.label || el.getAttribute("label") || el.textContent || ""));
    if (fab) { fab.click(); return; }
    if (++n < 25) setTimeout(dene, 200);
  };
  setTimeout(dene, 300);
}

/* ---------- üst çubuk simgeleri + oda düzeninde sol alan ---------- */
export const evimDuzenStyles = `
  @media (min-width:901px){ .nav .logo{flex:none} }
  .evtus{display:inline-flex;align-items:center;gap:2px;height:46px;padding:3px}
  .evtus a{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:38px;min-width:38px;padding:0 10px;border-radius:999px;color:var(--fg-2);font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}
  .evtus a:hover{background:rgba(255,255,255,.12);color:#fff}
  .evtus a.on{background:rgba(255,255,255,.92);color:#16181d}
  .evtus a ha-icon{--mdc-icon-size:20px}
  @media (max-width:1439px){ .evtus a span{display:none} .evtus a{padding:0;width:34px;min-width:34px} .evtus{gap:0} }
  .ecard .x.ss{right:auto;left:14px;background:rgba(var(--ev-vurgu-rgb,242,182,58),.85);border-color:transparent;color:#16181d}
  .ogeler{display:flex;flex-direction:column;gap:6px;width:100%}
  .oge{display:grid;grid-template-columns:24px 1fr 32px 32px 32px;align-items:center;gap:8px;padding:6px 6px 6px 10px;border-radius:var(--r-sm);background:rgba(255,255,255,.08);border:1px solid var(--line)}
  .oge.fazla{opacity:.5} .oge > ha-icon{--mdc-icon-size:20px}
  .oge span{font-weight:600;font-size:14px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} .oge small{display:block;font-size:11px;font-weight:500;color:var(--fg-2)}
  .oge button{width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0} .oge button:disabled{opacity:.25;cursor:default}
  .oge button ha-icon{--mdc-icon-size:18px}
  .ogeaday{margin-top:8px;max-height:180px;overflow-y:auto} .ogeaday button{display:inline-flex;align-items:center;gap:4px} .ogeaday button ha-icon{--mdc-icon-size:14px}
  .evkam{display:inline-flex;align-items:center;gap:8px} .evkam ha-icon{--mdc-icon-size:20px}
  .evkamdurum{display:flex;align-items:center;gap:10px;margin:4px 0;color:var(--fg-2);font-size:14px;line-height:1.4} .evkamdurum ha-icon{--mdc-icon-size:22px;flex:none}
  .solgrid{display:none}
  .solbos{grid-column:1/-1;display:flex;align-items:center;gap:12px;padding:18px;border-radius:var(--r);border:2px dashed var(--line);color:var(--fg-2);font-size:14px;min-height:120px}
  .solbos ha-icon{--mdc-icon-size:28px;flex:none}
  @media (min-width:901px){
    :host(.izgara.baslik-ust) .title{top:calc(104px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px))) !important;transform:none !important}
    :host(.izgara) .solgrid{display:grid;position:absolute;left:var(--pad);width:min(38vw,560px);top:calc(286px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));bottom:24px;
      grid-template-columns:1fr 1fr;grid-auto-rows:var(--card-h);align-content:start;gap:8px;overflow-x:hidden;overflow-y:auto;scrollbar-width:thin;padding:4px 6px 40px 4px;z-index:2;
      -webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 18px,#000 calc(100% - 36px),transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,#000 18px,#000 calc(100% - 36px),transparent 100%)}
    :host(.izgara) .solgrid > *{width:auto;min-width:0} :host(.izgara) .solgrid .card{width:auto}
  }
  @media (max-width:900px){
    .evtus{height:46px} .evtus a span{display:none} .evtus a{padding:0;width:38px}
    .nav{grid-template-columns:minmax(0,1fr) max-content max-content max-content !important}
    .strip > .card.kombi,.strip > .card.klima,.strip > .card.piyasa,.strip > .ecard:has(> .card.kombi),.strip > .ecard:has(> .card.klima),.strip > .ecard:has(> .card.piyasa){grid-column:1/-1}
    .strip .card.kombi,.strip .card.klima{height:176px}
  }
`;

/* ---------- Kamera sekmesi (Panel ayarları): kamera sistemi ana anahtarı + yön ışıkları — HA yardımcılarını anında açar/kapatır.
   Varsayılan yardımcılar blueprints/ belgelerindeki adlarla; başka varlıklar için pano ayarında kamera.anahtarlar ve kamera.durum. ---------- */
const KAMERA_ANAHTARLARI = [
  { e: "input_boolean.kamera_sistemi", ad: "Kamera sistemi", alt: "Kapalıyken kamera otomasyonları çalışmaz (ör. kamera akışını ve Frigate'i durdurmak için kullan).", ikon: "mdi:cctv" },
  { e: "input_boolean.kamera_isiklari", ad: "Kamera ışıkları", alt: "Kameranın gördüğü yöne göre ışıkları yakar. Evde misafir varken kapat.", ikon: "mdi:lightbulb-auto-outline" },
];
export function kameraSekmesi(p, sec, field) {
  const st = p.hass.states, kc = p.config.kamera || {};
  const liste = (kc.anahtarlar || KAMERA_ANAHTARLARI).filter(x => st[x.e]);
  const sistemE = kc.sistem || liste[0]?.e, sistem = st[sistemE]?.state === "on";
  const anahtar = x => { const acik = st[x.e].state === "on", alan = x.e.split(".")[0];
    return field(html`<span class="evkam"><ha-icon icon=${x.ikon || "mdi:toggle-switch-outline"}></ha-icon>${et(x.ad || st[x.e].attributes.friendly_name || x.e)}</span>`, html`<div class="seg">
        <button class=${acik ? "on" : ""} @click=${() => p.call(alan, "turn_on", { entity_id: x.e })}>${et("Açık")}</button>
        <button class=${!acik ? "on" : ""} @click=${() => p.call(alan, "turn_off", { entity_id: x.e })}>${et("Kapalı")}</button></div>`, x.alt ? et(x.alt) : ""); };
  if (!liste.length) return sec(et("Kamera"), "", html`<p class="evkamdurum"><ha-icon icon="mdi:information-outline"></ha-icon>${et("Kamera anahtarı bulunamadı. input_boolean.kamera_sistemi ve input_boolean.kamera_isiklari yardımcılarını oluştur ya da pano ayarında kamera.anahtarlar listesini doldur (belgeler: docs/kamera.md).")}</p>`);
  const kam = kc.durum?.kamera && st[kc.durum.kamera], kisi = kc.durum?.kisi && st[kc.durum.kisi];
  return html`
    ${sec(et("Kamera"), et("dokununca hemen uygulanır (Kaydet gerekmez)"), html`${liste.map(anahtar)}`)}
    ${sec(et("Durum"), "", html`<p class="evkamdurum"><ha-icon icon=${sistem ? "mdi:check-circle-outline" : "mdi:power-sleep"}></ha-icon>${sistem
      ? et("Kamera çalışıyor.") + (kam ? " " + et("Kamera: {d}", { d: kam.state === "unavailable" ? et("başlıyor…") : et("hazır") }) : "") + (kisi ? " · " + et("görülen kişi: {n}", { n: kisi.state }) : "")
      : et("Kamera kapalı. Uzaktan açmak için HA uygulamasında bu sekmeyi aç ve 'Kamera sistemi'ni Açık yap.")}</p>`)}`;
}
