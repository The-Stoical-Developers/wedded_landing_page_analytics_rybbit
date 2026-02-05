"use client";

/**
 * Churn & Retention KPI Page
 *
 * 20 KPIs based on activity-based churn definition:
 * - Churn = users who haven't logged in for 14+ days
 * - Categories: Active (0-7d), At Risk (7-14d), Churned Recent (14-30d), Churned Dormant (30d+), Never Logged
 */

import {
  TrendingDown,
  TrendingUp,
  Zap,
  AlertTriangle,
  UserMinus,
  Moon,
  UserX,
  Percent,
  AlertCircle,
  Clock,
  HeartOff,
  Info,
  Heart,
  Church,
  PartyPopper,
  Users,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { useChurnKPIs } from "@/wedded/api/hooks";
import { KPICard, KPIGrid, KPISection } from "@/wedded/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChurnKPIPage() {
  const { data, isLoading } = useChurnKPIs();

  // Calculate total onboarding churn
  const onboardingTotalChurn =
    (data?.breakdown.onboardingPhaseInfo ?? 0) +
    (data?.breakdown.onboardingPhaseEngagement ?? 0) +
    (data?.breakdown.onboardingPhaseCeremony ?? 0) +
    (data?.breakdown.onboardingPhaseCelebration ?? 0) +
    (data?.breakdown.onboardingPhaseGuests ?? 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Churn & Retention
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          User retention analysis based on login activity. Churn = 14+ days without login.
        </p>
      </div>

      {/* Activity KPIs (5) */}
      <KPISection title="User Activity" icon={<Zap className="w-4 h-4" />}>
        <KPIGrid columns={5}>
          <KPICard
            title="Active Users"
            value={data?.activity.active ?? 0}
            icon={<Zap className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/active-users"
            tooltip="Logged in within 7 days"
            variant="success"
          />
          <KPICard
            title="At Risk Users"
            value={data?.activity.atRisk ?? 0}
            icon={<AlertTriangle className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/at-risk-users"
            tooltip="Last login 7-14 days ago"
            variant="warning"
          />
          <KPICard
            title="Churned Recent"
            value={data?.activity.churnedRecent ?? 0}
            icon={<UserMinus className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/churned-recent"
            tooltip="Last login 14-30 days ago"
            variant="danger"
          />
          <KPICard
            title="Churned Dormant"
            value={data?.activity.churnedDormant ?? 0}
            icon={<Moon className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/churned-dormant"
            tooltip="Last login 30+ days ago"
            variant="danger"
          />
          <KPICard
            title="Never Logged In"
            value={data?.activity.neverLogged ?? 0}
            icon={<UserX className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/never-logged"
            tooltip="Registered but never logged in"
          />
        </KPIGrid>
      </KPISection>

      {/* Rate KPIs (6) */}
      <KPISection title="Retention Rates" icon={<Percent className="w-4 h-4" />}>
        <KPIGrid columns={3}>
          <KPICard
            title="Churn Rate"
            value={data?.activity.churnRate ?? 0}
            suffix="%"
            icon={<TrendingDown className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/churn-rate"
            tooltip="% of users with 14+ days without login"
            variant="danger"
          />
          <KPICard
            title="Active Rate"
            value={data?.activity.activeRate ?? 0}
            suffix="%"
            icon={<TrendingUp className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/active-rate"
            tooltip="% of users active in last 7 days"
            variant="success"
          />
          <KPICard
            title="At Risk Rate"
            value={data?.activity.atRiskRate ?? 0}
            suffix="%"
            icon={<AlertCircle className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/at-risk-rate"
            tooltip="% of users at risk (7-14 days inactive)"
            variant="warning"
          />
        </KPIGrid>
        <KPIGrid columns={3}>
          <KPICard
            title="Churned Recent Rate"
            value={data?.activity.churnedRecentRate ?? 0}
            suffix="%"
            icon={<Percent className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/churned-recent-rate"
            tooltip="% of users churned recently (14-30 days)"
          />
          <KPICard
            title="Churned Dormant Rate"
            value={data?.activity.churnedDormantRate ?? 0}
            suffix="%"
            icon={<Percent className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/churned-dormant-rate"
            tooltip="% of users dormant (30+ days)"
          />
          <KPICard
            title="Never Logged Rate"
            value={data?.activity.neverLoggedRate ?? 0}
            suffix="%"
            icon={<Percent className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/never-logged-rate"
            tooltip="% of users who never logged in"
          />
        </KPIGrid>
      </KPISection>

      {/* Abandonment by Stage KPIs (9) */}
      <KPISection title="Churn by Journey Stage" icon={<HeartOff className="w-4 h-4" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingDown className="w-4 h-4" />
                Churn Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <BreakdownBar
                    label="Before Wedding"
                    value={data?.breakdown.neverCreatedWedding ?? 0}
                    total={data?.breakdown.totalChurned ?? 1}
                    color="neutral"
                  />
                  <BreakdownBar
                    label="In Onboarding"
                    value={onboardingTotalChurn}
                    total={data?.breakdown.totalChurned ?? 1}
                    color="amber"
                  />
                  <BreakdownBar
                    label="Post-Onboarding"
                    value={data?.breakdown.postOnboarding ?? 0}
                    total={data?.breakdown.totalChurned ?? 1}
                    color="orange"
                  />
                  <BreakdownBar
                    label="Post-Tutorial"
                    value={data?.breakdown.postTutorial ?? 0}
                    total={data?.breakdown.totalChurned ?? 1}
                    color="red"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Onboarding Phase Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4" />
                Onboarding Phase Churn
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <PhaseBar
                    label="Phase Info"
                    value={data?.breakdown.onboardingPhaseInfo ?? 0}
                    total={onboardingTotalChurn || 1}
                    icon={<Info className="w-3 h-3" />}
                  />
                  <PhaseBar
                    label="Phase Engagement"
                    value={data?.breakdown.onboardingPhaseEngagement ?? 0}
                    total={onboardingTotalChurn || 1}
                    icon={<Heart className="w-3 h-3" />}
                  />
                  <PhaseBar
                    label="Phase Ceremony"
                    value={data?.breakdown.onboardingPhaseCeremony ?? 0}
                    total={onboardingTotalChurn || 1}
                    icon={<Church className="w-3 h-3" />}
                  />
                  <PhaseBar
                    label="Phase Celebration"
                    value={data?.breakdown.onboardingPhaseCelebration ?? 0}
                    total={onboardingTotalChurn || 1}
                    icon={<PartyPopper className="w-3 h-3" />}
                  />
                  <PhaseBar
                    label="Phase Guests"
                    value={data?.breakdown.onboardingPhaseGuests ?? 0}
                    total={onboardingTotalChurn || 1}
                    icon={<Users className="w-3 h-3" />}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Individual Stage KPIs */}
        <KPIGrid columns={3}>
          <KPICard
            title="Churn Before Wedding"
            value={data?.breakdown.neverCreatedWedding ?? 0}
            icon={<HeartOff className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/churn-before-wedding"
            tooltip="Churned without creating a wedding"
          />
          <KPICard
            title="Churn Post-Onboarding"
            value={data?.breakdown.postOnboarding ?? 0}
            icon={<GraduationCap className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/churn-post-onboarding"
            tooltip="Completed onboarding but not tutorial"
          />
          <KPICard
            title="Churn Post-Tutorial"
            value={data?.breakdown.postTutorial ?? 0}
            icon={<BookOpen className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/churn-post-tutorial"
            tooltip="Completed tutorial but still churned"
          />
        </KPIGrid>
      </KPISection>

      {/* Time Metrics KPIs (2) */}
      <KPISection title="Time to Churn" icon={<Clock className="w-4 h-4" />}>
        <KPIGrid columns={2}>
          <KPICard
            title="Avg Days to Churn"
            value={data?.timeMetrics.avgDaysToChurn ?? "-"}
            suffix={data?.timeMetrics.avgDaysToChurn !== null ? " days" : ""}
            icon={<Clock className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/avg-days-to-churn"
            tooltip="Average days from registration to last login"
          />
          <KPICard
            title="Median Days to Churn"
            value={data?.timeMetrics.medianDaysToChurn ?? "-"}
            suffix={data?.timeMetrics.medianDaysToChurn !== null ? " days" : ""}
            icon={<Clock className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/churn/median-days-to-churn"
            tooltip="Median days from registration to last login"
          />
        </KPIGrid>
      </KPISection>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryItem label="Total Users" value={data?.activity.totalUsers ?? 0} />
            <SummaryItem
              label="Total Churned"
              value={data?.breakdown.totalChurned ?? 0}
              color="red"
            />
            <SummaryItem
              label="Churn Rate"
              value={`${(data?.activity.churnRate ?? 0).toFixed(1)}%`}
              color="red"
            />
            <SummaryItem
              label="Active Rate"
              value={`${(data?.activity.activeRate ?? 0).toFixed(1)}%`}
              color="emerald"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BreakdownBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: "neutral" | "amber" | "orange" | "red";
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = {
    neutral: "bg-neutral-400 dark:bg-neutral-500",
    amber: "bg-amber-500 dark:bg-amber-400",
    orange: "bg-orange-500 dark:bg-orange-400",
    red: "bg-red-500 dark:bg-red-400",
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
      <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function PhaseBar({
  label,
  value,
  total,
  icon,
}: {
  label: string;
  value: number;
  total: number;
  icon: React.ReactNode;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="text-neutral-400 dark:text-neutral-500">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {value}
          </span>
        </div>
        <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mt-0.5">
          <div
            className="h-full bg-amber-500 dark:bg-amber-400 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
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
