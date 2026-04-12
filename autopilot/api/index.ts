import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

// Database Configuration
const SUPABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_URL || 'postgresql://postgres.ncnvfeervnbbzhsnlomd:27b7keP1jD1mgRcw@db.ncnvfeervnbbzhsnlomd.supabase.co:5432/postgres?sslmode=require';

const pool = new Pool({
  connectionString: SUPABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper to convert SQLite-style ? to Postgres $1, $2
function convertSql(sql: string) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

// Health Check
app.get('/api/health-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db: 'connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', error: String(err) });
  }
});

// Primary API: Cars Search
app.get('/api/cars', async (req, res) => {
  try {
    const { fuel_type, body_type, transmission, min_price, max_price } = req.query;
    let sql = `
      SELECT c.*, v.price_lakh, v.fuel_type, v.transmission, v.variant_name as variant
      FROM cars c
      JOIN variants v ON c.id = v.car_id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (fuel_type) { sql += ' AND v.fuel_type = ?'; params.push(fuel_type); }
    if (body_type) { sql += ' AND c.body_type = ?'; params.push(body_type); }
    
    const finalSql = convertSql(sql);
    const result = await pool.query(finalSql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Fallback for everything else
app.get('/api/*', (req, res) => {
  res.json({ message: 'AutoPilot API is running', path: req.path });
});

export default app;
