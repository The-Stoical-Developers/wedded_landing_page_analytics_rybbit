"use client";

/**
 * KPI Mobile Sidebar Navigation
 *
 * Horizontal scrollable navigation for mobile devices.
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
    label: "Journey",
    icon: Map,
  },
];

export function KPIMobileSidebar() {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <nav className="flex gap-2 pb-2">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
