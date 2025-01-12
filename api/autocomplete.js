const { Pool } = require("pg");

// 配置 PostgreSQL 数据库连接
const pool = new Pool({
    user: process.env.PG_USER, // 从环境变量中获取
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

module.exports = async (req, res) => {
    const searchTerm = req.query.term;

    if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
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

        const cities = results.rows.map(row => row.name);
        res.json(cities);
    } catch (err) {
        console.error("Autocomplete query error:", err);
        res.status(500).json({ error: "Database query error" });
    }
};
