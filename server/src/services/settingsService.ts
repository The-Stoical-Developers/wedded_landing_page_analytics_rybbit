import { eq } from "drizzle-orm";
import { db } from "../db/postgres/postgres.js";
import { settings } from "../db/postgres/schema.js";
import { DISABLE_SIGNUP } from "../lib/const.js";

interface SettingsCache {
  data: Record<string, any>;
  timestamp: number;
}

const CACHE_TTL_MS = 5000; // 5 seconds
let cache: SettingsCache | null = null;

const DEFAULTS: Record<string, any> = {
  disableSignup: DISABLE_SIGNUP,
};

async function loadSettings(): Promise<Record<string, any>> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  const rows = await db.select().from(settings);
  const merged = { ...DEFAULTS };

  for (const row of rows) {
    merged[row.key] = row.value;
  }

  cache = { data: merged, timestamp: Date.now() };
  return merged;
}

function invalidateCache() {
  cache = null;
}

export async function getSetting(key: string): Promise<any> {
  const all = await loadSettings();
  return all[key] ?? DEFAULTS[key];
}

export async function getAllSettings(): Promise<Record<string, any>> {
  return loadSettings();
}

export async function updateSetting(
  key: string,
  value: any,
  updatedBy?: string
): Promise<void> {
  await db
    .insert(settings)
    .values({
      key,
      value,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy ?? null,
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        value,
        updatedAt: new Date().toISOString(),
        updatedBy: updatedBy ?? null,
      },
    });

  invalidateCache();
}
