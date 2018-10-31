const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: 'production',
    stats: { modules: false },
    entry: { 'main-client': './ClientApp/boot-client.tsx' },
    output: {
        "path": __dirname + '/dist',
        "filename": "[name].js"
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: '/node_modules',
                include: /ClientApp/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "env",
                            "react"
                        ]
                    }
                }
            },
            {
                test: /\.tsx?$/,
                exclude: '/node_modules',
                include: /ClientApp/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                use: 'url-loader?limit=25000'
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "site.css"
        }),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./dist/vendor-manifest.json')
        })
    ].concat([
            // Plugins that apply in production builds only
            new UglifyJsPlugin()
    ])
}