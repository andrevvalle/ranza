'use strict';

var Promises = require('bluebird'), 
	colorizer = require('./colorizer'),
	adapter = require('./adapter');

function diff (arr, diff){
    return arr.filter(function(i) {return diff.indexOf(i) < 0;});
}

function Compare (root, requires) {
	return new Promises(function(resolve, reject) {
		var pJson = require(root + '/package.json');
		var log = [],
			successLog = [],
			unusedLog = [],
			undefinedLog = [];

		var dependencies = new Array(),
			normal = pJson.dependencies || {},
			dev = pJson.devDependencies || {};

		normal = (Object.keys(normal));
		dev = (Object.keys(dev));

		dependencies = normal.concat(dev);

		if (requires.length <= 0 && dependencies.length <= 0) {
			return reject('There is no dependencies or requires!');
		}

		dependencies = dependencies.filter(function(item, pos) {
    		return dependencies.indexOf(item) == pos;
		});

		log.push('[RANZA STATUS]');


		/* Dependency Comparator */
		var gruntDependencies = dependencies.filter(function(item){ 
			if (item.indexOf('grunt') >= 0) return true });

		if (gruntDependencies.length >= 0) {
			var gruntFile = adapter.gruntDependencies(root + 'Gruntfile.js');
			gruntDependencies.forEach(function(gruntDependency){
				if (gruntFile.indexOf(gruntDependency) < 0){
					unusedLog.push(colorizer('error', '  • ') + gruntDependency)
				} else {
					successLog.push(colorizer('success', '  • ') + gruntDependency)
				}
			})
		}

		dependencies = dependencies.filter(function(item){ 
			if (item.indexOf('grunt') === -1) return true });

		dependencies.forEach(function(dependency) {
			var index = requires.indexOf(dependency);
			if (index < 0) {
				unusedLog.push(colorizer('error', '  • ') + dependency)
			} else {
				successLog.push(colorizer('success', '  • ') + dependency)
			}
		});

		var unused = diff(dependencies, requires);

		var differences = diff(requires, dependencies);
		if (differences.length > 0) {
			differences.forEach(function(diff) {
				undefinedLog.push(colorizer('error', '  • ') + diff)
			})
		}

		if (successLog.length > 0) {
			log.push(colorizer('success','\n Defined and used:'))
			log.push(successLog.join('\n'))
		}

		if (unusedLog.length > 0) {
			log.push(colorizer('error','\n Defined, but unused:'))
			log.push(unusedLog.join('\n'))
		}

		if (undefinedLog.length > 0) {
			log.push(colorizer('error','\n Undefined, but used:'))
			log.push(undefinedLog.join('\n'))	
		}

		resolve([differences, unused, dependencies, log.join('\n')]);
	});
}

module.exports = Compare;