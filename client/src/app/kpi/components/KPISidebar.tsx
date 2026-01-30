"use client";

/**
 * KPI Sidebar Navigation
 *
 * Desktop sidebar for navigating between KPI categories.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  UserCheck,
  Heart,
  TrendingDown,
  Map,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/kpi",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/kpi/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/kpi/onboarding",
    label: "Onboarding",
    icon: UserCheck,
  },
  {
    href: "/kpi/weddings",
    label: "Weddings",
    icon: Heart,
  },
  {
    href: "/kpi/churn",
    label: "Churn",
    icon: TrendingDown,
  },
  {
    href: "/kpi/journey",
    label: "Customer Journey",
    icon: Map,
  },
];

export function KPISidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 py-6 px-4 hidden md:block min-h-screen">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Business KPIs
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Wedded Analytics
        </p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
