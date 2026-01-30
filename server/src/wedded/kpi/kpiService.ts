/**
 * KPI Service
 *
 * Business layer for KPI data. Coordinates repositories and transforms
 * data into the format expected by the frontend.
 *
 * Designed for future MCP exposure - all methods are self-contained
 * and return JSON-serializable responses.
 */

import {
  KPI_DEFINITIONS,
  KPIDefinition,
  KPICategory,
  CATEGORY_LABELS,
  getAllKPIs,
  getKPIsByCategory,
  getKPIBySlug,
} from "./KPIDefinitions.js";

import {
  SupabaseUserAnalyticsRepository,
  SupabaseOnboardingAnalyticsRepository,
  SupabaseWeddingAnalyticsRepository,
  SupabaseChurnAnalyticsRepository,
  SupabaseJourneyAnalyticsRepository,
  Granularity,
} from "./repositories/index.js";

import {
  SupabaseWeddingEntryPointsRepository,
  EntryPointsResponse,
  CustomCombinationResult,
} from "./repositories/WeddingEntryPointsRepository.js";

// Singleton repositories
const userRepo = new SupabaseUserAnalyticsRepository();
const onboardingRepo = new SupabaseOnboardingAnalyticsRepository();
const weddingRepo = new SupabaseWeddingAnalyticsRepository();
const churnRepo = new SupabaseChurnAnalyticsRepository();
const journeyRepo = new SupabaseJourneyAnalyticsRepository();
const entryPointsRepo = new SupabaseWeddingEntryPointsRepository();

// ========================================
// KPI DEFINITIONS
// ========================================

export interface KPIDefinitionsResponse {
  definitions: KPIDefinition[];
  categories: { id: KPICategory; label: string }[];
  totalCount: number;
}

export function getKPIDefinitions(): KPIDefinitionsResponse {
  const definitions = getAllKPIs();
  const categories = (Object.keys(CATEGORY_LABELS) as KPICategory[]).map(
    (id) => ({
      id,
      label: CATEGORY_LABELS[id],
    })
  );

  return {
    definitions,
    categories,
    totalCount: definitions.length,
  };
}

export function getKPIDefinitionsByCategory(
  category: KPICategory
): KPIDefinition[] {
  return getKPIsByCategory(category);
}

export function getKPIDefinition(
  category: KPICategory,
  slug: string
): KPIDefinition | null {
  return getKPIBySlug(category, slug) || null;
}

// ========================================
// USER ANALYTICS
// ========================================

export interface UsersOverviewResponse {
  totalUsers: number;
  newUsers: number;
  countries: number;
  registrations: Array<{ date: string; count: number }>;
  growth: Array<{
    date: string;
    totalUsers: number;
    newUsers: number;
    growthRate: number;
  }>;
  geography: Array<{
    countryCode: string;
    countryName: string;
    count: number;
    percentage: number;
  }>;
  byProvider: Array<{
    provider: string;
    label: string;
    count: number;
    percentage: number;
  }>;
}

export async function getUsersOverview(
  startDate: Date,
  endDate: Date,
  granularity: Granularity = "day"
): Promise<UsersOverviewResponse> {
  const [totalUsers, registrations, growth, geography, byProvider] =
    await Promise.all([
      userRepo.getTotalUsers(),
      userRepo.getRegistrations(startDate, endDate, granularity),
      userRepo.getGrowth(startDate, endDate),
      userRepo.getGeography(startDate, endDate),
      userRepo.getRegistrationsByProvider(startDate, endDate),
    ]);

  const newUsers = registrations.reduce((sum, r) => sum + r.count, 0);
  const countries = geography.length;

  return {
    totalUsers,
    newUsers,
    countries,
    registrations,
    growth,
    geography,
    byProvider,
  };
}

// ========================================
// ONBOARDING ANALYTICS
// ========================================

export interface OnboardingOverviewResponse {
  funnel: Array<{
    stage: string;
    stageName: string;
    count: number;
    conversionRate: number;
    dropOffRate: number;
  }>;
  timeAnalysis: {
    avgDuration: number;
    medianDuration: number;
    p90Duration: number;
    unit: string;
    sampleSize: number;
    byPhase: Array<{
      phase: string;
      phaseName: string;
      avgDuration: number;
      medianDuration: number;
      p90Duration: number;
      sampleSize: number;
    }>;
  };
  dropOffs: {
    topQuestions: Array<{
      questionId: string;
      dropOffCount: number;
      dropOffRate: number;
    }>;
    totalDropOffs: number;
    totalStarted: number;
  };
  summary: {
    started: number;
    completed: number;
    completionRate: number;
  };
}

export async function getOnboardingOverview(
  startDate: Date,
  endDate: Date
): Promise<OnboardingOverviewResponse> {
  const [funnel, timeAnalysis, dropOffs] = await Promise.all([
    onboardingRepo.getFunnel(startDate, endDate),
    onboardingRepo.getTimeAnalysis(startDate, endDate),
    onboardingRepo.getDropOffs(startDate, endDate),
  ]);

  const started = funnel[0]?.count || 0;
  const completed = funnel[funnel.length - 1]?.count || 0;
  const completionRate =
    started > 0 ? Math.round((completed / started) * 10000) / 100 : 0;

  return {
    funnel,
    timeAnalysis,
    dropOffs,
    summary: {
      started,
      completed,
      completionRate,
    },
  };
}

