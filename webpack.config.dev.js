import webpack from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import getEnv from './sessionVariables'

const mode = 'development'
const { PORT, DEBUG, SERVER_URL, SERVER_PORT, TOKEN_NAME } = getEnv(mode)

const GLOBAL = {
  'process.env': {
    NODE_ENV: JSON.stringify(mode),
    PORT: JSON.stringify(PORT),
    DEBUG: JSON.stringify(DEBUG),
    SERVER_URL: JSON.stringify(SERVER_URL),
    SERVER_PORT: JSON.stringify(SERVER_PORT),
    TOKEN_NAME: JSON.stringify(TOKEN_NAME)
  }
}
export default {
  mode: mode,
  resolve: {
    extensions: ['*', '.js', '.json']
  },
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client?reload=true',
    'react-hot-loader/patch',
    path.resolve(__dirname, 'src/index.js')
  ],
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js',
    globalObject: '(typeof self === \'undefined\' ? this : self)'
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'src')
  },
  plugins: [

    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin(GLOBAL),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      minify: {
        removeComments: true
      },
      inject: true
    })
  ],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.eot(\?v=\d+.\d+.\d+)?$/,
        use: ['file-loader']
      },

      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/font-woff'
            }
          }
        ]
      },
      {
        test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/octet-stream'
            }
          }
        ]
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'image/svg+xml'
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
    ]
  }
}
