/**
 * Churn KPI Hooks
 *
 * React Query hooks for fetching churn analytics data.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchChurnOverview, DateRangeParams } from "../endpoints";

export const CHURN_KPI_QUERY_KEY = "kpi-churn";

/**
 * Hook to fetch churn overview KPIs
 */
export function useChurnKPIs(params?: DateRangeParams) {
  return useQuery({
    queryKey: [CHURN_KPI_QUERY_KEY, params],
    queryFn: () => fetchChurnOverview(params),
    staleTime: 1000 * 60 * 5,
  });
}
