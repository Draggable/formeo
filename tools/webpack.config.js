const { resolve } = require('path')
const { BannerPlugin, DefinePlugin } = require('webpack')
const autoprefixer = require('autoprefixer')
const CompressionPlugin = require('compression-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const { default: mi18n } = require('mi18n')
const { languageFiles, enUS } = require('formeo-i18n')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const pkg = require('../package.json')

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
const devtool = PRODUCTION ? false : 'cheap-module-source-map'

const bannerTemplate = [`${pkg.name} - ${pkg.homepage}`, `Version: ${pkg.version}`, `Author: ${pkg.author}`].join('\n')
const copyPatterns = [{ from: './**/*', to: 'demo/assets/' }]
const plugins = [
  new CleanWebpackPlugin(['dist/*', 'demo/*'], { root }),
  new DefinePlugin({
    EN_US: JSON.stringify(enUS),
  }),
  new CopyWebpackPlugin(copyPatterns, { context: `${root}/src/demo/assets` }),
  new HtmlWebpackPlugin({
    template: '../src/demo/index.html',
    filename: '../demo/index.html',
    formBuilder: PRODUCTION ? 'assets/js/formeo.min.js' : 'dist/formeo.min.js',
    demo: PRODUCTION ? 'assets/js/demo.min.js' : 'demo/assets/js/demo.min.js',
    alwaysWriteToDisk: true,
    inject: false,
    langFiles: Object.entries(languageFiles).map(([locale, val]) => {
      const lang = mi18n.processFile(val)
      return {
        locale,
        dir: lang.dir,
        nativeName: lang[locale],
      }
    }),
  }),
  new HtmlWebpackHarddiskPlugin({ outputPath: './demo/' }),
  new MiniCssExtractPlugin({
    filename: ({ name }) => `${name.replace('/js/', '/css/')}.min.css`,
  }),
  new BannerPlugin(bannerTemplate),
  new CompressionPlugin({
    asset: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.(js)$/,
    threshold: 10240,
    minRatio: 0.8,
  }),
]

const extractTextLoader = !PRODUCTION
  ? {
      loader: 'style-loader',
      options: {
        attrs: {
          class: 'formeo-injected-style',
        },
        sourceMap: !PRODUCTION,
      },
    }
  : MiniCssExtractPlugin.loader

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
          extractTextLoader,
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
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: !PRODUCTION,
      }),
      new OptimizeCSSAssetsPlugin(),
    ],
  },
  resolve: {
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
