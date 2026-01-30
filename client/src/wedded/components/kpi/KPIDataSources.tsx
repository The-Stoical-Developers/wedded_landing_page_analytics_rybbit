"use client";

import { Database, Table, Columns } from "lucide-react";
import { KPIDefinition } from "../../api/endpoints/types";

interface KPIDataSourcesProps {
  kpi: KPIDefinition;
}

export function KPIDataSources({ kpi }: KPIDataSourcesProps) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Data Sources</h2>
      </div>

      <div className="space-y-4">
        {kpi.tables.map((table) => (
          <div
            key={`${table.schema}.${table.table}`}
            className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Table className="w-4 h-4 text-emerald-500" />
              <code className="text-sm font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                {table.schema}.{table.table}
              </code>
            </div>

            <div className="flex items-start gap-2 mb-3 ml-6">
              <Columns className="w-3.5 h-3.5 text-neutral-400 mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {table.columns.map((column) => (
                  <span
                    key={column}
                    className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono rounded"
                  >
                    {column}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-neutral-500 text-xs leading-relaxed ml-6">
              {table.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
