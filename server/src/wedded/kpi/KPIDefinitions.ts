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

export const CATEGORY_LABELS: Record<KPICategory, string> = {
  users: "Users",
  onboarding: "Onboarding",
  weddings: "Weddings",
  engagement: "Engagement",
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
    relatedKPIs: ["users/total-users", "users/countries"],
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
      "churn/churn-post-onboarding",
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

  "weddings/active": {
    slug: "active",
    category: "weddings",
    title: "Active Weddings",
    icon: "Heart",
    isTimeSensitive: true,
    businessDescription: "Number of weddings that are currently active (not archived).",
    businessImportance:
      "Shows the active user base currently planning their weddings.",
    technicalDescription:
      "Counts weddings where archived = false in the date range.",
    formula: `SELECT COUNT(*) FROM public.weddings
WHERE archived = false
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "archived", "created_at"],
        description: "Main weddings table with archived status",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "overview.activeWeddings",
    },
    relatedKPIs: ["weddings/total", "weddings/archived"],
  },

  "weddings/archived": {
    slug: "archived",
    category: "weddings",
    title: "Archived Weddings",
    icon: "Archive",
    isTimeSensitive: true,
    businessDescription: "Number of weddings that have been archived.",
    businessImportance:
      "Tracks weddings that are no longer actively being planned.",
    technicalDescription:
      "Counts weddings where archived = true in the date range.",
    formula: `SELECT COUNT(*) FROM public.weddings
WHERE archived = true
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "archived", "created_at"],
        description: "Main weddings table with archived status",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "overview.archivedWeddings",
    },
    relatedKPIs: ["weddings/total", "weddings/active"],
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
    relatedKPIs: ["weddings/total", "weddings/ceremony-date-set-rate"],
  },

  "weddings/ceremony-date-set-rate": {
    slug: "ceremony-date-set-rate",
    category: "weddings",
    title: "Ceremony Date Set Rate",
    icon: "Calendar",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription: "Percentage of weddings with a ceremony date defined.",
    businessImportance:
      "Indicates planning commitment level for the ceremony venue.",
    technicalDescription:
      "Calculates weddings with ceremony_date set divided by total.",
    formula: `WITH wedding_stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE ceremony_date IS NOT NULL) as with_date
  FROM public.weddings
  WHERE created_at >= :startDate AND created_at <= :endDate
)
SELECT ROUND(with_date::numeric / NULLIF(total, 0) * 100, 2) as rate FROM wedding_stats`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "ceremony_date", "created_at"],
        description: "Weddings table with ceremony date information",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "overview.ceremonyDateSetRate",
    },
    relatedKPIs: ["weddings/total", "weddings/celebration-date-set-rate"],
  },

  "weddings/celebration-date-set-rate": {
    slug: "celebration-date-set-rate",
    category: "weddings",
    title: "Celebration Date Set Rate",
    icon: "Calendar",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription: "Percentage of weddings with a celebration date defined.",
    businessImportance:
      "Indicates planning commitment level for the celebration venue.",
    technicalDescription:
      "Calculates weddings with celebration_date set divided by total.",
    formula: `WITH wedding_stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE celebration_date IS NOT NULL) as with_date
  FROM public.weddings
  WHERE created_at >= :startDate AND created_at <= :endDate
)
SELECT ROUND(with_date::numeric / NULLIF(total, 0) * 100, 2) as rate FROM wedding_stats`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "celebration_date", "created_at"],
        description: "Weddings table with celebration date information",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "overview.celebrationDateSetRate",
    },
    relatedKPIs: ["weddings/total", "weddings/ceremony-date-set-rate"],
  },

  // --- WEDDING ENGAGEMENT METRICS ---

  "weddings/with-tasks": {
    slug: "with-tasks",
    category: "weddings",
    title: "Weddings with Tasks",
    icon: "CheckSquare",
    isTimeSensitive: true,
    businessDescription: "Number of weddings that have created at least one task.",
    businessImportance:
      "Shows task feature adoption and active planning behavior.",
    technicalDescription:
      "Counts distinct weddings with at least one task in the tasks table.",
    formula: `SELECT COUNT(DISTINCT wedding_id) FROM public.tasks
WHERE deleted_at IS NULL
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "tasks",
        columns: ["wedding_id", "created_at", "deleted_at"],
        description: "Tasks created by wedding planners",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.weddingsWithTasks",
    },
    relatedKPIs: ["weddings/total", "weddings/task-completion-rate"],
  },

  "weddings/with-vendors": {
    slug: "with-vendors",
    category: "weddings",
    title: "Weddings with Vendors",
    icon: "Store",
    isTimeSensitive: true,
    businessDescription: "Number of weddings that have saved at least one vendor.",
    businessImportance:
      "Indicates vendor discovery feature adoption and marketplace engagement.",
    technicalDescription:
      "Counts distinct weddings with at least one vendor relationship.",
    formula: `SELECT COUNT(DISTINCT wedding_id) FROM public.retailers_in_weddings
WHERE deleted_at IS NULL
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "retailers_in_weddings",
        columns: ["wedding_id", "created_at", "deleted_at"],
        description: "Vendor-wedding relationships",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.weddingsWithVendors",
    },
    relatedKPIs: ["weddings/total", "weddings/vendor-hire-rate"],
  },

  "weddings/task-completion-rate": {
    slug: "task-completion-rate",
    category: "weddings",
    title: "Task Completion Rate",
    icon: "CheckCircle",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription: "Percentage of tasks that have been completed.",
    businessImportance:
      "Shows how actively users are using the task management feature.",
    technicalDescription:
      "Calculates completed tasks divided by total tasks.",
    formula: `WITH task_stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE completed = true) as completed
  FROM public.tasks
  WHERE deleted_at IS NULL
    AND created_at >= :startDate AND created_at <= :endDate
)
SELECT ROUND(completed::numeric / NULLIF(total, 0) * 100, 2) as rate FROM task_stats`,
    tables: [
      {
        schema: "public",
        table: "tasks",
        columns: ["completed", "created_at", "deleted_at"],
        description: "Tasks with completion status",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.tasks.taskCompletionRate",
    },
    relatedKPIs: ["weddings/with-tasks", "weddings/avg-tasks"],
  },

  "weddings/vendor-contact-rate": {
    slug: "vendor-contact-rate",
    category: "weddings",
    title: "Vendor Contact Rate",
    icon: "MessageSquare",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription: "Percentage of saved vendors that have been contacted.",
    businessImportance:
      "Shows how effectively users convert saved vendors into contacts.",
    technicalDescription:
      "Calculates contacted or hired vendors divided by total saved vendors.",
    formula: `WITH vendor_stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status IN ('CONTACTED', 'HIRED')) as contacted
  FROM public.retailers_in_weddings
  WHERE deleted_at IS NULL
    AND created_at >= :startDate AND created_at <= :endDate
)
SELECT ROUND(contacted::numeric / NULLIF(total, 0) * 100, 2) as rate FROM vendor_stats`,
    tables: [
      {
        schema: "public",
        table: "retailers_in_weddings",
        columns: ["status", "created_at", "deleted_at"],
        description: "Vendor relationships with status",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.vendorContactRate",
    },
    relatedKPIs: ["weddings/with-vendors", "weddings/vendor-hire-rate"],
  },

  "weddings/vendor-hire-rate": {
    slug: "vendor-hire-rate",
    category: "weddings",
    title: "Vendor Hire Rate",
    icon: "Briefcase",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription: "Percentage of vendors that have been hired.",
    businessImportance:
      "Key conversion metric showing vendor marketplace effectiveness.",
    technicalDescription:
      "Calculates hired vendors divided by total vendors.",
    formula: `WITH vendor_stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'HIRED') as hired
  FROM public.retailers_in_weddings
  WHERE deleted_at IS NULL
    AND created_at >= :startDate AND created_at <= :endDate
)
SELECT ROUND(hired::numeric / NULLIF(total, 0) * 100, 2) as rate FROM vendor_stats`,
    tables: [
      {
        schema: "public",
        table: "retailers_in_weddings",
        columns: ["status", "created_at", "deleted_at"],
        description: "Vendor relationships with hire status",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.vendors.conversionRate",
    },
    relatedKPIs: ["weddings/vendor-contact-rate", "weddings/avg-vendors"],
  },

  "weddings/avg-tasks": {
    slug: "avg-tasks",
    category: "weddings",
    title: "Avg Tasks per Wedding",
    icon: "ListTodo",
    isTimeSensitive: true,
    businessDescription: "Average number of tasks created per wedding.",
    businessImportance:
      "Shows depth of task feature engagement.",
    technicalDescription:
      "Calculates total tasks divided by total weddings.",
    formula: `WITH counts AS (
  SELECT
    (SELECT COUNT(*) FROM public.tasks WHERE deleted_at IS NULL AND created_at >= :startDate AND created_at <= :endDate) as tasks,
    (SELECT COUNT(*) FROM public.weddings WHERE created_at >= :startDate AND created_at <= :endDate) as weddings
)
SELECT ROUND(tasks::numeric / NULLIF(weddings, 0), 2) as avg FROM counts`,
    tables: [
      {
        schema: "public",
        table: "tasks",
        columns: ["wedding_id"],
        description: "Tasks table",
      },
      {
        schema: "public",
        table: "weddings",
        columns: ["id"],
        description: "Weddings table",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.avgTasksPerWedding",
    },
    relatedKPIs: ["weddings/with-tasks", "weddings/task-completion-rate"],
  },

  "weddings/avg-vendors": {
    slug: "avg-vendors",
    category: "weddings",
    title: "Avg Vendors per Wedding",
    icon: "Store",
    isTimeSensitive: true,
    businessDescription: "Average number of vendors saved per wedding.",
    businessImportance:
      "Shows depth of vendor marketplace engagement.",
    technicalDescription:
      "Calculates total vendor relationships divided by total weddings.",
    formula: `WITH counts AS (
  SELECT
    (SELECT COUNT(*) FROM public.retailers_in_weddings WHERE deleted_at IS NULL AND created_at >= :startDate AND created_at <= :endDate) as vendors,
    (SELECT COUNT(*) FROM public.weddings WHERE created_at >= :startDate AND created_at <= :endDate) as weddings
)
SELECT ROUND(vendors::numeric / NULLIF(weddings, 0), 2) as avg FROM counts`,
    tables: [
      {
        schema: "public",
        table: "retailers_in_weddings",
        columns: ["wedding_id"],
        description: "Vendor relationships",
      },
      {
        schema: "public",
        table: "weddings",
        columns: ["id"],
        description: "Weddings table",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.avgVendorsPerWedding",
    },
    relatedKPIs: ["weddings/with-vendors", "weddings/vendor-hire-rate"],
  },

  // --- WEDDING TIMELINE METRICS ---

  "weddings/upcoming-30-days": {
    slug: "upcoming-30-days",
    category: "weddings",
    title: "Upcoming Weddings (30 days)",
    icon: "CalendarDays",
    isTimeSensitive: false,
    businessDescription: "Weddings with ceremony date in the next 30 days.",
    businessImportance:
      "Critical for customer success - these users need the most support.",
    technicalDescription:
      "Counts weddings where ceremony_date is within next 30 days from today.",
    formula: `SELECT COUNT(*) FROM public.weddings
WHERE ceremony_date >= CURRENT_DATE
  AND ceremony_date <= CURRENT_DATE + INTERVAL '30 days'
  AND archived = false`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "ceremony_date", "archived"],
        description: "Weddings with upcoming ceremony dates",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "timeline.upcoming30Days",
    },
    relatedKPIs: ["weddings/past-ceremony", "weddings/ceremony-date-set-rate"],
  },

  "weddings/past-ceremony": {
    slug: "past-ceremony",
    category: "weddings",
    title: "Past Ceremony Date",
    icon: "History",
    isTimeSensitive: false,
    businessDescription: "Weddings where the ceremony date has already passed.",
    businessImportance:
      "Identifies weddings that may need post-wedding follow-up or archival.",
    technicalDescription:
      "Counts weddings where ceremony_date is before today.",
    formula: `SELECT COUNT(*) FROM public.weddings
WHERE ceremony_date < CURRENT_DATE
  AND ceremony_date IS NOT NULL`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "ceremony_date"],
        description: "Weddings with past ceremony dates",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "timeline.pastCeremony",
    },
    relatedKPIs: ["weddings/upcoming-30-days", "weddings/archived"],
  },

  // --- MISSION METRICS ---

  "weddings/missions-started": {
    slug: "missions-started",
    category: "weddings",
    title: "Weddings with Missions Started",
    icon: "Target",
    isTimeSensitive: true,
    businessDescription: "Weddings that have started at least one mission.",
    businessImportance:
      "Shows mission feature adoption and guided planning engagement.",
    technicalDescription:
      "Counts distinct weddings with at least one mission record.",
    formula: `SELECT COUNT(DISTINCT wedding_id) FROM public.missions
WHERE created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "missions",
        columns: ["wedding_id", "created_at"],
        description: "Mission records for weddings",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "missions.weddingsStarted",
    },
    relatedKPIs: ["weddings/missions-completed", "weddings/total"],
  },

  "weddings/missions-completed": {
    slug: "missions-completed",
    category: "weddings",
    title: "Weddings with Missions Completed",
    icon: "Trophy",
    isTimeSensitive: true,
    businessDescription: "Weddings that have completed at least one mission.",
    businessImportance:
      "Shows successful mission completion and deep feature engagement.",
    technicalDescription:
      "Counts distinct weddings with at least one completed mission.",
    formula: `SELECT COUNT(DISTINCT wedding_id) FROM public.missions
WHERE status = 'COMPLETED'
  AND updated_at >= :startDate AND updated_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "missions",
        columns: ["wedding_id", "status", "updated_at"],
        description: "Completed missions",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "missions.weddingsCompleted",
    },
    relatedKPIs: ["weddings/missions-started", "journey/ceremony-mission"],
  },

  "weddings/ceremony-venue-booked": {
    slug: "ceremony-venue-booked",
    category: "weddings",
    title: "Ceremony Venue Booked",
    icon: "Church",
    isTimeSensitive: true,
    businessDescription: "Weddings that have completed the ceremony venue mission.",
    businessImportance:
      "Key milestone - ceremony venue is the most important booking.",
    technicalDescription:
      "Counts weddings with CEREMONY_VENUE mission status = COMPLETED.",
    formula: `SELECT COUNT(DISTINCT wedding_id) FROM public.missions
WHERE template_id = 'CEREMONY_VENUE'
  AND status = 'COMPLETED'
  AND updated_at >= :startDate AND updated_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "missions",
        columns: ["wedding_id", "template_id", "status"],
        description: "Ceremony venue mission completions",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "missions.ceremonyVenueBooked",
    },
    relatedKPIs: ["weddings/celebration-venue-booked", "journey/ceremony-mission"],
  },

  "weddings/celebration-venue-booked": {
    slug: "celebration-venue-booked",
    category: "weddings",
    title: "Celebration Venue Booked",
    icon: "PartyPopper",
    isTimeSensitive: true,
    businessDescription: "Weddings that have completed the celebration venue mission.",
    businessImportance:
      "Second key milestone - celebration venue booking shows commitment.",
    technicalDescription:
      "Counts weddings with CELEBRATION_VENUE mission status = COMPLETED.",
    formula: `SELECT COUNT(DISTINCT wedding_id) FROM public.missions
WHERE template_id = 'CELEBRATION_VENUE'
  AND status = 'COMPLETED'
  AND updated_at >= :startDate AND updated_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "missions",
        columns: ["wedding_id", "template_id", "status"],
        description: "Celebration venue mission completions",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "missions.celebrationVenueBooked",
    },
    relatedKPIs: ["weddings/ceremony-venue-booked", "journey/celebration-mission"],
  },

  // --- COMPOSITE ENGAGEMENT METRICS ---

  "weddings/fully-engaged": {
    slug: "fully-engaged",
    category: "weddings",
    title: "Fully Engaged Weddings",
    icon: "Sparkles",
    isTimeSensitive: true,
    businessDescription: "Weddings using tasks, vendors, AND completed onboarding.",
    businessImportance:
      "Ultimate engagement metric - shows power users who leverage all features.",
    technicalDescription:
      "Counts weddings with completed onboarding, at least one task, and at least one vendor.",
    formula: `SELECT COUNT(DISTINCT w.id)
FROM public.weddings w
JOIN public.onboarding_sessions os ON os.wedding_id = w.id AND os.completed_at IS NOT NULL
WHERE w.id IN (SELECT DISTINCT wedding_id FROM public.tasks WHERE deleted_at IS NULL)
  AND w.id IN (SELECT DISTINCT wedding_id FROM public.retailers_in_weddings WHERE deleted_at IS NULL)
  AND w.created_at >= :startDate AND w.created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "created_at"],
        description: "Base weddings",
      },
      {
        schema: "public",
        table: "onboarding_sessions",
        columns: ["wedding_id", "completed_at"],
        description: "Onboarding completion",
      },
      {
        schema: "public",
        table: "tasks",
        columns: ["wedding_id"],
        description: "Task creation",
      },
      {
        schema: "public",
        table: "retailers_in_weddings",
        columns: ["wedding_id"],
        description: "Vendor relationships",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.fullyEngaged",
    },
    relatedKPIs: ["weddings/with-tasks", "weddings/with-vendors", "onboarding/completed"],
  },

  "weddings/same-day-events": {
    slug: "same-day-events",
    category: "weddings",
    title: "Same-Day Ceremony & Celebration",
    icon: "CalendarCheck",
    isTimeSensitive: true,
    businessDescription: "Weddings where ceremony and celebration happen on the same day.",
    businessImportance:
      "Helps understand wedding format preferences for product features.",
    technicalDescription:
      "Counts weddings where ceremony_date equals celebration_date.",
    formula: `SELECT COUNT(*) FROM public.weddings
WHERE ceremony_date IS NOT NULL
  AND celebration_date IS NOT NULL
  AND ceremony_date = celebration_date
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["ceremony_date", "celebration_date", "created_at"],
        description: "Weddings with both dates",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "timeline.sameDayEvents",
    },
    relatedKPIs: ["weddings/multi-day-events", "weddings/ceremony-date-set-rate"],
  },

  "weddings/multi-day-events": {
    slug: "multi-day-events",
    category: "weddings",
    title: "Multi-Day Weddings",
    icon: "CalendarRange",
    isTimeSensitive: true,
    businessDescription: "Weddings where ceremony and celebration are on different days.",
    businessImportance:
      "Identifies complex weddings that may need additional planning support.",
    technicalDescription:
      "Counts weddings where ceremony_date differs from celebration_date.",
    formula: `SELECT COUNT(*) FROM public.weddings
WHERE ceremony_date IS NOT NULL
  AND celebration_date IS NOT NULL
  AND ceremony_date != celebration_date
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["ceremony_date", "celebration_date", "created_at"],
        description: "Weddings with different dates",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "timeline.multiDayEvents",
    },
    relatedKPIs: ["weddings/same-day-events", "weddings/celebration-date-set-rate"],
  },

  // ========================================
  // CHURN & RETENTION (20 KPIs)
  // New definition: Churn = users who haven't logged in for 14+ days
  // Categories:
  // - Active: 0-7 days since last login
  // - At Risk: 7-14 days
  // - Churned Recent: 14-30 days
  // - Churned Dormant: 30+ days
  // - Never Logged: no last_sign_in_at
  // ========================================

  // === ACTIVITY KPIs (5) ===
  "churn/active-users": {
    slug: "active-users",
    category: "churn",
    title: "Active Users",
    icon: "Zap",
    isTimeSensitive: false,
    businessDescription: "Users who signed in within the last 7 days.",
    businessImportance:
      "Core engagement metric showing current platform health and user retention.",
    technicalDescription:
      "Counts users from Supabase Auth where last_sign_in_at is within 7 days of now.",
    formula: `SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at >= NOW() - INTERVAL '7 days'`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "last_sign_in_at"], description: "Supabase Auth users" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "activity.active" },
    relatedKPIs: ["churn/at-risk-users", "churn/churn-rate", "churn/active-rate"],
  },

  "churn/at-risk-users": {
    slug: "at-risk-users",
    category: "churn",
    title: "At Risk Users",
    icon: "AlertTriangle",
    isTimeSensitive: false,
    businessDescription: "Users who last signed in between 7-14 days ago.",
    businessImportance: "Early warning for potential churn. Target for re-engagement campaigns.",
    technicalDescription: "Counts users with last_sign_in_at between 7 and 14 days ago.",
    formula: `SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at < NOW() - INTERVAL '7 days' AND last_sign_in_at >= NOW() - INTERVAL '14 days'`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "last_sign_in_at"], description: "Supabase Auth users" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "activity.atRisk" },
    relatedKPIs: ["churn/active-users", "churn/churned-recent", "churn/at-risk-rate"],
  },

  "churn/churned-recent": {
    slug: "churned-recent",
    category: "churn",
    title: "Churned Recent",
    icon: "UserMinus",
    isTimeSensitive: false,
    businessDescription: "Users who last signed in between 14-30 days ago.",
    businessImportance: "Recently churned users. May still be recoverable with win-back campaigns.",
    technicalDescription: "Counts users with last_sign_in_at between 14 and 30 days ago.",
    formula: `SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at < NOW() - INTERVAL '14 days' AND last_sign_in_at >= NOW() - INTERVAL '30 days'`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "last_sign_in_at"], description: "Supabase Auth users" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "activity.churnedRecent" },
    relatedKPIs: ["churn/churned-dormant", "churn/churn-rate"],
  },

  "churn/churned-dormant": {
    slug: "churned-dormant",
    category: "churn",
    title: "Churned Dormant",
    icon: "Moon",
    isTimeSensitive: false,
    businessDescription: "Users who have not signed in for more than 30 days.",
    businessImportance: "Long-term churned users. Harder to recover but represent lost potential value.",
    technicalDescription: "Counts users with last_sign_in_at more than 30 days ago.",
    formula: `SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at < NOW() - INTERVAL '30 days'`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "last_sign_in_at"], description: "Supabase Auth users" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "activity.churnedDormant" },
    relatedKPIs: ["churn/churned-recent", "churn/churn-rate"],
  },

  "churn/never-logged": {
    slug: "never-logged",
    category: "churn",
    title: "Never Logged In",
    icon: "UserX",
    isTimeSensitive: false,
    businessDescription: "Users who registered but never logged in.",
    businessImportance: "Indicates issues with the registration-to-first-use flow.",
    technicalDescription: "Counts users with null last_sign_in_at in Supabase Auth.",
    formula: `SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at IS NULL`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "last_sign_in_at"], description: "Supabase Auth users" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "activity.neverLogged" },
    relatedKPIs: ["churn/churn-rate", "users/total-users"],
  },

  // === RATE KPIs (6) ===
  "churn/churn-rate": {
    slug: "churn-rate",
    category: "churn",
    title: "Churn Rate",
    icon: "TrendingDown",
    suffix: "%",
    isTimeSensitive: false,
    businessDescription: "Percentage of users who haven't logged in for 14+ days.",
    businessImportance: "Primary retention metric. Lower is better. Target should be under 20%.",
    technicalDescription: "Calculates (churned_recent + churned_dormant) / total_users * 100.",
    formula: `SELECT ROUND((churned_recent + churned_dormant)::numeric / NULLIF(total, 0) * 100, 2) as churn_rate`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "last_sign_in_at"], description: "Supabase Auth users" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "activity.churnRate" },
    relatedKPIs: ["churn/active-rate", "churn/churned-recent", "churn/churned-dormant"],
  },

  "churn/active-rate": {
    slug: "active-rate",
    category: "churn",
    title: "Active Rate",
    icon: "TrendingUp",
    suffix: "%",
    isTimeSensitive: false,
    businessDescription: "Percentage of users active in the last 7 days.",
    businessImportance: "Shows what portion of users are actively engaged. Higher is better.",
    technicalDescription: "Calculates active_users / total_users * 100.",
    formula: `SELECT ROUND(active::numeric / NULLIF(total, 0) * 100, 2) as active_rate`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "last_sign_in_at"], description: "Supabase Auth users" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "activity.activeRate" },
    relatedKPIs: ["churn/churn-rate", "churn/active-users", "churn/at-risk-rate"],
  },

  "churn/at-risk-rate": {
    slug: "at-risk-rate",
    category: "churn",
    title: "At Risk Rate",
    icon: "AlertCircle",
    suffix: "%",
    isTimeSensitive: false,
    businessDescription: "Percentage of users at risk of churning (7-14 days inactive).",
    businessImportance: "Early warning metric. High values suggest need for engagement campaigns.",
    technicalDescription: "Calculates at_risk_users / total_users * 100.",
    formula: `SELECT ROUND(at_risk::numeric / NULLIF(total, 0) * 100, 2) as at_risk_rate`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "last_sign_in_at"], description: "Supabase Auth users" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "activity.atRiskRate" },
    relatedKPIs: ["churn/churn-rate", "churn/active-rate", "churn/at-risk-users"],
  },

  "churn/churned-recent-rate": {
    slug: "churned-recent-rate",
    category: "churn",
    title: "Churned Recent Rate",
    icon: "Percent",
    suffix: "%",
    isTimeSensitive: false,
    businessDescription: "Percentage of users who churned recently (14-30 days).",
    businessImportance: "Shows recent churn velocity. Useful for tracking win-back campaign potential.",
    technicalDescription: "Calculates churned_recent / total_users * 100.",
    formula: `SELECT ROUND(churned_recent::numeric / NULLIF(total, 0) * 100, 2)`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "last_sign_in_at"], description: "Supabase Auth users" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "activity.churnedRecentRate" },
    relatedKPIs: ["churn/churned-dormant-rate", "churn/churn-rate"],
  },

  "churn/churned-dormant-rate": {
    slug: "churned-dormant-rate",
    category: "churn",
    title: "Churned Dormant Rate",
    icon: "Percent",
    suffix: "%",
    isTimeSensitive: false,
    businessDescription: "Percentage of users who are long-term churned (30+ days).",
    businessImportance: "Shows accumulated churn over time. High values indicate retention problems.",
    technicalDescription: "Calculates churned_dormant / total_users * 100.",
    formula: `SELECT ROUND(churned_dormant::numeric / NULLIF(total, 0) * 100, 2)`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "last_sign_in_at"], description: "Supabase Auth users" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "activity.churnedDormantRate" },
    relatedKPIs: ["churn/churned-recent-rate", "churn/churn-rate"],
  },

  "churn/never-logged-rate": {
    slug: "never-logged-rate",
    category: "churn",
    title: "Never Logged Rate",
    icon: "Percent",
    suffix: "%",
    isTimeSensitive: false,
    businessDescription: "Percentage of registered users who never logged in.",
    businessImportance: "Indicates registration flow issues. Should be minimized.",
    technicalDescription: "Calculates never_logged / total_users * 100.",
    formula: `SELECT ROUND(never_logged::numeric / NULLIF(total, 0) * 100, 2)`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "last_sign_in_at"], description: "Supabase Auth users" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "activity.neverLoggedRate" },
    relatedKPIs: ["churn/never-logged", "churn/churn-rate"],
  },

  // === ABANDONMENT BY STAGE KPIs (7) ===
  "churn/churn-before-wedding": {
    slug: "churn-before-wedding",
    category: "churn",
    title: "Churn Before Wedding",
    icon: "HeartOff",
    isTimeSensitive: false,
    businessDescription: "Churned users who never created a wedding.",
    businessImportance: "Shows users lost before any meaningful engagement. Critical early funnel leak.",
    technicalDescription: "Counts churned users (14+ days) with no associated wedding.",
    formula: `SELECT COUNT(*) FROM churned_users WHERE wedding_id IS NULL`,
    tables: [
      { schema: "auth", table: "users", columns: ["id", "last_sign_in_at"], description: "User activity" },
      { schema: "public", table: "weddings", columns: ["id", "wedder_1_id"], description: "Wedding ownership" },
    ],
    dataSource: { hook: "useChurnKPIs", valuePath: "breakdown.neverCreatedWedding" },
    relatedKPIs: ["churn/churn-rate", "churn/churn-phase-info"],
  },

  "churn/churn-phase-info": {
    slug: "churn-phase-info",
    category: "churn",
    title: "Churn in Phase Info",
    icon: "Info",
    isTimeSensitive: false,
    businessDescription: "Churned users who abandoned during the Info phase of onboarding.",
    businessImportance: "First phase churn indicates initial engagement issues.",
    technicalDescription: "Counts churned users whose last completed phase was before PHASE_INFO.",
    formula: `-- Users who churned in Phase Info`,
    tables: [{ schema: "public", table: "onboarding_sessions", columns: ["wedding_id", "completed_phases"], description: "Onboarding progress" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "breakdown.onboardingPhaseInfo" },
    relatedKPIs: ["churn/churn-phase-engagement", "churn/churn-before-wedding"],
  },

  "churn/churn-phase-engagement": {
    slug: "churn-phase-engagement",
    category: "churn",
    title: "Churn in Phase Engagement",
    icon: "Heart",
    isTimeSensitive: false,
    businessDescription: "Churned users who abandoned during the Engagement phase.",
    businessImportance: "Shows friction in the engagement details collection step.",
    technicalDescription: "Counts churned users who completed Info but not Engagement phase.",
    formula: `-- Users who churned in Phase Engagement`,
    tables: [{ schema: "public", table: "onboarding_sessions", columns: ["wedding_id", "completed_phases"], description: "Onboarding progress" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "breakdown.onboardingPhaseEngagement" },
    relatedKPIs: ["churn/churn-phase-info", "churn/churn-phase-ceremony"],
  },

  "churn/churn-phase-ceremony": {
    slug: "churn-phase-ceremony",
    category: "churn",
    title: "Churn in Phase Ceremony",
    icon: "Church",
    isTimeSensitive: false,
    businessDescription: "Churned users who abandoned during the Ceremony phase.",
    businessImportance: "Ceremony phase requires detailed planning input - may be overwhelming.",
    technicalDescription: "Counts churned users who completed Engagement but not Ceremony.",
    formula: `-- Users who churned in Phase Ceremony`,
    tables: [{ schema: "public", table: "onboarding_sessions", columns: ["wedding_id", "completed_phases"], description: "Onboarding progress" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "breakdown.onboardingPhaseCeremony" },
    relatedKPIs: ["churn/churn-phase-engagement", "churn/churn-phase-celebration"],
  },

  "churn/churn-phase-celebration": {
    slug: "churn-phase-celebration",
    category: "churn",
    title: "Churn in Phase Celebration",
    icon: "PartyPopper",
    isTimeSensitive: false,
    businessDescription: "Churned users who abandoned during the Celebration phase.",
    businessImportance: "Near the end of onboarding - users close to completion but still dropping.",
    technicalDescription: "Counts churned users who completed Ceremony but not Celebration.",
    formula: `-- Users who churned in Phase Celebration`,
    tables: [{ schema: "public", table: "onboarding_sessions", columns: ["wedding_id", "completed_phases"], description: "Onboarding progress" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "breakdown.onboardingPhaseCelebration" },
    relatedKPIs: ["churn/churn-phase-ceremony", "churn/churn-phase-guests"],
  },

  "churn/churn-phase-guests": {
    slug: "churn-phase-guests",
    category: "churn",
    title: "Churn in Phase Guests",
    icon: "Users",
    isTimeSensitive: false,
    businessDescription: "Churned users who abandoned during the Guests phase.",
    businessImportance: "Final onboarding phase - users very close to completion but still leaving.",
    technicalDescription: "Counts churned users who completed Celebration but not Guests.",
    formula: `-- Users who churned in Phase Guests`,
    tables: [{ schema: "public", table: "onboarding_sessions", columns: ["wedding_id", "completed_phases"], description: "Onboarding progress" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "breakdown.onboardingPhaseGuests" },
    relatedKPIs: ["churn/churn-phase-celebration", "churn/churn-post-onboarding"],
  },

  "churn/churn-post-onboarding": {
    slug: "churn-post-onboarding",
    category: "churn",
    title: "Churn Post-Onboarding",
    icon: "GraduationCap",
    isTimeSensitive: false,
    businessDescription: "Churned users who completed onboarding but not the tutorial.",
    businessImportance: "Shows users who got through onboarding but didn't engage with core features.",
    technicalDescription: "Counts churned users with completed onboarding but no tutorial answers.",
    formula: `-- Users who completed onboarding but churned before tutorial`,
    tables: [
      { schema: "public", table: "onboarding_sessions", columns: ["wedding_id", "completed_at"], description: "Completed onboarding" },
      { schema: "public", table: "wedder_answers", columns: ["wedding_id", "question_id"], description: "Tutorial indicators" },
    ],
    dataSource: { hook: "useChurnKPIs", valuePath: "breakdown.postOnboarding" },
    relatedKPIs: ["churn/churn-post-tutorial", "churn/churn-phase-guests"],
  },

  "churn/churn-post-tutorial": {
    slug: "churn-post-tutorial",
    category: "churn",
    title: "Churn Post-Tutorial",
    icon: "BookOpen",
    isTimeSensitive: false,
    businessDescription: "Churned users who completed both onboarding and tutorial.",
    businessImportance: "Fully onboarded but still churned. May indicate product-market fit issues.",
    technicalDescription: "Counts churned users with completed onboarding AND tutorial answers.",
    formula: `-- Users who completed tutorial but still churned`,
    tables: [
      { schema: "public", table: "onboarding_sessions", columns: ["wedding_id", "completed_at"], description: "Completed onboarding" },
      { schema: "public", table: "wedder_answers", columns: ["wedding_id", "question_id"], description: "Tutorial completion" },
    ],
    dataSource: { hook: "useChurnKPIs", valuePath: "breakdown.postTutorial" },
    relatedKPIs: ["churn/churn-post-onboarding", "churn/churn-rate"],
  },

  // === TIME METRICS KPIs (2) ===
  "churn/avg-days-to-churn": {
    slug: "avg-days-to-churn",
    category: "churn",
    title: "Avg Days to Churn",
    icon: "Clock",
    suffix: " days",
    isTimeSensitive: false,
    businessDescription: "Average number of days from registration to last login for churned users.",
    businessImportance: "Shows typical engagement window. Shorter times indicate quick disengagement.",
    technicalDescription: "Calculates average of (last_sign_in_at - created_at) in days for churned users.",
    formula: `SELECT AVG(EXTRACT(DAY FROM last_sign_in_at - created_at)) FROM auth.users WHERE churned`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "created_at", "last_sign_in_at"], description: "User timestamps" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "timeMetrics.avgDaysToChurn" },
    relatedKPIs: ["churn/median-days-to-churn", "churn/churn-rate"],
  },

  "churn/median-days-to-churn": {
    slug: "median-days-to-churn",
    category: "churn",
    title: "Median Days to Churn",
    icon: "Clock",
    suffix: " days",
    isTimeSensitive: false,
    businessDescription: "Median number of days from registration to last login for churned users.",
    businessImportance: "More robust than average - not skewed by outliers. Shows typical user behavior.",
    technicalDescription: "Calculates median of (last_sign_in_at - created_at) in days for churned users.",
    formula: `SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_active) FROM churned_users`,
    tables: [{ schema: "auth", table: "users", columns: ["id", "created_at", "last_sign_in_at"], description: "User timestamps" }],
    dataSource: { hook: "useChurnKPIs", valuePath: "timeMetrics.medianDaysToChurn" },
    relatedKPIs: ["churn/avg-days-to-churn", "churn/churn-rate"],
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

  // ========================================
  // ENGAGEMENT - TASKS
  // ========================================
  "engagement/total-tasks": {
    slug: "total-tasks",
    category: "engagement",
    title: "Total Tasks",
    icon: "ListTodo",
    isTimeSensitive: true,
    businessDescription:
      "Total number of tasks created across all weddings in the period.",
    businessImportance:
      "Shows overall platform engagement. More tasks = more active planning.",
    technicalDescription: "Counts all tasks created within the date range.",
    formula: `SELECT COUNT(*) FROM public.tasks
