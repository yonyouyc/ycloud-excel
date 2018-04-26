var config = require('./webpack.base.config'),
  webpack = require('webpack');
var merge = require('webpack-merge')
var CleanWebpackPlugin = require('clean-webpack-plugin')
var uglifyjs = require('uglifyjs-webpack-plugin')
var path = require('path')
var CopyWebpackPlugin = require('copy-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// 去除重复的css
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var packageConfig = require('../package.json')
// ...
config = merge(config, {
  externals: {
    knockout: {
      root: 'ko',
      commonjs: 'knockout',
      commonjs2: 'knockout',
      amd: 'knockout'
    },
    jquery: {
      root: '$',
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: 'jquery'
    }
  },
  output: {
    publicPath: "./",
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(['./dist'],
      {
        root: __dirname,      　　　　　　　　　　//根目录
        verbose:  true,      　　　　　　　　　　//开启在控制台输出信息
        dry:      false        　　　　　　　　　　//启用删除文件
      }),
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true
      },
      comments: false,
      sourceMap: true
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new CopyWebpackPlugin([
      
    ]),
    // new BundleAnalyzerPlugin(),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    new webpack.BannerPlugin('ycloud v' + packageConfig.version + ' author by 友云采FED')
  ]
})
module.exports = config

