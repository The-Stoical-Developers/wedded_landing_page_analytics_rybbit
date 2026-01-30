"use client";

import Link from "next/link";
import { Link2, ChevronRight } from "lucide-react";
import { KPIDefinition } from "../../api/endpoints/types";
import { cn } from "@/lib/utils";

interface KPIRelatedMetricsProps {
  kpi: KPIDefinition;
  allKPIs: KPIDefinition[];
}

const CATEGORY_COLORS: Record<string, string> = {
  users: "text-blue-500",
  onboarding: "text-emerald-500",
  weddings: "text-pink-500",
  churn: "text-red-500",
  journey: "text-purple-500",
};

export function KPIRelatedMetrics({ kpi, allKPIs }: KPIRelatedMetricsProps) {
  // Find related KPIs by slug
  const relatedKPIs = kpi.relatedKPIs
    .map(slug => allKPIs.find(k => k.slug === slug))
    .filter((k): k is KPIDefinition => k !== undefined);

  if (relatedKPIs.length === 0) {
    return null;
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Related Metrics</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {relatedKPIs.map((relatedKPI) => {
          const path = `/kpi/${relatedKPI.category}/${relatedKPI.slug}`;

          return (
            <Link
              key={path}
              href={path}
              className="block p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-transparent hover:border-emerald-500/30 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <span className="text-sm">{relatedKPI.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {relatedKPI.shortTitle || relatedKPI.title}
                    </p>
                    <p className={cn("text-xs capitalize", CATEGORY_COLORS[relatedKPI.category])}>
                      {relatedKPI.category}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:text-emerald-500 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
