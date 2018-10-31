const path = require('path');
const webpack = require('webpack');
const clientBundleOutputDir = './dist';
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: 'development',
    stats: { modules: false, children: false },
    entry: { 'main': './ClientApp/boot-client.tsx' },
    output: {
        "path": __dirname + '/dist',
        "filename": "[name].js"
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    devtool: "source-map",
    devServer: {
        contentBase: './dist',
        port: 30000,
        hot: true
    },
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
                test: /\.ts(x?)$/,
                exclude: '/node_modules',
                include: /ClientApp/,
                loaders: ['babel-loader', 'ts-loader']
                //use: {
                //    //loaders: ['babel-loader', 'ts-loader'],
                //    options: {
                //        presets: [
                //            "env",
                //            "react"
                //        ]
                //    }
                //}
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
        }),
        new webpack.HotModuleReplacementPlugin()
    ].concat([
        // Plugins that apply in development builds only
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map', // Remove this line if you prefer inline source maps
            moduleFilenameTemplate: path.relative(clientBundleOutputDir, '[resourcePath]') // Point sourcemap entries to the original file locations on disk
        })
    ])
}









//const path = require('path');
//const webpack = require('webpack');
//const clientBundleOutputDir = './dist';
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");

//module.exports = {
//    mode: 'development',
//    stats: { modules: false, children: false },
//    //entry: ['babel-polyfill','./ClientApp/boot-client.tsx'],
//    entry: { 'main': './ClientApp/boot-client.tsx' },
//    output: {
//        "path": '/dist/',
//        "filename": "main.js",
//        "publicPath": '/dist/'
//    },
//    resolve: {
//        extensions: ['.js', '.jsx', '.ts', '.tsx']
//    },
//    devtool: "none",
//    devServer: {
//        contentBase: './dist',
//        port: 30000,
//        hot: true
//    },
//    module: {
//        rules: [
//            {
//                test: /\.(js|jsx)$/,
//                exclude: '/node_modules',
//                include: /ClientApp/,
//                use: {
//                    loader: "babel-loader",
//                    options: {
//                        presets: [
//                            "env",
//                            "react"
//                        ]
//                    }
//                }
//            },
//            //{
//            //    test: /\.tsx?$/,
//            //    exclude: '/node_modules',
//            //    include: /ClientApp/,
//            //    use: {
//            //        loader: "ts-loader",
//            //        options: {
//            //            //transpileOnly: true
//            //            //"presets": [
//            //            //    ["env", {
//            //            //        "targets": {
//            //            //            "browsers": [
//            //            //                "Chrome >= 59",
//            //            //                "FireFox >= 44",
//            //            //                "Safari >= 7",
//            //            //                "Explorer 11",
//            //            //                "last 4 Edge versions"
//            //            //            ]
//            //            //        },
//            //            //        "useBuiltIns": true
//            //            //    }],
//            //            //    "react",
//            //            //    "stage-1"
//            //            //],
//            //            //"ignore": [
//            //            //    "node_modules"
//            //            //],
//            //            //"plugins": [
//            //            //    "transform-es2015-arrow-functions",
//            //            //    "transform-class-properties",
//            //            //    "syntax-class-properties"
//            //            //]
//            //        }
//            //    },
//            //    query: {
//            //        presets: [
//            //            "es2015",
//            //            ["env", {
//            //                "targets": {
//            //                    "browsers": [
//            //                        "Chrome >= 59",
//            //                        "FireFox >= 44",
//            //                        "Safari >= 7",
//            //                        "Explorer 11",
//            //                        "last 4 Edge versions"
//            //                    ]
//            //                },
//            //                "useBuiltIns": true
//            //            }],
//            //            "react",
//            //            "stage-1"
//            //        ]
//            //    }
//            //},
//            {
//                test: /\.tsx?$/,
//                exclude: '/node_modules',
//                include: /ClientApp/,
//                use: {
//                    loader: "babel-loader",
//                    options: {
//                        presets: [
//                            "env",
//                            "react"
//                        ]
//                    }
//                }
                
//                //query: {
//                //    presets: [
//                //        "es2015",
//                //        ["env", {
//                //            "targets": {
//                //                "browsers": [
//                //                    "Chrome >= 59",
//                //                    "FireFox >= 44",
//                //                    "Safari >= 7",
//                //                    "Explorer 11",
//                //                    "last 4 Edge versions"
//                //                ]
//                //            },
//                //            "useBuiltIns": true
//                //        }],
//                //        "react",
//                //        "stage-1"
//                //    ]
//                //}
//            },
//            //{
//            //    test: /\.tsx?$/,
//            //    exclude: '/node_modules',
//            //    include: /ClientApp/,
//            //    use: {
//            //        loader: "awesome-typescript-loader?silent=true"
//            //    }
//            //},


//            //{
//            //    test: /\.tsx?$/,
//            //    exclude: '/node_modules',
//            //    include: /ClientApp/,
//            //    use: {
//            //        loader: "babel-loader",
//            //        options: {
//            //            //transpileOnly: true
//            //            presets: [
//            //                ["env", {
//            //                    "targets": {
//            //                        "browsers": [
//            //                            "Chrome >= 59",
//            //                            "FireFox >= 44",
//            //                            "Safari >= 7",
//            //                            "Explorer 11",
//            //                            "last 4 Edge versions"
//            //                        ]
//            //                    },
//            //                    "useBuiltIns": true
//            //                }],
//            //                "react"
//            //            ]
//            //        }
//            //    }
//            //},
//            {
//                test: /\.scss$/,
//                use: [
//                    MiniCssExtractPlugin.loader,
//                    "css-loader",
//                    "sass-loader"
//                ]
//            },
//            {
//                test: /\.css$/,
//                use: [
//                    MiniCssExtractPlugin.loader,
//                    "css-loader"
//                ]
//            },
//            {
//                test: /\.(png|jpg|jpeg|gif|svg)$/,
//                use: 'url-loader?limit=25000'
//            }
//        ]
//    },
//    plugins: [
//        new MiniCssExtractPlugin({
//            filename: "site.css"
//        }),
//        new webpack.DllReferencePlugin({
//            context: __dirname,
//            manifest: require('./dist/vendor-manifest.json')
//        }),
//        new webpack.HotModuleReplacementPlugin()
//    ].concat([
//        // Plugins that apply in development builds only
//        new webpack.SourceMapDevToolPlugin({
//            filename: '[file].map', // Remove this line if you prefer inline source maps
//            moduleFilenameTemplate: path.relative(clientBundleOutputDir, '[resourcePath]') // Point sourcemap entries to the original file locations on disk
//        })
//    ])
//}