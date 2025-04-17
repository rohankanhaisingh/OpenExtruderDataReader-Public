const fs = require("fs");
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const VIEWS_FOLDER = path.join(__dirname, "public", "src", "views");
const ENTRY_FOLDER = path.join(__dirname, "public", "src");
const DIST_FOLDER = path.join(__dirname, "public", "dist");

const page = id => new HtmlWebpackPlugin({
	template: "!!ejs-compiled-loader!" + path.join(VIEWS_FOLDER, `${id}.ejs`),
	filename: path.join(__dirname, "public", "dist", `${id}.ejs`),
	inject: "body",
	hash: true,
	publicPath: "/static/dist",
	chunks: [id]
});

const actualViewFiles = fs.readdirSync(VIEWS_FOLDER, "utf-8");

const scriptEntries = {},
	plugins = [new MiniCssExtractPlugin({ filename: "style.[contenthash].css" })];

for (let file of actualViewFiles) {

	if (file.endsWith(".ejs")) {

		const fileName = file.split(".ejs")[0];
		const scriptEntryDirectory = path.join(ENTRY_FOLDER, "scripts", fileName);

		if (fs.existsSync(scriptEntryDirectory)) {

			const scriptEntryFile = path.join(scriptEntryDirectory, "entry.ts");

			if (fs.existsSync(scriptEntryFile)) 
				scriptEntries[fileName] = scriptEntryFile;
		}

		plugins.push(page(fileName));
	}
}

module.exports = {
	mode: "production",
	devtool: "source-map",
	entry: scriptEntries,
	output: {
		filename: '[contenthash].js',
		path: DIST_FOLDER,
		clean: true
	},
	plugins: plugins,
	resolve: {
		extensions: ['.ts', '.tsx', '.js', ".scss", ".css"],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: 'ts-loader',
			},
			{
				test: /\.scss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							publicPath: '',
						},
					},
					'css-loader',
					'sass-loader',
				],
			}
		],
	},
	optimization: {
		splitChunks: {
			chunks: 'all',
		},
	}
};