import pkg from './package.json';
import path from 'path';
import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import SvgStore from 'webpack-svgstore-plugin';
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

var makeIcons = (process.argv.indexOf('--icons') !== -1);
var production = (process.argv.indexOf('-p') !== -1);

var icons = new SvgStore(
  path.join(__dirname, pkg.config.files.formeo.icons),
  '.', {
    name: 'formeo-sprite.svg',
    chunk: 'formeo',
    svgoOptions: {
      plugins: [
        { cleanupAttrs: true },
        { removeDimensions: true },
        { removeTitle: true },
        { removeUselessDefs: true },
        { mergePaths: true },
        { removeStyleElement: true },
        // { removeViewBox: true },
        { removeNonInheritableGroupAttrs: true }, {
          removeAttrs: {
            attrs: ['fill', 'style']
          }
        }
      ]
    }
  }
);

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
    })
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
    contentBase: 'public/',
    progress: true,
    colors: true,
    noInfo: true
  }
};

if (production) {
  // clean and process icons if for production
  webpackConfig.plugins.push(icons, clean);
} else if (makeIcons) {
  // process icons
  webpackConfig.entry = undefined;
  webpackConfig.module = undefined;
  webpackConfig.plugins = [icons];
}

module.exports = webpackConfig;
