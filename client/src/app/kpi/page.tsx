"use client";

/**
 * KPI Dashboard Page
 *
 * Main dashboard showing key metrics similar to original wedded_analytics.
 */

import { useState } from "react";
import {
  Users,
  TrendingUp,
  UserCheck,
  Heart,
} from "lucide-react";
import { useDashboardKPIs } from "@/wedded/api/hooks";
import {
  KPICard,
  KPIGrid,
  RegistrationsChart,
  DashboardFunnel,
  UserActivityCard,
} from "@/wedded/components";
import { KPIDateSelector } from "./components/KPIDateSelector";

export default function KPIDashboardPage() {
  const [dateRange, setDateRange] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const { data, isLoading } = useDashboardKPIs(dateRange);

  const handleDateChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  // Get growth rate (if available)
  const growthRate = data?.users.growth?.[data.users.growth.length - 1]?.growthRate ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Dashboard Overview
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time business metrics and KPIs
          </p>
        </div>
        <KPIDateSelector onDateChange={handleDateChange} />
      </div>

      {/* Top KPI Cards */}
      <KPIGrid columns={4}>
        <KPICard
          title="Total Users"
          value={data?.users.totalUsers ?? 0}
          icon={<Users className="w-5 h-5" />}
          trend={growthRate ? { value: growthRate, isPositive: growthRate > 0 } : undefined}
          isLoading={isLoading}
          href="/kpi/users/total-users"
          tooltip="Total number of registered users in the platform"
        />
        <KPICard
          title="New Users"
          value={data?.users.newUsers ?? 0}
          icon={<TrendingUp className="w-5 h-5" />}
          isLoading={isLoading}
          href="/kpi/users/new-users"
          tooltip="Number of users who registered in selected period"
        />
        <KPICard
          title="Onboarding Rate"
          value={data?.onboarding.summary.completionRate ?? 0}
          suffix="%"
          icon={<UserCheck className="w-5 h-5" />}
          isLoading={isLoading}
          href="/kpi/onboarding/completion-rate"
          tooltip="Percentage of users who completed onboarding"
        />
        <KPICard
          title="Active Weddings"
          value={data?.weddings.overview.activeWeddings ?? 0}
          icon={<Heart className="w-5 h-5" />}
          isLoading={isLoading}
          href="/kpi/weddings/active"
          tooltip="Non-archived weddings with recent activity"
        />
      </KPIGrid>

      {/* User Activity */}
      <UserActivityCard
        activeUsers={data?.churn.activity.activeUsers ?? 0}
        inactiveUsers={data?.churn.activity.inactiveUsers ?? 0}
        dormantUsers={data?.churn.activity.dormantUsers ?? 0}
        neverSignedIn={data?.churn.activity.neverSignedIn ?? 0}
        isLoading={isLoading}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RegistrationsChart
          data={data?.users.registrations ?? []}
          isLoading={isLoading}
        />
        <DashboardFunnel
          data={data?.onboarding.funnel ?? []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
