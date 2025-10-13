const path = require('path');

module.exports = () => (
  {
    entry: './src/index.ts',

    output: {
      path: path.resolve(__dirname, 'build'),
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
            loader: 'ts-loader'
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
    }
  }
)