WHERE created_at >= :startDate AND created_at <= :endDate
  AND deleted_at IS NULL`,
    tables: [
      {
        schema: "public",
        table: "tasks",
        columns: ["id", "created_at", "deleted_at"],
        description: "Wedding planning tasks",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.tasks.totalTasks",
    },
    relatedKPIs: ["engagement/completed-tasks", "engagement/task-completion-rate"],
  },

  "engagement/completed-tasks": {
    slug: "completed-tasks",
    category: "engagement",
    title: "Completed Tasks",
    icon: "CheckSquare",
    isTimeSensitive: true,
    businessDescription: "Number of tasks marked as completed.",
    businessImportance:
      "Indicates actual progress users are making in their wedding planning.",
    technicalDescription: "Counts tasks where completed = true in the date range.",
    formula: `SELECT COUNT(*) FROM public.tasks
WHERE completed = true
  AND created_at >= :startDate AND created_at <= :endDate
  AND deleted_at IS NULL`,
    tables: [
      {
        schema: "public",
        table: "tasks",
        columns: ["id", "completed", "created_at"],
        description: "Wedding planning tasks with completion status",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.tasks.completedTasks",
    },
    relatedKPIs: ["engagement/total-tasks", "engagement/task-completion-rate"],
  },

  "engagement/task-completion-rate": {
    slug: "task-completion-rate",
    category: "engagement",
    title: "Task Completion Rate",
    icon: "Target",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription: "Percentage of tasks that have been completed.",
    businessImportance:
      "Measures user productivity and engagement with the task system.",
    technicalDescription: "Calculates completed tasks divided by total tasks.",
    formula: `WITH task_stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE completed = true) as done
  FROM public.tasks
  WHERE created_at >= :startDate AND created_at <= :endDate
    AND deleted_at IS NULL
)
SELECT ROUND(done::numeric / NULLIF(total, 0) * 100, 2) as rate FROM task_stats`,
    tables: [
      {
        schema: "public",
        table: "tasks",
        columns: ["id", "completed", "created_at"],
        description: "Tasks with completion status",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.tasks.taskCompletionRate",
    },
    relatedKPIs: ["engagement/total-tasks", "engagement/completed-tasks"],
  },

  "engagement/avg-tasks-per-wedding": {
    slug: "avg-tasks-per-wedding",
    category: "engagement",
    title: "Avg Tasks per Wedding",
    icon: "Calculator",
    isTimeSensitive: true,
    businessDescription: "Average number of tasks created per wedding.",
    businessImportance:
      "Indicates how deeply users engage with task planning features.",
    technicalDescription:
      "Calculates total tasks divided by number of weddings with tasks.",
    formula: `SELECT AVG(task_count) FROM (
  SELECT wedding_id, COUNT(*) as task_count
  FROM public.tasks
  WHERE created_at >= :startDate AND created_at <= :endDate
    AND deleted_at IS NULL
  GROUP BY wedding_id
) sub`,
    tables: [
      {
        schema: "public",
        table: "tasks",
        columns: ["wedding_id", "created_at"],
        description: "Tasks grouped by wedding",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.avgTasksPerWedding",
    },
    relatedKPIs: ["engagement/total-tasks", "engagement/weddings-with-tasks"],
  },

  "engagement/weddings-with-tasks": {
    slug: "weddings-with-tasks",
    category: "engagement",
    title: "Weddings with Tasks",
    icon: "ClipboardList",
    isTimeSensitive: true,
    businessDescription: "Number of weddings that have at least one task.",
    businessImportance:
      "Shows adoption of the task management feature.",
    technicalDescription: "Counts distinct weddings with at least one task.",
    formula: `SELECT COUNT(DISTINCT wedding_id) FROM public.tasks
