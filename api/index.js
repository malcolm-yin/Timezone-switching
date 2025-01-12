console.log(`Incoming request path: ${pathname}`);
module.exports = (req, res) => {
    const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
    
    // 根据路径转发到相应的处理程序
    if (pathname.includes('timezone')) {
      require('./timezone')(req, res);
    } else if (pathname.includes('autocomplete')) {
      require('./autocomplete')(req, res);
    } else {
      res.status(200).json({ message: "API root is working!" });
    }
  };
