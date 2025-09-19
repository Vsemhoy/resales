module.exports = {
	module: {
		rules: [
			// CSS Modules (scoped styles)
			{
				test: /\.module\.css$/,
				use: [
					{
						loader: require.resolve('style-loader'),
					},
					{
						loader: require.resolve('css-loader'),
						options: {
							importLoaders: 1,
							modules: {
								localIdentName: '[name]__[local]___[hash:base64:5]', // readable class names
							},
						},
					},
					{
						loader: require.resolve('postcss-loader'),
					},
				],
			},
			// Global CSS (default styles)
			{
				test: /\.css$/,
				exclude: /\.module\.css$/, // don't process modules here
				use: [
					{
						loader: require.resolve('style-loader'),
					},
					{
						loader: require.resolve('css-loader'),
					},
					{
						loader: require.resolve('postcss-loader'),
					},
				],
			},
		],
	},
};
