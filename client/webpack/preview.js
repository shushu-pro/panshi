/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  mode: 'production',
  // stats: 'detailed',
  devServer: {
    publicPath: '/',
    contentBase: [ 'dist' ].map((folder) => path.join(process.cwd(), folder)),
    open: true,
    historyApiFallback: true,
    proxy: {
      // port: 80,
      '/openapi/': {
        target: 'http://localhost:444/', // 开发环境
        changeOrigin: true,
        // pathRewrite: {
        //   '^/panshi/openapi/': '/openapi/',
        // },
      },
      '/mockapi/': {
        target: 'http://localhost:444/', // 开发环境
        changeOrigin: true,
        // pathRewrite: {
        //   '^/panshi/mockapi/': '/mockapi/',
        // },
      },
    },
  },
};
