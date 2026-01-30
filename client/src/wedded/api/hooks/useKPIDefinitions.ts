/**
 * KPI Definitions Hooks
 *
 * React Query hooks for fetching KPI definitions.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchKPIDefinitions,
  fetchKPIDefinitionsByCategory,
  fetchKPIDefinition,
  KPICategory,
} from "../endpoints";

export const KPI_DEFINITIONS_QUERY_KEY = "kpi-definitions";

/**
 * Hook to fetch all KPI definitions
 */
export function useKPIDefinitions() {
  return useQuery({
    queryKey: [KPI_DEFINITIONS_QUERY_KEY],
    queryFn: fetchKPIDefinitions,
    staleTime: 1000 * 60 * 60, // 1 hour - definitions don't change often
  });
}

/**
 * Hook to fetch KPI definitions by category
 */
export function useKPIDefinitionsByCategory(category: KPICategory) {
  return useQuery({
    queryKey: [KPI_DEFINITIONS_QUERY_KEY, category],
    queryFn: () => fetchKPIDefinitionsByCategory(category),
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Hook to fetch a single KPI definition
 */
export function useKPIDefinition(category: KPICategory, slug: string) {
  return useQuery({
    queryKey: [KPI_DEFINITIONS_QUERY_KEY, category, slug],
    queryFn: () => fetchKPIDefinition(category, slug),
    staleTime: 1000 * 60 * 60,
    enabled: !!category && !!slug,
  });
}
