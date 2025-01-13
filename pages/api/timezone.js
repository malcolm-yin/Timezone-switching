import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres.uzfdgubjiwltvcqjndhf',
  password: 'HLS,./8871846',
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  try {
    // 打印请求信息
    console.log('Request received:', req.method, req.query);

    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }

    // 测试数据库连接
    const testQuery = await pool.query('SELECT NOW()');
    console.log('Database connection test:', testQuery.rows[0]);

    const result = await pool.query(
      'SELECT name, timezone FROM cities WHERE LOWER(name) = LOWER($1)',
      [city]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      details: error.message
    });
  }
}