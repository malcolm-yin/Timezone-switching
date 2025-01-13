const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

// 数据库连接配置
const pool = new Pool({
  user: 'postgres.uzfdgubjiwltvcqjndhf',
  host: 'aws-0-us-west-1.pooler.supabase.com',
  database: 'postgres',
  password: 'HLS,./8871846',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// 时区查询路由
app.get('/api/timezone', async (req, res) => {
  console.log('Timezone query received:', req.query);
  const { city } = req.query;
  
  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    // 先尝试精确匹配
    const exactMatchQuery = `
      SELECT name, timezone 
      FROM cities 
      WHERE LOWER(name) = LOWER($1)
      LIMIT 1
    `;
    const exactMatchResult = await pool.query(exactMatchQuery, [city]);

    if (exactMatchResult.rows.length > 0) {
      return res.json({
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
    const fuzzyMatchResult = await pool.query(fuzzyMatchQuery, [`%${city}%`]);

    if (fuzzyMatchResult.rows.length > 0) {
      return res.json(fuzzyMatchResult.rows);
    }

    return res.status(404).json({ error: 'City not found' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Database query failed',
      details: error.message 
    });
  }
});

// 自动完成路由
app.get('/api/autocomplete', async (req, res) => {
  console.log('Autocomplete query received:', req.query);
  const { term } = req.query;

  if (!term) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const query = `
      SELECT DISTINCT name 
      FROM cities 
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY name ASC
      LIMIT 10
    `;
    const result = await pool.query(query, [`${term}%`]);
    res.json(result.rows.map(row => row.name));
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Database query failed',
      details: error.message 
    });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

// 如果在 Vercel 上运行，只需要导出 app
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // 本地运行时启动服务器
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}