const { resolve } = require('path')
const { name: pkgName, homepage, version, author } = require('../package.json')

const IS_PRODUCTION = process.argv.includes('production')
const ANALYZE = process.argv.includes('--analyze')

const devPrefix = process.argv.includes('development') ? 'dist/demo/' : ''

const projectRoot = resolve(__dirname, '../')
const outputDir = resolve(projectRoot, 'dist/')

const bannerTemplate = [`${pkgName} - ${homepage}`, `Version: ${version}`, `Author: ${author}`].join('\n')

const devtool = IS_PRODUCTION ? false : 'cheap-module-source-map'

module.exports = {
  IS_PRODUCTION,
  ANALYZE,
  devPrefix,
  projectRoot,
  outputDir,
  bannerTemplate,
  devtool,
}
