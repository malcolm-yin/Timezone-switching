import { Pool } from 'pg';

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      user: 'postgres.uzfdgubjiwltvcqjndhf',
      password: 'HLS,./8871846',
      host: 'aws-0-us-west-1.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
      }
    });
  }
  return pool;
}

export default async function handler(req, res) {
  // 1. 处理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed, use GET instead.' });
  }

  // 3. 读取查询参数
  const cityName = req.query.city;
  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const pool = getPool();
    console.log('Database connection successful');

    // 先尝试精确匹配
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

    // 如果没有精确匹配，则做模糊匹配
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

    // 如果什么都匹配不到，则返回 404
    return res.status(404).json({ error: 'City not found' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database query error',
      details: error.message,
      code: error.code
    });
  }
}