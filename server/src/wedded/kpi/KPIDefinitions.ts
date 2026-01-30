/**
 * KPI Definitions - Single Source of Truth
 *
 * This file contains all 39 KPI definitions including formulas and documentation.
 * The frontend fetches these from the backend to ensure consistency.
 *
 * Migrated from wedded_analytics for unified dashboard in Rybbit.
 */

export type KPICategory =
  | "users"
  | "onboarding"
  | "weddings"
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

export const CATEGORY_LABELS: Record<KPICategory, string> = {
  users: "Users",
  onboarding: "Onboarding",
  weddings: "Weddings",
  churn: "Churn",
  journey: "Customer Journey",
};

// ========================================
// KPI DEFINITIONS
// ========================================

export const KPI_DEFINITIONS: Record<string, KPIDefinition> = {
  // ========================================
  // USERS
  // ========================================
  "users/total-users": {
    slug: "total-users",
    category: "users",
    title: "Total Users",
    icon: "Users",
    isTimeSensitive: false,
    businessDescription:
      "The total number of registered users on the Wedded platform. This includes all users who have created an account, regardless of their onboarding status or activity level.",
    businessImportance:
      "This is the primary growth metric for the platform. It shows the overall reach and adoption of Wedded. Investors track this to understand market penetration and growth trajectory.",
    technicalDescription:
      "Counts all rows in the wedders table up to the selected end date. Each wedder represents a unique user account.",
    formula: `SELECT COUNT(*) FROM public.wedders WHERE created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "wedders",
        columns: ["id", "created_at"],
        description:
          "Main users table - each row represents one registered user account",
      },
    ],
    dataSource: {
      hook: "useUsersKPIs",
      valuePath: "totalUsers",
    },
    relatedKPIs: [
      "users/new-users",
      "users/countries",
      "onboarding/completion-rate",
    ],
  },

  "users/new-users": {
    slug: "new-users",
    category: "users",
    title: "New Users",
    icon: "UserPlus",
    suffix: "",
    isTimeSensitive: true,
    businessDescription:
      "The number of new user registrations within the selected time period.",
    businessImportance:
      "Shows acquisition velocity and marketing effectiveness. A healthy growth rate indicates successful user acquisition strategies.",
    technicalDescription: "Counts wedders created within the date range.",
    formula: `SELECT COUNT(*) FROM public.wedders
WHERE created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "wedders",
        columns: ["id", "created_at"],
        description: "Main users table",
      },
    ],
    dataSource: {
      hook: "useUsersKPIs",
      valuePath: "newUsers",
    },
    relatedKPIs: ["users/total-users", "users/avg-daily-registrations"],
    chartType: "line",
    chartDataPath: "data",
  },

  "users/countries": {
    slug: "countries",
    category: "users",
    title: "Countries",
    icon: "Globe",
    isTimeSensitive: true,
    businessDescription:
      "The number of unique countries where users have registered from.",
    businessImportance:
      "Indicates geographic reach and international expansion potential.",
    technicalDescription:
      "Counts distinct country codes from wedders in the date range.",
    formula: `SELECT COUNT(DISTINCT country_code) FROM public.wedders
WHERE country_code IS NOT NULL
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "wedders",
        columns: ["country_code", "created_at"],
        description: "Main users table with country information",
      },
    ],
    dataSource: {
      hook: "useUsersKPIs",
      valuePath: "countries",
    },
    relatedKPIs: ["users/total-users", "users/new-users"],
  },

  // ========================================
  // ONBOARDING
  // ========================================
  "onboarding/started": {
    slug: "started",
    category: "onboarding",
    title: "Started Onboarding",
    icon: "UserCheck",
    isTimeSensitive: true,
    businessDescription: "Users who began the onboarding process.",
    businessImportance: "Shows initial engagement after registration.",
    technicalDescription:
      "Counts onboarding sessions created in the date range.",
    formula: `SELECT COUNT(*) FROM public.onboarding_sessions
WHERE created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "onboarding_sessions",
        columns: ["id", "created_at"],
        description: "Tracks onboarding progress for each wedding",
      },
    ],
    dataSource: {
      hook: "useOnboardingKPIs",
      valuePath: "summary.started",
    },
    relatedKPIs: ["onboarding/completed", "onboarding/completion-rate"],
    chartType: "funnel",
    chartDataPath: "data",
  },

  "onboarding/completed": {
    slug: "completed",
    category: "onboarding",
    title: "Completed Onboarding",
    icon: "CheckCircle",
    isTimeSensitive: true,
    businessDescription:
      "Users who successfully finished all onboarding steps.",
    businessImportance:
      "Core activation metric - users who complete onboarding are more likely to become active.",
    technicalDescription:
      "Counts onboarding sessions with completed_at set in the date range.",
    formula: `SELECT COUNT(*) FROM public.onboarding_sessions
WHERE completed_at IS NOT NULL
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "onboarding_sessions",
        columns: ["id", "created_at", "completed_at"],
        description: "Tracks onboarding completion status",
      },
    ],
    dataSource: {
      hook: "useOnboardingKPIs",
      valuePath: "summary.completed",
    },
    relatedKPIs: [
      "onboarding/started",
      "onboarding/completion-rate",
      "churn/abandoned",
    ],
  },

  "onboarding/completion-rate": {
    slug: "completion-rate",
    category: "onboarding",
    title: "Completion Rate",
    icon: "Target",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription:
      "Percentage of users who complete the entire onboarding flow.",
    businessImportance:
      "Key conversion metric. Higher rates indicate a smooth, engaging onboarding experience.",
    technicalDescription:
      "Calculates completed sessions divided by total sessions started.",
    formula: `WITH sessions AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as completed
  FROM public.onboarding_sessions
  WHERE created_at >= :startDate AND created_at <= :endDate
)
SELECT ROUND(completed::numeric / NULLIF(total, 0) * 100, 2) as rate FROM sessions`,
    tables: [
      {
        schema: "public",
        table: "onboarding_sessions",
        columns: ["id", "created_at", "completed_at"],
        description: "Onboarding sessions with completion status",
      },
    ],
    dataSource: {
      hook: "useOnboardingKPIs",
      valuePath: "summary.completionRate",
    },
    relatedKPIs: [
      "onboarding/started",
      "onboarding/completed",
      "churn/churn-rate",
    ],
  },

  "onboarding/avg-time": {
    slug: "avg-time",
    category: "onboarding",
    title: "Avg. Completion Time",
    icon: "Clock",
    suffix: "s",
    isTimeSensitive: true,
    businessDescription: "Average time users take to complete onboarding.",
    businessImportance:
      "Indicates onboarding complexity. Shorter times suggest a streamlined experience.",
    technicalDescription:
      "Calculates average duration between session creation and completion.",
    formula: `SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_seconds
