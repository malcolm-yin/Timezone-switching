/**
 * api/timezone.js
 *
 * Vercel Serverless Function to handle timezone lookup.
 */
console.log('Timezone API is loaded!');  // 添加这行

const { Pool } = require('pg');

let pool;

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
  const cityName = req.query.city;
  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const pool = getPool();

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
      // 如果有多条结果，就直接返回一个数组
      return res.status(200).json(fuzzyMatchResult.rows);
    }

    // 如果什么都匹配不到，则返回 404
    return res.status(404).json({ error: 'City not found' });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ error: 'Database query error' });
  }
};