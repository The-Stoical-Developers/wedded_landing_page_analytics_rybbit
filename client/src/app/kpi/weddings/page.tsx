"use client";

/**
 * Weddings KPI Page
 *
 * Wedding creation and engagement metrics.
 */

import { useState } from "react";
import {
  Heart,
  UserPlus,
  Calendar,
  CheckSquare,
  Store,
  Users,
} from "lucide-react";
import { useWeddingsKPIs } from "@/wedded/api/hooks";
import { KPICard, KPIGrid, KPISection } from "@/wedded/components";
import { KPIDateSelector } from "../components/KPIDateSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WeddingsKPIPage() {
  const [dateRange, setDateRange] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const { data, isLoading } = useWeddingsKPIs(dateRange);

  const handleDateChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Wedding Analytics
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Wedding creation and user engagement
          </p>
        </div>
        <KPIDateSelector onDateChange={handleDateChange} />
      </div>

      {/* Overview Cards */}
      <KPISection title="Wedding Overview" icon={<Heart className="w-4 h-4" />}>
        <KPIGrid columns={4}>
          <KPICard
            title="Total Weddings"
            value={data?.overview.totalWeddings ?? 0}
            icon={<Heart className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/weddings/total"
            tooltip="Total weddings created"
          />
          <KPICard
            title="Active Weddings"
            value={data?.overview.activeWeddings ?? 0}
            icon={<Heart className="w-5 h-5" />}
            isLoading={isLoading}
            tooltip="Non-archived weddings"
          />
          <KPICard
            title="Partner Join Rate"
            value={data?.overview.partnerJoinRate ?? 0}
            suffix="%"
            icon={<UserPlus className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/weddings/partner-join-rate"
            tooltip="Weddings with partner joined"
          />
          <KPICard
            title="Date Set Rate"
            value={data?.overview.dateSetRate ?? 0}
            suffix="%"
            icon={<Calendar className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/weddings/date-set-rate"
            tooltip="Weddings with date defined"
          />
        </KPIGrid>
      </KPISection>

      {/* Planning Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wedding Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="w-4 h-4" />
              Wedding Status
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
                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <StatusBar
                  label="With Partner"
                  value={data?.overview.withPartner ?? 0}
                  total={data?.overview.totalWeddings ?? 1}
                  color="emerald"
                />
                <StatusBar
                  label="Solo Planning"
                  value={data?.overview.soloPlanning ?? 0}
                  total={data?.overview.totalWeddings ?? 1}
                  color="amber"
                />
                <StatusBar
                  label="With Date"
                  value={data?.overview.withDateSet ?? 0}
                  total={data?.overview.totalWeddings ?? 1}
                  color="emerald"
                />
                <StatusBar
                  label="No Date Yet"
                  value={data?.overview.withoutDate ?? 0}
                  total={data?.overview.totalWeddings ?? 1}
                  color="neutral"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <MetricItem
                  icon={<CheckSquare className="w-4 h-4" />}
                  label="Avg Tasks/Wedding"
                  value={data?.engagement.avgTasksPerWedding ?? 0}
                />
                <MetricItem
                  icon={<Store className="w-4 h-4" />}
                  label="Avg Vendors/Wedding"
                  value={data?.engagement.avgVendorsPerWedding ?? 0}
                />
                <MetricItem
                  icon={<CheckSquare className="w-4 h-4" />}
                  label="Task Completion"
                  value={data?.engagement.tasks.taskCompletionRate ?? 0}
                  suffix="%"
                />
                <MetricItem
                  icon={<Store className="w-4 h-4" />}
                  label="Vendor Conversion"
                  value={data?.engagement.vendors.conversionRate ?? 0}
                  suffix="%"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task and Vendor Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckSquare className="w-4 h-4" />
              Task Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KPIGrid columns={2}>
              <KPICard
                title="Total Tasks"
                value={data?.engagement.tasks.totalTasks ?? 0}
                icon={<CheckSquare className="w-5 h-5" />}
                isLoading={isLoading}
              />
              <KPICard
                title="Completed"
                value={data?.engagement.tasks.completedTasks ?? 0}
                icon={<CheckSquare className="w-5 h-5" />}
                isLoading={isLoading}
              />
            </KPIGrid>
          </CardContent>
        </Card>

        {/* Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="w-4 h-4" />
              Vendor Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KPIGrid columns={2}>
              <KPICard
                title="Total Vendors"
                value={data?.engagement.vendors.totalVendors ?? 0}
                icon={<Store className="w-5 h-5" />}
                isLoading={isLoading}
              />
              <KPICard
                title="Hired"
                value={data?.engagement.vendors.hiredVendors ?? 0}
                icon={<Store className="w-5 h-5" />}
                isLoading={isLoading}
              />
            </KPIGrid>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: "emerald" | "amber" | "neutral";
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = {
    emerald: "bg-emerald-500 dark:bg-emerald-400",
    amber: "bg-amber-500 dark:bg-amber-400",
    neutral: "bg-neutral-400 dark:bg-neutral-500",
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {value}
        </span>
      </div>
      <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MetricItem({
  icon,
  label,
  value,
  suffix = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
      <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
        {value.toFixed(value % 1 === 0 ? 0 : 1)}
        {suffix}
      </span>
    </div>
  );
}
