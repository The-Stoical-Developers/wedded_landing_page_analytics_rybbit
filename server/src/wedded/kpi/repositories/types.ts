/**
 * Repository Types for Wedded KPIs
 *
 * Defines interfaces for all repository methods and response types.
 * Following the same patterns as wedded_analytics for consistency.
 */

// ========================================
// COMMON TYPES
// ========================================

export type Granularity = "day" | "week" | "month";

// ========================================
// USER ANALYTICS
// ========================================

export interface RegistrationDataPoint {
  date: string;
  count: number;
}

export interface GrowthDataPoint {
  date: string;
  totalUsers: number;
  newUsers: number;
  growthRate: number;
}

export interface GeographyDataPoint {
  countryCode: string;
  countryName: string;
  count: number;
  percentage: number;
}

export type AuthProvider = "google" | "apple" | "facebook" | "email";

export interface ProviderDataPoint {
  provider: AuthProvider;
  label: string;
  count: number;
  percentage: number;
}

export interface UserAnalyticsRepository {
  getRegistrations(
    startDate: Date,
    endDate: Date,
    granularity: Granularity
  ): Promise<RegistrationDataPoint[]>;
  getGrowth(startDate: Date, endDate: Date): Promise<GrowthDataPoint[]>;
  getGeography(startDate: Date, endDate: Date): Promise<GeographyDataPoint[]>;
  getRegistrationsByProvider(
    startDate: Date,
    endDate: Date
  ): Promise<ProviderDataPoint[]>;
  getTotalUsers(): Promise<number>;
  getWeddersList(params: WedderListParams): Promise<WedderListResult>;
}

// ========================================
// ONBOARDING ANALYTICS
// ========================================

export interface FunnelStage {
  stage: string;
  stageName: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface PhaseTimeAnalysis {
  phase: string;
  phaseName: string;
  avgDuration: number;
  medianDuration: number;
  p90Duration: number;
  sampleSize: number;
}

export interface TimeAnalysisResult {
  avgDuration: number;
  medianDuration: number;
  p90Duration: number;
  unit: string;
  sampleSize: number;
  byPhase: PhaseTimeAnalysis[];
}

export interface DropOffQuestion {
  questionId: string;
  dropOffCount: number;
  dropOffRate: number;
}

export interface DropOffsResult {
  topQuestions: DropOffQuestion[];
  totalDropOffs: number;
  totalStarted: number;
}

export interface OnboardingAnalyticsRepository {
  getFunnel(startDate: Date, endDate: Date): Promise<FunnelStage[]>;
  getTimeAnalysis(startDate: Date, endDate: Date): Promise<TimeAnalysisResult>;
  getDropOffs(startDate: Date, endDate: Date): Promise<DropOffsResult>;
}

// ========================================
// WEDDING ANALYTICS
// ========================================

export interface WeddingOverviewResult {
  totalWeddings: number;
  activeWeddings: number;
  archivedWeddings: number;
  withPartner: number;
  soloPlanning: number;
  partnerJoinRate: number;
  withCeremonyDateSet: number;
  withoutCeremonyDate: number;
  ceremonyDateSetRate: number;
  withCelebrationDateSet: number;
  withoutCelebrationDate: number;
  celebrationDateSetRate: number;
}

export interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
}

export interface VendorMetrics {
  totalVendors: number;
  savedVendors: number;
  contactedVendors: number;
  hiredVendors: number;
  conversionRate: number;
}

export interface WeddingEngagementResult {
  tasks: TaskMetrics;
  vendors: VendorMetrics;
  avgTasksPerWedding: number;
  avgVendorsPerWedding: number;
  weddingsWithTasks: number;
  weddingsWithVendors: number;
  vendorContactRate: number;
  fullyEngaged: number;
}

export interface WeddingTimelineResult {
  upcoming30Days: number;
  pastCeremony: number;
  sameDayEvents: number;
  multiDayEvents: number;
}

export interface WeddingMissionsResult {
  weddingsStarted: number;
  weddingsCompleted: number;
  ceremonyVenueBooked: number;
  celebrationVenueBooked: number;
}

