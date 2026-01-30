/**
 * Weddings KPI Hooks
 *
 * React Query hooks for fetching wedding analytics data.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchWeddingsOverview, DateRangeParams } from "../endpoints";

export const WEDDINGS_KPI_QUERY_KEY = "kpi-weddings";

/**
 * Hook to fetch weddings overview KPIs
 */
export function useWeddingsKPIs(params?: DateRangeParams) {
  return useQuery({
    queryKey: [WEDDINGS_KPI_QUERY_KEY, params],
    queryFn: () => fetchWeddingsOverview(params),
    staleTime: 1000 * 60 * 5,
  });
}
