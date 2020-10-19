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
const { IS_PRODUCTION, ANALYZE, projectRoot, outputDir, devtool, bannerTemplate, version } = require('./build-vars')

// hack for Ubuntu on Windows
try {
  require('os').networkInterfaces()
} catch (e) {
  require('os').networkInterfaces = () => ({})
}

const copyPatterns = [
  { from: './**/*', to: 'demo/assets/', context: `${projectRoot}/src/demo/assets` },
  {
    from: '*.lang',
    to: 'demo/assets/lang/',
    context: require.resolve('formeo-i18n').replace(/main.min.js$/, 'lang/'),
  },
  { from: 'src/sass', to: 'dist/', context: projectRoot },
]

const plugins = [
  new CleanWebpackPlugin(['dist/*', 'demo/*'], { root: projectRoot }),
  new DefinePlugin({
    EN_US: JSON.stringify(enUS),
    'process.env': {
      production: JSON.stringify(process.env.NODE_ENV),
    },
  }),
  new CopyWebpackPlugin(copyPatterns),
  new HtmlWebpackPlugin({
    isProduction: IS_PRODUCTION,
    devPrefix: IS_PRODUCTION ? '' : 'dist/demo/',
    template: '../src/demo/index.html',
    filename: '../demo/index.html',
    formeo: IS_PRODUCTION ? 'assets/js/formeo.min.js' : 'dist/formeo.min.js',
    demo: 'assets/js/demo.min.js',
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
    version,
  }),
  new HtmlWebpackHarddiskPlugin({ outputPath: './demo/' }),
  new MiniCssExtractPlugin({
    moduleFilename: ({ name }) => `${name.replace('/js/', '/css/')}.min.css`,
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

const entry = {
  'dist/formeo': resolve(__dirname, '../src/js/index.js'),
  'demo/assets/js/demo': resolve(__dirname, '../src/demo/js/demo.js'),
}

if (IS_PRODUCTION) {
  entry['demo/assets/js/formeo'] = resolve(__dirname, '../src/js/index.js')
}

const extractTextLoader = !IS_PRODUCTION
  ? {
      loader: 'style-loader',
      options: {
        sourceMap: !IS_PRODUCTION,
      },
    }
  : MiniCssExtractPlugin.loader

const webpackConfig = {
  mode: IS_PRODUCTION ? 'production' : 'development',
  context: outputDir,
  entry,
  output: {
    path: projectRoot,
    publicPath: '/dist',
    filename: `[name].min.js`,
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /formeo-sprite\.svg$/,
        use: 'raw-loader',
      },
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
              sourceMap: !IS_PRODUCTION,
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
              sourceMap: !IS_PRODUCTION,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: !IS_PRODUCTION,
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
        sourceMap: !IS_PRODUCTION,
      }),
      new OptimizeCSSAssetsPlugin(),
    ],
  },
  resolve: {
    modules: [resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.scss'],
    symlinks: true,
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
