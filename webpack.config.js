'use strict';

var path = require('path');
var webpack = require('sgmf-scripts').webpack;
var jsFiles = require('sgmf-scripts').createJsPath();

var bootstrapPackages = {
    Alert: 'exports-loader?Alert!bootstrap/js/src/alert',
    // Button: 'exports-loader?Button!bootstrap/js/src/button',
    Carousel: 'exports-loader?Carousel!bootstrap/js/src/carousel',
    Collapse: 'exports-loader?Collapse!bootstrap/js/src/collapse',
    // Dropdown: 'exports-loader?Dropdown!bootstrap/js/src/dropdown',
    Modal: 'exports-loader?Modal!bootstrap/js/src/modal',
    // Popover: 'exports-loader?Popover!bootstrap/js/src/popover',
    Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/src/scrollspy',
    Tab: 'exports-loader?Tab!bootstrap/js/src/tab',
    // Tooltip: 'exports-loader?Tooltip!bootstrap/js/src/tooltip',
    Util: 'exports-loader?Util!bootstrap/js/src/util'
};

module.exports = [
    {
        mode: 'production',
        name: 'js',
        entry: path.resolve('./cartridges/bm_prefixbox_ai_search/cartridge/static/default/modules/main.js'),
        output: {
            path: path.resolve(
                './cartridges/bm_prefixbox_ai_search/cartridge/static/default/js'
            ),
            filename: '[name].js',
            libraryTarget: 'var',
            library: 'PrefixboxSalesforceLibrary',
            globalObject: 'window',
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            sourceType: 'script',
                        },
                    },
                    exclude: /node_modules/,
                },
            ],
        },
    },
];
