const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
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
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'sass-loader'
        }]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './visualization/index.html'
    }),
    new CopyWebpackPlugin([
      {from: 'visualization/assets', to: 'assets'}
    ]),
    new OfflinePlugin({
      safeToUseOptionalCaches: true,
      caches: {
        main: [
          '*.js'
        ],
        additional: [
          'https://fonts.googleapis.com/*',
          'https://fonts.gstatic.com/*'
        ]
      },
      externals: ['index.html'],
      excludes: ['assets/README.md'],

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
