"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { KPIDefinition } from "../../api/endpoints/types";

interface KPIBreadcrumbProps {
  kpi: KPIDefinition;
}

export function KPIBreadcrumb({ kpi }: KPIBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link
        href="/kpi"
        className="flex items-center gap-1 text-neutral-500 hover:text-emerald-500 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>KPIs</span>
      </Link>
      <ChevronRight className="w-4 h-4 text-neutral-400" />
      <Link
        href={`/kpi/${kpi.category}`}
        className="text-neutral-500 hover:text-emerald-500 transition-colors capitalize"
      >
        {kpi.category}
      </Link>
      <ChevronRight className="w-4 h-4 text-neutral-400" />
      <span className="text-neutral-900 dark:text-neutral-100 font-medium">
        {kpi.shortTitle || kpi.title}
      </span>
    </nav>
  );
}
