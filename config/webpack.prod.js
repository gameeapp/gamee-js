const path = require('path'),
    webpack = require('webpack')

module.exports = {
    devtool: '#source-map',

    entry: './gamee/src/index.js',

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
        // dont set this or context will be `gamee.gamee.emitter` etc.
        // library: 'gamee',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, '../gamee/dist'),
        filename: 'gamee-js.min.js'
    },

    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.BannerPlugin({
            banner: `@preserve build time ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}`
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true,
                toplevel: true,
                except: ["OneButtonController",
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
                drop_console: true,
                conditionals: true,
                comparisons: true
            },
            comments: "some"
        })
    ],

}