"use client";

/**
 * KPI Sidebar Navigation
 *
 * Desktop sidebar for navigating between KPI categories.
 * Churn section is expandable with sub-groups matching the churn page sections.
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  UserCheck,
  Heart,
  TrendingDown,
  Map,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Zap,
  Percent,
  HeartOff,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface ChurnSubGroup {
  label: string;
  icon: LucideIcon;
  items: { href: string; label: string }[];
}

const navItems: NavItem[] = [
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
    href: "/kpi/journey",
    label: "Customer Journey",
    icon: Map,
  },
];

const churnSubGroups: ChurnSubGroup[] = [
  {
    label: "User Activity",
    icon: Zap,
    items: [
      { href: "/kpi/churn/active-users", label: "Active Users" },
      { href: "/kpi/churn/at-risk-users", label: "At Risk Users" },
      { href: "/kpi/churn/churned-recent", label: "Churned Recent" },
      { href: "/kpi/churn/churned-dormant", label: "Churned Dormant" },
      { href: "/kpi/churn/never-logged", label: "Never Logged In" },
    ],
  },
  {
    label: "Retention Rates",
    icon: Percent,
    items: [
      { href: "/kpi/churn/churn-rate", label: "Churn Rate" },
      { href: "/kpi/churn/active-rate", label: "Active Rate" },
      { href: "/kpi/churn/at-risk-rate", label: "At Risk Rate" },
      { href: "/kpi/churn/churned-recent-rate", label: "Churned Recent Rate" },
      { href: "/kpi/churn/churned-dormant-rate", label: "Churned Dormant Rate" },
      { href: "/kpi/churn/never-logged-rate", label: "Never Logged Rate" },
    ],
  },
  {
    label: "Journey Stage",
    icon: HeartOff,
    items: [
      { href: "/kpi/churn/churn-before-wedding", label: "Before Wedding" },
      { href: "/kpi/churn/churn-post-onboarding", label: "Post-Onboarding" },
      { href: "/kpi/churn/churn-post-tutorial", label: "Post-Tutorial" },
    ],
  },
  {
    label: "Time Metrics",
    icon: Clock,
    items: [
      { href: "/kpi/churn/avg-days-to-churn", label: "Avg Days to Churn" },
      { href: "/kpi/churn/median-days-to-churn", label: "Median Days to Churn" },
    ],
  },
];

export function KPISidebar() {
  const pathname = usePathname();
  const isChurnSection = pathname.startsWith("/kpi/churn");
  const [churnExpanded, setChurnExpanded] = useState(isChurnSection);

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
        {/* Items before Churn */}
        {navItems.slice(0, 4).map((item) => {
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

        {/* Churn - Expandable */}
        <div>
          <div className="flex items-center">
            <Link
              href="/kpi/churn"
              className={cn(
                "flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isChurnSection
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
              )}
            >
              <TrendingDown className="w-5 h-5" />
              Churn
            </Link>
            <button
              onClick={() => setChurnExpanded((prev) => !prev)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isChurnSection
                  ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                  : "text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-300"
              )}
              aria-label={churnExpanded ? "Collapse churn sub-menu" : "Expand churn sub-menu"}
            >
              {churnExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Churn Sub-groups */}
          {churnExpanded && (
            <div className="mt-1 ml-3 pl-3 border-l border-neutral-200 dark:border-neutral-700 space-y-3 py-1">
              {churnSubGroups.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    <group.icon className="w-3.5 h-3.5" />
                    {group.label}
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {group.items.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "block px-2 py-1 rounded-md text-xs font-medium transition-colors",
                            isSubActive
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200"
                          )}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items after Churn */}
        {navItems.slice(4).map((item) => {
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
