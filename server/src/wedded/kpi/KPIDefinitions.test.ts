/**
 * KPI Definitions Unit Tests
 *
 * Tests that all KPI definitions are properly structured and consistent.
 */

import { describe, it, expect } from "vitest";
import {
  KPI_DEFINITIONS,
  CATEGORY_LABELS,
  KPICategory,
  getAllKPIs,
  getKPIsByCategory,
  getKPIBySlug,
} from "./KPIDefinitions.js";

describe("KPI Definitions", () => {
  describe("Structure Validation", () => {
    it("should have all required fields for each KPI", () => {
      const allKPIs = getAllKPIs();

      allKPIs.forEach((kpi) => {
        expect(kpi.slug, `KPI missing slug`).toBeDefined();
        expect(kpi.category, `KPI ${kpi.slug} missing category`).toBeDefined();
        expect(kpi.title, `KPI ${kpi.slug} missing title`).toBeDefined();
        expect(kpi.icon, `KPI ${kpi.slug} missing icon`).toBeDefined();
        expect(typeof kpi.isTimeSensitive, `KPI ${kpi.slug} missing isTimeSensitive`).toBe("boolean");
        expect(kpi.businessDescription, `KPI ${kpi.slug} missing businessDescription`).toBeDefined();
        expect(kpi.businessImportance, `KPI ${kpi.slug} missing businessImportance`).toBeDefined();
        expect(kpi.technicalDescription, `KPI ${kpi.slug} missing technicalDescription`).toBeDefined();
        expect(kpi.formula, `KPI ${kpi.slug} missing formula`).toBeDefined();
        expect(kpi.tables, `KPI ${kpi.slug} missing tables`).toBeInstanceOf(Array);
        expect(kpi.dataSource, `KPI ${kpi.slug} missing dataSource`).toBeDefined();
        expect(kpi.dataSource.hook, `KPI ${kpi.slug} missing dataSource.hook`).toBeDefined();
        expect(kpi.dataSource.valuePath, `KPI ${kpi.slug} missing dataSource.valuePath`).toBeDefined();
        expect(kpi.relatedKPIs, `KPI ${kpi.slug} missing relatedKPIs`).toBeInstanceOf(Array);
      });
    });

    it("should have valid category for each KPI", () => {
      const validCategories = Object.keys(CATEGORY_LABELS);
      const allKPIs = getAllKPIs();

      allKPIs.forEach((kpi) => {
        expect(
          validCategories,
          `KPI ${kpi.slug} has invalid category: ${kpi.category}`
        ).toContain(kpi.category);
      });
    });

    it("should have at least one table reference for each KPI", () => {
      const allKPIs = getAllKPIs();

      allKPIs.forEach((kpi) => {
        expect(
          kpi.tables.length,
          `KPI ${kpi.slug} should have at least one table`
        ).toBeGreaterThan(0);
      });
    });
  });

  describe("Category Labels", () => {
    it("should have labels for all categories", () => {
      const categories: KPICategory[] = ["users", "onboarding", "weddings", "engagement", "churn", "journey"];

      categories.forEach((category) => {
        expect(CATEGORY_LABELS[category], `Missing label for category: ${category}`).toBeDefined();
        expect(CATEGORY_LABELS[category].length).toBeGreaterThan(0);
      });
    });
  });

  describe("Engagement Category KPIs", () => {
    it("should have engagement KPIs defined", () => {
      const engagementKPIs = getKPIsByCategory("engagement");

      expect(engagementKPIs.length).toBeGreaterThan(0);
    });

    it("should include task-related KPIs", () => {
      const totalTasks = getKPIBySlug("engagement", "total-tasks");
      const completedTasks = getKPIBySlug("engagement", "completed-tasks");
      const taskCompletionRate = getKPIBySlug("engagement", "task-completion-rate");

      expect(totalTasks).toBeDefined();
      expect(completedTasks).toBeDefined();
      expect(taskCompletionRate).toBeDefined();
      expect(taskCompletionRate?.suffix).toBe("%");
    });

    it("should include vendor-related KPIs", () => {
      const totalVendors = getKPIBySlug("engagement", "total-vendors");
      const hiredVendors = getKPIBySlug("engagement", "hired-vendors");
      const vendorHireRate = getKPIBySlug("engagement", "vendor-hire-rate");

      expect(totalVendors).toBeDefined();
      expect(hiredVendors).toBeDefined();
      expect(vendorHireRate).toBeDefined();
      expect(vendorHireRate?.suffix).toBe("%");
    });

    it("should have correct data source paths for engagement KPIs", () => {
      const taskKPI = getKPIBySlug("engagement", "total-tasks");
      const vendorKPI = getKPIBySlug("engagement", "total-vendors");

      expect(taskKPI?.dataSource.hook).toBe("useWeddingsKPIs");
      expect(vendorKPI?.dataSource.hook).toBe("useWeddingsKPIs");
    });
  });

  describe("Users Category - Auth Provider KPIs", () => {
    it("should include auth provider rate KPIs", () => {
      const googleRate = getKPIBySlug("users", "google-auth-rate");
      const appleRate = getKPIBySlug("users", "apple-auth-rate");
      const emailRate = getKPIBySlug("users", "email-auth-rate");

      expect(googleRate).toBeDefined();
      expect(appleRate).toBeDefined();
      expect(emailRate).toBeDefined();

      // All should be percentages
      expect(googleRate?.suffix).toBe("%");
      expect(appleRate?.suffix).toBe("%");
      expect(emailRate?.suffix).toBe("%");
    });
  });

  describe("Weddings Category - Additional KPIs", () => {
    it("should include partner-related KPIs", () => {
      const withPartner = getKPIBySlug("weddings", "with-partner");
      const soloPlanning = getKPIBySlug("weddings", "solo-planning");
      const partnerJoinRate = getKPIBySlug("weddings", "partner-join-rate");

      expect(withPartner).toBeDefined();
      expect(soloPlanning).toBeDefined();
      expect(partnerJoinRate).toBeDefined();
      expect(partnerJoinRate?.suffix).toBe("%");
    });

    it("should include engagement KPIs in weddings category", () => {
      const withTasks = getKPIBySlug("weddings", "with-tasks");
      const withVendors = getKPIBySlug("weddings", "with-vendors");
      const taskCompletionRate = getKPIBySlug("weddings", "task-completion-rate");
      const vendorHireRate = getKPIBySlug("weddings", "vendor-hire-rate");

      expect(withTasks).toBeDefined();
      expect(withVendors).toBeDefined();
      expect(taskCompletionRate).toBeDefined();
      expect(vendorHireRate).toBeDefined();
    });

    it("should include timeline KPIs", () => {
      const upcoming = getKPIBySlug("weddings", "upcoming-30-days");
      const past = getKPIBySlug("weddings", "past-ceremony");

      expect(upcoming).toBeDefined();
      expect(past).toBeDefined();
      // These are not time-sensitive (they use current date, not date range)
      expect(upcoming?.isTimeSensitive).toBe(false);
      expect(past?.isTimeSensitive).toBe(false);
    });

    it("should include mission KPIs", () => {
      const missionsStarted = getKPIBySlug("weddings", "missions-started");
      const missionsCompleted = getKPIBySlug("weddings", "missions-completed");
      const ceremonyBooked = getKPIBySlug("weddings", "ceremony-venue-booked");
      const celebrationBooked = getKPIBySlug("weddings", "celebration-venue-booked");

      expect(missionsStarted).toBeDefined();
      expect(missionsCompleted).toBeDefined();
      expect(ceremonyBooked).toBeDefined();
      expect(celebrationBooked).toBeDefined();
    });

    it("should include composite engagement KPI", () => {
      const fullyEngaged = getKPIBySlug("weddings", "fully-engaged");

      expect(fullyEngaged).toBeDefined();
      expect(fullyEngaged?.tables.length).toBeGreaterThanOrEqual(3); // Uses multiple tables
    });

    it("should include event format KPIs", () => {
      const sameDay = getKPIBySlug("weddings", "same-day-events");
      const multiDay = getKPIBySlug("weddings", "multi-day-events");

      expect(sameDay).toBeDefined();
      expect(multiDay).toBeDefined();
    });
  });

  describe("Related KPIs Consistency", () => {
    it("should reference only existing KPIs in relatedKPIs", () => {
      const allKPIs = getAllKPIs();
      const allSlugs = new Set(
        allKPIs.map((kpi) => `${kpi.category}/${kpi.slug}`)
      );

      allKPIs.forEach((kpi) => {
        kpi.relatedKPIs.forEach((relatedSlug) => {
          expect(
            allSlugs.has(relatedSlug),
            `KPI ${kpi.slug} references non-existent related KPI: ${relatedSlug}`
          ).toBe(true);
        });
      });
    });
  });

  describe("Helper Functions", () => {
    it("getAllKPIs should return all definitions", () => {
      const all = getAllKPIs();
      const definitionsCount = Object.keys(KPI_DEFINITIONS).length;

      expect(all.length).toBe(definitionsCount);
    });

    it("getKPIsByCategory should filter correctly", () => {
      const usersKPIs = getKPIsByCategory("users");
      const onboardingKPIs = getKPIsByCategory("onboarding");

      usersKPIs.forEach((kpi) => {
        expect(kpi.category).toBe("users");
      });

      onboardingKPIs.forEach((kpi) => {
        expect(kpi.category).toBe("onboarding");
      });
    });

    it("getKPIBySlug should return correct KPI", () => {
      const totalUsers = getKPIBySlug("users", "total-users");

      expect(totalUsers).toBeDefined();
      expect(totalUsers?.slug).toBe("total-users");
      expect(totalUsers?.category).toBe("users");
    });

    it("getKPIBySlug should return undefined for non-existent KPI", () => {
      const nonExistent = getKPIBySlug("users", "non-existent-kpi");

      expect(nonExistent).toBeUndefined();
    });
  });

  describe("KPI Count", () => {
    it("should have expected minimum number of KPIs", () => {
      const all = getAllKPIs();

      // We added 17 new KPIs to the original ~28, so should have 45+
      expect(all.length).toBeGreaterThanOrEqual(45);
    });

    it("should have KPIs in each category", () => {
      const categories: KPICategory[] = ["users", "onboarding", "weddings", "engagement", "churn", "journey"];

      categories.forEach((category) => {
        const kpis = getKPIsByCategory(category);
        expect(kpis.length, `Category ${category} should have KPIs`).toBeGreaterThan(0);
      });
    });
  });
});
