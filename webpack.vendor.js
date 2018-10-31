const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: "production",
    stats: { modules: false },
    entry: {
        vendor: [
            'domain-task',
            'event-source-polyfill',
            'react',
            'react-dom',
            'react-router',
            'react-redux',
            'redux',
            'redux-thunk',
            'react-router-redux',
            'style-loader'
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
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "es2015",
                            "react"
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'url-loader',
                    'file-loader'
                ]
            },
            {
                test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: [
                    'url-loader?limit=25000'
                ]
            }
        ]
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, require.resolve('node-noop')), // Workaround for https://github.com/andris9/encoding/issues/16
        new webpack.DllPlugin({
            path: path.join(__dirname, 'dist', '[name]-manifest.json'),
            name: '[name]_[hash]'
        })
    ]
}