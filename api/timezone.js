import { Pool } from 'pg'

const pool = new Pool({
  user: 'postgres.uzfdgubjiwltvcqjndhf',
  host: 'aws-0-us-west-1.pooler.supabase.com',
  database: 'postgres',
  password: 'HLS,./8871846',
  port: 5432,
  ssl: { rejectUnauthorized: false }
})

export default async function handler(req, res) {
  const { city } = req.query
  
  if (!city) {
    return res.status(400).json({ error: 'City name is required' })
  }

  try {
    const result = await pool.query(
      'SELECT name, timezone FROM cities WHERE LOWER(name) = LOWER($1)',
      [city]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'City not found' })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database query failed' })
  }
}