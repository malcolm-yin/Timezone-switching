const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// 配置 CORS，明确允许所有来源
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 数据库连接池配置
const pool = new Pool({
  user: 'postgres.uzfdgubjiwltvcqjndhf',
  host: 'aws-0-us-west-1.pooler.supabase.com',
  database: 'postgres',
  password: 'HLS,./8871846',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

// 添加连接测试
pool.connect((err, client, done) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
    done();
  }
});

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// 自动完成路由
app.get('/api/autocomplete', async (req, res) => {
  try {
    console.log('Autocomplete request received:', req.query);
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const result = await pool.query(
      'SELECT DISTINCT name FROM cities WHERE LOWER(name) LIKE LOWER($1) ORDER BY name LIMIT 10',
      [`${term}%`]
    );

    console.log('Autocomplete results:', result.rows);
    res.json(result.rows.map(row => row.name));
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 时区查询路由
app.get('/api/timezone', async (req, res) => {
  try {
    console.log('Timezone request received:', req.query);
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }

    const result = await pool.query(
      'SELECT name, timezone FROM cities WHERE LOWER(name) = LOWER($1)',
      [city]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    console.log('Timezone result:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Timezone error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 处理未找到的路由
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 如果是在 Vercel 上，导出 app
module.exports = app;

// 如果是本地运行，启动服务器
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}