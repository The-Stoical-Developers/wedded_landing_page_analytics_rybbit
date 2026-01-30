"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useKPIDefinition, useKPIDefinitions, useJourneyKPIs } from "@/wedded/api/hooks";
import {
  KPIBreadcrumb,
  KPIDetailHeader,
  KPIBusinessContext,
  KPITechnicalContext,
  KPIDataSources,
  KPIRelatedMetrics,
} from "@/wedded/components/kpi";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY = "journey";

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((current: unknown, key: string) => {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current) && /^\d+$/.test(key)) {
      return current[parseInt(key, 10)];
    }
    if (typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export default function KPIDetailPage({ params }: PageProps) {
  const { slug } = use(params);

  const { data: kpiData, isLoading: isLoadingKPI } = useKPIDefinition(CATEGORY, slug);
  const { data: allKPIsData } = useKPIDefinitions();
  const { data: categoryData, isLoading: isLoadingData } = useJourneyKPIs();

  if (isLoadingKPI) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-48 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!kpiData) {
    notFound();
  }

  const value = categoryData
    ? (getNestedValue(categoryData, kpiData.dataSource.valuePath) as number) ?? 0
    : 0;

  let trend: { value: number; isPositive: boolean } | undefined;
  if (kpiData.dataSource.trendPath && categoryData) {
    const trendValue = getNestedValue(categoryData, kpiData.dataSource.trendPath) as number | undefined;
    if (trendValue !== undefined) {
      trend = { value: Math.abs(trendValue), isPositive: trendValue >= 0 };
    }
  }

  const allKPIs = allKPIsData?.definitions || [];

  return (
    <div className="space-y-6">
      <KPIBreadcrumb kpi={kpiData} />
      <KPIDetailHeader kpi={kpiData} value={value} trend={trend} isLoading={isLoadingData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KPIBusinessContext kpi={kpiData} />
        <KPITechnicalContext kpi={kpiData} />
      </div>
      <KPIDataSources kpi={kpiData} />
      <KPIRelatedMetrics kpi={kpiData} allKPIs={allKPIs} />
    </div>
  );
}
