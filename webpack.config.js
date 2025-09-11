const path = require('path');

module.exports = {
  entry: './src/index.ts',

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'swagger-protobuf-core.js',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },

    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devServer: {
    static: './example/web',
    hot: true,
  },
};