import pkg from './package.json';
import path from 'path';
import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import {optimize, BannerPlugin, DefinePlugin} from 'webpack';

const isDebug = !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose');
const isAnalyze = process.argv.includes('--analyze') || process.argv.includes('--analyse');

const bannerTemplate = [
  `${pkg.name} - ${pkg.homepage}`,
  `Version: ${pkg.version}`,
  `Author: ${pkg.author}`
].join('\n');

let plugins = [
  new ExtractTextPlugin('[name].min.css'),
  new DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }),
  new optimize.UglifyJsPlugin({
    compress: {warnings: false}
  }),
  new BannerPlugin(bannerTemplate),
  new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js)$/,
      threshold: 10240,
      minRatio: 0.8
    })
];

const webpackConfig = {
  context: path.join(__dirname, 'demo/assets/'),
  entry: {
    formeo: path.join(__dirname, pkg.config.files.formeo.js)
  },
  output: {
    path: path.join(__dirname, 'demo/assets/'),
    publicPath: '/assets/',
    filename: '[name].min.js'
  },
  module: {
    rules: [
    {
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'eslint-loader',
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
      }
    }, {
      test: /\.lang$/,
      loader: 'file?name=[path][name].[ext]&context=./src'
    }, {
      test: /\.scss$/,
      use: ExtractTextPlugin
      .extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
            query: {modules: false, sourceMaps: true}
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [autoprefixer({browsers: ['last 2 versions']})]
            }
          },
          {
            loader: 'sass-loader', query: {sourceMaps: true}
          }
        ]
      })
    }]
  },
  plugins,
  resolve: {
    modules: [
      path.join(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.scss']
  },
  devServer: {
    hot: true,
    inline: true,
    contentBase: 'demo/',
    noInfo: true,
    host: '192.168.1.82'
  }
};

// if (!isDebug) {
//   webpackConfig.context = path.join(__dirname, 'dist');
//   webpackConfig.output.path = path.join(__dirname, 'dist');
//   webpackConfig.output.publicPath = 'dist/';
// }

module.exports = webpackConfig;
