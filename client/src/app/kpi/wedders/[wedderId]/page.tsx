"use client";

/**
 * Wedder Detail Page
 *
 * Shows detailed information about a specific wedder including
 * their basic info and all weddings they're involved in.
 */

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  User,
  MapPin,
  Calendar,
  Heart,
  Loader2,
  XCircle,
} from "lucide-react";
import { useWedderDetail } from "@/wedded/api/hooks";
import { WeddingsTable } from "@/wedded/components";
import { cn } from "@/lib/utils";

const PROVIDER_CONFIG: Record<
  string,
  { label: string; icon: string; className: string }
> = {
  google: {
    label: "Google",
    icon: "G",
    className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
  apple: {
    label: "Apple",
    icon: "",
    className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  },
  facebook: {
    label: "Facebook",
    icon: "f",
    className: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  email: {
    label: "Email",
    icon: "@",
    className: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
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

export default function WedderDetailPage() {
  const params = useParams();
  const wedderId = params.wedderId as string;

  const { data: wedder, isLoading, error } = useWedderDetail(wedderId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !wedder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Wedder not found
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          The wedder you're looking for doesn't exist or has been deleted.
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

  const provider = wedder.provider?.toLowerCase() || "email";
  const providerConfig = PROVIDER_CONFIG[provider] || PROVIDER_CONFIG.email;

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
        <span className="text-neutral-600 dark:text-neutral-400">Wedders</span>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-neutral-700 dark:text-neutral-300">
          {truncateId(wedder.id)}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Wedder <code className="text-emerald-600">{truncateId(wedder.id)}</code>
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Registered {formatDate(wedder.createdAt)}
          </p>
        </div>
      </div>

      {/* Basic Info Card */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Basic Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Registration Date */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
                Registered
              </span>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {formatDate(wedder.createdAt)}
              </span>
            </div>
          </div>

          {/* Country */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
                Country
              </span>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {wedder.countryCode || "Unknown"}
              </span>
            </div>
          </div>

          {/* Auth Provider */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold",
                providerConfig.className
              )}
            >
              {providerConfig.icon}
            </div>
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
                Auth Provider
              </span>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {providerConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Weddings Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Their Weddings ({wedder.weddings.length})
          </h3>
        </div>

        {wedder.weddings.length === 0 ? (
          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-8 text-center">
            <Heart className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400">
              No weddings found for this wedder
            </p>
          </div>
        ) : (
          <WeddingsTable
            weddings={wedder.weddings}
            total={wedder.weddings.length}
            page={1}
            pageSize={wedder.weddings.length}
          />
        )}
      </div>
    </div>
  );
}
