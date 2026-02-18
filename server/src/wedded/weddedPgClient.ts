/**
 * Wedded PostgreSQL Client for KPI Analytics
 *
 * Singleton pg Pool connection for querying Wedded's Supabase PostgreSQL
 * database directly using the analytics_reader role.
 *
 * Environment variables required:
 * - WEDDED_DATABASE_URL: PostgreSQL connection string for analytics_reader
 */

import pg from "pg";

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;

export function getWeddedPool(): pg.Pool {
  if (!poolInstance) {
    const connectionString = process.env.WEDDED_DATABASE_URL;

    if (!connectionString) {
      throw new Error("WEDDED_DATABASE_URL must be configured");
    }

    poolInstance = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }

  return poolInstance;
}

export const weddedPool = {
  get pool(): pg.Pool {
    return getWeddedPool();
  },
};
