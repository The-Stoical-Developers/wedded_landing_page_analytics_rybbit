"use client";

/**
 * User Activity Card Component
 *
 * Shows user activity breakdown (Active, Inactive, Dormant, Never Signed In).
 */

import Link from "next/link";
import { Zap, Activity, Moon, UserX, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserActivityCardProps {
  activeUsers: number;
  inactiveUsers: number;
  dormantUsers: number;
  neverSignedIn: number;
  isLoading?: boolean;
}

export function UserActivityCard({
  activeUsers,
  inactiveUsers,
  dormantUsers,
  neverSignedIn,
  isLoading,
}: UserActivityCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href="/kpi/churn">
      <Card className="hover:border-emerald-500/50 hover:shadow-lg transition-all cursor-pointer group">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">User Activity (&lt;30d)</CardTitle>
            <ChevronRight className="w-5 h-5 text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:text-emerald-500 transition-all" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Active */}
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-center">
              <Zap className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-emerald-500">
                {activeUsers}
              </div>
              <div className="text-xs text-neutral-500">Active (&lt;7d)</div>
            </div>

            {/* Inactive */}
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-center">
              <Activity className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-amber-500">
                {inactiveUsers}
              </div>
              <div className="text-xs text-neutral-500">Inactive (7-30d)</div>
            </div>

            {/* Dormant */}
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-center">
              <Moon className="w-5 h-5 text-red-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-red-500">
                {dormantUsers}
              </div>
              <div className="text-xs text-neutral-500">Dormant (&gt;30d)</div>
            </div>

            {/* Never Signed In */}
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-center">
              <UserX className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-neutral-400">
                {neverSignedIn}
              </div>
              <div className="text-xs text-neutral-500">Never Signed In</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