export interface WeddingAnalyticsRepository {
  getOverview(startDate: Date, endDate: Date): Promise<WeddingOverviewResult>;
  getEngagement(
    startDate: Date,
    endDate: Date
  ): Promise<WeddingEngagementResult>;
  getTimeline(): Promise<WeddingTimelineResult>;
  getMissions(startDate: Date, endDate: Date): Promise<WeddingMissionsResult>;
}

// ========================================
// CHURN ANALYTICS
// ========================================

/**
 * Activity metrics based on last login time
 * - Active: 0-7 days
 * - At Risk: 7-14 days
 * - Churned Recent: 14-30 days
 * - Churned Dormant: 30+ days
 * - Never Logged: no last_sign_in_at
 */
export interface ChurnActivityResult {
  totalUsers: number;
  active: number;
  atRisk: number;
  churnedRecent: number;
  churnedDormant: number;
  neverLogged: number;
  // Rates
  activeRate: number;
  atRiskRate: number;
  churnRate: number; // (churnedRecent + churnedDormant) / total
  churnedRecentRate: number;
  churnedDormantRate: number;
  neverLoggedRate: number;
}

/**
 * Breakdown of churned users by journey stage where they abandoned
 */
export interface ChurnBreakdownResult {
  // Total churned (for reference)
  totalChurned: number;
  // By journey stage
  neverCreatedWedding: number;
  onboardingPhaseInfo: number;
  onboardingPhaseEngagement: number;
  onboardingPhaseCeremony: number;
  onboardingPhaseCelebration: number;
  onboardingPhaseGuests: number;
  postOnboarding: number; // completed onboarding but not tutorial
  postTutorial: number; // completed tutorial but churned after
  // Rates (percentage of total churned)
  neverCreatedWeddingRate: number;
  onboardingTotalRate: number; // all onboarding phases combined
  postOnboardingRate: number;
  postTutorialRate: number;
}

/**
 * Time-based churn metrics
 */
export interface ChurnTimeMetrics {
  avgDaysToChurn: number | null;
  medianDaysToChurn: number | null;
  minDaysToChurn: number | null;
  maxDaysToChurn: number | null;
}

/**
 * Combined churn KPI response
 */
export interface ChurnKPIResult {
  activity: ChurnActivityResult;
  breakdown: ChurnBreakdownResult;
  timeMetrics: ChurnTimeMetrics;
}

// Legacy types (kept for backwards compatibility during migration)
export interface ChurnOverviewResult {
  neverStarted: number;
  abandoned: number;
  completed: number;
  total: number;
  churnRate: number;
}

export interface StageChurn {
  stage: string;
  stageName: string;
  enteredCount: number;
  completedCount: number;
  churnedCount: number;
  churnRate: number;
}

export interface ChurnByStageResult {
  stages: StageChurn[];
  totalStarted: number;
  totalCompleted: number;
  overallChurnRate: number;
}

export interface UserActivityMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  dormantUsers: number;
  neverSignedIn: number;
  activeRate: number;
  dormantRate: number;
}

export interface ChurnAnalyticsRepository {
  // New methods
  getActivity(): Promise<ChurnActivityResult>;
  getBreakdown(): Promise<ChurnBreakdownResult>;
  getTimeMetrics(): Promise<ChurnTimeMetrics>;
  getChurnKPIs(): Promise<ChurnKPIResult>;
  // Legacy methods (deprecated)
  getOverview(startDate: Date, endDate: Date): Promise<ChurnOverviewResult>;
  getByStage(startDate: Date, endDate: Date): Promise<ChurnByStageResult>;
  getActivityMetrics(): Promise<UserActivityMetrics>;
}

// ========================================
// JOURNEY ANALYTICS
// ========================================

export interface JourneyStage {
  stage: string;
  stageName: string;
  count: number;
  percentage: number;
  dropOffCount: number;
  dropOffRate: number;
}

export interface JourneyFunnelResult {
  stages: JourneyStage[];
  totalUsers: number;
  fullyCompleted: number;
  overallCompletionRate: number;
}

