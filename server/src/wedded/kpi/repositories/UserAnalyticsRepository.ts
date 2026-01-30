/**
 * User Analytics Repository
 *
 * Provides user-related KPI data from Supabase.
 * Includes registrations, growth, geography, and provider stats.
 */

import { supabase } from "../../supabase.js";
import {
  UserAnalyticsRepository,
  RegistrationDataPoint,
  GrowthDataPoint,
  GeographyDataPoint,
  ProviderDataPoint,
  AuthProvider,
  Granularity,
} from "./types.js";

interface WedderRow {
  created_at: string;
  country_code: string | null;
  provider: string | null;
}

const PROVIDER_LABELS: Record<AuthProvider, string> = {
  google: "Google",
  apple: "Apple",
  facebook: "Facebook",
  email: "Email",
};

const COUNTRY_NAMES: Record<string, string> = {
  ES: "Spain",
  US: "United States",
  MX: "Mexico",
  AR: "Argentina",
  CO: "Colombia",
  CL: "Chile",
  PE: "Peru",
  GB: "United Kingdom",
  FR: "France",
  DE: "Germany",
  IT: "Italy",
  PT: "Portugal",
  BR: "Brazil",
  CA: "Canada",
  AU: "Australia",
};

export class SupabaseUserAnalyticsRepository
  implements UserAnalyticsRepository
{
  async getRegistrations(
    startDate: Date,
    endDate: Date,
    granularity: Granularity
  ): Promise<RegistrationDataPoint[]> {
    const { data, error } = await supabase.client
      .from("wedders")
      .select("created_at, country_code")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (error) throw error;
    if (!data) return [];

    return this.aggregateByGranularity(data as WedderRow[], granularity);
  }

  async getGrowth(startDate: Date, endDate: Date): Promise<GrowthDataPoint[]> {
    // Get all users up to end date
    const { data: allUsers, error: allError } = await supabase.client
      .from("wedders")
      .select("created_at, country_code")
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true });

    if (allError) throw allError;
    if (!allUsers) return [];

    const users = allUsers as WedderRow[];

    // Get users before start date (for baseline)
    const usersBeforeStart = users.filter(
      (u) => new Date(u.created_at) < startDate
    ).length;

    // Aggregate by day within the date range
    const usersInRange = users.filter(
      (u) =>
        new Date(u.created_at) >= startDate &&
        new Date(u.created_at) <= endDate
    );

    const dailyMap = new Map<string, number>();

    usersInRange.forEach((user) => {
      const date = user.created_at.split("T")[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    // Build growth data points
    const result: GrowthDataPoint[] = [];
    let cumulativeTotal = usersBeforeStart;

    const sortedDates = Array.from(dailyMap.keys()).sort();

    for (const date of sortedDates) {
      const newUsers = dailyMap.get(date) || 0;
      const previousTotal = cumulativeTotal;
      cumulativeTotal += newUsers;

      const growthRate =
        previousTotal > 0
          ? (newUsers / previousTotal) * 100
          : newUsers > 0
            ? 100
            : 0;

      result.push({
        date,
        totalUsers: cumulativeTotal,
        newUsers,
        growthRate: Math.round(growthRate * 100) / 100,
      });
    }

    return result;
  }

  async getGeography(
    startDate: Date,
    endDate: Date
  ): Promise<GeographyDataPoint[]> {
    const { data, error } = await supabase.client
      .from("wedders")
      .select("country_code")
      .not("country_code", "is", null)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (error) throw error;
    if (!data) return [];

    const users = data as WedderRow[];
    const countryMap = new Map<string, number>();
    let total = 0;

    users.forEach((user) => {
      const code = user.country_code || "Unknown";
      countryMap.set(code, (countryMap.get(code) || 0) + 1);
      total++;
    });

    const result: GeographyDataPoint[] = Array.from(countryMap.entries())
      .map(([countryCode, count]) => ({
        countryCode,
        countryName: COUNTRY_NAMES[countryCode] || countryCode,
        count,
        percentage: Math.round((count / total) * 10000) / 100,
      }))
      .sort((a, b) => b.count - a.count);

    return result;
  }

  async getRegistrationsByProvider(
    startDate: Date,
    endDate: Date
  ): Promise<ProviderDataPoint[]> {
    const { data, error } = await supabase.client
      .from("wedders")
      .select("provider")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (error) throw error;
    if (!data) return [];

    const users = data as Pick<WedderRow, "provider">[];
    const providerMap = new Map<string, number>();
    let total = 0;

    users.forEach((user) => {
      const provider = user.provider || "email";
      providerMap.set(provider, (providerMap.get(provider) || 0) + 1);
      total++;
    });

    const validProviders: AuthProvider[] = [
      "google",
      "apple",
      "facebook",
      "email",
    ];
    const result: ProviderDataPoint[] = validProviders
      .map((provider) => {
        const count = providerMap.get(provider) || 0;
        return {
          provider,
          label: PROVIDER_LABELS[provider],
          count,
          percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
        };
      })
      .sort((a, b) => b.count - a.count);

    return result;
  }

  async getTotalUsers(): Promise<number> {
    const { count, error } = await supabase.client
      .from("wedders")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count || 0;
  }

  private aggregateByGranularity(
    data: { created_at: string }[],
    granularity: Granularity
  ): RegistrationDataPoint[] {
    const aggregated = new Map<string, number>();

    data.forEach((row) => {
      const date = new Date(row.created_at);
      const key = this.getGranularityKey(date, granularity);
      aggregated.set(key, (aggregated.get(key) || 0) + 1);
    });

    return Array.from(aggregated.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getGranularityKey(date: Date, granularity: Granularity): string {
    switch (granularity) {
      case "day":
        return date.toISOString().split("T")[0];
      case "week": {
        const weekStart = new Date(date);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        return weekStart.toISOString().split("T")[0];
      }
      case "month":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
    }
  }
}
