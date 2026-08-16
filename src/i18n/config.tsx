"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import en from "./en.json";
import hi from "./hi.json";
import kn from "./kn.json";

export type Locale = "en" | "kn" | "hi";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  hi: "हिंदी (Hindi)",
  kn: "ಕನ್ನಡ (Kannada)",
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  en,
  hi,
  kn,
};

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("locale") as Locale) || "en";
    }
    return "en";
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      if (!key) return "";
      const currentDict = translations[locale] || {};
      const fallbackDict = translations.en || {};

      // 1. Direct key match
      if (currentDict[key]) return currentDict[key];
      
      // 2. Case-insensitive key match
      const lowerKey = key.toLowerCase();
      for (const [k, v] of Object.entries(currentDict)) {
        if (k.toLowerCase() === lowerKey) return v;
      }

      // 3. Fallback to English dictionary
      if (fallbackDict[key]) return fallbackDict[key];
      for (const [k, v] of Object.entries(fallbackDict)) {
        if (k.toLowerCase() === lowerKey) return v;
      }

      return key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
