"use client";

/**
 * Users KPI Page
 *
 * Detailed user metrics including registrations, growth, geography, and providers.
 */

import { useState } from "react";
import {
  Users,
  UserPlus,
  Globe,
  Mail,
} from "lucide-react";
import { useUsersKPIs } from "@/wedded/api/hooks";
import { KPICard, KPIGrid, KPISection } from "@/wedded/components";
import { KPIDateSelector } from "../components/KPIDateSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersKPIPage() {
  const [dateRange, setDateRange] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const { data, isLoading } = useUsersKPIs(dateRange);

  const handleDateChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            User Analytics
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Registration, growth, and geographic distribution
          </p>
        </div>
        <KPIDateSelector onDateChange={handleDateChange} />
      </div>

      {/* Overview Cards */}
      <KPISection title="Overview" icon={<Users className="w-4 h-4" />}>
        <KPIGrid columns={3}>
          <KPICard
            title="Total Users"
            value={data?.totalUsers ?? 0}
            icon={<Users className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/users/total-users"
            tooltip="Total registered users on the platform"
          />
          <KPICard
            title="New Users"
            value={data?.newUsers ?? 0}
            icon={<UserPlus className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/users/new-users"
            tooltip="New registrations in selected period"
          />
          <KPICard
            title="Countries"
            value={data?.countries ?? 0}
            icon={<Globe className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/users/countries"
            tooltip="Unique countries with registered users"
          />
        </KPIGrid>
      </KPISection>

      {/* Geography and Providers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="w-4 h-4" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.geography.slice(0, 10).map((country) => (
                  <div
                    key={country.countryCode}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getFlag(country.countryCode)}</span>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {country.countryName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {country.count}
                      </span>
                      <span className="text-xs text-neutral-400 w-12 text-right">
                        {country.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration by Provider */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="w-4 h-4" />
              Registration Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {data?.byProvider.map((provider) => (
                  <div key={provider.provider} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {provider.label}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {provider.count}
                        </span>
                        <span className="text-xs text-neutral-400 w-12 text-right">
                          {provider.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
                        style={{ width: `${provider.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    ES: "🇪🇸",
    US: "🇺🇸",
    MX: "🇲🇽",
    AR: "🇦🇷",
    CO: "🇨🇴",
    CL: "🇨🇱",
    PE: "🇵🇪",
    GB: "🇬🇧",
    FR: "🇫🇷",
    DE: "🇩🇪",
    IT: "🇮🇹",
    PT: "🇵🇹",
    BR: "🇧🇷",
    CA: "🇨🇦",
    AU: "🇦🇺",
  };
  return flags[countryCode] || "🌍";
}
