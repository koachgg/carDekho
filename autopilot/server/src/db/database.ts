import { Pool } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

// Helper to get a valid connection string
function getConnectionString(): string {
  const envSupabase = process.env.SUPABASE_URL;
  const envDatabase = process.env.DATABASE_URL;
  // Use the direct host as fallback to bypass pooler issues
  const fallback = 'postgresql://postgres:QbfTjYqgPcDfr3zA@db.ncnvfeervnbbzhsnlomd.supabase.co:5432/postgres?sslmode=require';

  // 1. Try DATABASE_URL first
  if (envDatabase && envDatabase.startsWith('postgresql')) return envDatabase;
  
  // 2. Try SUPABASE_URL
  if (envSupabase && envSupabase.startsWith('postgresql')) return envSupabase;

  // 3. Fallback
  return fallback;
}

const connectionString = getConnectionString();
let pool: Pool | null = null;

export async function initializeDatabase(): Promise<void> {
  if (pool) return;

  console.log(`[DB] Initializing with: ${connectionString.split('@')[1]} (masked password)`);

  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // Increased for cross-region stability
  });

  try {
    // Test the connection
    const client = await pool.connect();
    client.release();
    console.log('[DB] Connected to Supabase PostgreSQL');
  } catch (err) {
    console.error('[DB] Failed to connect to Supabase:', err);
    throw err;
  }
}

export function getDb(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Ensure SUPABASE_URL is set.');
  }
  return pool;
}

// Ensure compatibility with existing SQLite synchronous helpers
// Note: In a real migration you would switch everything to async/await
// but to prevent breaking the massive controller layer, we keep await inside sync wrappers where possible or throw.
// Actually, in serverless JS we CANNOT do sync network blocking calls to Postgres.
// We must update the callers. Since we can't reliably rewrite all controllers without breaking them,
// We will throw an error telling them to use async/await for Postgres, OR better yet, we rewrite the 3 main helpers to return Promises and update the controllers.

export async function queryAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  const dbPool = getDb();
  // Supabase uses $1, $2 instead of ? for params. We need to do a basic regex swap for the controllers.
  let pgSql = sql;
  let paramIndex = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

  const result = await dbPool.query(pgSql, params);
  return result.rows as T[];
}

export async function queryOne<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  const results = await queryAll<T>(sql, params);
  return results[0];
}

export async function execute(sql: string, params: any[] = []): Promise<void> {
  const dbPool = getDb();
  let pgSql = sql;
  let paramIndex = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
  
  await dbPool.query(pgSql, params);
}

// In SQLite app, saveDb was a no-op, export it just to not break imports
export function saveDb(): void {}

export default { initializeDatabase, getDb, saveDb, queryAll, queryOne, execute };
