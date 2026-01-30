/**
 * Users KPI Hooks
 *
 * React Query hooks for fetching user analytics data.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchUsersOverview, DateRangeParams } from "../endpoints";

export const USERS_KPI_QUERY_KEY = "kpi-users";

/**
 * Hook to fetch users overview KPIs
 */
export function useUsersKPIs(params?: DateRangeParams) {
  return useQuery({
    queryKey: [USERS_KPI_QUERY_KEY, params],
    queryFn: () => fetchUsersOverview(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
