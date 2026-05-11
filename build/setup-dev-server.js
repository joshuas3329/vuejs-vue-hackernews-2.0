const fs = require('fs')
const path = require('path')
const { createFsFromVolume, Volume } = require('memfs')
const webpack = require('webpack')
const chokidar = require('chokidar')
const clientConfig = require('./webpack.client.config')
const serverConfig = require('./webpack.server.config')

const readFile = (mfs, file) => {
  try {
    return mfs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
  } catch (e) {}
}

module.exports = function setupDevServer (app, templatePath, cb) {
  let bundle
  let template
  let clientManifest

  let ready
  const readyPromise = new Promise(r => { ready = r })
  const update = () => {
    if (bundle && clientManifest) {
      ready()
      cb(bundle, { template, clientManifest })
    }
  }

  // read template from disk and watch
  template = fs.readFileSync(templatePath, 'utf-8')
  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    console.log('index.html template updated.')
    update()
  })

  // modify client config to work with hot middleware
  clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
  clientConfig.output.filename = '[name].js'
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  )

  // dev middleware
  const clientCompiler = webpack(clientConfig)
  const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    publicPath: clientConfig.output.publicPath
  })
  app.use(devMiddleware)

  // Webpack 5 uses compiler hooks instead of compiler.plugin()
  clientCompiler.hooks.done.tap('setup-dev-server', stats => {
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))
    if (stats.errors.length) return
    clientManifest = JSON.parse(readFile(
      devMiddleware.context.outputFileSystem,
      'vue-ssr-client-manifest.json'
    ))
    update()
  })

  // hot middleware
  app.use(require('webpack-hot-middleware')(clientCompiler, { heartbeat: 5000 }))

  // watch and update server renderer using an in-memory filesystem (memfs)
  const serverCompiler = webpack(serverConfig)
  const mfs = createFsFromVolume(new Volume())
  mfs.join = path.join.bind(path) // required by webpack
  serverCompiler.outputFileSystem = mfs

  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    stats = stats.toJson()
    if (stats.errors.length) return

    bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json'))
    update()
  })

  return readyPromise
}
