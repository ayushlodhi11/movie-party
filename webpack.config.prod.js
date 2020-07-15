import webpack from 'webpack';
import WebpackMd5Hash from 'webpack-md5-hash';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import getEnv from './sessionVariables';
import TerserPlugin from 'terser-webpack-plugin';
import WorkboxPlugin from 'workbox-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const mode = 'production';

const { PORT, DEBUG, SERVER_URL, SERVER_PORT, TOKEN_NAME } = getEnv(process.env.ENV);

const GLOBALS = {
	'process.env': {
		NODE_ENV: JSON.stringify(mode),
		PORT: JSON.stringify(PORT),
		DEBUG: JSON.stringify(DEBUG),
		SERVER_URL: JSON.stringify(SERVER_URL),
		SERVER_PORT: JSON.stringify(SERVER_PORT),
		TOKEN_NAME: JSON.stringify(TOKEN_NAME),
	},
};

console.log('globals', GLOBALS);

export default {
	mode: mode,
	resolve: {
		extensions: ['*', '.js', '.jsx', '.json'],
	},
	devtool: 'source-map',
	entry: {
		index: path.resolve(__dirname, 'src/index'),
	},
	target: 'web',
	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/',
		filename: '[name].[chunkhash].js',
	},
	optimization: {
		splitChunks: {
			chunks: 'all',
		},
		minimizer: [
			new TerserPlugin({
				sourceMap: true, // Must be set to true if using source-maps in production
				terserOptions: {
					compress: {
						drop_console: true,
					},
				},
			}),
		],
	},
	plugins: [
		new WebpackMd5Hash(),
		new webpack.DefinePlugin(GLOBALS),
		new HtmlWebpackPlugin({
			filename: path.resolve(__dirname, './dist/index.html'),
			template: path.resolve(__dirname, './src/client/index.ejs'),
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			},
			inject: true,
		}),
		new CopyPlugin([
			{ from: './src/client/favicon.ico' },
			{ from: './src/client/images', to: 'images' },
			{ from: './src/client/manifest.json' },
			{ from: './src/client/_redirects' },
		]),
		new WorkboxPlugin.InjectManifest({
			// globDirectory: './public/dist/',
			// globPatterns: ['**\/*.{html,js,css}'],
			swSrc: './src/client/sw.js',
			swDest: 'service-worker.js',
			// clientsClaim: true,
			// skipWaiting: true,
			// navigateFallback: '/**'
		}),
	],
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
			{
				test: /\.worker\.js$/,
				loader: 'worker-loader',
			},

			{
				test: /\.eot(\?v=\d+.\d+.\d+)?$/,
				use: ['file-loader'],
			},

			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 10000,
							mimetype: 'application/font-woff',
						},
					},
				],
			},
			{
				test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 10000,
							mimetype: 'application/octet-stream',
						},
					},
				],
			},
			{
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 10000,
							mimetype: 'image/svg+xml',
						},
					},
				],
			},
			{
				test: /\.(jpe?g|png|gif|ico)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
						},
					},
				],
			},
			{
				test: /(\.css|\.scss|\.sass)$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							plugins: () => [require('autoprefixer')],
							sourceMap: true,
						},
					},
					{
						loader: 'sass-loader',
						options: {
							includePaths: [path.resolve(__dirname, 'src', 'scss')],
							sourceMap: true,
						},
					},
				],
			},
		],
	},
};
