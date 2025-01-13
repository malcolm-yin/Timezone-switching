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

    const { term } = req.query;
    if (!term) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const result = await pool.query(
      'SELECT DISTINCT name FROM cities WHERE LOWER(name) LIKE LOWER($1) ORDER BY name LIMIT 10',
      [`${term}%`]
    );

    return res.status(200).json(result.rows.map(row => row.name));
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      details: error.message
    });
  }
}