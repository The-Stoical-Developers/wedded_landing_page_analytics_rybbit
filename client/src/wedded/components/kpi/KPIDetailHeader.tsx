"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { KPIDefinition } from "../../api/endpoints/types";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

interface KPIDetailHeaderProps {
  kpi: KPIDefinition;
  value: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  users: "text-blue-500",
  onboarding: "text-emerald-500",
  weddings: "text-pink-500",
  churn: "text-red-500",
  journey: "text-purple-500",
};

export function KPIDetailHeader({ kpi, value, trend, isLoading }: KPIDetailHeaderProps) {
  if (isLoading) {
    return (
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
          <div className="flex-1">
            <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-4" />
            <div className="flex items-end gap-4">
              <div className="h-14 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
              <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        {/* Icon */}
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
          <span className="text-2xl">{kpi.icon}</span>
        </div>

        {/* Title and Value */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("text-xs font-medium uppercase tracking-wider", CATEGORY_COLORS[kpi.category])}>
              {kpi.category}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            {kpi.title}
          </h1>

          <div className="flex items-end gap-3 md:gap-4">
            <div className="flex items-end gap-1">
              <NumberFlow
                value={value}
                className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100"
              />
              {kpi.suffix && (
                <span className="text-2xl md:text-3xl font-bold text-neutral-500 mb-1">
                  {kpi.suffix}
                </span>
              )}
            </div>

            {trend && (
              <div className="flex items-center gap-1.5 pb-1">
                {trend.isPositive ? (
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-lg font-semibold",
                    trend.isPositive ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {trend.isPositive ? "+" : ""}{trend.value.toFixed(1)}%
                </span>
                <span className="text-neutral-400 text-sm hidden sm:inline">vs last period</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
