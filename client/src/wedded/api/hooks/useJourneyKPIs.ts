/**
 * Journey KPI Hooks
 *
 * React Query hooks for fetching customer journey analytics data.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchJourneyOverview, DateRangeParams } from "../endpoints";

export const JOURNEY_KPI_QUERY_KEY = "kpi-journey";

/**
 * Hook to fetch journey overview KPIs
 */
export function useJourneyKPIs(params?: DateRangeParams) {
  return useQuery({
    queryKey: [JOURNEY_KPI_QUERY_KEY, params],
    queryFn: () => fetchJourneyOverview(params),
    staleTime: 1000 * 60 * 5,
  });
}
