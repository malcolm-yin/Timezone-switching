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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed, use GET instead.' });
  }

  const cityName = req.query.city;
  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const pool = getPool();

    const exactMatchQuery = `
      SELECT name, timezone 
      FROM cities 
      WHERE LOWER(name) = LOWER($1)
      LIMIT 1
    `;
    const exactMatchResult = await pool.query(exactMatchQuery, [cityName]);

    if (exactMatchResult.rows.length > 0) {
      return res.status(200).json({
        city: exactMatchResult.rows[0].name,
        timezone: exactMatchResult.rows[0].timezone,
      });
    }

    const fuzzyMatchQuery = `
      SELECT name, timezone 
      FROM cities 
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY name ASC
      LIMIT 10
    `;
    const fuzzyMatchResult = await pool.query(fuzzyMatchQuery, [`%${cityName}%`]);

    if (fuzzyMatchResult.rows.length > 0) {
      return res.status(200).json(fuzzyMatchResult.rows);
    }

    return res.status(404).json({ error: 'City not found' });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ error: 'Database query error' });
  }
}
