import pkg from './package.json';
import path from 'path';
import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { optimize, BannerPlugin, DefinePlugin } from 'webpack';

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

var development = (process.argv.indexOf('-d') !== -1);
var plugins;

if (development) {
  plugins = [
    new ExtractTextPlugin('[name].min.css'),
    new optimize.DedupePlugin(),
    new CopyWebpackPlugin([
      { from: 'src/lang', to: 'lang' },
    ])
  ];
} else {
  plugins = [
    new ExtractTextPlugin('[name].min.css'),
    new DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new optimize.DedupePlugin(),
    new optimize.OccurenceOrderPlugin(),
    new optimize.UglifyJsPlugin({
      compress: { warnings: false }
    }),
    new BannerPlugin(bannerTemplate)
  ];
}

var webpackConfig = {
  context: path.join(__dirname, pkg.config.files.formeo.js),
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
      test: /\.lang$/,
      loader: 'file?name=[path][name].[ext]&context=./dist/lang'
    }, {
      test: /\.scss$/,
      loaders: ['style', 'css?sourceMap', 'sass?sourceMap'],
      loader: ExtractTextPlugin.extract('style', sassLoaders.join('!'))
    }]
  },
  // devtool: 'source-map',
  plugins: plugins,
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

module.exports = webpackConfig;
