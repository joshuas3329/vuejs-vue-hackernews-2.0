'use strict'

// Runs webpack using the project-local webpack module, bypassing any
// system-installed webpack binary that may be on PATH.

const webpack = require('../node_modules/webpack')
const target = process.argv[2] // 'client' or 'server'

if (!target || !['client', 'server'].includes(target)) {
  console.error('Usage: node build/build.js <client|server>')
  process.exit(1)
}

const config = require(`./webpack.${target}.config`)

console.log(`Building ${target} bundle...`)

webpack(config, (err, stats) => {
  if (err) {
    console.error(err.stack || err)
    if (err.details) console.error(err.details)
    process.exit(1)
  }

  const info = stats.toJson()

  if (stats.hasErrors()) {
    info.errors.forEach(e => console.error(e.message || e))
    process.exit(1)
  }

  if (stats.hasWarnings()) {
    info.warnings.forEach(w => console.warn(w.message || w))
  }

  console.log(stats.toString({
    assets: true,
    chunks: false,
    modules: false,
    colors: true
  }))
})
