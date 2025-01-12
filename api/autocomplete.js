/**
 * api/autocomplete.js
 *
 * Vercel Serverless Function to handle city auto-complete queries.
 */

const { Pool } = require('pg');

// 在 Serverless 场景中，建议使用一个“全局”连接池，避免重复创建
let pool;

/**
 * 获取或创建一个全局 Pool
 */
function getPool() {
  if (!pool) {
    pool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT
    });
  }
  return pool;
}

module.exports = async (req, res) => {
  // 1. 处理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');  // 或者指定你的域名
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
  } catch (err) {
    console.error('Autocomplete query error:', err);
    return res.status(500).json({ error: 'Database query error' });
  }
};
