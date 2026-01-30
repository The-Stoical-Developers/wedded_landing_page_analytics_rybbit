/**
 * Entry Points KPI Hooks
 *
 * React Query hooks for fetching wedding entry points data.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchEntryPoints,
  fetchCustomCombination,
  EntryPointsParams,
  DateRangeParams,
} from "../endpoints";

export const ENTRY_POINTS_QUERY_KEY = "kpi-entry-points";
export const CUSTOM_COMBINATION_QUERY_KEY = "kpi-custom-combination";

/**
 * Hook to fetch entry points data
 */
export function useEntryPoints(params?: EntryPointsParams) {
  return useQuery({
    queryKey: [ENTRY_POINTS_QUERY_KEY, params],
    queryFn: () => fetchEntryPoints(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch custom combination count
 */
export function useCustomCombination(
  params: (DateRangeParams & { questionIds: string }) | null
) {
  return useQuery({
    queryKey: [CUSTOM_COMBINATION_QUERY_KEY, params],
    queryFn: () =>
      params ? fetchCustomCombination(params) : Promise.resolve(null),
    enabled: !!params && !!params.questionIds,
    staleTime: 1000 * 60 * 5,
  });
}
