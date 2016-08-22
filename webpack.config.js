// Modules
var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var DashboardPlugin = require('webpack-dashboard/plugin');

var ENV = process.env.npm_lifecycle_event;
var isBuild = ENV === 'build';

module.exports = function makeWebpackConfig() {

    var config = {

        devtool: 'source-map',
        debug: true,
        entry: './app/app',
        resolve: {
            extensions: ['', '.js', '.sass', '.html']
        },
        output: {
            path: './dist',
            filename: 'waschnick.js'
        },
        module: {
            preLoaders: [
                {test: /\.js$/, loaders: ['source-map-loader'], exclude: /node_modules/}
            ],
            loaders: [
                {test: /\.js$/, loader: 'babel', exclude: /node_modules/, query: {presets: ['es2015']}},
                {test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap&minimize')},
                {test: /\.scss$/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap&minimize!sass?sourceMap')},

                {test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/, loader: 'file?name=[path][name].[ext]?[hash]&context=./app/'},
                {
                    // TODO loader: 'html?attrs=script:src&img:src&root=/src'
                    test: /\.html$/, loader: 'file?name=[path][name].[ext]?[hash]&context=./app/'
                }
            ]
        },
        devServer: {
            historyApiFallback: true
        },
        plugins: [
            new ExtractTextPlugin('waschnick.css'),
            new DashboardPlugin()
        ],
    };


    if (isBuild) {
        console.info('Using BUILD-Config and use Dedupe.');
        config.plugins.push(
            // Reference: https://github.com/johnagan/clean-webpack-plugin
            // Clean up build folder on before prod build
            new CleanWebpackPlugin(['build'], {verbose: true, dry: false}),

            // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
            // Minify all javascript, switch loaders to minimizing mode
            new webpack.optimize.UglifyJsPlugin()
        )
    }

    return config;
}();
