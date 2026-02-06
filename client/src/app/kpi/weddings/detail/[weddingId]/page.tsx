"use client";

/**
 * Wedding Detail Page
 *
 * Shows detailed information about a specific wedding including
 * wedders, onboarding progress, tasks, vendors, and missions.
 */

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ListTodo,
  Store,
  Target,
  Loader2,
} from "lucide-react";
import { useWeddingDetail } from "@/wedded/api/hooks";
import { WedderCard } from "@/wedded/components";
import { MissionStatus, OnboardingStatus } from "@/wedded/api/endpoints/types";
import { cn } from "@/lib/utils";

const ONBOARDING_STATUS_CONFIG: Record<
  OnboardingStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  not_started: {
    label: "Not Started",
    icon: XCircle,
    className: "text-neutral-500 dark:text-neutral-400",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    className: "text-amber-500 dark:text-amber-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "text-emerald-500 dark:text-emerald-400",
  },
};

const MISSION_STATUS_CONFIG: Record<
  MissionStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  not_started: {
    label: "Not Started",
    icon: XCircle,
    className: "text-neutral-400 dark:text-neutral-500",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    className: "text-amber-500 dark:text-amber-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "text-emerald-500 dark:text-emerald-400",
  },
};

const PHASE_NAMES: Record<string, string> = {
  PHASE_INFO: "Info",
  PHASE_ENGAGEMENT: "Engagement",
  PHASE_CEREMONY: "Ceremony",
  PHASE_CELEBRATION: "Celebration",
  PHASE_GUESTS: "Guests",
};

function truncateId(id: string): string {
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function WeddingDetailPage() {
  const params = useParams();
  const weddingId = params.weddingId as string;

  const { data: wedding, isLoading, error } = useWeddingDetail(weddingId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Wedding not found
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          The wedding you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          href="/kpi"
          className="mt-4 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
        >
          Back to KPIs
        </Link>
      </div>
    );
  }

  const onboardingConfig = ONBOARDING_STATUS_CONFIG[wedding.onboarding.status];
  const OnboardingIcon = onboardingConfig.icon;

  const taskCompletion =
    wedding.tasks.total > 0
      ? Math.round((wedding.tasks.completed / wedding.tasks.total) * 100)
      : 0;

  const totalVendors =
    wedding.vendors.saved +
    wedding.vendors.contacted +
    wedding.vendors.hired +
    wedding.vendors.recommended +
    wedding.vendors.weddingPlanner;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Link
          href="/kpi"
          className="hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          KPIs
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href="/kpi/weddings"
          className="hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          Weddings
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-neutral-700 dark:text-neutral-300">
          {truncateId(wedding.id)}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
          <Heart className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Wedding <code className="text-emerald-600">{truncateId(wedding.id)}</code>
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Created {formatDate(wedding.createdAt)}
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info Card */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
            Basic Info
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Wedding Date
              </span>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {wedding.weddingDate
                  ? formatDate(wedding.weddingDate)
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Status
              </span>
              <span
                className={cn(
                  "inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
                  wedding.archived
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                )}
              >
                {wedding.archived ? "Archived" : "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Onboarding Card */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
            Onboarding
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <OnboardingIcon className={cn("w-5 h-5", onboardingConfig.className)} />
              <span className={cn("text-sm font-medium", onboardingConfig.className)}>
                {onboardingConfig.label}
              </span>
            </div>
            {/* Phase checkboxes */}
            <div className="flex flex-wrap gap-2">
              {["PHASE_INFO", "PHASE_ENGAGEMENT", "PHASE_CEREMONY", "PHASE_CELEBRATION", "PHASE_GUESTS"].map(
                (phase) => {
                  const completed = wedding.onboarding.completedPhases.includes(phase);
                  return (
                    <span
                      key={phase}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full",
                        completed
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                      )}
                    >
                      {completed && <CheckCircle className="w-3 h-3" />}
                      {PHASE_NAMES[phase]}
                    </span>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Couple Section */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
          Couple
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WedderCard wedder={wedding.wedder1} label="Wedder 1" />
          <WedderCard wedder={wedding.wedder2} label="Wedder 2" />
        </div>
      </div>

      {/* Metrics Section */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
          Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tasks */}
          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <ListTodo className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Tasks
              </span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {wedding.tasks.completed}/{wedding.tasks.total}
            </div>
            <div className="mt-2">
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${taskCompletion}%` }}
                />
              </div>
              <span className="text-xs text-neutral-500 mt-1">
                {taskCompletion}% complete
              </span>
            </div>
          </div>

          {/* Vendors */}
          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Vendors
              </span>
              <span className="text-xs text-neutral-400 ml-auto">{totalVendors} total</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Saved</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">{wedding.vendors.saved}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Contacted</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">{wedding.vendors.contacted}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Hired</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{wedding.vendors.hired}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Recommended</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{wedding.vendors.recommended}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Wedding Planner</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">{wedding.vendors.weddingPlanner}</span>
              </div>
            </div>
          </div>

          {/* Missions */}
          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Missions
              </span>
            </div>
            <div className="space-y-2">
              {(["ceremony", "celebration", "photography"] as const).map((mission) => {
                const status = wedding.missions[mission];
                const config = MISSION_STATUS_CONFIG[status];
                const Icon = config.icon;
                return (
                  <div key={mission} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">
                      {mission}
                    </span>
                    <Icon className={cn("w-4 h-4", config.className)} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
