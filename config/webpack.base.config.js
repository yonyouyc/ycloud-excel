const path = require('path');
const basepath = process.cwd();
const distpath = path.resolve(basepath, "./dist");
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
module.exports = {
  entry: [
    './src/index.js'
  ],
  devtool: 'inline-source-map',
  plugins: [
    new ExtractTextPlugin({
    })
  ],
  resolve: {
    alias: {
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.html/,
        use: {
          loader: 'html-loader'
        }
      },
      {
        test: /\.(less|css)$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'less-loader',
            {
              loader: 'postcss-loader',
              options: {
                minimize: true,
                plugins: [
                  require('autoprefixer')({browsers: [
                    'last 3 versions',
                    'ie >= 9']})
                ]
              }
            }],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(png|svg|jpg|gif|swf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 13312
            }
          }
        ]
      }
    ]
  },
  output: {
    path: distpath,
    filename: 'ycloud-excel.min.js'
  },
};
