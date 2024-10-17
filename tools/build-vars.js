import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { name as pkgName, homepage, author, version } from '../package.json'


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const ANALYZE = process.argv.includes('--analyze')

export const devPrefix = !IS_PRODUCTION ? 'dist/demo/' : ''
export const projectRoot = resolve(__dirname, '../')
export const outputDir = resolve(projectRoot, 'dist/')

export const bannerTemplate = [`${pkgName} - ${homepage}`, `Version: ${version}`, `Author: ${author}`].join('\n')

export const devtool = IS_PRODUCTION ? false : 'cheap-module-source-map'
