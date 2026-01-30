"use client";

/**
 * Churn KPI Page
 *
 * Churn analysis and user activity metrics.
 */

import { useState } from "react";
import { TrendingDown, Zap, Users, Moon, UserX, AlertTriangle } from "lucide-react";
import { useChurnKPIs } from "@/wedded/api/hooks";
import { KPICard, KPIGrid, KPISection, KPIFunnel } from "@/wedded/components";
import { KPIDateSelector } from "../components/KPIDateSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChurnKPIPage() {
  const [dateRange, setDateRange] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const { data, isLoading } = useChurnKPIs(dateRange);

  const handleDateChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Churn & Activity
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            User retention and engagement analysis
          </p>
        </div>
        <KPIDateSelector onDateChange={handleDateChange} />
      </div>

      {/* Churn Overview */}
      <KPISection title="Churn Overview" icon={<TrendingDown className="w-4 h-4" />}>
        <KPIGrid columns={4}>
          <KPICard
            title="Churn Rate"
            value={data?.overview.churnRate ?? 0}
            suffix="%"
            icon={<TrendingDown className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/churn-rate"
            tooltip="Users who abandoned onboarding"
          />
          <KPICard
            title="Never Started"
            value={data?.overview.neverStarted ?? 0}
            icon={<UserX className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/never-started"
            tooltip="Registered but never started onboarding"
          />
          <KPICard
            title="Abandoned"
            value={data?.overview.abandoned ?? 0}
            icon={<AlertTriangle className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/abandoned"
            tooltip="Started but didn't complete"
          />
          <KPICard
            title="Completed"
            value={data?.overview.completed ?? 0}
            icon={<Zap className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/completed"
            tooltip="Successfully completed onboarding"
          />
        </KPIGrid>
      </KPISection>

      {/* Activity Metrics */}
      <KPISection title="User Activity" icon={<Zap className="w-4 h-4" />}>
        <KPIGrid columns={4}>
          <KPICard
            title="Active Users"
            value={data?.activity.activeUsers ?? 0}
            icon={<Zap className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/active-users"
            tooltip="Signed in within 7 days"
          />
          <KPICard
            title="Inactive Users"
            value={data?.activity.inactiveUsers ?? 0}
            icon={<Users className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/inactive-users"
            tooltip="Signed in 7-30 days ago"
          />
          <KPICard
            title="Dormant Users"
            value={data?.activity.dormantUsers ?? 0}
            icon={<Moon className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/dormant-users"
            tooltip="No sign in for 30+ days"
          />
          <KPICard
            title="Never Signed In"
            value={data?.activity.neverSignedIn ?? 0}
            icon={<UserX className="w-5 h-5" />}
            isLoading={isLoading}
            tooltip="Registered but never logged in"
          />
        </KPIGrid>
      </KPISection>

      {/* Churn by Stage and Activity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn by Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="w-4 h-4" />
              Churn by Onboarding Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
                      <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    </div>
                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {data?.byStage.stages.map((stage) => (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {stage.stageName}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-500">
                          {stage.enteredCount} → {stage.completedCount}
                        </span>
                        <span className="text-red-500 font-medium">
                          -{stage.churnedCount} ({stage.churnRate.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 dark:bg-emerald-400"
                        style={{
                          width: `${(stage.completedCount / (stage.enteredCount || 1)) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-red-400 dark:bg-red-500"
                        style={{
                          width: `${(stage.churnedCount / (stage.enteredCount || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Activity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
                      <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    </div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <ActivityBar
                  label="Active (7 days)"
                  value={data?.activity.activeUsers ?? 0}
                  total={data?.activity.totalUsers ?? 1}
                  color="emerald"
                />
                <ActivityBar
                  label="Inactive (7-30 days)"
                  value={data?.activity.inactiveUsers ?? 0}
                  total={data?.activity.totalUsers ?? 1}
                  color="amber"
                />
                <ActivityBar
                  label="Dormant (30+ days)"
                  value={data?.activity.dormantUsers ?? 0}
                  total={data?.activity.totalUsers ?? 1}
                  color="red"
                />
                <ActivityBar
                  label="Never Signed In"
                  value={data?.activity.neverSignedIn ?? 0}
                  total={data?.activity.totalUsers ?? 1}
                  color="neutral"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryItem
              label="Total Users"
              value={data?.activity.totalUsers ?? 0}
            />
            <SummaryItem
              label="Active Rate"
              value={`${(data?.activity.activeRate ?? 0).toFixed(1)}%`}
              color="emerald"
            />
            <SummaryItem
              label="Dormant Rate"
              value={`${(data?.activity.dormantRate ?? 0).toFixed(1)}%`}
              color="red"
            />
            <SummaryItem
              label="Overall Churn"
              value={`${(data?.byStage.overallChurnRate ?? 0).toFixed(1)}%`}
              color="red"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: "emerald" | "amber" | "red" | "neutral";
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = {
    emerald: "bg-emerald-500 dark:bg-emerald-400",
    amber: "bg-amber-500 dark:bg-amber-400",
    red: "bg-red-500 dark:bg-red-400",
    neutral: "bg-neutral-400 dark:bg-neutral-500",
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {value}
          </span>
          <span className="text-xs text-neutral-400">
            ({percentage.toFixed(1)}%)
          </span>
        </div>
      </div>
      <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: "emerald" | "red";
}) {
  const colorClasses = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    red: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
      <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
        {label}
      </div>
      <div
        className={`text-xl font-bold ${color ? colorClasses[color] : "text-neutral-900 dark:text-neutral-100"}`}
      >
        {value}
      </div>
    </div>
  );
}
