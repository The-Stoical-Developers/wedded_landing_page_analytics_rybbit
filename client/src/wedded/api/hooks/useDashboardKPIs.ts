/**
 * Dashboard KPI Hooks
 *
 * React Query hooks for fetching the combined dashboard overview.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardOverview, DateRangeParams } from "../endpoints";

export const DASHBOARD_KPI_QUERY_KEY = "kpi-dashboard";

/**
 * Hook to fetch combined dashboard KPIs
 */
export function useDashboardKPIs(params?: DateRangeParams) {
  return useQuery({
    queryKey: [DASHBOARD_KPI_QUERY_KEY, params],
    queryFn: () => fetchDashboardOverview(params),
    staleTime: 1000 * 60 * 5,
  });
}
