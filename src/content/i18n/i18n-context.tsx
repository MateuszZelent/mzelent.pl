"use client";

import React, { createContext, useContext, useState } from "react";

import { dictionaryEn } from "./dictionaries/en";
import { dictionaryPl } from "./dictionaries/pl";
import type { Language, TranslationDictionary } from "./types";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const dictionaries: Record<Language, TranslationDictionary> = {
  pl: dictionaryPl,
  en: dictionaryEn,
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: dictionaryEn,
});

export function LanguageProvider({ children }: { readonly children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  React.useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const savedLang = localStorage.getItem("mzelent_language") as Language | null;
        if (savedLang === "pl" || savedLang === "en") {
          setLanguageState(savedLang);
        } else if (typeof navigator !== "undefined" && navigator.language?.startsWith("pl")) {
          setLanguageState("pl");
        }
      } catch {
        // localStorage may be blocked in some environments
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem("mzelent_language", newLang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLang;
      }
    } catch {
      // Ignore
    }
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t: dictionaries[language],
  };

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}
