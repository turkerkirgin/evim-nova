import { TAG, SUFFIX } from "./util.js";
// Lovelace card wrapper: lets the panel live in a dashboard (panel view) instead of panel_custom.
// Install the bundle as a dashboard resource, add a dashboard with one card:  type: custom:evim-nova-card
// Routing inside the card uses the URL hash (#/<room>), so the dashboard URL itself never changes.
// Optional: a `config:` object in the card config is used like config.json (users can still override it in the panel settings).
class HacasaNovaCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._ensure();
    this._el.cardConfig = this._config.config && Object.keys(this._config.config).length ? this._config.config : null;
    this._el.applyConfig?.();
  }
  set hass(h) { const ilk = !this._hass; this._hass = h; if (this._el) this._el.hass = h; if (ilk && this._config?.status_bar && this.isConnected) this._statusBar(this._config.status_bar); }
  get hass() { return this._hass; }
  _ensure() {
    if (this._el) return;
    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `:host{display:block;position:relative;height:calc(100vh - var(--header-height, 56px));height:calc(100dvh - var(--header-height, 56px));overflow:hidden}
      ${TAG}{display:block;height:100%}`;
    const el = document.createElement(TAG);
    el.hashMode = true;
    // Evim yaması: üst çubuk kiosk-mode ile gizliyse kart tüm ekranı kaplasın (full_height: true)
    if (this._config?.full_height && !new URLSearchParams(location.search).has("disable_km")) style.textContent = style.textContent.replace(/calc\(100(d?)vh - var\(--header-height, 56px\)\)/g, "100$1vh");
    el.classList.add("in-card");
    el.panel = { url_path: location.pathname.split("/")[1] || "evim-nova" };
    if (this._hass) el.hass = this._hass;
    root.append(style, el);
    this._el = el;
  }
  // Evim yaması: Android uygulaması durum çubuğunu <html>'deki --app-header-background-color'dan okur ("theme-update" ile yeniler).
  // Pano açıkken koyu yap, kapanınca temanın rengine geri bırak. Biçim "rgb(r, g, b)" olmalı (uygulama bu biçimi ayrıştırır).
  connectedCallback() { if (this._config?.status_bar) this._statusBar(this._config.status_bar); }
  disconnectedCallback() { if (this._config?.status_bar) this._statusBar(null); }
  _statusBar(c) {
    const r = document.documentElement.style;
    if (c) { if (this._prevBar === undefined) this._prevBar = r.getPropertyValue("--app-header-background-color"); r.setProperty("--app-header-background-color", c); }
    else { if (this._prevBar) r.setProperty("--app-header-background-color", this._prevBar); else r.removeProperty("--app-header-background-color"); this._prevBar = undefined; }
    try { (this._hass || document.querySelector("home-assistant")?.hass)?.auth?.external?.fireMessage({ type: "theme-update" }); } catch (e) {}
  }
  getCardSize() { return 20; }
  static getStubConfig() { return {}; }
  static getConfigElement() { return undefined; }
}
if (!customElements.get(TAG + "-card")) customElements.define(TAG + "-card", HacasaNovaCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === TAG + "-card")) window.customCards.push({ type: TAG + "-card", name: "Evim Nova" + (SUFFIX ? " (dev)" : ""), description: "The Evim Nova home panel inside a dashboard. Use it as the only card in a view of type panel.", preview: false });
