"use client";

/**
 * WeddingsTable Component
 *
 * Displays a paginated table of weddings for drill-down views.
 */

import { formatDistanceToNow } from "date-fns";
import { ChevronRight, Users, User, Calendar } from "lucide-react";
import Link from "next/link";
import { WeddingSummary, OnboardingStatus } from "@/wedded/api/endpoints/types";
import { cn } from "@/lib/utils";

interface WeddingsTableProps {
  weddings: WeddingSummary[];
  total: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  baseUrl?: string;
}

const STATUS_STYLES: Record<
  OnboardingStatus,
  { label: string; className: string }
> = {
  not_started: {
    label: "Not Started",
    className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

function truncateId(id: string): string {
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

function formatDate(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function WeddingsTable({
  weddings,
  total,
  page,
  pageSize,
  isLoading = false,
  onPageChange,
  baseUrl = "/kpi/weddings/detail",
}: WeddingsTableProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (isLoading) {
    return <WeddingsTableSkeleton />;
  }

  if (weddings.length === 0) {
    return (
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-8 text-center">
        <p className="text-neutral-500 dark:text-neutral-400">
          No weddings found
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Wedding ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Wedding Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Partner
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Onboarding
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {weddings.map((wedding) => {
              const statusStyle = STATUS_STYLES[wedding.onboardingStatus];
              return (
                <tr
                  key={wedding.id}
                  className="hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <code className="text-sm font-mono text-neutral-700 dark:text-neutral-300">
                      {truncateId(wedding.id)}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {formatDate(wedding.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {wedding.weddingDate ? (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(wedding.weddingDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-neutral-400 dark:text-neutral-500">
                        Not set
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {wedding.hasPartner ? (
                      <span className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                        <Users className="w-3.5 h-3.5" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <User className="w-3.5 h-3.5" />
                        Solo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
                        statusStyle.className
                      )}
                    >
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {wedding.archived ? (
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Archived
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`${baseUrl}/${wedding.id}`}
                      className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, total)} of {total} weddings
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                page <= 1
                  ? "text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              )}
            >
              Previous
            </button>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                page >= totalPages
                  ? "text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WeddingsTableSkeleton() {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-800/50">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row}>
                {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                  <td key={col} className="px-4 py-3">
                    <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
