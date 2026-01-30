/**
 * KPI API Endpoints
 *
 * Pure async functions for fetching KPI data from the backend.
 * Uses authedFetch from the main API utils.
 */

import { authedFetch } from "../../../api/utils";
import {
  DateRangeParams,
  KPIDefinitionsResponse,
  KPIDefinitionsByCategoryResponse,
  KPIDefinition,
  KPICategory,
  UsersOverviewResponse,
  OnboardingOverviewResponse,
  WeddingsOverviewResponse,
  ChurnOverviewResponse,
  JourneyOverviewResponse,
  DashboardOverviewResponse,
  EntryPointsResponse,
  CustomCombinationResponse,
} from "./types";

// ========================================
// KPI DEFINITIONS
// ========================================

/**
 * Fetch all KPI definitions
 */
export function fetchKPIDefinitions(): Promise<KPIDefinitionsResponse> {
  return authedFetch("/kpi/definitions");
}

/**
 * Fetch KPI definitions by category
 */
export function fetchKPIDefinitionsByCategory(
  category: KPICategory
): Promise<KPIDefinitionsByCategoryResponse> {
  return authedFetch(`/kpi/definitions/${category}`);
}

/**
 * Fetch a single KPI definition
 */
export function fetchKPIDefinition(
  category: KPICategory,
  slug: string
): Promise<KPIDefinition> {
  return authedFetch(`/kpi/definitions/${category}/${slug}`);
}

// ========================================
// ANALYTICS DATA
// ========================================

/**
 * Fetch users overview
 */
export function fetchUsersOverview(
  params?: DateRangeParams
): Promise<UsersOverviewResponse> {
  return authedFetch("/kpi/users", params);
}

/**
 * Fetch onboarding overview
 */
export function fetchOnboardingOverview(
  params?: DateRangeParams
): Promise<OnboardingOverviewResponse> {
  return authedFetch("/kpi/onboarding", params);
}

/**
 * Fetch weddings overview
 */
export function fetchWeddingsOverview(
  params?: DateRangeParams
): Promise<WeddingsOverviewResponse> {
  return authedFetch("/kpi/weddings", params);
}

/**
 * Fetch churn overview
 */
export function fetchChurnOverview(
  params?: DateRangeParams
): Promise<ChurnOverviewResponse> {
  return authedFetch("/kpi/churn", params);
}

/**
 * Fetch journey overview
 */
export function fetchJourneyOverview(
  params?: DateRangeParams
): Promise<JourneyOverviewResponse> {
  return authedFetch("/kpi/journey", params);
}

/**
 * Fetch combined dashboard overview
 */
export function fetchDashboardOverview(
  params?: DateRangeParams
): Promise<DashboardOverviewResponse> {
  return authedFetch("/kpi/dashboard", params);
}

// ========================================
// ENTRY POINTS
// ========================================

export interface EntryPointsParams extends DateRangeParams {
  questionIds?: string;
}

/**
 * Fetch wedding entry points data
 */
export function fetchEntryPoints(
  params?: EntryPointsParams
): Promise<EntryPointsResponse> {
  return authedFetch("/kpi/entry-points", params);
}

/**
 * Fetch custom combination count
 */
export function fetchCustomCombination(
  params: EntryPointsParams & { questionIds: string }
): Promise<CustomCombinationResponse> {
  return authedFetch("/kpi/entry-points/combination", params);
}
