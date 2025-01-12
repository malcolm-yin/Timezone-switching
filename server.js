require('dotenv').config(); // 加载 .env 文件
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 配置 CORS
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://your-production-url.com'] // 替换为你的线上 URL
    : ['http://localhost:3000'];

app.use(cors({ origin: allowedOrigins }));

// 提供静态文件（前端页面）
app.use(express.static(path.join(__dirname, 'public')));

// 加载拆分的 API 路由
app.use('/api/timezone', require('./api/timezone'));
app.use('/api/autocomplete', require('./api/autocomplete'));

// 测试 API（可选）
app.get('/api/test', (req, res) => {
  res.json({
    message: `Hello from ${process.env.NODE_ENV} environment!`,
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