FROM public.onboarding_sessions
WHERE completed_at IS NOT NULL
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "onboarding_sessions",
        columns: ["created_at", "completed_at"],
        description: "Session timestamps for duration calculation",
      },
    ],
    dataSource: {
      hook: "useOnboardingKPIs",
      valuePath: "timeAnalysis.avgDuration",
    },
    relatedKPIs: ["onboarding/completion-rate", "onboarding/completed"],
  },

  // ========================================
  // WEDDINGS
  // ========================================
  "weddings/total": {
    slug: "total",
    category: "weddings",
    title: "Total Weddings",
    icon: "Heart",
    isTimeSensitive: true,
    businessDescription: "Total number of weddings created on the platform.",
    businessImportance:
      "Core business metric - each wedding represents potential revenue.",
    technicalDescription:
      "Counts all wedding records created in the date range.",
    formula: `SELECT COUNT(*) FROM public.weddings
WHERE created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "created_at"],
        description: "Main weddings table",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "overview.totalWeddings",
    },
    relatedKPIs: ["weddings/active", "weddings/partner-join-rate"],
  },

  "weddings/partner-join-rate": {
    slug: "partner-join-rate",
    category: "weddings",
    title: "Partner Join Rate",
    icon: "UserPlus",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription: "Percentage of weddings where a partner has joined.",
    businessImportance:
      "Higher rates indicate viral growth potential and stronger engagement.",
    technicalDescription:
      "Calculates weddings with wedder_2_id set divided by total weddings.",
    formula: `WITH wedding_stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE wedder_2_id IS NOT NULL) as with_partner
  FROM public.weddings
  WHERE created_at >= :startDate AND created_at <= :endDate
)
SELECT ROUND(with_partner::numeric / NULLIF(total, 0) * 100, 2) as rate FROM wedding_stats`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "wedder_2_id", "created_at"],
        description: "Weddings table with partner information",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "overview.partnerJoinRate",
    },
    relatedKPIs: ["weddings/total", "weddings/date-set-rate"],
  },

  "weddings/date-set-rate": {
    slug: "date-set-rate",
    category: "weddings",
    title: "Date Set Rate",
    icon: "Calendar",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription: "Percentage of weddings with a wedding date defined.",
    businessImportance:
      "Indicates planning commitment level and potential for premium features.",
    technicalDescription:
      "Calculates weddings with wedding_date set divided by total.",
    formula: `WITH wedding_stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE wedding_date IS NOT NULL) as with_date
  FROM public.weddings
  WHERE created_at >= :startDate AND created_at <= :endDate
)
SELECT ROUND(with_date::numeric / NULLIF(total, 0) * 100, 2) as rate FROM wedding_stats`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "wedding_date", "created_at"],
        description: "Weddings table with date information",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "overview.dateSetRate",
    },
    relatedKPIs: ["weddings/total", "weddings/partner-join-rate"],
  },

  // ========================================
  // CHURN
  // ========================================
  "churn/churn-rate": {
    slug: "churn-rate",
    category: "churn",
    title: "Churn Rate",
    icon: "TrendingDown",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription:
      "Percentage of users who started onboarding but abandoned before completion.",
    businessImportance:
      "Critical metric for understanding user drop-off. Lower is better - indicates a smooth onboarding experience.",
    technicalDescription:
      "Calculates abandoned sessions divided by total sessions started in the period. Abandoned = sessions without completed_at.",
    formula: `WITH session_stats AS (
  SELECT
    COUNT(*) FILTER (WHERE completed_at IS NULL) as abandoned,
    COUNT(*) as total_sessions
  FROM public.onboarding_sessions
  WHERE created_at >= :startDate AND created_at <= :endDate
)
SELECT ROUND(abandoned::numeric / NULLIF(total_sessions, 0) * 100, 2) as churn_rate
FROM session_stats`,
    tables: [
      {
        schema: "public",
        table: "onboarding_sessions",
        columns: ["id", "created_at", "completed_at"],
        description: "Onboarding sessions - null completed_at means abandoned",
      },
    ],
    dataSource: {
      hook: "useChurnKPIs",
      valuePath: "overview.churnRate",
    },
    relatedKPIs: [
      "churn/abandoned",
      "churn/completed",
      "onboarding/completion-rate",
    ],
  },

  "churn/abandoned": {
    slug: "abandoned",
    category: "churn",
    title: "Abandoned",
    icon: "UserMinus",
    isTimeSensitive: true,
    businessDescription:
      "Users who started onboarding but did not complete it.",
    businessImportance:
      "Shows where users are dropping off. Important for identifying friction points.",
    technicalDescription:
      "Counts onboarding sessions without a completed_at timestamp.",
    formula: `SELECT COUNT(*) FROM public.onboarding_sessions
