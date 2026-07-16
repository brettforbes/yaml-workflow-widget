const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const { VueLoaderPlugin } = require('vue-loader')
const fs = require('fs');
const path = require('path');

const paths = require('./webpack._paths')

const isDevelopment = process.env.NODE_ENV !== 'production';

const htmlBodyContent = fs.readFileSync(paths.src + '/html/content.html').toString();

const htmlHeader = isDevelopment ? "<script src='http://localhost:35729/livereload.js'></script>" : "";

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const WatchExternalFilesPlugin = require('webpack-watch-files-plugin').default;
// const LiveReloadPlugin = require('webpack-livereload-plugin');
const WebpackFileWatcherLiveReload = require('./webpack._livereload.js');

const scssFiles = fs.readdirSync("./src").filter(function (file) {
    return file.match(/.*\.scss$/);
});
const scssEntries = scssFiles.map((filename) => {
    const filenameWithoutExtension = filename.replace(/\.[^/.]+$/, "");
    const entryName = `style_` + filenameWithoutExtension;
    return { [entryName]: "./src/" + filename };
});

//load package.json
const config = require('./package');

module.exports = {
  // Where webpack looks to start building the bundle
  entry: {
    index: [
        paths.src + '/_index.js',
    ],
    // SPEC-012 F0-S2: Vue3 workflow DAG app (normal bundled entry)
    'workflow-dag': paths.src + '/workflow-dag/main.js',
  },

  watchOptions: {
    poll: 1000,
    aggregateTimeout: 200,
    ignored: /node_modules/
  },

  optimization: {
    runtimeChunk: false,
    splitChunks: false,
  },
  
  // Where webpack outputs the assets and bundles
  output: {
    path: paths.build,
    filename: '[name].js',
    publicPath: paths.build,
  },

  // Customize the webpack build process
  plugins: [
    // Removes/cleans build folders and unused assets when rebuilding
    new CleanWebpackPlugin(),

    // Copies files from target to destination folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.public,
          to: paths.build,
          globOptions: {
            ignore: ['*.DS_Store'],
          },
          noErrorOnMissing: true,
        },
        {
          from: 'node_modules/@fortawesome/fontawesome-free/webfonts',
          to: paths.build + '/webfonts',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
          noErrorOnMissing: true,
        },
        {
          from: 'node_modules/@fontsource/wire-one/files',
          to: paths.build + '/webfonts',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
          noErrorOnMissing: true,
        },
        {
          from: 'node_modules/@fontsource/alumni-sans-pinstripe/files',
          to: paths.build + '/webfonts',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
          noErrorOnMissing: true,
        },
        
      ],
    }),

    // Generates an HTML file from a template
    // Generates deprecation warning: https://github.com/jantimon/html-webpack-plugin/issues/1501
    new HtmlWebpackPlugin({
      title: config.title,
      description: config.description,
      template: paths.src + '/html/_index.html', // template file
      filename: 'index.html', // output file
      body: htmlBodyContent,
      header: htmlHeader,
      inject: false, //dont inject anything
    }),

    new VueLoaderPlugin(),

    //TODO: update this to include only the vendor files that are needed for the widget
    new MergeIntoSingleFilePlugin({
        files: {
            //create one file for all vendor js
            "vendor.js": [
                'node_modules/jquery/dist/jquery.min.js',
                'node_modules/@popperjs/core/dist/umd/popper.js',
                'node_modules/bootstrap/dist/js/bootstrap.js',
                'node_modules/d3/dist/d3.js',
            ],
            //create one file for all vendor css
            "vendor.css": [
                'node_modules/bootstrap/dist/css/bootstrap.css',
                'node_modules/@fortawesome/fontawesome-free/css/all.min.css'
            ],
            //create one file for all widget js
            "widget.js": [
                paths.src + '/js/**/*.js',
            ],
            "widget.css": [
                paths.src + '/css/**/*.css',
            ]
        }
    }),

    // // Extracts CSS into separate files
    // new MiniCssExtractPlugin({
    //     filename: 'widget2.css'
    // }),

    // Watch for changes in files and reload the page
    isDevelopment && new WatchExternalFilesPlugin({
        files: [
          './src/**/*',
          '!./src/*.test.js'
        ]
    }),

    // auto reload the page using http://localhost:35729/livereload.js
    // new LiveReloadPlugin({}),
    isDevelopment && new WebpackFileWatcherLiveReload({
        watchFiles: [
            './src/**/*',
            '!./src/*.test.js'
          ]
      })
  ],

  // Determine how modules within the project are treated
  module: {
    rules: [
      // SPEC-012: Vue SFCs for workflow-dag entry
      {
        test: /\.vue$/,
        include: path.resolve(__dirname, 'src/workflow-dag'),
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, 'src/workflow-dag'),
          path.resolve(__dirname, 'apps/nice-dag'),
          path.resolve(__dirname, 'node_modules'),
        ],
        use: ['style-loader', 'css-loader'],
      },
      // YAML as source string for workflow-dag assets
      {
        test: /\.ya?ml$/,
        include: path.resolve(__dirname, 'src/workflow-dag'),
        type: 'asset/source',
      },
      // CLI / nugget content markdown as source strings
      {
        test: /\.md$/,
        include: path.resolve(__dirname, 'src/content'),
        type: 'asset/source',
      },
      // Workflow-dag JS: real ES modules (exclude from raw-loader)
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src/workflow-dag'),
          path.resolve(__dirname, 'apps/nice-dag'),
        ],
        use: ['babel-loader'],
      },
      // Transpile selected node_modules used by the Vue app
      {
        test: /\.m?js$/,
        include: /node_modules[\\/](vue-prism-editor|prismjs|js-yaml)/,
        use: ['babel-loader'],
        resolve: { fullySpecified: false },
      },
      // Legacy widget JS: loaded as raw text for MergeIntoSingleFilePlugin
      {
        test: /\.js$/,
        exclude: [
          path.resolve(__dirname, 'src/workflow-dag'),
          path.resolve(__dirname, 'apps/nice-dag'),
          /node_modules/,
        ],
        use: [
          {
            loader: 'raw-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },

      // Images: Copy image files to build folder
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },

      // Fonts and SVGs: Inline files
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },
    ],
  },

  optimization: {
    minimize: false, //TODO: change to minify only widget css and js but not vendor.
    minimizer: [new CssMinimizerPlugin({
        exclude: /vendor/,
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
    , '...'],
    runtimeChunk: {
      name: 'runtime',
    },
  },

  resolve: {
    modules: [paths.src, 'node_modules'],
    extensions: ['.js', '.jsx', '.json', '.vue'],
    alias: {
      '@': paths.src,
      assets: paths.public,
      // SPEC-012 F0-S1: Nice-DAG library lives only under apps/nice-dag/
      '@ebay/nice-dag-core': path.resolve(__dirname, 'apps/nice-dag/nice-dag-core'),
      '@ebay/nice-dag-vue3': path.resolve(__dirname, 'apps/nice-dag/nice-dag-vue3'),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },

  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
}