// ========================================
// WEDDING ANALYTICS
// ========================================

export interface WeddingsOverviewResponse {
  overview: {
    totalWeddings: number;
    activeWeddings: number;
    archivedWeddings: number;
    withPartner: number;
    soloPlanning: number;
    partnerJoinRate: number;
    withDateSet: number;
    withoutDate: number;
    dateSetRate: number;
  };
  engagement: {
    tasks: {
      totalTasks: number;
      completedTasks: number;
      taskCompletionRate: number;
    };
    vendors: {
      totalVendors: number;
      savedVendors: number;
      contactedVendors: number;
      hiredVendors: number;
      conversionRate: number;
    };
    avgTasksPerWedding: number;
    avgVendorsPerWedding: number;
  };
}

export async function getWeddingsOverview(
  startDate: Date,
  endDate: Date
): Promise<WeddingsOverviewResponse> {
  const [overview, engagement] = await Promise.all([
    weddingRepo.getOverview(startDate, endDate),
    weddingRepo.getEngagement(startDate, endDate),
  ]);

  return {
    overview,
    engagement,
  };
}

// ========================================
// CHURN ANALYTICS
// ========================================

export interface ChurnOverviewResponse {
  overview: {
    neverStarted: number;
    abandoned: number;
    completed: number;
    total: number;
    churnRate: number;
  };
  byStage: {
    stages: Array<{
      stage: string;
      stageName: string;
      enteredCount: number;
      completedCount: number;
      churnedCount: number;
      churnRate: number;
    }>;
    totalStarted: number;
    totalCompleted: number;
    overallChurnRate: number;
  };
  activity: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    dormantUsers: number;
    neverSignedIn: number;
    activeRate: number;
    dormantRate: number;
  };
}

export async function getChurnOverview(
  startDate: Date,
  endDate: Date
): Promise<ChurnOverviewResponse> {
  const [overview, byStage, activity] = await Promise.all([
    churnRepo.getOverview(startDate, endDate),
    churnRepo.getByStage(startDate, endDate),
    churnRepo.getActivityMetrics(),
  ]);

  return {
    overview,
    byStage,
    activity,
  };
}

// ========================================
// JOURNEY ANALYTICS
// ========================================

export interface JourneyOverviewResponse {
  funnel: {
    stages: Array<{
      stage: string;
      stageName: string;
      count: number;
      percentage: number;
      dropOffCount: number;
      dropOffRate: number;
    }>;
    totalUsers: number;
    fullyCompleted: number;
    overallCompletionRate: number;
  };
  milestones: {
    milestones: Array<{
      milestone: string;
      milestoneName: string;
      completedCount: number;
      totalEligible: number;
      completionRate: number;
      avgDaysToComplete: number | null;
    }>;
    totalWeddings: number;
  };
  timeline: {
    data: Array<{
      date: string;
      registrations: number;
      weddingsCreated: number;
      onboardingCompleted: number;
      tutorialCompleted: number;
    }>;
    totals: {
      registrations: number;
      weddingsCreated: number;
      onboardingCompleted: number;
      tutorialCompleted: number;
    };
  };
}

export async function getJourneyOverview(
  startDate: Date,
  endDate: Date
): Promise<JourneyOverviewResponse> {
  const [funnel, milestones, timeline] = await Promise.all([
    journeyRepo.getFunnel(startDate, endDate),
    journeyRepo.getMilestones(startDate, endDate),
    journeyRepo.getTimeline(startDate, endDate),
  ]);

  return {
    funnel,
    milestones,
    timeline,
  };
}

// ========================================
// COMBINED DASHBOARD
// ========================================

export interface DashboardOverviewResponse {
  users: UsersOverviewResponse;
  onboarding: OnboardingOverviewResponse;
  weddings: WeddingsOverviewResponse;
  churn: ChurnOverviewResponse;
  journey: JourneyOverviewResponse;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export async function getDashboardOverview(
  startDate: Date,
  endDate: Date,
  granularity: Granularity = "day"
): Promise<DashboardOverviewResponse> {
  const [users, onboarding, weddings, churn, journey] = await Promise.all([
    getUsersOverview(startDate, endDate, granularity),
    getOnboardingOverview(startDate, endDate),
    getWeddingsOverview(startDate, endDate),
    getChurnOverview(startDate, endDate),
    getJourneyOverview(startDate, endDate),
  ]);

  return {
    users,
    onboarding,
    weddings,
    churn,
    journey,
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  };
}

// ========================================
// ENTRY POINTS ANALYTICS
// ========================================

export async function getEntryPoints(
  startDate: Date,
  endDate: Date,
  questionIds?: string[]
): Promise<EntryPointsResponse> {
  return entryPointsRepo.getEntryPoints(startDate, endDate, questionIds);
}

export async function getCustomCombination(
  startDate: Date,
  endDate: Date,
  questionIds: string[]
): Promise<CustomCombinationResult> {
  return entryPointsRepo.getCustomCombinationCount(startDate, endDate, questionIds);
}
