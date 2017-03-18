const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OfflinePlugin = require('offline-plugin')

module.exports = {
  entry: './app/index.js',
  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: 'app.[hash:8].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      }, {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './app/index.html',
      rollbarAccessToken: process.env.ROLLBAR_CLIENT_ACCESS_TOKEN
    }),
    new CopyWebpackPlugin([
      {from: 'app/assets', to: 'assets'}
    ]),
    new OfflinePlugin({
      safeToUseOptionalCaches: true,
      caches: {
        main: [
          '*.js',
          'index.html'
        ],
        additional: [
          'assets/manifest.json',
          'assets/app-icon-1x.png',
          'assets/app-icon-1.5x.png',
          'assets/app-icon-2x.png',
          'assets/app-icon-3x.png',
          'assets/app-icon-4x.png',
          'https://fonts.googleapis.com/css?family=Lato:300,400,700,700i'
        ],
        optional: [
          'https://fonts.gstatic.com/*'
        ]
      },
      externals: [
        'index.html',
        'assets/manifest.json',
        'assets/app-icon-1x.png',
        'assets/app-icon-1.5x.png',
        'assets/app-icon-2x.png',
        'assets/app-icon-3x.png',
        'assets/app-icon-4x.png',
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
    port: 9000,
    proxy: {
      '/hoodie': 'http://localhost:8080'
    }
  }
}
