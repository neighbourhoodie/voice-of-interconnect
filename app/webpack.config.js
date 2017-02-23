const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './app/app.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {test: /\.js$/, use: 'babel-loader'}
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Voice of InterConnect',
      filename: 'index.html',
      template: './app/index.html'
    }),
    new CopyWebpackPlugin([
      {from: 'app/assets', to: 'assets'}
    ])
  ],
  devServer: {
    port: 9000,
    proxy: {
      '/hoodie': 'http://localhost:8080'
    }
  }
}
