/**
 * Drill-Down API Endpoints
 *
 * Pure async functions for fetching drill-down analytics data.
 */

import { authedFetch } from "../../../api/utils";
import {
  DrillDownParams,
  WeddingListResult,
  WeddingDetail,
  WedderDetail,
  WedderListParams,
  WedderListResult,
} from "./types";

/**
 * Fetch weddings that dropped off at a specific question
 */
export function fetchDropOffWeddings(
  questionId: string,
  params?: DrillDownParams
): Promise<WeddingListResult> {
  return authedFetch(`/kpi/drilldown/dropoffs/${questionId}/weddings`, params);
}

/**
 * Fetch weddings at a specific churn stage
 */
export function fetchChurnStageWeddings(
  stage: string,
  params?: DrillDownParams
): Promise<WeddingListResult> {
  return authedFetch(`/kpi/drilldown/churn/${stage}/weddings`, params);
}

/**
 * Fetch weddings at a specific journey stage
 */
export function fetchJourneyStageWeddings(
  stage: string,
  params?: DrillDownParams
): Promise<WeddingListResult> {
  return authedFetch(`/kpi/drilldown/journey/${stage}/weddings`, params);
}

/**
 * Fetch detailed information about a specific wedding
 */
export function fetchWeddingDetail(weddingId: string): Promise<WeddingDetail> {
  return authedFetch(`/kpi/weddings/${weddingId}`);
}

/**
 * Fetch detailed information about a specific wedder
 */
export function fetchWedderDetail(wedderId: string): Promise<WedderDetail> {
  return authedFetch(`/kpi/wedders/${wedderId}`);
}

/**
 * Fetch weddings for a specific KPI (by category and slug)
 */
export function fetchKPIWeddings(
  category: string,
  slug: string,
  params?: DrillDownParams
): Promise<WeddingListResult> {
  return authedFetch(`/kpi/${category}/${slug}/weddings`, params);
}

/**
 * Fetch paginated list of wedders (users)
 */
export function fetchWeddersList(
  params?: WedderListParams
): Promise<WedderListResult> {
  return authedFetch("/kpi/wedders", params);
}