WHERE created_at >= :startDate AND created_at <= :endDate
  AND deleted_at IS NULL`,
    tables: [
      {
        schema: "public",
        table: "tasks",
        columns: ["wedding_id"],
        description: "Tasks with wedding reference",
      },
    ],
    dataSource: {
      hook: "useEngagementKPIs",
      valuePath: "weddingsWithTasks",
    },
    relatedKPIs: ["engagement/total-tasks", "weddings/total"],
  },

  // ========================================
  // ENGAGEMENT - VENDORS
  // ========================================
  "engagement/total-vendors": {
    slug: "total-vendors",
    category: "engagement",
    title: "Total Vendors Saved",
    icon: "Store",
    isTimeSensitive: true,
    businessDescription: "Total vendors saved across all weddings.",
    businessImportance:
      "Shows engagement with the vendor marketplace feature.",
    technicalDescription: "Counts all retailer-wedding relationships.",
    formula: `SELECT COUNT(*) FROM public.retailers_in_weddings
WHERE created_at >= :startDate AND created_at <= :endDate
  AND deleted_at IS NULL`,
    tables: [
      {
        schema: "public",
        table: "retailers_in_weddings",
        columns: ["id", "created_at"],
        description: "Vendor-wedding relationships",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.vendors.totalVendors",
    },
    relatedKPIs: ["engagement/hired-vendors", "engagement/vendor-hire-rate"],
  },

  "engagement/saved-vendors": {
    slug: "saved-vendors",
    category: "engagement",
    title: "Saved Vendors",
    icon: "Bookmark",
    isTimeSensitive: true,
    businessDescription: "Vendors that have been saved but not yet contacted.",
    businessImportance: "Top of vendor funnel - initial interest indicator.",
    technicalDescription: "Counts vendors with status = SAVED.",
    formula: `SELECT COUNT(*) FROM public.retailers_in_weddings
