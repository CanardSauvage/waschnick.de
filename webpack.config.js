// Modules
var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var ENV = process.env.npm_lifecycle_event;
module.exports = function makeWebpackConfig() {

    var config = {
        devtool: 'source-map',
        debug: true,
        entry: './build/app',
        output: {
            path: './hugo/themes/waschnick/static',
            filename: 'js/waschnick.js'
        },
        module: {
            preLoaders: [
                {test: /\.js$/, loaders: ['source-map-loader'], exclude: /node_modules/}
            ],
            loaders: [
                {test: /\.js$/, loader: 'babel', exclude: /node_modules/, query: {presets: ['es2015']}},
                {test: /\.css$/, loader: cssExtractor.extract('style', 'css?sourceMap&minimize')},
                {test: /\.scss$/, loader: cssExtractor.extract('style', 'css?sourceMap&minimize!sass?sourceMap')},
            ]
        },
        devServer: {
            historyApiFallback: true
        },
        plugins: [
            new CleanWebpackPlugin(['dist'], {verbose: true, dry: false}),
            new ExtractTextPlugin("css/waschnick.css"),
            new webpack.optimize.UglifyJsPlugin()
        ],
    };

    return config;
}();
