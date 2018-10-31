const path = require('path');
const webpack = require('webpack');
const clientBundleOutputDir = './dist';
module.exports = {
    mode: "development",
    stats: { modules: false },
    entry: { 'main-client': './ClientApp/boot-client.tsx' },
    output: {
        "path": __dirname+'/dist',
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
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
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
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./dist/vendor-manifest.json')
        })
    ].concat([
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map', 
            moduleFilenameTemplate: path.relative(clientBundleOutputDir, '[resourcePath]') // Point sourcemap entries to the original file locations on disk
        })
    ])
}