const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common(), {
  entry: './src/index.ts',
  output: {
    filename: 'swagger-protobuf-core.js',
  },
  devServer: {
    static: './example/web',
    hot: true,
  },
});