/**
 * pages/api/autocomplete.js
 * Vercel Serverless Function to handle city auto-complete queries.
 */
const { Pool } = require('pg');

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

module.exports = async (req, res) => {
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
  const searchTerm = req.query.term;
  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const pool = getPool();
    console.log('Database connection successful');
    
    const query = `
      SELECT DISTINCT name 
      FROM cities 
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY name ASC
      LIMIT 10
    `;
    const results = await pool.query(query, [`${searchTerm}%`]);

    const cities = results.rows.map((row) => row.name);
    return res.status(200).json(cities);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database query error',
      details: error.message,
      code: error.code
    });
  }
};