"use client";

/**
 * Dashboard Funnel Component
 *
 * Visual funnel chart for onboarding stages.
 */

import {
  User,
  Heart,
  Church,
  PartyPopper,
  Users,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FunnelStage {
  stage: string;
  stageName: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

interface DashboardFunnelProps {
  data: FunnelStage[];
  isLoading?: boolean;
  title?: string;
}

const stageIcons: Record<string, React.ReactNode> = {
  PHASE_INFO: <User className="w-4 h-4" />,
  PHASE_ENGAGEMENT: <Heart className="w-4 h-4" />,
  PHASE_CEREMONY: <Church className="w-4 h-4" />,
  PHASE_CELEBRATION: <PartyPopper className="w-4 h-4" />,
  PHASE_GUESTS: <Users className="w-4 h-4" />,
};

const stageColors = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

export function DashboardFunnel({
  data,
  isLoading,
  title = "Onboarding Funnel",
}: DashboardFunnelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-2">
            {[100, 85, 70, 55, 40].map((width, i) => (
              <div
                key={i}
                className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse"
                style={{ width: `${width}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = data.length > 0 ? data[0].count : 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {data.length > 0 ? data[data.length - 1].conversionRate : 0}%
              conversion
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-col items-center space-y-1">
          {data.map((stage, index) => {
            const widthPercent =
              maxCount > 0 ? Math.max(40, (stage.count / maxCount) * 100) : 40;
            const color = stageColors[index % stageColors.length];
            const isLast = index === data.length - 1;

            return (
              <div key={stage.stage} className="w-full flex flex-col items-center">
                {/* Stage bar */}
                <div
                  className={cn(
                    "relative h-12 flex items-center justify-between px-3 text-white transition-all duration-300",
                    color,
                    isLast ? "rounded-b-xl" : "rounded-lg"
                  )}
                  style={{
                    width: `${widthPercent}%`,
                    clipPath: isLast
                      ? "polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)"
                      : "polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)",
                  }}
                >
                  {/* Content */}
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      {stageIcons[stage.stage] || <User className="w-4 h-4" />}
                    </div>
                    <span className="font-medium text-xs truncate max-w-[80px] md:max-w-none">
                      {stage.stageName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      {stage.count.toLocaleString()}
                    </span>
                    <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded">
                      {stage.conversionRate}%
                    </span>
                  </div>
                </div>

                {/* Drop-off indicator */}
                {!isLast && stage.dropOffRate > 0 && (
                  <div className="h-6 flex items-center">
                    <div className="flex items-center gap-0.5 px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full">
                      <ChevronDown className="w-3 h-3 text-red-400" />
                      <span className="text-[10px] font-bold text-red-400">
                        -{stage.dropOffRate}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary footer */}
        {data.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase">
                    Started
                  </div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">
                    {data[0]?.count.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="text-xl">🎯</div>

              <div className="flex items-center gap-2">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase text-right">
                    Completed
                  </div>
                  <div className="font-bold text-emerald-500 text-right">
                    {data[data.length - 1]?.count.toLocaleString()}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                  <PartyPopper className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