WHERE status = 'SAVED'
  AND created_at >= :startDate AND created_at <= :endDate
  AND deleted_at IS NULL`,
    tables: [
      {
        schema: "public",
        table: "retailers_in_weddings",
        columns: ["id", "status", "created_at"],
        description: "Saved vendors",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.vendors.savedVendors",
    },
    relatedKPIs: ["engagement/contacted-vendors", "engagement/total-vendors"],
  },

  "engagement/contacted-vendors": {
    slug: "contacted-vendors",
    category: "engagement",
    title: "Contacted Vendors",
    icon: "MessageSquare",
    isTimeSensitive: true,
    businessDescription: "Vendors that users have reached out to.",
    businessImportance: "Shows intent to hire - mid-funnel engagement.",
    technicalDescription: "Counts vendors with status = CONTACTED.",
    formula: `SELECT COUNT(*) FROM public.retailers_in_weddings
WHERE status = 'CONTACTED'
  AND created_at >= :startDate AND created_at <= :endDate
  AND deleted_at IS NULL`,
    tables: [
      {
        schema: "public",
        table: "retailers_in_weddings",
        columns: ["id", "status", "created_at"],
        description: "Contacted vendors",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.vendors.contactedVendors",
    },
    relatedKPIs: ["engagement/saved-vendors", "engagement/hired-vendors"],
  },

  "engagement/hired-vendors": {
    slug: "hired-vendors",
    category: "engagement",
    title: "Hired Vendors",
    icon: "BadgeCheck",
    isTimeSensitive: true,
    businessDescription: "Vendors that have been hired for weddings.",
    businessImportance:
      "Key business metric - shows marketplace conversion success.",
    technicalDescription: "Counts vendors with status = HIRED.",
    formula: `SELECT COUNT(*) FROM public.retailers_in_weddings
