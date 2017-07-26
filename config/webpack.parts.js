

const HtmlWebpackPlugin = require('html-webpack-plugin');

exports.devServer = ({ host, port } = {}) => ({
    devServer: {
        historyApiFallback: true,
        stats: 'errors-only',
        host, // Defaults to `localhost`
        port: 3001, // Defaults to 8080
        overlay: {
            errors: true,
            warnings: true,
        },
    },
});

exports.page = ({
  path = '',
    template = require.resolve(
        'html-webpack-plugin/default_index.ejs'
    ),
    title,
    entry,
    chunks,
} = {}) => ({
        entry,
        plugins: [
            new HtmlWebpackPlugin({
                chunks,
                filename: `${path && path + '/'}index.html`,
                template,
                title,
            }),
        ],
    });