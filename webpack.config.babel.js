import pkg from './package.json';
import path from 'path';
import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import {optimize, BannerPlugin, DefinePlugin} from 'webpack';

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

const development = (process.argv.indexOf('-d') !== -1);
let plugins;

if (development) {
  plugins = [
    new ExtractTextPlugin('[name].min.css'),
  ];
} else {
  plugins = [
    new ExtractTextPlugin('[name].min.css'),
    new DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new optimize.OccurenceOrderPlugin(),
    new optimize.UglifyJsPlugin({
      compress: {warnings: false}
    }),
    new BannerPlugin(bannerTemplate)
  ];
}

const webpackConfig = {
  context: path.join(__dirname, 'dist'),
  entry: {
    formeo: path.join(__dirname, pkg.config.files.formeo.js)
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: 'dist/',
    filename: '[name].min.js'
  },
  module: {
    // preLoaders: [{
    //   test: /\.js?$/,
    //   loaders: ['eslint'],
    //   include: 'src/js/'
    // }],
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
      }
    }, {
      test: /\.lang$/,
      loader: 'file?name=[path][name].[ext]&context=./src'
    }, {
      test: /\.scss$/,
      loaders: sassLoaders,
      // loader: ExtractTextPlugin.extract('style', sassLoaders.join('!'))
    }]
  },
  plugins,
  // sassLoader: {
  //   includePaths: [path.resolve(__dirname, './src/sass')]
  // },
  // postcss: function() {
  //   return {
  //     defaults: [autoprefixer],
  //     cleaner: [autoprefixer({browsers: ['last 2 versions']})]
  //   };
  // },
  resolve: {
    modules: [
      path.join(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.scss']
  },
  devServer: {
    hot: true,
    contentBase: 'demo/',
    noInfo: true
  }
};

module.exports = webpackConfig;
