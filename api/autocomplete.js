import { Pool } from 'pg';

let pool;

function getPool() {
  if (!pool) {
    if (!process.env.PG_USER || !process.env.PG_HOST || !process.env.PG_DATABASE || !process.env.PG_PASSWORD || !process.env.PG_PORT) {
      throw new Error('Missing PostgreSQL environment variables');
    }
    pool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT,
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed, use GET instead.' });
  }

  const searchTerm = req.query.term;
  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const pool = getPool();
    const query = `
      SELECT DISTINCT name 
      FROM cities 
      WHERE name ILIKE $1
      ORDER BY name ASC
      LIMIT 10
    `;
    const results = await pool.query(query, [`${searchTerm}%`]);

    const cities = results.rows.map((row) => row.name);
    return res.status(200).json(cities);
  } catch (err) {
    console.error('Autocomplete query error:', {
      message: err.message,
      stack: err.stack,
      query: searchTerm,
    });
    return res.status(500).json({ error: 'Database query error' });
  }
}
