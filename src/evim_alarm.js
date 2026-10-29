// Evim yaması: alarm ekranı — kurulurken (çıkış süresi), giriş süresinde ve çalarken tam ekran uyarı, geri sayım, şifre tuşları
// ve sesler (/local/sesler: kurulum, devrede, uyarı bip'i, siren). Ses cihaz başına açılır/kapanır (localStorage "evimAlarmSes"; telefonlarda varsayılan kapalı).
import { html, nothing } from "lit";
import { et } from "./i18n.js";

// sesler /config/www/sesler/ altında (= /local/sesler/); başka klasör için pano ayarında alarm.sesYolu
const SES_ADLARI = ["siren", "uyari", "kurulum", "devrede"];
let sesYolu = "/local/sesler/";
const SES = ad => sesYolu + ad + ".wav";
const ANAHTAR = "evimAlarmSes";
let calanAd = null, istenen = null, engellendi = false, yenile = null;

/* Android WebView'de (Fully Kiosk, HA uygulaması) ses ancak dokunuşla başlatılabilir; ama bir dokunuş içinde bir kez çalınan
   ses öğesinin kilidi kalıcı açılır. Bu yüzden her ses için TEK öğe tutulur ve ekrana ilk dokunuşta hepsi sessizce "hazırlanır".
   Fully'nin JavaScript arayüzü açıksa (window.fully) onun oynatıcısı kullanılır: kilit yok, ses düzeyi de en yükseğe alınır. */
const ogeler = {};
const oge = ad => { if (!ogeler[ad]) { const a = new Audio(SES(ad)); a.preload = "auto"; ogeler[ad] = a; } return ogeler[ad]; };
let hazir = false;
function hazirla() {
  if (hazir || window.fully) return;
  hazir = true;
  for (const ad of SES_ADLARI) {
    if (ad === calanAd) continue;
    const a = oge(ad); a.volume = 0;
    a.play().then(() => { if (calanAd !== ad) { a.pause(); a.currentTime = 0; } a.volume = 1; }).catch(() => { a.volume = 1; hazir = false; });
  }
  if (istenen) { const [ad, dongu] = istenen; istenen = null; calanAd = null; cal(ad, dongu); }   // engellenmiş bir ses bekliyorsa şimdi çal
}
for (const olay of ["pointerdown", "touchstart", "keydown"]) addEventListener(olay, hazirla, { capture: true, passive: true });

/** telefon mu? Ekranın kısa kenarına bakılır (dik tutulan tablet telefon sayılmasın) */
const telefon = () => Math.min(screen.width, screen.height) < 600;
export const sesAcikMi = () => { try { const v = localStorage.getItem(ANAHTAR); if (v === "1" || v === "0") return v === "1"; } catch (e) {} return !telefon(); };
export const sesAyarla = acik => { try { localStorage.setItem(ANAHTAR, acik ? "1" : "0"); } catch (e) {} if (!acik) dur(); };
export const sesEngellendi = () => engellendi;
function dur() {
  if (window.fully) { try { window.fully.stopSound(); } catch (e) {} }
  for (const a of Object.values(ogeler)) if (!a.paused) { a.pause(); a.currentTime = 0; }
  calanAd = null; istenen = null; engellendi = false;
}
function cal(ad, dongu) {
  if (calanAd === ad) return;
  dur(); if (!sesAcikMi()) return;
  calanAd = ad;
  if (window.fully) {
    try { window.fully.setAudioVolume(100, 3); window.fully.setAudioVolume(100, 4); window.fully.playSound(new URL(SES(ad), location.href).href, dongu); return; } catch (e) {}
  }
  const a = oge(ad); a.loop = dongu; a.volume = 1; a.currentTime = 0;
  a.onended = () => { if (calanAd === ad && !a.loop) calanAd = null; };
  a.play().then(() => { engellendi = false; }).catch(() => { if (calanAd === ad) { engellendi = true; istenen = [ad, dongu]; yenile?.(); } });
}
/** "Sesi dene": dokunuşla çağrıldığı için kilidi de açar */
export function sesDene() { cal("siren", false); setTimeout(() => { if (calanAd === "siren") dur(); }, 3000); }

