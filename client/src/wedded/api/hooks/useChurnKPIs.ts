/**
 * Churn KPI Hooks
 *
 * React Query hooks for fetching churn analytics data.
 * Uses new activity-based churn definition (14+ days = churned).
 */

import { useQuery } from "@tanstack/react-query";
import { fetchChurnKPIs, fetchChurnOverview, DateRangeParams } from "../endpoints";

export const CHURN_KPI_QUERY_KEY = "kpi-churn";

/**
 * Hook to fetch churn KPIs (new activity-based definition)
 */
export function useChurnKPIs() {
  return useQuery({
    queryKey: [CHURN_KPI_QUERY_KEY],
    queryFn: () => fetchChurnKPIs(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * @deprecated Use useChurnKPIs() instead
 * Hook to fetch legacy churn overview
 */
export function useChurnKPIsLegacy(params?: DateRangeParams) {
  return useQuery({
    queryKey: [CHURN_KPI_QUERY_KEY, "legacy", params],
    queryFn: () => fetchChurnOverview(params),
    staleTime: 1000 * 60 * 5,
  });
}
