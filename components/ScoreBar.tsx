"use client";

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  color?: "brand" | "green" | "amber" | "red";
}

const colorMap = {
  brand: {
    bar: "bg-gradient-to-r from-brand-500 to-brand-400",
    text: "text-brand-600 dark:text-brand-400",
    track: "bg-brand-100 dark:bg-brand-900/40",
  },
  green: {
    bar: "bg-gradient-to-r from-emerald-500 to-green-400",
    text: "text-emerald-600 dark:text-emerald-400",
    track: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  amber: {
    bar: "bg-gradient-to-r from-amber-500 to-yellow-400",
    text: "text-amber-600 dark:text-amber-400",
    track: "bg-amber-100 dark:bg-amber-900/40",
  },
  red: {
    bar: "bg-gradient-to-r from-red-500 to-rose-400",
    text: "text-red-600 dark:text-red-400",
    track: "bg-red-100 dark:bg-red-900/40",
  },
};

function getAutoColor(value: number): "green" | "amber" | "red" | "brand" {
  if (value >= 75) return "green";
  if (value >= 50) return "amber";
  return "red";
}

export default function ScoreBar({
  label,
  value,
  max = 100,
  color,
}: ScoreBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const resolvedColor = color ?? getAutoColor(value);
  const colors = colorMap[resolvedColor];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </span>
        <span className={`text-sm font-bold ${colors.text}`}>
          {value}
          <span className="text-xs font-normal text-gray-400">/{max}</span>
        </span>
      </div>
      <div className={`h-2.5 w-full overflow-hidden rounded-full ${colors.track}`}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
