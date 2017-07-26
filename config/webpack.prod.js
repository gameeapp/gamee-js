var path = require('path'),
    webpack = require('webpack');

module.exports = {
    devtool: '#source-map',

    entry: {
        bower: './bower_components/bullet/dist/bullet.min.js',
        gamee: './gamee/src/index.js'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    },

    output: {
        path: path.resolve(__dirname, '../gamee/dist'),
        filename: 'gamee-js.min.js'
    },

    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true,
                toplevel: true,
                except: ["Gamee",
                    "OneButtonController",
                    "TwoButtonController",
                    "FourButtonController",
                    "FiveButtonController",
                    "SixButtonController",
                    "FourArrowController",
                    "TouchController",
                    "JoystickController",
                    "JoystickButtonController",
                    "TwoArrowsTwoButtonsController",
                    "TwoArrowsOneButtonController",
                    "TwoActionButtonsController"] // this will make objects reserved words, so it wont be minified and its constructor is visible in IDE and debugger
            },
            compress: {
                screw_ie8: true,
                sequences: true,
                properties: true,
                dead_code: true,
                drop_debugger: true,
                drop_console: false,
                conditionals: true,
                comparisons: true
            },
            comments: false
        })
    ],

}