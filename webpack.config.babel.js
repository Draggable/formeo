import pkg from './package.json';
import {resolve} from 'path';
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

const extractSass = new ExtractTextPlugin({
    filename: '[name].[contenthash].css',
    disable: process.env.NODE_ENV === 'development'
});

const webpackConfig = {
  context: resolve(__dirname, 'demo/assets/'),
  entry: {
    formeo: resolve(__dirname, pkg.config.files.formeo.js)
  },
  output: {
    path: resolve(__dirname, 'demo/assets/'),
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
      use: extractSass
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
      resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.scss']
  },
  devServer: {
    inline: true,
    contentBase: 'demo/',
    noInfo: true
  }
};

// if (!isDebug) {
//   webpackConfig.context = resolve(__dirname, 'dist');
//   webpackConfig.output.path = resolve(__dirname, 'dist');
//   webpackConfig.output.publicPath = 'dist/';
// }

module.exports = webpackConfig;
