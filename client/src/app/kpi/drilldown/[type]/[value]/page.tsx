"use client";

/**
 * Drill-Down Page
 *
 * Shows a paginated list of weddings for a specific drill-down context
 * (drop-off question, churn stage, or journey stage).
 */

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, AlertCircle, TrendingDown, Map } from "lucide-react";
import {
  useDropOffWeddings,
  useChurnStageWeddings,
  useJourneyStageWeddings,
} from "@/wedded/api/hooks";
import { WeddingsTable } from "@/wedded/components";
import { KPIDateSelector } from "../../../components/KPIDateSelector";
import { DrillDownType } from "@/wedded/api/endpoints/types";

const TYPE_CONFIG: Record<
  DrillDownType,
  {
    title: string;
    icon: React.ElementType;
    breadcrumb: string;
    parentHref: string;
  }
> = {
  dropoff: {
    title: "Drop-off at",
    icon: AlertCircle,
    breadcrumb: "Onboarding > Drop-offs",
    parentHref: "/kpi/onboarding",
  },
  churn: {
    title: "Churn at",
    icon: TrendingDown,
    breadcrumb: "Churn > By Stage",
    parentHref: "/kpi/churn",
  },
  journey: {
    title: "Journey stage",
    icon: Map,
    breadcrumb: "Journey > Stages",
    parentHref: "/kpi/journey",
  },
};

export default function DrillDownPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const type = params.type as DrillDownType;
  const value = decodeURIComponent(params.value as string);

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
  });

  const queryParams = {
    ...dateRange,
    page,
    pageSize,
  };

  // Use the appropriate hook based on type
  const dropOffQuery = useDropOffWeddings(
    type === "dropoff" ? value : null,
    queryParams
  );
  const churnQuery = useChurnStageWeddings(
    type === "churn" ? value : null,
    queryParams
  );
  const journeyQuery = useJourneyStageWeddings(
    type === "journey" ? value : null,
    queryParams
  );

  const query =
    type === "dropoff"
      ? dropOffQuery
      : type === "churn"
        ? churnQuery
        : journeyQuery;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.dropoff;
  const Icon = config.icon;

  const handleDateChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Link
          href="/kpi"
          className="hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          KPIs
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href={config.parentHref}
          className="hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          {config.breadcrumb.split(" > ")[0]}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span>{config.breadcrumb.split(" > ")[1]}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-neutral-700 dark:text-neutral-300">
          {value}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {config.title} <code className="text-emerald-600">{value}</code>
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {query.data?.total ?? 0} weddings found
            </p>
          </div>
        </div>
        <KPIDateSelector onDateChange={handleDateChange} />
      </div>

      {/* Table */}
      <WeddingsTable
        weddings={query.data?.weddings ?? []}
        total={query.data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={query.isLoading}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