WHERE completed_at IS NULL
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "onboarding_sessions",
        columns: ["id", "created_at", "completed_at"],
        description: "Sessions where completed_at IS NULL",
      },
    ],
    dataSource: {
      hook: "useChurnKPIs",
      valuePath: "overview.abandoned",
    },
    relatedKPIs: ["churn/churn-rate", "churn/completed", "onboarding/started"],
  },

  "churn/completed": {
    slug: "completed",
    category: "churn",
    title: "Completed",
    icon: "CheckCircle",
    isTimeSensitive: true,
    businessDescription:
      "Users who successfully completed the onboarding process.",
    businessImportance:
      "The inverse of churn - these are activated users likely to engage with the platform.",
    technicalDescription:
      "Counts onboarding sessions with a completed_at timestamp.",
    formula: `SELECT COUNT(*) FROM public.onboarding_sessions
WHERE completed_at IS NOT NULL
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "onboarding_sessions",
        columns: ["id", "created_at", "completed_at"],
        description: "Sessions where completed_at IS NOT NULL",
      },
    ],
    dataSource: {
      hook: "useChurnKPIs",
      valuePath: "overview.completed",
    },
    relatedKPIs: [
      "churn/churn-rate",
      "churn/abandoned",
      "onboarding/completed",
    ],
  },

  "churn/never-started": {
    slug: "never-started",
    category: "churn",
    title: "Never Started",
    icon: "UserX",
    isTimeSensitive: true,
    businessDescription:
      "Users who registered but never began onboarding.",
    businessImportance:
      "Identifies users lost before any engagement. May indicate registration friction.",
    technicalDescription:
      "Calculates users registered minus users who started onboarding.",
    formula: `WITH user_count AS (
  SELECT COUNT(*) as total FROM public.wedders
  WHERE created_at >= :startDate AND created_at <= :endDate
),
session_count AS (
  SELECT COUNT(*) as started FROM public.onboarding_sessions
  WHERE created_at >= :startDate AND created_at <= :endDate
)
SELECT GREATEST(0, total - started) as never_started
FROM user_count, session_count`,
    tables: [
      {
        schema: "public",
        table: "wedders",
        columns: ["id", "created_at"],
        description: "All registered users",
      },
      {
        schema: "public",
        table: "onboarding_sessions",
        columns: ["id", "created_at"],
        description: "Users who started onboarding",
      },
    ],
    dataSource: {
      hook: "useChurnKPIs",
      valuePath: "overview.neverStarted",
    },
    relatedKPIs: ["churn/churn-rate", "users/new-users"],
  },

  // Activity metrics
  "churn/active-users": {
    slug: "active-users",
    category: "churn",
    title: "Active Users",
    icon: "Zap",
    isTimeSensitive: false,
    businessDescription: "Users who signed in within the last 7 days.",
    businessImportance:
      "Core engagement metric showing current platform health.",
    technicalDescription:
      "Counts users from Supabase Auth where last_sign_in_at is within 7 days.",
    formula: `-- Via Supabase Auth Admin API
SELECT COUNT(*) FROM auth.users
WHERE last_sign_in_at >= NOW() - INTERVAL '7 days'`,
    tables: [
      {
        schema: "auth",
        table: "users",
        columns: ["id", "last_sign_in_at"],
        description: "Supabase Auth users table",
      },
    ],
    dataSource: {
      hook: "useChurnKPIs",
      valuePath: "activity.activeUsers",
    },
    relatedKPIs: ["churn/inactive-users", "churn/dormant-users"],
  },

  "churn/inactive-users": {
    slug: "inactive-users",
    category: "churn",
    title: "Inactive Users",
    icon: "Activity",
    isTimeSensitive: false,
    businessDescription: "Users who last signed in between 7-30 days ago.",
    businessImportance:
      "Early warning for potential churn. These users may need re-engagement.",
    technicalDescription:
      "Counts users with last_sign_in_at between 7 and 30 days ago.",
    formula: `-- Via Supabase Auth Admin API
SELECT COUNT(*) FROM auth.users
WHERE last_sign_in_at < NOW() - INTERVAL '7 days'
  AND last_sign_in_at >= NOW() - INTERVAL '30 days'`,
    tables: [
      {
        schema: "auth",
        table: "users",
        columns: ["id", "last_sign_in_at"],
        description: "Supabase Auth users table",
      },
    ],
    dataSource: {
      hook: "useChurnKPIs",
      valuePath: "activity.inactiveUsers",
    },
    relatedKPIs: ["churn/active-users", "churn/dormant-users"],
  },

  "churn/dormant-users": {
    slug: "dormant-users",
    category: "churn",
    title: "Dormant Users",
    icon: "Moon",
    isTimeSensitive: false,
    businessDescription:
      "Users who have not signed in for more than 30 days.",
    businessImportance:
      "These users are at high risk of permanent churn.",
    technicalDescription:
      "Counts users with last_sign_in_at more than 30 days ago.",
    formula: `-- Via Supabase Auth Admin API
SELECT COUNT(*) FROM auth.users
WHERE last_sign_in_at < NOW() - INTERVAL '30 days'`,
    tables: [
      {
        schema: "auth",
        table: "users",
        columns: ["id", "last_sign_in_at"],
        description: "Supabase Auth users table",
      },
    ],
    dataSource: {
      hook: "useChurnKPIs",
      valuePath: "activity.dormantUsers",
    },
    relatedKPIs: ["churn/active-users", "churn/inactive-users"],
  },

  // ========================================
  // CUSTOMER JOURNEY
  // ========================================
  "journey/registered": {
    slug: "registered",
    category: "journey",
    title: "Registered",
    icon: "UserPlus",
    isTimeSensitive: true,
    businessDescription:
      "Users who have created an account on the platform.",
    businessImportance:
      "The entry point of the customer journey. All other metrics derive from this base.",
    technicalDescription: "Counts users registered within the date range.",
    formula: `SELECT COUNT(*) FROM public.wedders
WHERE created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "wedders",
        columns: ["id", "created_at"],
        description: "User registration records",
      },
    ],
    dataSource: {
      hook: "useJourneyKPIs",
      valuePath: "funnel.totalUsers",
    },
    relatedKPIs: ["journey/wedding-created", "journey/onboarding-completed"],
    chartType: "funnel",
    chartDataPath: "stages",
  },

  "journey/wedding-created": {
    slug: "wedding-created",
    category: "journey",
    title: "Wedding Created",
    icon: "Heart",
    isTimeSensitive: true,
    businessDescription: "Users who created a wedding after registration.",
    businessImportance:
      "Shows intent to use the platform for wedding planning.",
    technicalDescription: "Counts weddings created within the date range.",
    formula: `SELECT COUNT(*) FROM public.weddings
WHERE created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "created_at"],
        description: "Wedding creation records",
      },
    ],
    dataSource: {
      hook: "useJourneyKPIs",
      valuePath: "funnel.stages.1.count",
    },
    relatedKPIs: ["journey/registered", "journey/onboarding-completed"],
  },

  "journey/onboarding-completed": {
    slug: "onboarding-completed",
    category: "journey",
    title: "Onboarding Completed",
    icon: "CheckCircle",
    isTimeSensitive: true,
    businessDescription:
      "Users who completed the entire onboarding flow.",
    businessImportance:
      "Key activation milestone - users ready to use all features.",
    technicalDescription:
      "Counts onboarding sessions with completed_at set.",
    formula: `SELECT COUNT(*) FROM public.onboarding_sessions
WHERE completed_at IS NOT NULL
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "onboarding_sessions",
        columns: ["id", "completed_at", "created_at"],
        description: "Onboarding session completion records",
      },
    ],
    dataSource: {
      hook: "useJourneyKPIs",
      valuePath: "funnel.stages.2.count",
    },
    relatedKPIs: ["journey/wedding-created", "journey/tutorial-completed"],
  },

  "journey/tutorial-completed": {
    slug: "tutorial-completed",
    category: "journey",
    title: "Tutorial Completed",
    icon: "GraduationCap",
    isTimeSensitive: true,
    businessDescription:
      "Users who engaged with the tutorial milestones.",
    businessImportance:
      "Shows deeper engagement with the platform features.",
    technicalDescription:
      "Counts unique weddings that answered any tutorial milestone question.",
    formula: `SELECT COUNT(DISTINCT wedding_id) FROM public.wedder_answers
WHERE question_id IN ('ceremony_venue_booked', 'venue_search_started', 'photographer_booked')
  AND answered_at >= :startDate AND answered_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "wedder_answers",
        columns: ["wedding_id", "question_id", "answered_at"],
        description: "User answers to tutorial questions",
      },
    ],
    dataSource: {
      hook: "useJourneyKPIs",
      valuePath: "funnel.stages.3.count",
    },
    relatedKPIs: ["journey/onboarding-completed", "journey/ceremony-mission"],
  },

  "journey/ceremony-mission": {
    slug: "ceremony-mission",
    category: "journey",
    title: "Ceremony Venue Mission",
    icon: "Church",
    isTimeSensitive: true,
    businessDescription:
      "Users who completed the ceremony venue selection mission.",
    businessImportance:
      "Critical planning milestone - ceremony is the core of any wedding.",
    technicalDescription: "Counts completed CEREMONY_VENUE missions.",
    formula: `SELECT COUNT(DISTINCT wedding_id) FROM public.missions
WHERE template_id = 'CEREMONY_VENUE'
  AND status = 'COMPLETED'
  AND updated_at >= :startDate AND updated_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "missions",
        columns: ["wedding_id", "template_id", "status", "updated_at"],
        description: "Mission completion records",
      },
    ],
    dataSource: {
      hook: "useJourneyKPIs",
      valuePath: "funnel.stages.4.count",
    },
    relatedKPIs: ["journey/tutorial-completed", "journey/celebration-mission"],
  },

  "journey/celebration-mission": {
    slug: "celebration-mission",
    category: "journey",
    title: "Celebration Venue Mission",
    icon: "PartyPopper",
    isTimeSensitive: true,
    businessDescription:
      "Users who completed the celebration/reception venue selection mission.",
    businessImportance:
      "Second major venue milestone - shows continued engagement.",
    technicalDescription: "Counts completed CELEBRATION_VENUE missions.",
    formula: `SELECT COUNT(DISTINCT wedding_id) FROM public.missions
WHERE template_id = 'CELEBRATION_VENUE'
  AND status = 'COMPLETED'
  AND updated_at >= :startDate AND updated_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "missions",
        columns: ["wedding_id", "template_id", "status", "updated_at"],
        description: "Mission completion records",
      },
    ],
    dataSource: {
      hook: "useJourneyKPIs",
      valuePath: "funnel.stages.5.count",
    },
    relatedKPIs: ["journey/ceremony-mission", "journey/photography-mission"],
  },

  "journey/photography-mission": {
    slug: "photography-mission",
    category: "journey",
    title: "Photography Mission",
    icon: "Camera",
    isTimeSensitive: true,
    businessDescription:
      "Users who completed the photographer hiring mission.",
    businessImportance:
      "Third major vendor milestone - highly engaged users.",
    technicalDescription: "Counts completed HIRE_PHOTOGRAPHER missions.",
    formula: `SELECT COUNT(DISTINCT wedding_id) FROM public.missions
WHERE template_id = 'HIRE_PHOTOGRAPHER'
  AND status = 'COMPLETED'
  AND updated_at >= :startDate AND updated_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "missions",
        columns: ["wedding_id", "template_id", "status", "updated_at"],
        description: "Mission completion records",
      },
    ],
    dataSource: {
      hook: "useJourneyKPIs",
      valuePath: "funnel.stages.6.count",
    },
    relatedKPIs: ["journey/celebration-mission", "journey/overall-completion"],
  },

  "journey/overall-completion": {
    slug: "overall-completion",
    category: "journey",
    title: "Journey Completion Rate",
    icon: "Trophy",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription:
      "Percentage of registered users who completed the full journey.",
    businessImportance:
      "Ultimate success metric - shows end-to-end conversion.",
    technicalDescription:
      "Calculates users who completed photography mission divided by registered users.",
    formula: `WITH registered AS (
  SELECT COUNT(*) as total FROM public.wedders
  WHERE created_at >= :startDate AND created_at <= :endDate
),
completed AS (
  SELECT COUNT(DISTINCT wedding_id) as total FROM public.missions
  WHERE template_id = 'HIRE_PHOTOGRAPHER'
    AND status = 'COMPLETED'
    AND updated_at >= :startDate AND updated_at <= :endDate
)
SELECT ROUND(completed.total::numeric / NULLIF(registered.total, 0) * 100, 2) as rate
FROM registered, completed`,
    tables: [
      {
        schema: "public",
        table: "wedders",
        columns: ["id", "created_at"],
        description: "Registered users",
      },
      {
        schema: "public",
        table: "missions",
        columns: ["wedding_id", "template_id", "status"],
        description: "Completed missions",
      },
    ],
    dataSource: {
      hook: "useJourneyKPIs",
      valuePath: "funnel.overallCompletionRate",
    },
    relatedKPIs: ["journey/registered", "journey/photography-mission"],
  },
};

// Helper functions
export function getKPIBySlug(
  category: KPICategory,
  slug: string
): KPIDefinition | undefined {
  return KPI_DEFINITIONS[`${category}/${slug}`];
}

export function getKPIsByCategory(category: KPICategory): KPIDefinition[] {
  return Object.values(KPI_DEFINITIONS).filter(
    (kpi) => kpi.category === category
  );
}

export function getAllKPIs(): KPIDefinition[] {
  return Object.values(KPI_DEFINITIONS);
}
