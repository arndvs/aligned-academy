import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";
import translationEn from "./locales/en-US/translations.json";
import translationEs from "./locales/es-ES/translations.json";
import translationKo from "./locales/ko-KR/translations.json";
import translationFr from "./locales/fr-FR/translations.json";
import translationIt from "./locales/it-IT/translations.json";
import translationPt from "./locales/pt-PT/translations.json";
import translationAr from "./locales/ar-SA/translations.json";

interface CurrencyConfig {
  currency: string;
  symbol: string;
}

const resources = {
  "en-US": { translation: translationEn },
  en: { translation: translationEn }, // Fallback for any English variant
  "es-ES": { translation: translationEs },
  es: { translation: translationEs }, // Fallback for any Spanish variant
  "ko-KR": { translation: translationKo },
  ko: { translation: translationKo }, // Fallback for any Korean variant
  "fr-FR": { translation: translationFr },
  fr: { translation: translationFr }, // Fallback for any French variant
  "it-IT": { translation: translationIt },
  it: { translation: translationIt }, // Fallback for any Italian variant
  "pt-PT": { translation: translationPt },
  pt: { translation: translationPt }, // Fallback for any Portuguese variant
  "ar-SA": { translation: translationAr },
  ar: { translation: translationAr }, // Fallback for any Arabic variant
};

// List of RTL languages
const RTL_LANGUAGES = ["ar", "ar-SA"];

const LANGUAGE_KEY = "@app_language";

export const CURRENCY_MAP: Record<string, CurrencyConfig> = {
  "en-US": { currency: "USD", symbol: "$" },
  "es-ES": { currency: "EUR", symbol: "€" },
  "fr-FR": { currency: "EUR", symbol: "€" },
  "it-IT": { currency: "EUR", symbol: "€" },
  "ko-KR": { currency: "KRW", symbol: "₩" },
  "pt-PT": { currency: "EUR", symbol: "€" },
  "ar-SA": { currency: "SAR", symbol: "ر.س" },
};

const initI18n = async () => {
  try {
    // Try to get saved language preference
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

    // Determine which language to use
    let selectedLanguage = savedLanguage;

    if (!selectedLanguage) {
      // If no saved language, use device locale or fallback
      const deviceLocales = Localization.getLocales();
      const deviceLocale = deviceLocales[0]?.languageTag || "en-US";
      const languageCode = deviceLocale.split("-")[0];

      // Try exact locale match first
      if (deviceLocale in resources) {
        selectedLanguage = deviceLocale;
      }

      // Then try language code match
      else if (languageCode in resources) {
        selectedLanguage = languageCode;
      } else {
        selectedLanguage = "en-US";
      }
    }

    // Handle RTL layout
    const isRTL = RTL_LANGUAGES.includes(selectedLanguage);

    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }

    await i18n.use(initReactI18next).init({
      resources,
      lng: selectedLanguage,
      fallbackLng: {
        "es-*": ["es-ES", "es", "en-US"],
        "en-*": ["en-US", "en"],
        "ko-*": ["ko-KR", "ko", "en-US"],
        "fr-*": ["fr-FR", "fr", "en-US"],
        "it-*": ["it-IT", "it", "en-US"],
        "pt-*": ["pt-PT", "pt", "en-US"],
        "ar-*": ["ar-SA", "ar", "en-US"],
        default: ["en-US"],
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

    // Save the selected language
    if (!savedLanguage) {
      await AsyncStorage.setItem(LANGUAGE_KEY, selectedLanguage);
    }
  } catch (error) {
    console.error("Error initializing i18n:", error);
    // Initialize with defaults if there's an error
    await i18n.use(initReactI18next).init({
      resources,
      lng: "en-US",
      fallbackLng: "en-US",
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  }
};

initI18n();

export default i18n;
