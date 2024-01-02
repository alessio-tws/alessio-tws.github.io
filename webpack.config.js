const path = require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: "./src/index.js",
	output: {
		filename: "app.js",
		path: path.resolve(__dirname, "dist"),
		publicPath: "./"
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'src/index.html'
		}),
		new CopyWebpackPlugin({
			patterns: [
				{from:'src/assets',to:'assets'}	
			]
		})
	],
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					"style-loader",
					"css-loader",
					"sass-loader"
				]
			},
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			}
		]
	},
	resolve: {
		extensions: ['.tsx','.ts','.js'],
		alias: {
		  'react': 'nervjs',
		  'react-dom': 'nervjs',
		  // Not necessary unless you consume a module using `createClass`
		  'create-react-class': "nerv-create-class"
		}
	  }
}