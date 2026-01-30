"use client";

import { BarChart2, Lightbulb } from "lucide-react";
import { KPIDefinition } from "../../api/endpoints/types";

interface KPIBusinessContextProps {
  kpi: KPIDefinition;
}

export function KPIBusinessContext({ kpi }: KPIBusinessContextProps) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">What is this?</h2>
      </div>

      <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-6">
        {kpi.businessDescription}
      </p>

      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Why it matters</h3>
        </div>
        <p className="text-neutral-500 dark:text-neutral-500 text-sm leading-relaxed">
          {kpi.businessImportance}
        </p>
      </div>
    </div>
  );
}
