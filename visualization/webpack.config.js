const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './visualization/index.js',
  output: {
    path: path.join(__dirname, '..', 'dist', 'visualization'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {test: /\.js$/, use: 'babel-loader'}
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './visualization/index.html'
    }),
    new CopyWebpackPlugin([
      {from: 'visualization/assets', to: 'assets'}
    ])
  ],
  devServer: {
    port: 9001,
    proxy: {
      '/hoodie': 'http://localhost:8080'
    }
  }
}
