var autoprefixer = require('autoprefixer-core');
var postcssNested = require('postcss-nested');
var postcss = require('postcss');
var fs = require('fs');
var path = require('path');
var postcssTask = function(dron) {

	if (this.constructor!==postcssTask)
	return new postcssTask(dron);
	
	this.dron = dron;
	var self = this;
	dron.watchLocal('*.post.css', function(files) {
		if (files.length===0) {
			self.dron.warn('No postCSS files');
		} else {
			self.process(files);
		}
	});
}

postcssTask.prototype = {
	constructor: postcssTask,
	process: function(files) {
		var self = this;
		files.forEach(function(file) {
			self.dron.log('Processing postcss', file);
			fs.readFile(file, 'utf-8', function(err, content) {
				if (err) {
					self.dron.warn('The file is not readable', file, err);
				} else {
					var tar = file.replace(/\.post\.css$/, '.css');
					postcss([ postcssNested, autoprefixer ]).process(content, {
						from: file,
						to: tar
					}).then(function (result) {
					    result.warnings().forEach(function (warn) {
					        self.dron.warn(warn.toString());
					    });
					    fs.fileWrite(tar, 'utf-8', result.css);
					    self.dron.log('Created', path.basename(tar));
					});
				}
			});
			/**/
			
		});
	}
}

module.exports = postcssTask;