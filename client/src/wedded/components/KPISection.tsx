"use client";

/**
 * KPISection Component
 *
 * A titled section for grouping KPI cards with optional description.
 */

import { cn } from "@/lib/utils";

interface KPISectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function KPISection({
  title,
  description,
  icon,
  children,
  className,
}: KPISectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {/* Section header */}
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {children}
    </section>
  );
}
