import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const DB_PATH = process.env.DATABASE_PATH || './db/autopilot.sqlite';
const absoluteDbPath = path.resolve(__dirname, '../../', DB_PATH);

let db: SqlJsDatabase | null = null;

// Ensure directory exists
const dbDir = path.dirname(absoluteDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export async function initializeDatabase(): Promise<void> {
  if (db) return; // Prevent multiple initializations in serverless
  const SQL = await initSqlJs();

  // Load existing DB file or create new
  if (fs.existsSync(absoluteDbPath)) {
    const buffer = fs.readFileSync(absoluteDbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Run schema
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.run(schema);

  // Persist
  saveDb();
  console.log('[DB] Schema initialized');
}

export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(absoluteDbPath, buffer);
}

// Helper: run a query that returns rows (like SELECT)
export function queryAll<T>(sql: string, params: any[] = []): T[] {
  const d = getDb();
  const stmt = d.prepare(sql);
  if (params.length > 0) stmt.bind(params);

  const results: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as T;
    results.push(row);
  }
  stmt.free();
  return results;
}

// Helper: run a query that returns a single row
export function queryOne<T>(sql: string, params: any[] = []): T | undefined {
  const results = queryAll<T>(sql, params);
  return results[0];
}

// Helper: run an INSERT/UPDATE/DELETE statement
export function execute(sql: string, params: any[] = []): void {
  const d = getDb();
  d.run(sql, params);
  saveDb();
}

export default { initializeDatabase, getDb, saveDb, queryAll, queryOne, execute };
