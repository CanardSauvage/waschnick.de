// Modules
var webpack = require('webpack'),
    path = require('path'),
//ExtractTextPlugin = require('extract-text-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin');
var ENV = process.env.npm_lifecycle_event;
var isDev = ENV === 'watch';
var isTest = ENV === 'test' || ENV === 'testw';
var isMock = ENV === 'start';
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
            filename: 'bundle.js'
        },
        module: {
            preLoaders: [
                {test: /\.js$/, loaders: ['source-map-loader'], exclude: /node_modules/}
            ],
            loaders: [
                {test: /\.js$/, loader: 'babel', exclude: /node_modules/, query: {presets: ['es2015']}},
                {test: /\.scss$/, loaders: ['style', 'css?sourceMap', 'sass?sourceMap']},
                {test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/, loader: 'file?name=app/[path][name].[ext]?[hash]&context=./app/'},
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
            //new ExtractTextPlugin('styles.css')
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
