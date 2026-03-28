"use client";

import { CheckCircleIcon, ExclamationCircleIcon, LightBulbIcon } from "./icons";

interface ResultCardProps {
  title: string;
  items: string[];
  type: "strength" | "weakness" | "suggestion";
}

const typeConfig = {
  strength: {
    icon: CheckCircleIcon,
    iconClass: "text-emerald-500",
    dotClass: "bg-emerald-500",
    headerClass: "text-emerald-700 dark:text-emerald-400",
    borderClass: "border-emerald-200 dark:border-emerald-800",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
    badgeClass: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  },
  weakness: {
    icon: ExclamationCircleIcon,
    iconClass: "text-rose-500",
    dotClass: "bg-rose-500",
    headerClass: "text-rose-700 dark:text-rose-400",
    borderClass: "border-rose-200 dark:border-rose-800",
    bgClass: "bg-rose-50 dark:bg-rose-950/20",
    badgeClass: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
  },
  suggestion: {
    icon: LightBulbIcon,
    iconClass: "text-amber-500",
    dotClass: "bg-amber-500",
    headerClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-200 dark:border-amber-800",
    bgClass: "bg-amber-50 dark:bg-amber-950/20",
    badgeClass: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  },
};

export default function ResultCard({ title, items, type }: ResultCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm animate-slide-up ${config.borderClass} ${config.bgClass}`}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconClass}`} />
        <h3 className={`font-semibold ${config.headerClass}`}>{title}</h3>
        <span
          className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badgeClass}`}
        >
          {items.length}
        </span>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <span
              className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${config.dotClass}`}
            />
            <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
