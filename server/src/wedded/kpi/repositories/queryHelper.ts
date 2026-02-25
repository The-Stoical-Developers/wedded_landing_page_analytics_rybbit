/**
 * Query Helper for KPI Repositories
 *
 * Provides typed query utilities on top of the Wedded pg Pool.
 */

import { weddedPool } from "../../weddedPgClient.js";

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await weddedPool.pool.query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  const result = await weddedPool.pool.query(sql, params);
  return (result.rows[0] as T) || null;
}

export async function queryCount(sql: string, params: unknown[] = []): Promise<number> {
  const result = await weddedPool.pool.query(sql, params);
  return parseInt(result.rows[0]?.count ?? "0", 10);
}
