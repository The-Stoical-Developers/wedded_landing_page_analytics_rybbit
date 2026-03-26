/**
 * User Analytics Repository
 *
 * Provides user-related KPI data using direct PostgreSQL queries.
 * Includes registrations, growth, geography, and provider stats.
 */

import { query, queryCount } from "./queryHelper.js";
import {
  UserAnalyticsRepository,
  RegistrationDataPoint,
  GrowthDataPoint,
  GeographyDataPoint,
  ProviderDataPoint,
  AuthProvider,
  Granularity,
  WedderListParams,
  WedderListResult,
  WedderListItem,
} from "./types.js";

interface WedderRow {
  id: string;
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

export class PgUserAnalyticsRepository
  implements UserAnalyticsRepository
{
  async getRegistrations(
    startDate: Date,
    endDate: Date,
    granularity: Granularity
  ): Promise<RegistrationDataPoint[]> {
    const data = await query<Pick<WedderRow, "created_at" | "country_code">>(
      "SELECT created_at, country_code FROM public.wedders WHERE created_at >= $1 AND created_at <= $2",
      [startDate.toISOString(), endDate.toISOString()]
    );

    if (!data.length) return [];

    return this.aggregateByGranularity(data, granularity);
  }

  async getGrowth(startDate: Date, endDate: Date): Promise<GrowthDataPoint[]> {
    // Get all users up to end date
    const allUsers = await query<Pick<WedderRow, "created_at" | "country_code">>(
      "SELECT created_at, country_code FROM public.wedders WHERE created_at <= $1 ORDER BY created_at ASC",
      [endDate.toISOString()]
    );

    if (!allUsers.length) return [];

    const users = allUsers;

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
      const date = new Date(user.created_at).toISOString().split("T")[0];
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
    const data = await query<Pick<WedderRow, "country_code">>(
      "SELECT country_code FROM public.wedders WHERE country_code IS NOT NULL AND created_at >= $1 AND created_at <= $2",
      [startDate.toISOString(), endDate.toISOString()]
    );

    if (!data.length) return [];

    const users = data;
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
    const data = await query<Pick<WedderRow, "provider">>(
      "SELECT provider FROM public.wedders WHERE created_at >= $1 AND created_at <= $2",
      [startDate.toISOString(), endDate.toISOString()]
    );

    if (!data.length) return [];

    const users = data;
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
    return queryCount("SELECT COUNT(*) FROM public.wedders");
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

  async getWeddersList(params: WedderListParams): Promise<WedderListResult> {
    const {
      page,
      pageSize,
      search,
      provider,
      countryCode,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // Build dynamic query
    const conditions: string[] = [];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (provider) {
      conditions.push(`provider = $${paramIndex++}`);
      queryParams.push(provider);
    }

    if (countryCode) {
      conditions.push(`country_code = $${paramIndex++}`);
      queryParams.push(countryCode);
    }

    if (search) {
      conditions.push(`id::text ILIKE $${paramIndex++}`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Apply sorting at DB level
    let orderClause = "";
    if (sortBy === "createdAt") {
      orderClause = `ORDER BY created_at ${sortOrder === "asc" ? "ASC" : "DESC"}`;
    }

    const data = await query<WedderRow>(
      `SELECT id, created_at, country_code, provider FROM public.wedders ${whereClause} ${orderClause}`,
      queryParams
    );

    let wedders = data;

    const total = wedders.length;

    // Apply pagination in memory
    const offset = (page - 1) * pageSize;
    const paginatedWedders = wedders.slice(offset, offset + pageSize);

    const wedderIds = paginatedWedders.map((w) => w.id);

    // Get wedding counts for each wedder
    const weddingCounts = new Map<string, number>();

    if (wedderIds.length > 0) {
      // Count as wedder_1
      const asWedder1 = await query<{ wedder_1_id: string }>(
        `SELECT wedder_1_id FROM public.weddings WHERE wedder_1_id = ANY($1::uuid[])`,
        [wedderIds]
      );

      for (const w of asWedder1) {
        weddingCounts.set(w.wedder_1_id, (weddingCounts.get(w.wedder_1_id) || 0) + 1);
      }

      // Count as wedder_2
      const asWedder2 = await query<{ wedder_2_id: string }>(
        `SELECT wedder_2_id FROM public.weddings WHERE wedder_2_id = ANY($1::uuid[]) AND wedder_2_id IS NOT NULL`,
        [wedderIds]
      );

      for (const w of asWedder2) {
        weddingCounts.set(w.wedder_2_id, (weddingCounts.get(w.wedder_2_id) || 0) + 1);
      }
    }

    // Map to result
    const result: WedderListItem[] = paginatedWedders.map((w) => ({
      id: w.id,
      createdAt: w.created_at,
      countryCode: w.country_code,
      countryName: w.country_code ? COUNTRY_NAMES[w.country_code] || w.country_code : null,
      provider: w.provider,
      providerLabel: w.provider ? PROVIDER_LABELS[w.provider as AuthProvider] || w.provider : null,
      weddingsCount: weddingCounts.get(w.id) || 0,
    }));

    // Sort by weddingsCount if needed (can't be done in DB)
    if (sortBy === "weddingsCount") {
      result.sort((a, b) =>
        sortOrder === "asc"
          ? a.weddingsCount - b.weddingsCount
          : b.weddingsCount - a.weddingsCount
      );
    }

    return {
      wedders: result,
      total,
      page,
      pageSize,
    };
  }
}
