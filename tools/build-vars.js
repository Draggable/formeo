const { resolve } = require('path')
const { name: pkgName, homepage, version, author } = require('../package.json')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const ANALYZE = process.argv.includes('--analyze')

const devPrefix = !IS_PRODUCTION ? 'dist/demo/' : ''
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
  version
}
