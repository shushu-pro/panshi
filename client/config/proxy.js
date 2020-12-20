// 接口反向代理配置项

module.exports = {
  // port: 80,
  '/openapi/': {
    target: 'http://localhost:444/', // 开发环境
    changeOrigin: true,
    pathRewrite: {
      '/openapi/': '/openapi/',
    },
  },
  '/mockapi/': {
    target: 'http://localhost:444/', // 开发环境
    changeOrigin: true,
    pathRewrite: {
      '/mockapi/': '/mockapi/',
    },
  },
};
