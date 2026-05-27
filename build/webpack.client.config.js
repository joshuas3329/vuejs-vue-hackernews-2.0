const webpack = require('webpack')
const { merge } = require('webpack-merge')
const base = require('./webpack.base.config')
const { GenerateSW } = require('workbox-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const config = merge(base, {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    app: './src/entry-client.js'
  },
  resolve: {
    alias: {
      'create-api': './create-api-client.js'
    }
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: 10
        }
      }
    },
    runtimeChunk: {
      name: 'manifest'
    }
  },
  plugins: [
    // strip dev-only code in Vue source
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"client"'
    }),
    new VueSSRClientPlugin()
  ]
})

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    // auto generate service worker
    new GenerateSW({
      cacheId: 'vue-hn',
      swDest: 'service-worker.js',
      clientsClaim: true,
      skipWaiting: true,
      exclude: [/\.map$/, /\.json$/],
      runtimeCaching: [
        {
          urlPattern: /^\/(top|new|show|ask|jobs)?$/,
          handler: 'NetworkFirst'
        },
        {
          urlPattern: /^\/item\/\d+$/,
          handler: 'NetworkFirst'
        },
        {
          urlPattern: /^\/user\/.+$/,
          handler: 'NetworkFirst'
        }
      ]
    })
  )
}

module.exports = config
