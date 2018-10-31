const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    mode: "production",
    stats: { modules: false },
    entry: {
        vendor: [
            'bootstrap',
            'bootstrap/dist/css/bootstrap.css',
            'domain-task',
            'event-source-polyfill',
            'react',
            'react-dom',
            'react-router',
            'react-redux',
            'redux',
            'redux-thunk',
            'react-router-redux',
            'style-loader',
            'jquery'
        ]
    },
    output: {
        publicPath: '/dist/',
        filename: '[name].js',
        library: '[name]_[hash]',
        path: path.join(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js']
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['react', 'es2015']
                    }
                }
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)(\?|$)/,
                use: {
                    loader: 'url-loader?limit=100000'
                }
            },
            {
                test: /\.css(\?|$)/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "vendor.css"
        }),
        new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery' }), 
        new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, require.resolve('node-noop')), // Workaround for https://github.com/andris9/encoding/issues/16
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new webpack.DllPlugin({
            path: path.join(__dirname, 'dist', '[name]-manifest.json'),
            name: '[name]_[hash]'
        })
    ]
}