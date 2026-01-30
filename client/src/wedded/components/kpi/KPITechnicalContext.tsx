"use client";

import { Code2, Calculator } from "lucide-react";
import { KPIDefinition } from "../../api/endpoints/types";

interface KPITechnicalContextProps {
  kpi: KPIDefinition;
}

export function KPITechnicalContext({ kpi }: KPITechnicalContextProps) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Code2 className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">How it&apos;s calculated</h2>
      </div>

      <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-6">
        {kpi.technicalDescription}
      </p>

      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Formula</h3>
        </div>
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 overflow-x-auto">
          <code className="text-xs md:text-sm text-emerald-600 dark:text-emerald-400 font-mono whitespace-pre-wrap break-all">
            {kpi.formula}
          </code>
        </div>
      </div>
    </div>
  );
}
