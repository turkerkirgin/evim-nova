// Evim yaması: animasyonlu klima kartı (IR sahneleri + son modu tutan input_select) ve piyasalar kartı.
import { html, nothing } from "lit";
import { et, locale } from "./i18n.js";

// input_select seçenekleri Türkçe ya da İngilizce olabilir
const MODLAR = { "Isıtma": "isitma", "Soğutma": "sogutma", "Kapalı": "kapali", Heat: "isitma", Heating: "isitma", Cool: "sogutma", Cooling: "sogutma", Off: "kapali" };

/** Klima: IR ile çalıştığı için durumu `config.klima.mod` (input_select) tutar; düğmeler Tuya sahnelerini çalıştırır. */
export function klimaKart(p) {
  const k = p.config.klima || {}, st = p.hass.states;
  const modDurum = st[k.mod]?.state || "Kapalı", mod = MODLAR[modDurum] || MODLAR[modDurum[0]?.toUpperCase() + modDurum.slice(1)] || "kapali";
  const t = parseFloat(st[k.sicaklik]?.state);
  const calistir = (sahne, ev) => { ev.stopPropagation(); if (st[sahne]) p.call("scene", "turn_on", { entity_id: sahne }); };
  const dugme = (m, ad, ikon, sahne) => html`<button class=${mod === m ? "on" : ""} title=${ad} @click=${ev => calistir(sahne, ev)}><ha-icon icon=${ikon}></ha-icon><span>${ad}</span></button>`;
  const akis = mod === "isitma" ? html`<b></b><b></b><b></b><b></b>`
    : mod === "sogutma" ? html`${[0, 1, 2, 3, 4, 5].map(i => html`<ha-icon icon="mdi:snowflake" style="--i:${i}"></ha-icon>`)}` : nothing;
  return html`<div class=${`card klima m-${mod}`} @contextmenu=${ev => { ev.preventDefault(); p.moreInfo(k.mod); }}>
    <div class="kl-cihaz"><i class="kl-izgara"></i><i class="kl-led"></i></div>
    <div class="kl-akis">${akis}</div>
    <div class="kl-ust"><span class="kl-durum">${mod === "isitma" ? et("Isıtıyor") : mod === "sogutma" ? et("Soğutuyor") : et("Kapalı")}</span></div>
    <div class="kl-ad">${k.ad || et("Klima")}</div>
    <div class="kl-alt">${Number.isFinite(t) ? html`${et("İçeride")} <b>${t.toFixed(1)}°</b>` : ""}${k.oda_adi ? html` · ${k.oda_adi}` : nothing}</div>
    <div class="kl-dugmeler">${dugme("isitma", et("Isıt"), "mdi:fire", k.isit)}${dugme("sogutma", et("Soğut"), "mdi:snowflake", k.sogut)}${dugme("kapali", et("Kapat"), "mdi:power", k.kapat)}</div>
  </div>`;
}

