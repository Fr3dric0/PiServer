const webpack = require('webpack');
const path = require('path');

let BUILD_DIR = path.resolve(__dirname, 'client/app');
let APP_DIR = path.resolve(__dirname, 'client/assets');

let config = {
    entry: APP_DIR + '/index.jsx',
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?/,
                include: APP_DIR,
                loader: 'babel'
            }
        ]
    }
};


module.exports = config;