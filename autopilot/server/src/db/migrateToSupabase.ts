import { Client } from 'pg';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// NOTE: If you are on an IPv4-only network, use the Connection Pooler URL from Supabase Settings.
// It usually looks like: postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
const SUPABASE_URL = process.env.SUPABASE_URL || 'postgresql://postgres.ncnvfeervnbbzhsnlomd:qAC3RHwsCc8oL0oa@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function migrate() {
  console.log('[MIGRATE] Starting migration from SQLite to Supabase...');

  // 1. Initialize SQLite
  const dbPath = path.resolve(__dirname, '../../db/autopilot.sqlite');
  if (!fs.existsSync(dbPath)) {
    console.error(`[MIGRATE] SQLite DB not found at ${dbPath}`);
    process.exit(1);
  }
  const buffer = fs.readFileSync(dbPath);
  const SQL = await initSqlJs();
  const sqliteDb = new SQL.Database(buffer);
  console.log('[MIGRATE] SQLite DB loaded.');

  // 2. Initialize Postgres
  const connectionString = SUPABASE_URL;
  const pgClient = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  // Mask password for logging
  const maskedUrl = connectionString.replace(/:([^@]+)@/, ':****@');
  console.log(`[MIGRATE] Attempting connection to: ${maskedUrl}`);
  
  await pgClient.connect();
  console.log('[MIGRATE] Connected to Supabase.');

  // 3. Create Tables in Supabase (1:1 with SQLite for zero-friction migration)
  console.log('[MIGRATE] Creating schema...');
  const schemaSql = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS cars (
      id SERIAL PRIMARY KEY,
      make VARCHAR(255) NOT NULL,
      model VARCHAR(255) NOT NULL,
      body_type VARCHAR(50) NOT NULL,
      seating INTEGER NOT NULL,
      safety_rating NUMERIC(3, 1),
      image_url TEXT,
      image_url_2 TEXT,
      image_url_3 TEXT,
      tags TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
      reviewer_name VARCHAR(100) NOT NULL,
      reviewer_type VARCHAR(50) NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      ownership_months INTEGER,
      pros TEXT,
      cons TEXT,
      helpful_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      preference_vector JSONB,
      conversation_history JSONB,
      confidence_score INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS review_summaries (
      car_id INTEGER PRIMARY KEY REFERENCES cars(id) ON DELETE CASCADE,
      summary TEXT NOT NULL,
      generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Truncate existing data to prevent duplicates during testing
    TRUNCATE TABLE review_summaries, sessions, reviews, cars RESTART IDENTITY CASCADE;
  `;
  await pgClient.query(schemaSql);
  console.log('[MIGRATE] Schema created and tables truncated for fresh import.');

  // Helper to run SQLite query and get objects
  const getSqliteRows = (query: string) => {
    const stmt = sqliteDb.prepare(query);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  };

  // 4. Migrate Cars and Variants (Normalized in Supabase)
  const cars = getSqliteRows('SELECT * FROM cars');
  console.log(`[MIGRATE] Found ${cars.length} cars in SQLite.`);
  if (cars.length > 0) {
    // Insert into cars table
    const carValues = cars.map(c => `(${c.id}, $$${c.make}$$, $$${c.model}$$, $$${c.body_type}$$, ${c.seating}, ${c.safety_rating || 'NULL'}, $$${c.image_url}$$, ${c.image_url_2 ? `$$${c.image_url_2}$$` : 'NULL'}, ${c.image_url_3 ? `$$${c.image_url_3}$$` : 'NULL'}, ${c.tags ? `$$${c.tags}$$` : 'NULL'}, '${c.created_at}')`).join(',\n');
    await pgClient.query(`INSERT INTO cars (id, make, model, body_type, seating, safety_rating, image_url, image_url_2, image_url_3, tags, created_at) VALUES ${carValues}`);
    console.log(`[MIGRATE] Inserted ${cars.length} cars into Supabase.`);
    
    // Insert into variants table
    const variantValues = cars.map(c => `(${c.id}, $$${c.variant || 'Base'}$$, ${c.price_lakh}, $$${c.fuel_type}$$, $$${c.transmission}$$, ${c.mileage_kmpl || 'NULL'}, ${c.engine_cc || 'NULL'}, ${c.power_bhp || 'NULL'}, ${c.torque_nm || 'NULL'}, ${c.boot_liters || 'NULL'}, ${c.running_cost_per_km || 'NULL'}, '${c.created_at}')`).join(',\n');
    await pgClient.query(`INSERT INTO variants (car_id, variant_name, price_lakh, fuel_type, transmission, mileage_kmpl, engine_cc, power_bhp, torque_nm, boot_liters, running_cost_per_km, created_at) VALUES ${variantValues}`);
    console.log(`[MIGRATE] Inserted ${cars.length} variants into Supabase.`);

    try {
      await pgClient.query("SELECT setval('cars_id_seq', (SELECT MAX(id) FROM cars));");
      await pgClient.query("SELECT setval('variants_id_seq', (SELECT MAX(id) FROM variants));");
    } catch(e) {}
  }

  // 5. Migrate Reviews
  const reviews = getSqliteRows('SELECT * FROM reviews');
  console.log(`[MIGRATE] Found ${reviews.length} reviews in SQLite.`);
  if (reviews.length > 0) {
    const reviewValues = reviews.map(r => `(${r.id}, ${r.car_id}, $$${r.reviewer_name}$$, $$${r.reviewer_type}$$, ${r.rating}, $$${r.title}$$, $$${r.body}$$, ${r.ownership_months || 'NULL'}, $$${r.pros || ''}$$, $$${r.cons || ''}$$, ${r.helpful_count || 0}, '${r.created_at}')`).join(',\n');
    await pgClient.query(`INSERT INTO reviews (id, car_id, reviewer_name, reviewer_type, rating, title, body, ownership_months, pros, cons, helpful_count, created_at) VALUES ${reviewValues}`);
    console.log(`[MIGRATE] Inserted ${reviews.length} reviews into Supabase.`);
    try {
      await pgClient.query("SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));");
    } catch(e) {}
  }

  // 6. Migrate Review Summaries
  const summaries = getSqliteRows('SELECT * FROM review_summaries');
  console.log(`[MIGRATE] Found ${summaries.length} summaries in SQLite.`);
  if (summaries.length > 0) {
    const summaryValues = summaries.map(s => `(${s.car_id}, $$${s.summary}$$, '${s.generated_at}')`).join(',\n');
    await pgClient.query(`INSERT INTO review_summaries (car_id, summary, generated_at) VALUES ${summaryValues}`);
    console.log(`[MIGRATE] Inserted ${summaries.length} summaries into Supabase.`);
  }

  // 7. Migrate Sessions
  const sessions = getSqliteRows('SELECT * FROM sessions');
  console.log(`[MIGRATE] Found ${sessions.length} sessions in SQLite.`);
  if (sessions.length > 0) {
    // Only migrate sessions that have full JSON (sqlite sql.js returns strings for TEXT)
    // UUID casting might fail if id is not valid UUID, but we used standard uuid in server
    // We'll insert them one by one to catch individual UUID failures just in case
    let sessionCount = 0;
    for (const session of sessions) {
      try {
         await pgClient.query(`
           INSERT INTO sessions (id, preference_vector, conversation_history, confidence_score, created_at, updated_at) 
           VALUES ($1, $2::jsonb, $3::jsonb, $4, $5, $6)
         `, [
           session.id, 
           session.preference_vector || '{}', 
           session.conversation_history || '[]', 
           session.confidence_score, 
           session.created_at, 
           session.updated_at
         ]);
         sessionCount++;
      } catch (err) {
         // Silently skip failed sessions (usually invalid UUIDs from old manual inserts)
      }
    }
    console.log(`[MIGRATE] Inserted ${sessionCount} valid sessions into Supabase.`);
  }

  await pgClient.end();
  console.log('[MIGRATE] Migration Complete! 🎉');
}

migrate().catch(err => {
  console.error('[MIGRATE] Fatal Error:', err);
  process.exit(1);
});
