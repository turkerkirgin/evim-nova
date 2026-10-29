// Translations. The Dutch text is the key, so the source stays readable; `t("Aan")` returns "On" in English and "Ein" in German.
// `t("{n} van {m} aan", { n, m })` fills placeholders.
//
// Each language is one file in src/lang/ (`export default { "Dutch key": "translation", … }`) plus one line in
// LANGS below. A key that is missing or empty falls back to English, then to the Dutch key.
// `npm run i18n:check` lists missing keys and placeholder mistakes; `npm run i18n:check -- <code>` prints the
// missing keys of one language as a block to paste into its file.
//
// Evim Nova's own modules (alarm, themes, climate/boiler cards, camera tab, scenarios …) are written in Turkish:
// `et("Turkish text")` returns it as is in Turkish and the English text from src/lang/evim_en.js in every other language.
import en from "./lang/en.js";
import de from "./lang/de.js";
import tr from "./lang/tr.js";
import evimEn from "./lang/evim_en.js";

export const LANGS = {
  nl: { name: "Nederlands", locale: "nl-NL" },
  en: { name: "English", locale: "en-GB", dict: en },
  de: { name: "Deutsch", locale: "de-DE", dict: de },
  tr: { name: "Türkçe", locale: "tr-TR", dict: tr },
};

// Home Assistant language ("de", "de-CH", "pt-BR", "zh-Hans") → our code: exact match first, then the base language.
export const pickLang = hassLang => {
  const l = String(hassLang || "en").toLowerCase();
  return LANGS[l] ? l : LANGS[l.split(/[-_]/)[0]] ? l.split(/[-_]/)[0] : "en";
};

// Strings built while the module loads already need a language: take the one Home Assistant stored in the browser
// (selectedLanguage), else the page or browser language. The panel sets the real one as soon as hass arrives.
const firstLang = () => {
  try { const s = JSON.parse(localStorage.getItem("selectedLanguage") || "null"); if (s) return pickLang(s); } catch { /* no storage: fall through */ }
  return pickLang(globalThis.document?.documentElement?.lang || globalThis.navigator?.language);
};

let lang = firstLang(), dict = LANGS[lang].dict || null;
export const setLang = l => { lang = LANGS[l] ? l : "en"; dict = LANGS[lang].dict || null; };
export const getLang = () => lang;
export const locale = () => LANGS[lang].locale;
export const LANGUAGES = Object.fromEntries(Object.entries(LANGS).map(([k, v]) => [k, v.name]));

const fill = (s, vars) => { if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v); return s; };

export function t(key, vars) {
  // Evim Nova's Turkish keys (tab and page labels built at load and translated when shown) fall back to evim_en
  return fill(lang === "nl" ? key : (dict?.[key] || en[key] || (lang !== "tr" && evimEn[key]) || key), vars);
}

/** Evim Nova text: Turkish is the key; other languages get the English line from lang/evim_en.js. */
export function et(key, vars) {
  return fill(lang === "tr" ? key : (evimEn[key] || key), vars);
}
