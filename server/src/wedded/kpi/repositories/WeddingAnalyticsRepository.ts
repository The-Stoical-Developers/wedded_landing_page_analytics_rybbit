/**
 * Wedding Analytics Repository
 *
 * Provides wedding overview and engagement metrics from Supabase.
 */

import { supabase } from "../../supabase.js";
import {
  WeddingAnalyticsRepository,
  WeddingOverviewResult,
  WeddingEngagementResult,
} from "./types.js";

export class SupabaseWeddingAnalyticsRepository
  implements WeddingAnalyticsRepository
{
  async getOverview(
    startDate: Date,
    endDate: Date
  ): Promise<WeddingOverviewResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get total weddings in date range
    const { count: totalWeddings, error: totalError } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (totalError) throw totalError;
    const total = totalWeddings || 0;

    // Get active weddings (not archived) in date range
    const { count: activeCount, error: activeError } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (activeError) throw activeError;
    const activeWeddings = activeCount || 0;
    const archivedWeddings = total - activeWeddings;

    // Get weddings with partner
    const { count: withPartnerCount, error: partnerError } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .not("wedder_2_id", "is", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (partnerError) throw partnerError;
    const withPartner = withPartnerCount || 0;
    const soloPlanning = total - withPartner;

    // Get weddings with date set
    const { count: withDateCount, error: dateError } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .not("wedding_date", "is", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (dateError) throw dateError;
    const withDateSet = withDateCount || 0;
    const withoutDate = total - withDateSet;

    // Calculate rates
    const partnerJoinRate =
      total > 0 ? Math.round((withPartner / total) * 10000) / 100 : 0;

    const dateSetRate =
      total > 0 ? Math.round((withDateSet / total) * 10000) / 100 : 0;

    return {
      totalWeddings: total,
      activeWeddings,
      archivedWeddings,
      withPartner,
      soloPlanning,
      partnerJoinRate,
      withDateSet,
      withoutDate,
      dateSetRate,
    };
  }

  async getEngagement(
    startDate: Date,
    endDate: Date
  ): Promise<WeddingEngagementResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get total weddings for averages
    const { count: totalWeddings, error: weddingsError } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (weddingsError) throw weddingsError;
    const weddings = totalWeddings || 0;

    // Task metrics
    const { count: totalTasks, error: totalTasksError } = await supabase.client
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (totalTasksError) throw totalTasksError;
    const totalTaskCount = totalTasks || 0;

    const { count: completedTasks, error: completedTasksError } =
      await supabase.client
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("completed", true)
        .gte("created_at", startISO)
        .lte("created_at", endISO);

    if (completedTasksError) throw completedTasksError;
    const completedTaskCount = completedTasks || 0;

    const taskCompletionRate =
      totalTaskCount > 0
        ? Math.round((completedTaskCount / totalTaskCount) * 10000) / 100
        : 0;

    // Vendor metrics
    const { count: totalVendors, error: totalVendorsError } =
      await supabase.client
        .from("retailers_in_weddings")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .gte("created_at", startISO)
        .lte("created_at", endISO);

    if (totalVendorsError) throw totalVendorsError;
    const totalVendorCount = totalVendors || 0;

    const { count: savedVendors, error: savedError } = await supabase.client
      .from("retailers_in_weddings")
      .select("*", { count: "exact", head: true })
      .eq("status", "SAVED")
      .is("deleted_at", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (savedError) throw savedError;
    const savedVendorCount = savedVendors || 0;

    const { count: contactedVendors, error: contactedError } =
      await supabase.client
        .from("retailers_in_weddings")
        .select("*", { count: "exact", head: true })
        .eq("status", "CONTACTED")
        .is("deleted_at", null)
        .gte("created_at", startISO)
        .lte("created_at", endISO);

    if (contactedError) throw contactedError;
    const contactedVendorCount = contactedVendors || 0;

    const { count: hiredVendors, error: hiredError } = await supabase.client
      .from("retailers_in_weddings")
      .select("*", { count: "exact", head: true })
      .eq("status", "HIRED")
      .is("deleted_at", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (hiredError) throw hiredError;
    const hiredVendorCount = hiredVendors || 0;

    const vendorConversionRate =
      totalVendorCount > 0
        ? Math.round((hiredVendorCount / totalVendorCount) * 10000) / 100
        : 0;

    // Calculate averages
    const avgTasksPerWedding =
      weddings > 0
        ? Math.round((totalTaskCount / weddings) * 100) / 100
        : 0;

    const avgVendorsPerWedding =
      weddings > 0
        ? Math.round((totalVendorCount / weddings) * 100) / 100
        : 0;

    return {
      tasks: {
        totalTasks: totalTaskCount,
        completedTasks: completedTaskCount,
        taskCompletionRate,
      },
      vendors: {
        totalVendors: totalVendorCount,
        savedVendors: savedVendorCount,
        contactedVendors: contactedVendorCount,
        hiredVendors: hiredVendorCount,
        conversionRate: vendorConversionRate,
      },
      avgTasksPerWedding,
      avgVendorsPerWedding,
    };
  }
}
