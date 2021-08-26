var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var extractCSS = new ExtractTextPlugin('public/css/style.css');

module.exports = {
    entry: path.resolve(__dirname, 'src/assets/js'),
    output: {
        filename: 'public/js/index.js',
    },
    devtool: 'source-map',
    module: {
        loaders: [{
                loader: 'babel-loader',

                // Skip any files outside of your project's `src` directory
                exclude: /node_modules/,

                // Only run `.js` and `.jsx` files through Babel
                test: /\.jsx?$/,

                // Options to configure babel with
                query: {
                    plugins: ['transform-runtime'],
                    presets: ['es2015', 'stage-0'],
                }
            },

            {
                test: /\.scss$/i,
                loader: extractCSS.extract(['css-loader', 'resolve-url-loader', 'sass-loader?sourceMap'])
            },

            {
                test: /\.(png|svg|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url?limit=25000&name=public/images/[name].[ext]'
            },

            {
                test: /\.(woff|woff2|eot|ttf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url?limit=25000&name=public/fonts/[name].[ext]'
            }
        ]
    },
    plugins: [
        extractCSS,
        new webpack.ProvidePlugin({ // Make jquery available globally
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
    ],
    debug: true,
}
