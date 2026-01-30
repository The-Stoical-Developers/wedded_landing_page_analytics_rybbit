"use client";

/**
 * Journey KPI Page
 *
 * Customer journey funnel, milestones, and timeline.
 */

import { useState } from "react";
import {
  Map,
  Users,
  Trophy,
  Target,
  Calendar,
  Heart,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { useJourneyKPIs } from "@/wedded/api/hooks";
import { KPICard, KPIGrid, KPISection, KPIFunnel } from "@/wedded/components";
import { KPIDateSelector } from "../components/KPIDateSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JourneyKPIPage() {
  const [dateRange, setDateRange] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const { data, isLoading } = useJourneyKPIs(dateRange);

  const handleDateChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Customer Journey
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            End-to-end conversion and milestones
          </p>
        </div>
        <KPIDateSelector onDateChange={handleDateChange} />
      </div>

      {/* Journey Overview */}
      <KPISection title="Journey Overview" icon={<Map className="w-4 h-4" />}>
        <KPIGrid columns={4}>
          <KPICard
            title="Total Users"
            value={data?.funnel.totalUsers ?? 0}
            icon={<Users className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/journey/registered"
            tooltip="Users who registered on the platform"
          />
          <KPICard
            title="Fully Completed"
            value={data?.funnel.fullyCompleted ?? 0}
            icon={<Trophy className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/journey/photography-mission"
            tooltip="Users who completed the full journey"
          />
          <KPICard
            title="Completion Rate"
            value={data?.funnel.overallCompletionRate ?? 0}
            suffix="%"
            icon={<Target className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/journey/overall-completion"
            tooltip="End-to-end conversion rate"
          />
          <KPICard
            title="Active Weddings"
            value={data?.milestones.totalWeddings ?? 0}
            icon={<Heart className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/weddings/total"
            tooltip="Total weddings being planned"
          />
        </KPIGrid>
      </KPISection>

      {/* Journey Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-4 h-4" />
            Customer Journey Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <KPIFunnel stages={data?.funnel.stages || []} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4" />
            Journey Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  </div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {data?.milestones.milestones.map((milestone) => (
                <MilestoneBar
                  key={milestone.milestone}
                  icon={getMilestoneIcon(milestone.milestone)}
                  label={milestone.milestoneName}
                  completed={milestone.completedCount}
                  total={milestone.totalEligible}
                  rate={milestone.completionRate}
                  avgDays={milestone.avgDaysToComplete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Totals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" />
            Period Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryItem
                label="Registrations"
                value={data?.timeline.totals.registrations ?? 0}
                icon={<Users className="w-4 h-4" />}
              />
              <SummaryItem
                label="Weddings Created"
                value={data?.timeline.totals.weddingsCreated ?? 0}
                icon={<Heart className="w-4 h-4" />}
              />
              <SummaryItem
                label="Onboarding Done"
                value={data?.timeline.totals.onboardingCompleted ?? 0}
                icon={<UserCheck className="w-4 h-4" />}
              />
              <SummaryItem
                label="Tutorial Done"
                value={data?.timeline.totals.tutorialCompleted ?? 0}
                icon={<GraduationCap className="w-4 h-4" />}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getMilestoneIcon(milestone: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    registration: <Users className="w-4 h-4" />,
    wedding_created: <Heart className="w-4 h-4" />,
    onboarding_completed: <UserCheck className="w-4 h-4" />,
    partner_joined: <Users className="w-4 h-4" />,
    first_task: <Target className="w-4 h-4" />,
    tutorial_completed: <GraduationCap className="w-4 h-4" />,
  };
  return icons[milestone] || <Trophy className="w-4 h-4" />;
}

function MilestoneBar({
  icon,
  label,
  completed,
  total,
  rate,
  avgDays,
}: {
  icon: React.ReactNode;
  label: string;
  completed: number;
  total: number;
  rate: number;
  avgDays: number | null;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 dark:text-neutral-400">{icon}</span>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">
            {completed} / {total}
          </span>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 w-14 text-right">
            {rate.toFixed(1)}%
          </span>
          {avgDays !== null && (
            <span className="text-xs text-neutral-400 w-16 text-right">
              ~{avgDays.toFixed(0)}d avg
            </span>
          )}
        </div>
      </div>
      <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
      <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {value}
      </span>
    </div>
  );
}