/** Kombi: gerçek iklim varlığı. Kombi "ısıtıyor" bilgisi vermediği için: açık + anlık < hedef ⇒ ısıtıyor (alev), değilse hedefte (pilot alevi). */
const ONAYAR = { auto: "Otomatik", eco: "Eko", manual: "Manuel", comfort: "Konfor", away: "Dışarıda", home: "Evde", sleep: "Uyku" };
export function kombiKart(p) {
  const k = p.config.kombi || {}, s = p.hass.states[k.entity]; if (!s) return nothing;
  const a = s.attributes, acik = s.state !== "off" && s.state !== "unavailable", hedef = +a.temperature, simdi = +a.current_temperature;
  const isitiyor = acik && Number.isFinite(hedef) && Number.isFinite(simdi) && simdi < hedef - 0.2;
  const mod = !acik ? "kapali" : isitiyor ? "isitiyor" : "hedefte";
  const dur = ev => ev.stopPropagation();
  const ayarla = d => ev => { dur(ev); const v = Math.round(Math.min(a.max_temp ?? 35, Math.max(a.min_temp ?? 5, (Number.isFinite(hedef) ? hedef : 20) + d)) * 2) / 2;
    p.call("climate", "set_temperature", { entity_id: k.entity, temperature: v }); };
  const guc = ev => { dur(ev); p.call("climate", "set_hvac_mode", { entity_id: k.entity, hvac_mode: acik ? "off" : (a.hvac_modes || []).find(m => m !== "off") || "heat" }); };
  const presetler = a.preset_modes || [], pr = a.preset_mode;
  const sonraki = ev => { dur(ev); if (!presetler.length) return; const i = presetler.indexOf(pr); p.call("climate", "set_preset_mode", { entity_id: k.entity, preset_mode: presetler[(i + 1) % presetler.length] }); };
  return html`<div class=${`card kombi k-${mod}`} @contextmenu=${ev => { ev.preventDefault(); p.moreInfo(k.entity); }}>
    <div class="kb-cihaz"><i class="kb-ekran">${Number.isFinite(hedef) ? hedef.toFixed(1) : "–"}</i><i class="kb-pencere">${mod === "kapali" ? nothing : html`<b class="a1"></b><b class="a2"></b><b class="a3"></b>`}</i></div>
    <div class="kb-akis">${mod === "isitiyor" ? html`<b></b><b></b><b></b>` : nothing}</div>
    <div class="kl-ust"><span class="kl-durum">${mod === "isitiyor" ? et("Isıtıyor") : mod === "hedefte" ? et("Hedefte") : et("Kapalı")}</span>
      ${presetler.length ? html`<button class="kb-onayar" @click=${sonraki}>${ONAYAR[pr] ? et(ONAYAR[pr]) : pr || "—"}</button>` : nothing}</div>
    <div class="kl-ad">${k.ad || et("Kombi")}</div>
    <div class="kl-alt">${Number.isFinite(simdi) ? html`${et("İçeride")} <b>${simdi.toFixed(1)}°</b>` : ""}${Number.isFinite(hedef) ? html` · ${et("Hedef")} <b>${hedef.toFixed(1)}°</b>` : nothing}</div>
    <div class="kl-dugmeler kb-dugmeler">
      <button @click=${ayarla(-0.5)} title=${et("Hedefi düşür")}><ha-icon icon="mdi:minus"></ha-icon></button>
      <span class="kb-hedef">${Number.isFinite(hedef) ? hedef.toFixed(1) + "°" : "–"}</span>
      <button @click=${ayarla(0.5)} title=${et("Hedefi artır")}><ha-icon icon="mdi:plus"></ha-icon></button>
      <button class=${acik ? "on" : ""} @click=${guc}><ha-icon icon=${acik ? "mdi:fire" : "mdi:power"}></ha-icon><span>${acik ? et("Açık") : et("Kapalı")}</span></button>
    </div>
  </div>`;
}

/** Piyasalar: dolar, euro, gram altın … değer + günlük değişim (önceki kapanışa göre). Dokununca Haberler sayfası. */
export const piyasaSatir = (st, x) => {
  const s = st[x.e]; if (!s) return null;
  const v = parseFloat(s.state), o = parseFloat(s.attributes.chartPreviousClose);
  const d = Number.isFinite(v) && Number.isFinite(o) && o ? (v - o) / o * 100 : null;
  const bas = x.basamak ?? (v >= 1000 ? 0 : 2);
  return { ...x, v, d, metin: Number.isFinite(v) ? v.toLocaleString(locale(), { minimumFractionDigits: bas, maximumFractionDigits: bas }) : "–" };
};
export function piyasaKart(p) {
  const liste = (p.config.piyasa?.liste || []).map(x => piyasaSatir(p.hass.states, x)).filter(Boolean).slice(0, p.config.piyasa?.kartta || 4);
  return html`<div class="card piyasa" @click=${() => p.goPath("__haberler__")}>
    <div class="py-bas"><ha-icon icon="mdi:chart-line"></ha-icon><span>${et("Piyasalar")}</span></div>
    <div class="py-liste">${liste.map(x => html`<div class="py-satir"><span class="py-ad">${x.ad}</span><b>${x.metin}<small>${x.birim || ""}</small></b>
      <em class=${x.d == null ? "" : x.d >= 0 ? "art" : "dus"}>${x.d == null ? "" : `${x.d >= 0 ? "▲" : "▼"} %${Math.abs(x.d).toFixed(2)}`}</em></div>`)}</div>
  </div>`;
}

