"use client";

/**
 * Competitors Layout
 *
 * Layout for the Competitors section.
 * Simplified layout that doesn't depend on auth to avoid crashes when backend is unavailable.
 */

import { useEffect, Suspense } from "react";
import { useWindowSize } from "@uidotdev/usehooks";
import Link from "next/link";
import { HomeIcon, BookOpen, BarChart, Target } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

function SimpleSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between h-dvh p-2 py-3 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-850 gap-3 transition-all duration-100",
        isExpanded ? "w-44" : "w-[45px]"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col items-start gap-2">
        <SidebarLink
          href="/"
          icon={<HomeIcon className="w-5 h-5" />}
          label="Home"
          active={false}
          expanded={isExpanded}
        />
        <SidebarLink
          href="https://rybbit.com/docs"
          icon={<BookOpen className="w-5 h-5" />}
          label="Documentation"
          target="_blank"
          active={false}
          expanded={isExpanded}
        />
        <SidebarLink
          href="/kpi"
          icon={<BarChart className="w-5 h-5" />}
          label="Business KPIs"
          active={pathname.startsWith("/kpi")}
          expanded={isExpanded}
        />
        <SidebarLink
          href="/competitors"
          icon={<Target className="w-5 h-5" />}
          label="Competitors"
          active={pathname.startsWith("/competitors")}
          expanded={isExpanded}
        />
      </div>
    </div>
  );
}

function SidebarLink({
  active = false,
  href,
  icon,
  label,
  expanded = false,
  target,
}: {
  active?: boolean;
  href: string;
  icon?: React.ReactNode;
  label?: string;
  expanded?: boolean;
  target?: string;
}) {
  return (
    <Link href={href} className="focus:outline-none" target={target}>
      <div
        className={cn(
          "p-1 rounded-md transition-all duration-200 flex items-center gap-2",
          active
            ? "bg-neutral-150 dark:bg-neutral-800 text-neutral-800 dark:text-white"
            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-150 dark:hover:bg-neutral-800/80"
        )}
      >
        <div className="flex items-center justify-center w-5 h-5 shrink-0">{icon}</div>
        {expanded && label && (
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden w-[120px]">{label}</span>
        )}
      </div>
    </Link>
  );
}

import { useState } from "react";

export default function CompetitorsLayout({ children }: { children: React.ReactNode }) {
  // Set page title for Competitors section
  useEffect(() => {
    document.title = "Wedded Analytics | Competitive Analysis";
  }, []);

  const { width } = useWindowSize();

  if (width && width < 768) {
    return (
      <div className="h-full flex w-full">
        <main className="flex flex-col items-center px-4 py-4 w-full h-dvh overflow-y-auto">
          <div className="w-full max-w-6xl mt-4">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <SimpleSidebar />
      <main className="flex flex-col items-center px-4 py-4 w-full h-dvh overflow-y-auto">
        <div className="w-full max-w-6xl mt-4">{children}</div>
      </main>
    </div>
  );
}
