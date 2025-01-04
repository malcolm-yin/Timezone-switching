const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 3000;

// 启用中间件
app.use(bodyParser.json());
app.use(cors());

// 配置 PostgreSQL 数据库连接
const pool = new Pool({
    user: "postgres", // 替换为你的 PostgreSQL 用户名
    host: "localhost",
    database: "city_timezones", // 替换为你的数据库名
    password: "HLS,./8871846", // 替换为你的 PostgreSQL 密码
    port: 5432, // PostgreSQL 默认端口
});

// 提供静态文件（前端页面）
app.use(express.static("public"));

// 查询接口：通过城市名称获取时区（精确匹配优先，模糊匹配次之）
app.get("/timezone", async (req, res) => {
    const cityName = req.query.city;

    if (!cityName) {
        return res.status(400).json({ error: "City name is required" });
    }

    try {
        // 精确匹配查询
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

        // 模糊匹配查询
        const fuzzyMatchQuery = `
            SELECT name, timezone 
            FROM cities 
            WHERE LOWER(name) LIKE LOWER($1)
            ORDER BY name ASC
            LIMIT 10
        `;
        const fuzzyMatchResult = await pool.query(fuzzyMatchQuery, [`%${cityName}%`]);

        if (fuzzyMatchResult.rows.length > 0) {
            return res.json(fuzzyMatchResult.rows); // 返回模糊匹配的所有结果
        }

        // 如果都没有匹配结果
        return res.status(404).json({ error: "City not found" });
    } catch (err) {
        console.error("Database query error:", err);
        res.status(500).json({ error: "Database query error" });
    }
});

// 表单提示接口：返回匹配的城市列表（支持模糊匹配）
app.get("/autocomplete", async (req, res) => {
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
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
