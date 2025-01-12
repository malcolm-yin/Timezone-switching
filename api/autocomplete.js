const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

router.get('/', async (req, res) => {
  const searchTerm = req.query.term;

  if (!searchTerm) {
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
    const results = await pool.query(query, [`${searchTerm}%`]);

    const cities = results.rows.map((row) => row.name);
    res.json(cities);
  } catch (err) {
    console.error('Autocomplete query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
});

module.exports = router;
