const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('node:path');
const { DefinePlugin, HotModuleReplacementPlugin } = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = function(env, argv) {
  const mode = env.production ? "production" : "development";
  const entry = mode === "production" ? './src/app/index.tsx' : [
    'webpack-hot-middleware/client?reload=true&timeout=1000',
    './src/app/index.tsx',
  ];

  const plugins = [
    new HtmlWebpackPlugin({
      template: "./src/app/index.html",
    }),

    new DefinePlugin({
      'process.env.WEBSOCKETS_PORT': JSON.stringify(process.env.WEBSOCKETS_PORT),
      'process.env.STATIC_CONTENT_URL': JSON.stringify(process.env.STATIC_CONTENT_URL),
    }),
  ];

  if (mode === "development") {
    plugins.push(
      new HotModuleReplacementPlugin(),
      // new ForkTsCheckerWebpackPlugin({
      //   async: true,
      //   typescript: {
      //     configFile: path.resolve(__dirname, './src/app/tsconfig.json'),
      //   },
      //   issue: {
      //     include: [
      //       { file: './src/app/**/*.{ts,tsx}' },
      //     ],
      //   },
      // }),
    );
  }

  return {
    entry,
    mode,
    output: {
      path: path.resolve(__dirname, './dist/client/'),
      filename: 'bundle.js',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              // transpileOnly: true,
              configFile: path.resolve(__dirname, "src", "app", "tsconfig.json")
            },
          },
          exclude: '/node_modules/',
        },
        {
          test: /\.module\.s?css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]__[local]--[hash:base64:5]',
                },
                esModule: true,
              },
            },
            'sass-loader',
          ]
        },
        {
          test: /\.s?css$/,
          exclude: /\.module\.s?css$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader',
          ]
        },
        {
          test: /\.(png|jpg)$/,
          use: [
            {
              loader: 'url',
              options: {
                limit: 8192
              },
            }
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@root': path.resolve(__dirname, './src'),
        '@': path.resolve(__dirname, './src/app'),
      },
    },
    plugins,
    devtool: 'inline-source-map',
    devServer: {
      historyApiFallback: true,
    },
    stats: {
      errorDetails: mode == "development",
    },
  };
};
