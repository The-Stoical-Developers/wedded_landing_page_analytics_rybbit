"use client";

/**
 * KPICard Component
 *
 * Displays a single KPI metric with value, optional trend, and tooltip.
 * Styled to match Rybbit's design system with dark mode support.
 */

import { TrendingUp, TrendingDown, Info } from "lucide-react";
import Link from "next/link";
import NumberFlow from "@number-flow/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  tooltip?: string;
  href?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  suffix = "",
  icon,
  trend,
  isLoading = false,
  tooltip,
  href,
  className,
}: KPICardProps) {
  if (isLoading) {
    return <KPICardSkeleton />;
  }

  const cardContent = (
    <div
      className={cn(
        "bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4",
        "hover:border-neutral-200 dark:hover:border-neutral-700 transition-all duration-200",
        href && "cursor-pointer",
        className
      )}
    >
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
            {title}
          </span>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <NumberFlow
          value={value}
          className="text-2xl font-bold text-neutral-900 dark:text-neutral-100"
          format={{
            notation: value > 100000 ? "compact" : "standard",
            maximumFractionDigits: value > 100000 ? 1 : 0,
          }}
        />
        {suffix && (
          <span className="text-lg font-semibold text-neutral-500 dark:text-neutral-400">
            {suffix}
          </span>
        )}
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {trend.isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-emerald-500" : "text-red-500"
            )}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value.toFixed(1)}%
          </span>
          <span className="text-neutral-400 dark:text-neutral-500 text-xs">
            vs last period
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}

/**
 * Loading skeleton for KPICard
 */
export function KPICardSkeleton() {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="w-9 h-9 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
      </div>
      <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
      <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
    </div>
  );
}
