const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// 配置 CORS，允许所有来源
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
    const result = await pool.query(
      'SELECT name, timezone FROM cities WHERE LOWER(name) = LOWER($1)',
      [city]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed', details: error.message });
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
    const result = await pool.query(
      'SELECT DISTINCT name FROM cities WHERE LOWER(name) LIKE LOWER($1) ORDER BY name LIMIT 10',
      [`${term}%`]
    );

    res.json(result.rows.map(row => row.name));
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed', details: error.message });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// 导出 app 以供 Vercel 使用
module.exports = app;