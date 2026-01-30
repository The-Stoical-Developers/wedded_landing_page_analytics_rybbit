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
  withDateSet: number;
  withoutDate: number;
  dateSetRate: number;
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
}

export interface WeddingAnalyticsRepository {
  getOverview(startDate: Date, endDate: Date): Promise<WeddingOverviewResult>;
  getEngagement(
    startDate: Date,
    endDate: Date
  ): Promise<WeddingEngagementResult>;
}

// ========================================
// CHURN ANALYTICS
// ========================================

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
