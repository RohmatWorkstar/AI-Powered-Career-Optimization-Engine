"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SparklesIcon } from "./icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import { useTheme } from "@/lib/ThemeContext";

export default function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight block">
                {t.appName}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-none">
                {t.poweredBy}
              </span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-4 ml-4">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
                pathname === "/" 
                  ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30" 
                  : "text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              Resume Analyzer
            </Link>
            <Link 
              href="/job-matcher" 
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
                pathname === "/job-matcher" 
                  ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30" 
                  : "text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              Job Matcher
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            onClick={toggleDarkMode}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-gray-500 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-700"
            aria-label={t.toggleDarkMode}
          >
            {darkMode ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile nav */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 px-6 py-2 overflow-x-auto hide-scrollbar">
        <nav className="flex items-center gap-4">
          <Link 
            href="/" 
            className={`text-sm font-medium whitespace-nowrap transition-colors px-3 py-1.5 rounded-lg ${
              pathname === "/" 
                ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30" 
                : "text-gray-600 dark:text-gray-300 hover:text-brand-500"
            }`}
          >
            Resume Analyzer
          </Link>
          <Link 
            href="/job-matcher" 
            className={`text-sm font-medium whitespace-nowrap transition-colors px-3 py-1.5 rounded-lg ${
              pathname === "/job-matcher" 
                ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30" 
                : "text-gray-600 dark:text-gray-300 hover:text-brand-500"
            }`}
          >
            Job Matcher
          </Link>
        </nav>
      </div>
    </header>
  );
}
