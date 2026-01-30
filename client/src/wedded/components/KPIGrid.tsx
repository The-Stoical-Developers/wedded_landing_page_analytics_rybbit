"use client";

/**
 * KPIGrid Component
 *
 * Responsive grid layout for KPI cards.
 * Matches the Rybbit pattern of 2 → 3 → 4 columns.
 */

import { cn } from "@/lib/utils";

interface KPIGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
}

export function KPIGrid({ children, className, columns = 4 }: KPIGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}
