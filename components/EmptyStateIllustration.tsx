"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function EmptyStateIllustration() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-6 animate-fade-in">
      <svg
        width="280"
        height="200"
        viewBox="0 0 280 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Background glow */}
        <defs>
          <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="docGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="docGradDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Soft background circle */}
        <circle cx="140" cy="100" r="85" fill="url(#brandGrad)" />

        {/* Document */}
        <rect x="95" y="35" width="90" height="120" rx="8" className="fill-white dark:fill-gray-800" stroke="#e2e8f0" strokeWidth="1.5" />
        <rect x="95" y="35" width="90" height="120" rx="8" className="dark:stroke-gray-700" strokeWidth="0.5" fill="none" />

        {/* Document lines */}
        <rect x="110" y="55" width="60" height="4" rx="2" className="fill-gray-200 dark:fill-gray-600" />
        <rect x="110" y="66" width="50" height="4" rx="2" className="fill-gray-200 dark:fill-gray-600" />
        <rect x="110" y="77" width="55" height="4" rx="2" className="fill-gray-200 dark:fill-gray-600" />
        <rect x="110" y="88" width="40" height="4" rx="2" className="fill-gray-200 dark:fill-gray-600" />
        <rect x="110" y="99" width="58" height="4" rx="2" className="fill-gray-200 dark:fill-gray-600" />
        <rect x="110" y="110" width="45" height="4" rx="2" className="fill-gray-200 dark:fill-gray-600" />
        <rect x="110" y="121" width="52" height="4" rx="2" className="fill-gray-200 dark:fill-gray-600" />

        {/* Scanning line animation */}
        <rect x="97" y="55" width="86" height="2" rx="1" fill="#6366f1" opacity="0.5">
          <animate attributeName="y" values="55;135;55" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
        </rect>

        {/* AI sparkle effects */}
        <g filter="url(#glow)">
          {/* Top-right sparkle */}
          <circle cx="200" cy="50" r="4" fill="url(#sparkleGrad)">
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Right sparkle */}
          <circle cx="210" cy="90" r="3" fill="#818cf8">
            <animate attributeName="r" values="2;4;2" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* Bottom-right sparkle */}
          <circle cx="195" cy="135" r="3.5" fill="url(#sparkleGrad)">
            <animate attributeName="r" values="2.5;4.5;2.5" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
          </circle>

          {/* Top-left sparkle */}
          <circle cx="75" cy="65" r="2.5" fill="#a5b4fc">
            <animate attributeName="r" values="2;3.5;2" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.2s" repeatCount="indefinite" />
          </circle>

          {/* Bottom-left sparkle */}
          <circle cx="80" cy="125" r="3" fill="#818cf8">
            <animate attributeName="r" values="2;4;2" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.8s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Checkmark badge */}
        <circle cx="170" cy="140" r="16" fill="#6366f1" />
        <circle cx="170" cy="140" r="16" fill="url(#sparkleGrad)" />
        <path d="M162 140l5 5 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Floating dots */}
        <circle cx="60" cy="45" r="2" className="fill-brand-300 dark:fill-brand-600" opacity="0.5">
          <animate attributeName="cy" values="45;40;45" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="225" cy="70" r="1.5" className="fill-brand-400 dark:fill-brand-500" opacity="0.4">
          <animate attributeName="cy" values="70;65;70" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="230" cy="150" r="2" className="fill-brand-300 dark:fill-brand-600" opacity="0.3">
          <animate attributeName="cy" values="150;145;150" dur="3.5s" repeatCount="indefinite" />
        </circle>
      </svg>

      <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
        {t.emptyStateText}
      </p>
    </div>
  );
}
