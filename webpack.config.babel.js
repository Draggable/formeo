import pkg from './package.json';
import path from 'path';
import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { optimize, BannerPlugin } from 'webpack';

const sassLoaders = [
  'css?sourceMap',
  'sass?sourceMap',
  'postcss-loader?pack=cleaner'
];

const bannerTemplate = [
  `${pkg.name} - ${pkg.homepage}`,
  `Version: ${pkg.version}`,
  `Author: ${pkg.author}`
].join('\n');

var production = (process.argv.indexOf('-p') !== -1);
var clean = new CleanWebpackPlugin(['dist/*']);

var webpackConfig = {
  entry: {
    'formeo': path.join(__dirname, pkg.config.files.formeo.js)
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: 'dist/',
    filename: '[name].min.js'
  },
  module: {
    preLoaders: [{
      test: /\.js?$/,
      loaders: ['eslint'],
      include: 'src/js/'
    }],
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
      }
    }, {
      test: /\.scss$/,
      loaders: ['style', 'css?sourceMap', 'sass?sourceMap'],
      loader: ExtractTextPlugin.extract('style', sassLoaders.join('!'))
    }]
  },
  // devtool: 'source-map',
  plugins: [
    new ExtractTextPlugin('[name].min.css'),
    new optimize.DedupePlugin(),
    new BannerPlugin(bannerTemplate),
    new optimize.UglifyJsPlugin({
      compress: { warnings: false }
    }),
    new CopyWebpackPlugin([
      { from: 'dist/formeo.min.js', to: '../demo/assets/js' },
      { from: 'dist/formeo-sprite.svg', to: '../demo/assets/img' },
      { from: 'dist/formeo.min.css', to: '../demo/assets/css' }
    ])
  ],
  sassLoader: {
    includePaths: [path.resolve(__dirname, './src/sass')]
  },
  postcss: function() {
    return {
      defaults: [autoprefixer],
      cleaner: [autoprefixer({ browsers: ['last 2 versions'] })]
    };
  },
  resolve: {
    root: path.join(__dirname, 'src'),
    extensions: ['', '.js', '.scss'],
    modulesDirectories: ['src', 'node_modules']
  },
  devServer: {
    hot: true,
    contentBase: 'demo/',
    progress: true,
    colors: true,
    noInfo: true
  }
};

if (production) {
  // clean and process icons if for production
  webpackConfig.plugins.push(clean);
}

module.exports = webpackConfig;
