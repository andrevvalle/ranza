'use strict';

var Promises = require('bluebird');

var watch = require('node-watch'),
    glob = Promises.promisify(require('glob')),
    rooter = require('./rooter');

function Sentinel(path) {
    return new Promises(function(resolve, reject) {
        var root = rooter(path),
            globOptions = {};
        
        glob(root + '**/*.js*', globOptions).then(function(files) {
            return resolve([files, root]);
        });
    });
}

module.exports = Sentinel;