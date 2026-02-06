"use client";

/**
 * KPI Date Selector
 *
 * Simple date range selector for KPI pages.
 */

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kpi-date-range-days";
const DEFAULT_DAYS = 30;

const presets = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
];

function getStoredDays(): number {
  if (typeof window === "undefined") return DEFAULT_DAYS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_DAYS;
  const parsed = Number(stored);
  return presets.some(p => p.days === parsed) ? parsed : DEFAULT_DAYS;
}

interface KPIDateSelectorProps {
  onDateChange: (startDate: string, endDate: string) => void;
  className?: string;
}

export function KPIDateSelector({ onDateChange, className }: KPIDateSelectorProps) {
  const [selected, setSelected] = useState(getStoredDays);

  // Fire initial date range on mount
  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - selected);
    onDateChange(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (days: number) => {
    setSelected(days);
    localStorage.setItem(STORAGE_KEY, String(days));
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    onDateChange(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Calendar className="w-4 h-4 text-neutral-400" />
      <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {presets.map((preset) => (
          <button
            key={preset.days}
            onClick={() => handleSelect(preset.days)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors",
              selected === preset.days
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