export const kartStyles = `
  /* ---------- klima ---------- */
  .card.klima{display:block;position:relative;overflow:hidden;transition:background .6s,border-color .6s,box-shadow .6s}
  .card.klima.m-isitma{background:linear-gradient(160deg,rgba(255,138,80,.42),rgba(255,90,40,.14) 70%);border-color:rgba(255,160,100,.6);box-shadow:0 0 30px -6px rgba(255,120,60,.55)}
  .card.klima.m-sogutma{background:linear-gradient(160deg,rgba(90,190,255,.40),rgba(60,120,255,.12) 70%);border-color:rgba(140,210,255,.6);box-shadow:0 0 30px -6px rgba(80,170,255,.55)}
  .kl-cihaz{position:absolute;top:var(--cp);right:var(--cp);width:44%;height:26%;border-radius:10px;background:linear-gradient(#f4f6f8,#cfd5db);box-shadow:0 6px 16px rgba(0,0,0,.35)}
  .kl-izgara{position:absolute;left:8%;right:8%;bottom:14%;height:18%;border-radius:4px;background:repeating-linear-gradient(90deg,#9aa3ab 0 2px,#c4cbd1 2px 6px);transition:height .6s}
  .card.klima:not(.m-kapali) .kl-izgara{height:26%}
  .kl-led{position:absolute;right:9%;top:22%;width:6px;height:6px;border-radius:50%;background:#7a828a}
  .m-isitma .kl-led{background:#ff7a3c;box-shadow:0 0 8px #ff7a3c}
  .m-sogutma .kl-led{background:#4cc2ff;box-shadow:0 0 8px #4cc2ff}
  .kl-akis{position:absolute;top:calc(var(--cp) + 26%);right:var(--cp);width:44%;height:42%;pointer-events:none;overflow:hidden}
  .m-isitma .kl-akis b{position:absolute;bottom:-10%;width:3px;height:55%;border-radius:3px;background:linear-gradient(transparent,rgba(255,170,110,.95),transparent);animation:sicak 2.2s ease-in infinite}
  .m-isitma .kl-akis b:nth-child(1){left:15%} .m-isitma .kl-akis b:nth-child(2){left:38%;animation-delay:.5s}
  .m-isitma .kl-akis b:nth-child(3){left:62%;animation-delay:1s} .m-isitma .kl-akis b:nth-child(4){left:85%;animation-delay:1.5s}
  @keyframes sicak{0%{transform:translateY(40%) scaleX(1);opacity:0}30%{opacity:1}100%{transform:translateY(-120%) scaleX(2.2) skewX(12deg);opacity:0}}
  .m-sogutma .kl-akis ha-icon{position:absolute;top:-20%;left:calc(8% + var(--i) * 15%);--mdc-icon-size:14px;color:#cdeeff;animation:kar 2.6s linear infinite;animation-delay:calc(var(--i) * -.45s);filter:drop-shadow(0 0 4px #7fd0ff)}
  @keyframes kar{0%{transform:translateY(0) rotate(0);opacity:0}15%{opacity:1}100%{transform:translateY(260%) rotate(180deg);opacity:0}}
  .kl-ust{position:absolute;top:var(--cp);left:var(--cp)}
  .kl-durum{font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:var(--fg-2)}
  .m-isitma .kl-durum{color:#ffd2b8} .m-sogutma .kl-durum{color:#d4f0ff}
  .kl-ad{position:absolute;left:var(--cp);top:42%;font-size:calc(19 * var(--u));font-weight:600}
  .kl-alt{position:absolute;left:var(--cp);top:calc(42% + 26px);font-size:13px;color:var(--fg-2)} .kl-alt b{color:#fff}
  .kl-dugmeler{position:absolute;left:var(--cp);right:var(--cp);bottom:var(--cp);display:flex;gap:6px}
  .kl-dugmeler button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;height:38px;border-radius:999px;border:1px solid var(--line);background:rgba(0,0,0,.22);color:#fff;font:inherit;font-size:12px;font-weight:700;cursor:pointer}
  .kl-dugmeler button ha-icon{--mdc-icon-size:16px}
  .kl-dugmeler button.on{background:rgba(255,255,255,.92);color:#1d1d1f;border-color:transparent}
  .m-isitma .kl-dugmeler button.on ha-icon{color:#ff6a2c} .m-sogutma .kl-dugmeler button.on ha-icon{color:#1e9bff}
  /* ---------- kombi ---------- */
  .card.kombi{display:block;position:relative;overflow:hidden;transition:background .6s,border-color .6s,box-shadow .6s}
  .card.kombi.k-isitiyor{background:linear-gradient(160deg,rgba(255,120,50,.46),rgba(255,70,30,.14) 70%);border-color:rgba(255,150,90,.65);box-shadow:0 0 32px -6px rgba(255,100,40,.6)}
  .card.kombi.k-hedefte{background:linear-gradient(160deg,rgba(255,190,90,.22),rgba(255,160,60,.06) 70%);border-color:rgba(255,200,120,.35)}
  .kb-cihaz{position:absolute;top:var(--cp);right:var(--cp);width:25%;height:46%;border-radius:10px;background:linear-gradient(#f5f6f8,#d3d8dd);box-shadow:0 6px 16px rgba(0,0,0,.35)}
  .kb-ekran{position:absolute;left:14%;right:14%;top:12%;height:22%;border-radius:4px;background:#1f2a33;color:#7fe0ff;font:700 11px/1 "Hanken Grotesk",system-ui;display:grid;place-items:center;font-style:normal;letter-spacing:.5px}
  .k-kapali .kb-ekran{color:#55606a}
  .kb-pencere{position:absolute;left:24%;right:24%;bottom:12%;height:34%;border-radius:6px;background:#2a2f35;overflow:hidden;box-shadow:inset 0 2px 6px rgba(0,0,0,.6)}
  .kb-pencere b{position:absolute;bottom:-6%;border-radius:50% 50% 45% 45%;background:radial-gradient(circle at 50% 70%,#fff3c4 0%,#ffb340 35%,#ff5a1f 70%,transparent 72%);transform-origin:50% 100%;animation:alev .5s ease-in-out infinite alternate}
  .kb-pencere b.a1{left:12%;width:30%;height:70%} .kb-pencere b.a2{left:36%;width:30%;height:95%;animation-delay:-.2s} .kb-pencere b.a3{left:60%;width:28%;height:65%;animation-delay:-.35s}
  .k-hedefte .kb-pencere b{height:26% !important;animation-duration:1.4s;filter:hue-rotate(185deg) saturate(1.4)}
  @keyframes alev{from{transform:scaleY(.82) scaleX(1.05)}to{transform:scaleY(1.08) scaleX(.92)}}
  .kb-akis{position:absolute;top:var(--cp);right:calc(var(--cp) + 26%);width:18%;height:46%;pointer-events:none;overflow:hidden}
  .k-isitiyor .kb-akis b{position:absolute;bottom:-10%;width:3px;height:55%;border-radius:3px;background:linear-gradient(transparent,rgba(255,170,110,.95),transparent);animation:sicak 2.2s ease-in infinite}
  .k-isitiyor .kb-akis b:nth-child(1){left:15%} .k-isitiyor .kb-akis b:nth-child(2){left:50%;animation-delay:.7s} .k-isitiyor .kb-akis b:nth-child(3){left:82%;animation-delay:1.4s}
  .k-isitiyor .kl-durum{color:#ffd2b8}
  .kb-onayar{margin-left:8px;height:22px;padding:0 10px;border-radius:999px;border:1px solid var(--line);background:rgba(0,0,0,.22);color:#fff;font:inherit;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;vertical-align:middle}
  .kl-ust{display:flex;align-items:center}
  .kb-dugmeler button{flex:0 0 38px}
  .kb-dugmeler button:last-child{flex:1}
  .kb-hedef{flex:0 0 auto;min-width:54px;display:grid;place-items:center;font-size:16px;font-weight:700;font-variant-numeric:tabular-nums}
  .k-isitiyor .kb-dugmeler button.on ha-icon{color:#ff6a2c}
  /* ---------- piyasalar ---------- */
  .card.piyasa{display:flex;flex-direction:column;cursor:pointer}
  .py-bas{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:var(--fg-2)}
  .py-bas ha-icon{--mdc-icon-size:18px}
  .py-liste{flex:1;display:flex;flex-direction:column;justify-content:space-evenly;margin-top:6px}
  .py-satir{display:grid;grid-template-columns:1fr max-content 74px;align-items:baseline;gap:8px}
  .py-ad{font-size:13px;color:var(--fg-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .py-satir b{font-size:15px;font-weight:700;font-variant-numeric:tabular-nums} .py-satir b small{font-size:11px;font-weight:600;color:var(--fg-2);margin-left:2px}
  .py-satir em{font-style:normal;font-size:11px;font-weight:700;text-align:right;font-variant-numeric:tabular-nums}
  .py-satir em.art{color:#4ade80} .py-satir em.dus{color:#ff6b6b}
`;
