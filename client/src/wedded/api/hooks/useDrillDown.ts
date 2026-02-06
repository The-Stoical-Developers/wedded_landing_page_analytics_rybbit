/**
 * Drill-Down Hooks
 *
 * React Query hooks for fetching drill-down analytics data.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchDropOffWeddings,
  fetchChurnStageWeddings,
  fetchJourneyStageWeddings,
  fetchWeddingDetail,
  fetchWedderDetail,
  fetchKPIWeddings,
  fetchWeddersList,
  DrillDownParams,
  WedderListParams,
} from "../endpoints";

export const DRILLDOWN_QUERY_KEY = "kpi-drilldown";
export const WEDDING_DETAIL_QUERY_KEY = "kpi-wedding-detail";
export const WEDDER_DETAIL_QUERY_KEY = "kpi-wedder-detail";

/**
 * Hook to fetch weddings that dropped off at a specific question
 */
export function useDropOffWeddings(
  questionId: string | null,
  params?: DrillDownParams
) {
  return useQuery({
    queryKey: [DRILLDOWN_QUERY_KEY, "dropoff", questionId, params],
    queryFn: () => fetchDropOffWeddings(questionId!, params),
    enabled: !!questionId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch weddings at a specific churn stage
 */
export function useChurnStageWeddings(
  stage: string | null,
  params?: DrillDownParams
) {
  return useQuery({
    queryKey: [DRILLDOWN_QUERY_KEY, "churn", stage, params],
    queryFn: () => fetchChurnStageWeddings(stage!, params),
    enabled: !!stage,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch weddings at a specific journey stage
 */
export function useJourneyStageWeddings(
  stage: string | null,
  params?: DrillDownParams
) {
  return useQuery({
    queryKey: [DRILLDOWN_QUERY_KEY, "journey", stage, params],
    queryFn: () => fetchJourneyStageWeddings(stage!, params),
    enabled: !!stage,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch detailed information about a specific wedding
 */
export function useWeddingDetail(weddingId: string | null) {
  return useQuery({
    queryKey: [WEDDING_DETAIL_QUERY_KEY, weddingId],
    queryFn: () => fetchWeddingDetail(weddingId!),
    enabled: !!weddingId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch detailed information about a specific wedder
 */
export function useWedderDetail(wedderId: string | null) {
  return useQuery({
    queryKey: [WEDDER_DETAIL_QUERY_KEY, wedderId],
    queryFn: () => fetchWedderDetail(wedderId!),
    enabled: !!wedderId,
    staleTime: 1000 * 60 * 5,
  });
}

export const KPI_WEDDINGS_QUERY_KEY = "kpi-weddings";

/**
 * Hook to fetch weddings for a specific KPI (by category and slug)
 */
export function useKPIWeddings(
  category: string | null,
  slug: string | null,
  params?: DrillDownParams
) {
  return useQuery({
    queryKey: [KPI_WEDDINGS_QUERY_KEY, category, slug, params],
    queryFn: () => fetchKPIWeddings(category!, slug!, params),
    enabled: !!category && !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export const WEDDERS_LIST_QUERY_KEY = "kpi-wedders-list";

/**
 * Hook to fetch paginated list of wedders (users)
 */
export function useWeddersList(params?: WedderListParams) {
  return useQuery({
    queryKey: [WEDDERS_LIST_QUERY_KEY, params],
    queryFn: () => fetchWeddersList(params),
    staleTime: 1000 * 60 * 5,
  });
}