export interface JourneyMilestone {
  milestone: string;
  milestoneName: string;
  completedCount: number;
  totalEligible: number;
  completionRate: number;
  avgDaysToComplete: number | null;
}

export interface JourneyMilestonesResult {
  milestones: JourneyMilestone[];
  totalWeddings: number;
}

export interface JourneyTimelinePoint {
  date: string;
  registrations: number;
  weddingsCreated: number;
  onboardingCompleted: number;
  tutorialCompleted: number;
}

export interface JourneyTimelineResult {
  data: JourneyTimelinePoint[];
  totals: {
    registrations: number;
    weddingsCreated: number;
    onboardingCompleted: number;
    tutorialCompleted: number;
  };
}

export interface JourneyAnalyticsRepository {
  getFunnel(startDate: Date, endDate: Date): Promise<JourneyFunnelResult>;
  getMilestones(
    startDate: Date,
    endDate: Date
  ): Promise<JourneyMilestonesResult>;
  getTimeline(startDate: Date, endDate: Date): Promise<JourneyTimelineResult>;
}

// ========================================
// DRILL-DOWN TYPES
// ========================================

export type OnboardingStatus = "not_started" | "in_progress" | "completed";

export type MissionStatus = "not_started" | "in_progress" | "completed";

export interface WeddingSummary {
  id: string;
  createdAt: string;
  weddingDate: string | null;
  archived: boolean;
  wedder1Id: string;
  wedder2Id: string | null;
  hasPartner: boolean;
  onboardingStatus: OnboardingStatus;
}

export interface WeddingListResult {
  weddings: WeddingSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WedderSummary {
  id: string;
  name: string | null;
  createdAt: string;
  countryCode: string | null;
  provider: string | null;
}

export interface VendorsByStatus {
  saved: number;
  contacted: number;
  hired: number;
  recommended: number;
  weddingPlanner: number;
}

export interface WeddingDetail {
  id: string;
  createdAt: string;
  weddingDate: string | null;
  archived: boolean;
  wedder1: WedderSummary | null;
  wedder2: WedderSummary | null;
  onboarding: {
    status: OnboardingStatus;
    completedPhases: string[];
    completedAt: string | null;
  };
  tasks: { total: number; completed: number };
  vendors: VendorsByStatus;
  missions: {
    ceremony: MissionStatus;
    celebration: MissionStatus;
    photography: MissionStatus;
  };
}

export interface WedderDetail {
  id: string;
  createdAt: string;
  countryCode: string | null;
  provider: string | null;
  weddings: WeddingSummary[];
}

export type DrillDownType = "dropoff" | "churn" | "journey";

export interface DrillDownParams {
  startDate: Date;
  endDate: Date;
  page: number;
  pageSize: number;
}

export interface DrillDownRepository {
  getWeddingsByDropOffQuestion(
    questionId: string,
    params: DrillDownParams
  ): Promise<WeddingListResult>;
  getWeddingsByChurnStage(
    stage: string,
    params: DrillDownParams
  ): Promise<WeddingListResult>;
  getWeddingsByJourneyStage(
    stage: string,
    params: DrillDownParams
  ): Promise<WeddingListResult>;
  getWeddingDetail(weddingId: string): Promise<WeddingDetail | null>;
  getWedderDetail(wedderId: string): Promise<WedderDetail | null>;
}

// ========================================
// WEDDER LIST TYPES
// ========================================

export interface WedderListItem {
  id: string;
  createdAt: string;
  countryCode: string | null;
  countryName: string | null;
  provider: string | null;
  providerLabel: string | null;
  weddingsCount: number;
}

export interface WedderListParams {
  page: number;
  pageSize: number;
  search?: string;
  provider?: string;
  countryCode?: string;
  sortBy?: "createdAt" | "weddingsCount";
  sortOrder?: "asc" | "desc";
}

export interface WedderListResult {
  wedders: WedderListItem[];
  total: number;
  page: number;
  pageSize: number;
}
