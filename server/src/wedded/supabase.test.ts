/**
 * Supabase Client Unit Tests
 *
 * Tests the singleton pattern and environment variable validation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Supabase Client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to clear singleton
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getSupabaseClient", () => {
    it("should throw error when SUPABASE_URL is missing", async () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const { getSupabaseClient } = await import("./supabase.js");

      expect(() => getSupabaseClient()).toThrow(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured"
      );
    });

    it("should throw error when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
      process.env.SUPABASE_URL = "https://test.supabase.co";
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const { getSupabaseClient } = await import("./supabase.js");

      expect(() => getSupabaseClient()).toThrow(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured"
      );
    });

    it("should return a client when env vars are configured", async () => {
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";

      const { getSupabaseClient } = await import("./supabase.js");

      const client = getSupabaseClient();
      expect(client).toBeDefined();
      expect(client.from).toBeDefined();
    });

    it("should return the same instance on multiple calls (singleton)", async () => {
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";

      const { getSupabaseClient } = await import("./supabase.js");

      const client1 = getSupabaseClient();
      const client2 = getSupabaseClient();

      expect(client1).toBe(client2);
    });
  });

  describe("supabase.client getter", () => {
    it("should return client via getter", async () => {
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";

      const { supabase } = await import("./supabase.js");

      expect(supabase.client).toBeDefined();
      expect(supabase.client.from).toBeDefined();
    });
  });
});