WHERE status = 'HIRED'
  AND created_at >= :startDate AND created_at <= :endDate
  AND deleted_at IS NULL`,
    tables: [
      {
        schema: "public",
        table: "retailers_in_weddings",
        columns: ["id", "status", "created_at"],
        description: "Hired vendors",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.vendors.hiredVendors",
    },
    relatedKPIs: ["engagement/contacted-vendors", "engagement/vendor-hire-rate"],
  },

  "engagement/vendor-hire-rate": {
    slug: "vendor-hire-rate",
    category: "engagement",
    title: "Vendor Hire Rate",
    icon: "TrendingUp",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription:
      "Percentage of saved vendors that get hired.",
    businessImportance:
      "Conversion metric for the vendor marketplace funnel.",
    technicalDescription: "Calculates hired vendors divided by total saved.",
    formula: `WITH vendor_stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'HIRED') as hired
  FROM public.retailers_in_weddings
  WHERE created_at >= :startDate AND created_at <= :endDate
    AND deleted_at IS NULL
)
SELECT ROUND(hired::numeric / NULLIF(total, 0) * 100, 2) as rate FROM vendor_stats`,
    tables: [
      {
        schema: "public",
        table: "retailers_in_weddings",
        columns: ["id", "status", "created_at"],
        description: "Vendor status for conversion calculation",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.vendors.conversionRate",
    },
    relatedKPIs: ["engagement/total-vendors", "engagement/hired-vendors"],
  },

  "engagement/avg-vendors-per-wedding": {
    slug: "avg-vendors-per-wedding",
    category: "engagement",
    title: "Avg Vendors per Wedding",
    icon: "Calculator",
    isTimeSensitive: true,
    businessDescription: "Average number of vendors saved per wedding.",
    businessImportance:
      "Shows depth of vendor marketplace engagement.",
    technicalDescription:
      "Calculates total vendors divided by weddings with vendors.",
    formula: `SELECT AVG(vendor_count) FROM (
  SELECT wedding_id, COUNT(*) as vendor_count
  FROM public.retailers_in_weddings
  WHERE created_at >= :startDate AND created_at <= :endDate
    AND deleted_at IS NULL
  GROUP BY wedding_id
) sub`,
    tables: [
      {
        schema: "public",
        table: "retailers_in_weddings",
        columns: ["wedding_id", "created_at"],
        description: "Vendors grouped by wedding",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "engagement.avgVendorsPerWedding",
    },
    relatedKPIs: ["engagement/total-vendors", "engagement/weddings-with-vendors"],
  },

  "engagement/weddings-with-vendors": {
    slug: "weddings-with-vendors",
    category: "engagement",
    title: "Weddings with Vendors",
    icon: "ShoppingBag",
    isTimeSensitive: true,
    businessDescription:
      "Number of weddings that have saved at least one vendor.",
    businessImportance: "Shows adoption of the vendor marketplace feature.",
    technicalDescription: "Counts distinct weddings with vendor relationships.",
    formula: `SELECT COUNT(DISTINCT wedding_id) FROM public.retailers_in_weddings
