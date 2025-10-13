const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common(), {
  entry: './src/lite.ts',
  output: {
    filename: 'swagger-protobuf-lite.js',
  },
  devServer: {
    static: './example/web',
    hot: true,
  },
});