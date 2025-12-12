import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import de from "./locales/de/translation.json";

const savedLang = localStorage.getItem("app_lang") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
  },
  lng: savedLang, // ✅ load saved language on refresh
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