const ss = n => { n = Math.max(0, Math.ceil(n)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`; };

/** paneldeki her çizimde çağrılır: sesleri duruma göre yönetir, gerekiyorsa tam ekran uyarıyı döndürür */
export function alarmEkrani(p) {
  const s = p.home?.alarm, st = s?.state, onceki = p._alarmOnceki;
  if (!s) return nothing;
  yenile = () => p.requestUpdate();
  if (p.config.alarm?.sesYolu) sesYolu = p.config.alarm.sesYolu.replace(/\/?$/, "/");
  if (st !== onceki) {
    p._alarmOnceki = st; p._alarmKod = ""; p._alarmHata = false; p._alarmSus = false;
    if (onceki !== undefined && st === "arming") cal("kurulum", false);                       // kurma başladı
    else if (st.startsWith("armed_") && (onceki === "arming" || onceki === "disarmed")) cal("devrede", false);   // alarm devrede (çıkış süresi bitti ya da süresiz kuruldu)
  }
  if (st === "triggered" && !p._alarmSus) cal("siren", true);
  else if (st === "pending" && !p._alarmSus) cal("uyari", true);
  else if (calanAd === "siren" || calanAd === "uyari") dur();

  const aktif = ["arming", "pending", "triggered"].includes(st);
  if (aktif && !p._alarmTik) p._alarmTik = setInterval(() => p.requestUpdate(), 1000);
  if (!aktif && p._alarmTik) { clearInterval(p._alarmTik); p._alarmTik = null; }
  if (!aktif || p._alarmGizli === s.last_changed) return nothing;

  const cfg = p.config.alarm || {}, gecen = (Date.now() - new Date(s.last_changed).getTime()) / 1000;
  const kalan = st === "arming" ? (cfg.cikis ?? 120) - gecen : st === "pending" ? (cfg.giris ?? 35) - gecen : null;
  const sebep = p.hass.states[cfg.sebep || "input_text.alarm_sebep"]?.state;
  const kod = p._alarmKod || "";
  const bas = k => { p._alarmHata = false; p._alarmKod = k === "⌫" ? kod.slice(0, -1) : (kod + k).slice(0, 12); p.requestUpdate(); };
  const kapat = async () => {
    try { await p.call("alarm_control_panel", "alarm_disarm", { entity_id: s.entity_id, code: kod }); p._alarmKod = ""; }
    catch (e) { p._alarmKod = ""; p._alarmHata = true; }
    p.requestUpdate();
  };
  const tuslar = html`<div class=${`al-tus ${p._alarmHata ? "hata" : ""}`}>
    <div class="al-kod">${p._alarmHata ? et("Yanlış şifre") : kod ? "•".repeat(kod.length) : et("Şifreyi gir")}</div>
    <div class="al-izgara">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "OK"].map(k => html`<button class=${k === "OK" ? "ok" : ""} @click=${() => k === "OK" ? kapat() : bas(k)}>${k === "OK" ? et("Kapat") : k}</button>`)}</div>
  </div>`;
  const neden = sebep && sebep !== "—" && sebep !== "unknown" ? sebep : "", ipucu = cfg.ipucu ? " " + cfg.ipucu : "";   // ipucu: ör. "Ya da kapı butonuna 2 kez bas."
  const metin = {
    arming: { ust: et("Alarm kuruluyor"), alt: et("Evden çıkabilirsin; süre bitince alarm devreye girer."), ikon: "mdi:shield-sync" },
    pending: { ust: et("Giriş algılandı"), alt: `${neden ? neden + ". " : ""}${et("Süre bitmeden şifreyi gir.")}${ipucu}`, ikon: "mdi:shield-alert" },
    triggered: { ust: et("ALARM"), alt: `${neden ? neden + " · " : ""}${et("Kapatmak için şifreyi gir.")}${ipucu}`, ikon: "mdi:alarm-light" },
  }[st];
  const sesVar = sesAcikMi() && st !== "arming";
  return html`<div class=${`al-ekran al-${st}`}>
    <div class="al-kutu">
      <div class="al-bas"><ha-icon icon=${metin.ikon}></ha-icon><div><h2>${metin.ust}</h2><p>${metin.alt}</p></div></div>
      ${kalan != null ? html`<div class="al-sayac">${ss(kalan)}</div>` : nothing}
      ${engellendi && st !== "arming" ? html`<div class="al-engel"><ha-icon icon="mdi:volume-off"></ha-icon>${et("Tarayıcı sesi engelledi: ekrana bir kez dokun")}</div>` : nothing}
      ${tuslar}
      <div class="al-alt">
        ${st === "arming" ? html`<button @click=${() => { p._alarmGizli = s.last_changed; p.requestUpdate(); }}>${et("Gizle")}</button>` : nothing}
        ${sesVar ? html`<button @click=${() => { p._alarmSus = !p._alarmSus; if (p._alarmSus) dur(); p.requestUpdate(); }}>${p._alarmSus ? et("Sesi aç") : et("Bu cihazda sustur")}</button>` : nothing}
      </div>
    </div>
  </div>`;
}

export const alarmStyles = `
  .al-ekran{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:16px;background:rgba(10,12,18,.72);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
  .al-ekran.al-pending{background:rgba(60,38,0,.78)}
  .al-ekran.al-triggered{animation:alyan 1s steps(1) infinite}
  @keyframes alyan{0%{background:rgba(150,0,0,.86)}50%{background:rgba(40,0,0,.86)}}
  .al-kutu{width:min(440px,100%);max-height:100%;overflow:auto;padding:24px;border-radius:24px;background:rgba(22,24,29,.88);border:1px solid rgba(255,255,255,.16);box-shadow:0 30px 80px rgba(0,0,0,.5);color:#fff}
  .al-bas{display:flex;gap:14px;align-items:flex-start} .al-bas ha-icon{--mdc-icon-size:44px;flex:none;color:#8ea8ff}
  .al-pending .al-bas ha-icon{color:#ffb020} .al-triggered .al-bas ha-icon{color:#ff5252}
  .al-bas h2{font-size:28px;font-weight:700;letter-spacing:-.5px;margin:0} .al-bas p{margin:4px 0 0;color:rgba(255,255,255,.75);font-size:14px;line-height:1.4}
  .al-sayac{font-size:64px;font-weight:700;text-align:center;font-variant-numeric:tabular-nums;letter-spacing:-2px;margin:10px 0 4px}
  .al-pending .al-sayac{color:#ffb020}
  .al-engel{display:flex;align-items:center;gap:8px;justify-content:center;margin:6px 0;padding:8px 12px;border-radius:12px;background:rgba(255,176,32,.18);color:#ffd27a;font-size:13px;font-weight:600} .al-engel ha-icon{--mdc-icon-size:18px}
  .al-tus{margin-top:14px} .al-kod{text-align:center;height:34px;font-size:22px;letter-spacing:6px;color:rgba(255,255,255,.8)}
  .al-tus.hata .al-kod{color:#ff6b6b;letter-spacing:0;font-size:16px;animation:alsalla .35s}
  @keyframes alsalla{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
  .al-izgara{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
  .al-izgara button{height:58px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.08);color:#fff;font:inherit;font-size:22px;font-weight:600;cursor:pointer}
  .al-izgara button:active{background:rgba(255,255,255,.22)} .al-izgara button.ok{background:#fff;color:#16181d;font-size:16px;font-weight:700}
  .al-alt{display:flex;gap:8px;justify-content:center;margin-top:14px}
  .al-alt button{height:40px;padding:0 18px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#fff;font:inherit;font-size:13px;font-weight:700;cursor:pointer}
  @media (max-width:900px){ .al-sayac{font-size:52px} .al-izgara button{height:52px} }
`;
