/**
 * KPI API Types
 *
 * TypeScript interfaces for all KPI API responses.
 * Matches the backend service types.
 */

// ========================================
// KPI DEFINITIONS
// ========================================

export type KPICategory =
  | "users"
  | "onboarding"
  | "weddings"
  | "engagement"
  | "churn"
  | "journey";

export interface DataSourceTable {
  schema: string;
  table: string;
  columns: string[];
  description: string;
}

export interface KPIDefinition {
  slug: string;
  category: KPICategory;
  title: string;
  shortTitle?: string;
  icon: string;
  suffix?: string;
  isTimeSensitive: boolean;
  businessDescription: string;
  businessImportance: string;
  technicalDescription: string;
  formula: string;
  tables: DataSourceTable[];
  dataSource: {
    hook: string;
    valuePath: string;
    trendPath?: string;
  };
  relatedKPIs: string[];
  chartType?: "line" | "bar" | "funnel" | "none";
  chartDataPath?: string;
}

export interface KPIDefinitionsResponse {
  definitions: KPIDefinition[];
  categories: { id: KPICategory; label: string }[];
  totalCount: number;
}

export interface KPIDefinitionsByCategoryResponse {
  category: KPICategory;
  categoryLabel: string;
  definitions: KPIDefinition[];
  count: number;
}

// ========================================
// DATE RANGE PARAMS
// ========================================

export type Granularity = "day" | "week" | "month";

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  granularity?: Granularity;
}

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

export interface ProviderDataPoint {
  provider: string;
  label: string;
  count: number;
  percentage: number;
}

export interface UsersOverviewResponse {
  totalUsers: number;
  newUsers: number;
  countries: number;
  registrations: RegistrationDataPoint[];
  growth: GrowthDataPoint[];
  geography: GeographyDataPoint[];
  byProvider: ProviderDataPoint[];
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

export interface OnboardingOverviewResponse {
  funnel: FunnelStage[];
  timeAnalysis: TimeAnalysisResult;
  dropOffs: DropOffsResult;
  summary: {
    started: number;
    completed: number;
    completionRate: number;
  };
}

// ========================================
// WEDDING ANALYTICS
// ========================================

export interface WeddingOverview {
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

export interface WeddingEngagement {
  tasks: TaskMetrics;
  vendors: VendorMetrics;
  avgTasksPerWedding: number;
  avgVendorsPerWedding: number;
  weddingsWithTasks: number;
  weddingsWithVendors: number;
  vendorContactRate: number;
  fullyEngaged: number;
}

export interface WeddingTimeline {
  upcoming30Days: number;
  pastCeremony: number;
  sameDayEvents: number;
  multiDayEvents: number;
}

export interface WeddingMissions {
  weddingsStarted: number;
  weddingsCompleted: number;
  ceremonyVenueBooked: number;
  celebrationVenueBooked: number;
}

export interface WeddingsOverviewResponse {
  overview: WeddingOverview;
  engagement: WeddingEngagement;
  timeline: WeddingTimeline;
  missions: WeddingMissions;
}

// ========================================
// CHURN ANALYTICS (New activity-based definition)
// Churn = users who haven't logged in for 14+ days
// ========================================

/**
 * Activity metrics based on last login time
 * - Active: 0-7 days
 * - At Risk: 7-14 days
 * - Churned Recent: 14-30 days
 * - Churned Dormant: 30+ days
 * - Never Logged: no last_sign_in_at
 */
export interface ChurnActivity {
  totalUsers: number;
  active: number;
  atRisk: number;
  churnedRecent: number;
  churnedDormant: number;
  neverLogged: number;
  // Rates
  activeRate: number;
  atRiskRate: number;
  churnRate: number;
  churnedRecentRate: number;
  churnedDormantRate: number;
  neverLoggedRate: number;
}

/**
 * Breakdown of churned users by journey stage where they abandoned
 */
export interface ChurnBreakdown {
  totalChurned: number;
  neverCreatedWedding: number;
  onboardingPhaseInfo: number;
  onboardingPhaseEngagement: number;
  onboardingPhaseCeremony: number;
  onboardingPhaseCelebration: number;
  onboardingPhaseGuests: number;
  postOnboarding: number;
  postTutorial: number;
  // Rates
  neverCreatedWeddingRate: number;
  onboardingTotalRate: number;
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
 * New churn KPI response
 */
export interface ChurnKPIsResponse {
  activity: ChurnActivity;
  breakdown: ChurnBreakdown;
  timeMetrics: ChurnTimeMetrics;
}

// Legacy types (kept for backwards compatibility)
export interface ChurnOverview {
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

export interface ChurnByStage {
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

export interface ChurnOverviewResponse {
  overview: ChurnOverview;
  byStage: ChurnByStage;
  activity: UserActivityMetrics;
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

export interface JourneyFunnel {
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

export interface JourneyMilestones {
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

export interface JourneyTimeline {
  data: JourneyTimelinePoint[];
  totals: {
    registrations: number;
    weddingsCreated: number;
    onboardingCompleted: number;
    tutorialCompleted: number;
  };
}

export interface JourneyOverviewResponse {
  funnel: JourneyFunnel;
  milestones: JourneyMilestones;
  timeline: JourneyTimeline;
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

// ========================================
// ENTRY POINTS
// ========================================

export interface EntryPointQuestion {
  id: string;
  label: string;
  phase: "PHASE_CEREMONY" | "PHASE_CELEBRATION";
  bookedResponse: string;
}

export interface QuestionMetric {
  questionId: string;
  label: string;
  hasBooked: number;
  hasBookedRate: number;
  responses: Record<string, number>;
}

export interface CombinationMetric {
  combination: string[];
  count: number;
  percentage: number;
  label: string;
}

export interface EntryPointsData {
  totalWeddings: number;
  byQuestion: Record<string, QuestionMetric>;
  combinations: CombinationMetric[];
}

export interface EntryPointsResponse {
  data: EntryPointsData;
  availableQuestions: EntryPointQuestion[];
}

export interface CustomCombinationResult {
  selectedQuestions: string[];
  matchingWeddings: number;
  percentage: number;
  totalWeddings: number;
}

export interface CustomCombinationResponse {
  data: CustomCombinationResult;
}

// ========================================
// DRILL-DOWN TYPES
// ========================================

export type OnboardingStatus = "not_started" | "in_progress" | "completed";

export type MissionStatus = "not_started" | "in_progress" | "completed";

export type DrillDownType = "dropoff" | "churn" | "journey";

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

export interface DrillDownParams extends DateRangeParams {
  page?: number;
  pageSize?: number;
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
  page?: number;
  pageSize?: number;
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
