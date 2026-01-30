"use client";

/**
 * KPIFunnel Component
 *
 * Visualizes funnel data with stages and drop-off rates.
 * Used for onboarding and customer journey funnels.
 */

import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { ChevronRight, TrendingDown } from "lucide-react";

interface FunnelStage {
  stage: string;
  stageName: string;
  count: number;
  percentage?: number;
  dropOffRate?: number;
  conversionRate?: number;
}

interface KPIFunnelProps {
  stages: FunnelStage[];
  isLoading?: boolean;
  className?: string;
}

export function KPIFunnel({ stages, isLoading, className }: KPIFunnelProps) {
  if (isLoading) {
    return <KPIFunnelSkeleton stageCount={stages.length || 5} />;
  }

  const maxCount = stages[0]?.count || 1;

  return (
    <div className={cn("space-y-2", className)}>
      {stages.map((stage, index) => {
        const widthPercent = Math.max(10, (stage.count / maxCount) * 100);
        const isLast = index === stages.length - 1;

        return (
          <div key={stage.stage} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {stage.stageName}
              </span>
              <div className="flex items-center gap-3">
                <NumberFlow
                  value={stage.count}
                  className="font-semibold text-neutral-900 dark:text-neutral-100"
                />
                {stage.percentage !== undefined && (
                  <span className="text-neutral-400 dark:text-neutral-500 text-xs w-12 text-right">
                    {stage.percentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-500 transition-all duration-500"
                style={{ width: `${widthPercent}%` }}
              />
            </div>

            {/* Drop-off indicator */}
            {!isLast && stage.dropOffRate !== undefined && stage.dropOffRate > 0 && (
              <div className="flex items-center justify-end gap-1 text-xs text-red-500 dark:text-red-400">
                <TrendingDown className="w-3 h-3" />
                <span>{stage.dropOffRate.toFixed(1)}% drop-off</span>
                <ChevronRight className="w-3 h-3 text-neutral-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function KPIFunnelSkeleton({ stageCount }: { stageCount: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: stageCount }).map((_, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
        </div>
      ))}
    </div>
  );
}
