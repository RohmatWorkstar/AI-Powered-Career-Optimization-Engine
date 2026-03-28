"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { translations, type Locale, type Translations } from "./translations";

interface LanguageContextValue {
  locale: Locale;
  t: Translations;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  // Read from localStorage ONLY after hydration has cleanly passed or error will be thrown
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("resume-ai-locale");
        if (saved === "en" || saved === "id") {
          setLocale(saved);
        }
      }
    } catch (e) {
      // Safe guard against disabled localStorage
      console.warn("Could not read from local storage", e);
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next: Locale = prev === "en" ? "id" : "en";
      if (typeof window !== "undefined") {
        localStorage.setItem("resume-ai-locale", next);
      }
      return next;
    });
  }, []);

  const t = useMemo(() => translations[locale], [locale]);

  const value = useMemo(
    () => ({ locale, t, toggleLocale }),
    [locale, t, toggleLocale]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
