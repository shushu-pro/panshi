/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
// const cssnano = require('cssnano');
const path = require('path');
const base = require('./base');
const { BUILD_PATH } = require('../config/define');

const cwd = process.cwd();
const resolve = (dir) => path.resolve(cwd, dir);

module.exports = base.extends({
  mode: 'production',
  // devtool: 'none',
  // externals: {
  //   lodash: '_',
  //   react: 'React',
  //   'react-dom': 'ReactDOM',
  //   antd: 'antd',
  // },
  // CDN: [
  //   'lodash@4.17.20/lodash.js',
  //   'react@17.0.1/react.development.js',
  //   'react-dom@17.0.1/react-dom.development.js',
  //   'antd@4.8.3/antd.js',
  //   'antd@4.8.3/antd.css',
  // ],

  performance: {
    maxEntrypointSize: 1024 * 1024,
    maxAssetSize: 1024 * 1024,
  },

  module: {
    rules: [
      // {
      //   test: /\.tsx?$/,
      //   exclude: /node_modules/,
      //   loader: 'babel-loader',
      //   options: {
      //     presets: [
      //       '@babel/preset-env',
      //       '@babel/preset-react',
      //       '@babel/preset-typescript',
      //     ],
      //   },
      // },
      {
        test: /\.(jsx?|tsx?)$/, // 一个匹配loaders所处理的文件的拓展名的正则表达式，这里用来匹配js和jsx文件（必须）
        // exclude: /node_modules/, // 屏蔽不需要处理的文件（文件夹）（可选）
        include: resolve('src'),
        loader: 'babel-loader', // loader的名称（必须）
        options: {
          presets: [
            [ '@babel/preset-env', {
              useBuiltIns: 'entry', // or "usage"
              corejs: 3,
            } ],
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
          plugins: [
            [ 'import', { libraryName: 'antd', style: true } ],
            'lodash',
          ],
        },
      },

      {
        test: /\.css$/,
        exclude: [ /node_modules/ ],
        use: [
          {
            loader: 'style-loader', // 创建 <style></style>
          },
          {
            loader: 'css-loader', // 转换css
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: [ /node_modules/ ],
        use: [
          {
            loader: 'style-loader', // 创建 <style></style>
          },
          {
            loader: 'css-loader', // 转换css
            options: {
              modules: false,
            },
          },
        ],
      },

      // 业务代码，less开启modules
      {
        test: /\.less$/,
        exclude: [ /node_modules/ ],
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          {
            loader: 'less-loader', // 编译 Less -> CSS
            options: {
              lessOptions: {
                // modifyVars: { '@primary-color': '#1DA57A' },
                javascriptEnabled: true,
              },
            },
          },
        ],
      },

      // 第三方库。关闭modules
      {
        test: /\.less$/,
        include: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: false,
            },
          },
          {
            loader: 'less-loader', // 编译 Less -> CSS
            options: {
              lessOptions: {
                // modifyVars: { '@primary-color': '#1DA57A' },
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new LodashModuleReplacementPlugin(),
    // new MiniCssExtractPlugin({
    //   filename: '[name][contenthash].css',
    // }),
    // new OptimizeCssAssetsPlugin({
    //   assetNameRegExp: /\.css$/g,
    //   cssProcessor: cssnano,
    //   cssProcessorPluginOptions: {
    //     preset: [ 'default', { discardComments: { removeAll: true } } ],
    //   },
    //   canPrint: true,
    // }),

    // new LodashModuleReplacementPlugin(),
    new webpack.ProgressPlugin({
      // activeModules: true,
      // entries: true,
      // modules: true,
      // handler (percentage, message, ...args) {
      //   // custom logic
      // },
      // modulesCount: 5000,
      // profile: false,
      // dependencies: true,
      // dependenciesCount: 10000,
      // percentBy: null,
    }),
    new MonacoWebpackPlugin({
      publicPath: BUILD_PATH,
      languages: [ 'json', 'javascript', 'html', 'xml' ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // cache: true,
        parallel: true,
        // sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        },
      }),
    ],
  },
});
