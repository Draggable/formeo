const pkg = require('../package.json')
const { resolve } = require('path')
const autoprefixer = require('autoprefixer')
const CompressionPlugin = require('compression-webpack-plugin')
const { BannerPlugin } = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

// hack for Ubuntu on Windows
try {
  require('os').networkInterfaces()
} catch (e) {
  require('os').networkInterfaces = () => ({})
}

const root = resolve(__dirname, '../')
const outputDir = resolve(root, 'dist/')
const PRODUCTION = process.argv.includes('production')
const ANALYZE = process.argv.includes('--analyze')
const COPY = process.argv.includes('--copy')
const devtool = PRODUCTION ? false : 'cheap-module-source-map'

const bannerTemplate = [`${pkg.name} - ${pkg.homepage}`, `Version: ${pkg.version}`, `Author: ${pkg.author}`].join('\n')

const plugins = [
  new CleanWebpackPlugin(['dist/*', 'demo/**/formeo*'], { root }),
  new BannerPlugin(bannerTemplate),
  new CompressionPlugin({
    asset: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.(js)$/,
    threshold: 10240,
    minRatio: 0.8,
  }),
]

if (COPY) {
  const patterns = [
    {from: `src/demo/assets/**/*`, to: `demo/assets/`}
  ]
  plugins.push(new CopyWebpackPlugin([ ...patterns ], {context: root}))
}

const webpackConfig = {
  mode: PRODUCTION ? 'production' : 'development',
  target: 'web',
  context: outputDir,
  entry: {
    'dist/formeo': resolve(__dirname, '../src/js/index.js'),
    'demo/assets/js/demo': resolve(__dirname, '../src/demo/', 'js/demo.js'),
  },
  output: {
    path: root,
    publicPath: '/dist',
    filename: `[name].min.js`,
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              attrs: {
                class: 'formeo-injected-style',
              },
              sourceMap: !PRODUCTION,
            },
          },
          {
            loader: 'css-loader',
            options: {
              camelCase: true,
              minimize: true,
              sourceMap: !PRODUCTION,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                autoprefixer({
                  browsers: ['> 1%'],
                }),
              ],
              sourceMap: !PRODUCTION,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: !PRODUCTION,
            },
          },
        ],
      },
    ],
  },
  plugins,
  devtool,
  resolve: {
    symlinks: false,
    modules: [resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.scss'],
  },
  devServer: {
    inline: true,
    contentBase: 'demo/',
    noInfo: true,
  },
}

if (ANALYZE) {
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