WHERE created_at >= :startDate AND created_at <= :endDate
  AND deleted_at IS NULL`,
    tables: [
      {
        schema: "public",
        table: "retailers_in_weddings",
        columns: ["wedding_id"],
        description: "Vendors with wedding reference",
      },
    ],
    dataSource: {
      hook: "useEngagementKPIs",
      valuePath: "weddingsWithVendors",
    },
    relatedKPIs: ["engagement/total-vendors", "weddings/total"],
  },

  // ========================================
  // USERS - AUTH PROVIDERS
  // ========================================
  "users/google-auth-rate": {
    slug: "google-auth-rate",
    category: "users",
    title: "Google Sign-up Rate",
    icon: "Chrome",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription: "Percentage of users who signed up with Google.",
    businessImportance:
      "Shows preferred authentication method. Higher social rates reduce friction.",
    technicalDescription:
      "Calculates Google provider registrations divided by total.",
    formula: `WITH provider_stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE provider = 'google') as google_count
  FROM public.wedders
  WHERE created_at >= :startDate AND created_at <= :endDate
)
SELECT ROUND(google_count::numeric / NULLIF(total, 0) * 100, 2) as rate FROM provider_stats`,
    tables: [
      {
        schema: "public",
        table: "wedders",
        columns: ["id", "provider", "created_at"],
        description: "Users with auth provider",
      },
    ],
    dataSource: {
      hook: "useUsersKPIs",
      valuePath: "byProvider",
    },
    relatedKPIs: ["users/apple-auth-rate", "users/email-auth-rate"],
  },

  "users/apple-auth-rate": {
    slug: "apple-auth-rate",
    category: "users",
    title: "Apple Sign-up Rate",
    icon: "Apple",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription: "Percentage of users who signed up with Apple.",
    businessImportance:
      "Important for iOS users. Shows mobile app sign-up preferences.",
    technicalDescription:
      "Calculates Apple provider registrations divided by total.",
    formula: `WITH provider_stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE provider = 'apple') as apple_count
  FROM public.wedders
  WHERE created_at >= :startDate AND created_at <= :endDate
)
SELECT ROUND(apple_count::numeric / NULLIF(total, 0) * 100, 2) as rate FROM provider_stats`,
    tables: [
      {
        schema: "public",
        table: "wedders",
        columns: ["id", "provider", "created_at"],
        description: "Users with auth provider",
      },
    ],
    dataSource: {
      hook: "useUsersKPIs",
      valuePath: "byProvider",
    },
    relatedKPIs: ["users/google-auth-rate", "users/email-auth-rate"],
  },

  "users/email-auth-rate": {
    slug: "email-auth-rate",
    category: "users",
    title: "Email Sign-up Rate",
    icon: "Mail",
    suffix: "%",
    isTimeSensitive: true,
    businessDescription: "Percentage of users who signed up with email/password.",
    businessImportance:
      "Higher email rates may indicate trust concerns with social login.",
    technicalDescription:
      "Calculates email provider registrations divided by total.",
    formula: `WITH provider_stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE provider = 'email' OR provider IS NULL) as email_count
  FROM public.wedders
  WHERE created_at >= :startDate AND created_at <= :endDate
)
SELECT ROUND(email_count::numeric / NULLIF(total, 0) * 100, 2) as rate FROM provider_stats`,
    tables: [
      {
        schema: "public",
        table: "wedders",
        columns: ["id", "provider", "created_at"],
        description: "Users with auth provider",
      },
    ],
    dataSource: {
      hook: "useUsersKPIs",
      valuePath: "byProvider",
    },
    relatedKPIs: ["users/google-auth-rate", "users/apple-auth-rate"],
  },

  // ========================================
  // WEDDINGS - ADDITIONAL
  // ========================================
  "weddings/with-partner": {
    slug: "with-partner",
    category: "weddings",
    title: "Weddings with Partner",
    icon: "Users",
    isTimeSensitive: true,
    businessDescription: "Number of weddings where a partner has joined.",
    businessImportance:
      "Couples planning together are more engaged and likely to convert.",
    technicalDescription:
      "Counts weddings where wedder_2_id is not null.",
    formula: `SELECT COUNT(*) FROM public.weddings
WHERE wedder_2_id IS NOT NULL
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "wedder_2_id", "created_at"],
        description: "Weddings with partner",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "overview.withPartner",
    },
    relatedKPIs: ["weddings/solo-planning", "weddings/partner-join-rate"],
  },

  "weddings/solo-planning": {
    slug: "solo-planning",
    category: "weddings",
    title: "Solo Planning Weddings",
    icon: "User",
    isTimeSensitive: true,
    businessDescription:
      "Weddings being planned by a single person without a partner.",
    businessImportance:
      "Opportunity to invite partners and increase engagement.",
    technicalDescription:
      "Counts weddings where wedder_2_id is null.",
    formula: `SELECT COUNT(*) FROM public.weddings
WHERE wedder_2_id IS NULL
  AND created_at >= :startDate AND created_at <= :endDate`,
    tables: [
      {
        schema: "public",
        table: "weddings",
        columns: ["id", "wedder_2_id", "created_at"],
        description: "Solo planning weddings",
      },
    ],
    dataSource: {
      hook: "useWeddingsKPIs",
      valuePath: "overview.soloPlanning",
    },
    relatedKPIs: ["weddings/with-partner", "weddings/partner-join-rate"],
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
