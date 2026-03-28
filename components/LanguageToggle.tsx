"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      onClick={toggleLocale}
      className="group relative inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-brand-300 dark:hover:border-brand-600"
      aria-label={`Switch to ${locale === "en" ? "Indonesian" : "English"}`}
      title={locale === "en" ? "Ganti ke Bahasa Indonesia" : "Switch to English"}
    >
      {/* Globe icon */}
      <svg
        className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-brand-500 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
        />
      </svg>

      {/* Language labels with flag */}
      <span className="relative flex items-center gap-1">
        <span
          className={`inline-block transition-all duration-300 ${
            locale === "en"
              ? "opacity-100 translate-y-0"
              : "opacity-0 absolute -translate-y-2"
          }`}
        >
          🇺🇸 EN
        </span>
        <span
          className={`inline-block transition-all duration-300 ${
            locale === "id"
              ? "opacity-100 translate-y-0"
              : "opacity-0 absolute translate-y-2"
          }`}
        >
          🇮🇩 ID
        </span>
      </span>
    </button>
  );
}
