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

// 查询接口：通过城市名称获取时区
app.get("/timezone", async (req, res) => {
    const cityName = req.query.city; // 从查询参数中获取城市名

    if (!cityName) {
        return res.status(400).json({ error: "City name is required" });
    }

    try {
        // 查询数据库
        const result = await pool.query(
            `SELECT name, timezone FROM cities 
             WHERE LOWER(name) = LOWER($1) 
                OR LOWER(alternate_names) LIKE LOWER($2) 
             LIMIT 1`,
            [cityName, `%${cityName}%`]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "City not found" });
        }

        // 返回查询结果
        res.json({ city: result.rows[0].name, timezone: result.rows[0].timezone });
    } catch (err) {
        console.error("Database query error:", err);
        res.status(500).json({ error: "Database query error" });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
