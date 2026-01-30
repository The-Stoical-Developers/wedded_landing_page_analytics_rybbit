"use client";

/**
 * KPI Dashboard Layout
 *
 * Main layout for the Business KPIs section.
 * Includes sidebar navigation between KPI categories.
 */

import { useEffect } from "react";
import { useWindowSize } from "@uidotdev/usehooks";
import { AppSidebar } from "../../components/AppSidebar";
import { StandardPage } from "../../components/StandardPage";
import { KPISidebar } from "./components/KPISidebar";
import { KPIMobileSidebar } from "./components/KPIMobileSidebar";

export default function KPILayout({ children }: { children: React.ReactNode }) {
  // Set page title for KPI section
  useEffect(() => {
    document.title = "Wedded Analytics | Investor Dashboard";
  }, []);
  const { width } = useWindowSize();

  if (width && width < 768) {
    return (
      <StandardPage showSidebar={false}>
        <KPIMobileSidebar />
        <div className="mt-4">{children}</div>
      </StandardPage>
    );
  }

  return (
    <div className="flex h-full">
      <AppSidebar />
      <KPISidebar />
      <StandardPage showSidebar={false}>
        <div className="flex-1 overflow-auto mt-4">{children}</div>
      </StandardPage>
    </div>
  );
}
