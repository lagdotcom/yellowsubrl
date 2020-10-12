const path = require('path');
const dist = path.join(__dirname, 'dist');

module.exports = {
	entry: './src/main',
	plugins: [],
	output: {
		path: dist,
		filename: 'main.js',
	},
	devtool: 'source-map',
	devServer: {
		contentBase: dist,
		compress: true,
		open: true,
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.(png|wav)$/,
				loader: 'file-loader',
				options: { name: '[name].[ext]' },
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{ test: /\.tsx?$/, loader: 'ts-loader' },
		],
	},
};
