var less = require('less');
var fs = require('fs');
var lessTask = function(dron) {
	if (this.constructor!==lessTask)
	return new lessTask(dron);
	
	this.dron = dron;
	var self = this;
	var files = dron.watchLocal('*.less', function(files) {
		self.process(files);
	});
}

lessTask.prototype = {
	constructor: lessTask,
	process: function(files) {
		var self = this;
		files.forEach(function(file) {
			self.dron.log('Processing less', file);
			fs.readFile(file, 'utf-8', function(err, content) {
				if (err) {
					self.dron.warn('The file is not readable', file, err);
				} else {
					less.render(content, function (e, output) {
					  console.log(output.css);
					});
				}
			});
			/**/
			
		});
	}
}

module.exports = lessTask;