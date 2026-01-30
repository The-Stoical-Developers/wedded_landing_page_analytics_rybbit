/**
 * Onboarding KPI Hooks
 *
 * React Query hooks for fetching onboarding analytics data.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchOnboardingOverview, DateRangeParams } from "../endpoints";

export const ONBOARDING_KPI_QUERY_KEY = "kpi-onboarding";

/**
 * Hook to fetch onboarding overview KPIs
 */
export function useOnboardingKPIs(params?: DateRangeParams) {
  return useQuery({
    queryKey: [ONBOARDING_KPI_QUERY_KEY, params],
    queryFn: () => fetchOnboardingOverview(params),
    staleTime: 1000 * 60 * 5,
  });
}
