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
  const cityName = req.query.city;

  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const exactMatchQuery = `
      SELECT name, timezone 
      FROM cities 
      WHERE LOWER(name) = LOWER($1)
      LIMIT 1
    `;
    const exactMatchResult = await pool.query(exactMatchQuery, [cityName]);

    if (exactMatchResult.rows.length > 0) {
      return res.json({
        city: exactMatchResult.rows[0].name,
        timezone: exactMatchResult.rows[0].timezone,
      });
    }

    const fuzzyMatchQuery = `
      SELECT name, timezone 
      FROM cities 
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY name ASC
      LIMIT 10
    `;
    const fuzzyMatchResult = await pool.query(fuzzyMatchQuery, [`%${cityName}%`]);

    if (fuzzyMatchResult.rows.length > 0) {
      return res.json(fuzzyMatchResult.rows);
    }

    return res.status(404).json({ error: 'City not found' });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
});

module.exports = router;
