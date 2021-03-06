const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OfflinePlugin = require('offline-plugin')

module.exports = {
  entry: './visualization/index.js',
  output: {
    path: path.join(__dirname, '..', 'dist', 'visualization'),
    filename: 'app.[hash:8].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      }, {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          use: 'css-loader!sass-loader'
        })
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './visualization/index.html',
      rollbarAccessToken: process.env.ROLLBAR_CLIENT_ACCESS_TOKEN
    }),
    new ExtractTextPlugin('app.[hash:8].css'),
    new CopyWebpackPlugin([
      {from: 'visualization/assets', to: 'assets'}
    ]),
    new OfflinePlugin({
      safeToUseOptionalCaches: true,
      caches: {
        main: [
          '*.js',
          'index.html'
        ],
        additional: [
          'https://fonts.googleapis.com/css?family=Lato:300,400,700,700i'
        ],
        optional: [
          'https://fonts.gstatic.com/*'
        ]
      },
      externals: [
        'index.html',
        'https://fonts.googleapis.com/css?family=Lato:300,400,700,700i',
        'https://fonts.gstatic.com/*'
      ],
      excludes: [
        'assets/README.md'
      ],

      ServiceWorker: {
        events: true
      },
      AppCache: {
        events: true
      }
    })
  ],
  devServer: {
    port: 9001,
    proxy: {
      '/hoodie': 'http://localhost:8080'
    }
  }
}
