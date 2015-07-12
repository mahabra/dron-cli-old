var fs = require('fs')
var colors = require('colors')
var Watcher = require('file-watch')
var mixin = (function() {
  var mixinup = function(a,b) { 
  	for(var i in b) { 
  		
  		if (b.hasOwnProperty(i)) { 
              
  			a[i]=b[i]; 
  		} 
  	} 
  	return a; 
  } 
  
  return function(a) { 
  	var i=1; 
  	for (;i<arguments.length;i++) { 
  		if ("object"===typeof arguments[i]) {
  			mixinup(a,arguments[i]); 
  		} 
  	} 
  	return a;
  }
})();
var slashrize= function(url) {
	url=url.replace(/\\/g, "/").replace('//', '/');
	if (url.substr(-1)!=='/') url+='/';
	return url;
}
var Dron = function(dir, args) {

	if (this.constructor!==Dron)
	return new Dron(dir, args);
	this.dir = slashrize(dir||process.cwd());
	this.tasks = {};
	this.processes = [];
	this.run(args);
}

Dron.prototype = {
	constructor: Dron,
	run: function(args) {
		for (var i=2;i<args.length;++i) {
			if (this.loadTask(args[i])) {
				this.runTask(args[i]);
			} else {
				this.warn('Task dron-'+args[i]+' is not exists. To use any module install it globaly.');
			}
		}
	},
	loadTask: function(taskName) {
		/*
		Load task
		*/
		try { require('dron-'+taskName)(this); } 
		catch(e) { 
			try {
				console.log('Searching in', slashrize(process.env.Path.substring(0, process.env.Path.indexOf(';'))));
				require(slashrize(process.env.Path.substring(0, process.env.Path.indexOf(';')))+'node_modules/dron-'+taskName+'')(this);
			} catch(e) {
				this.warn(e);
				return false;
			}
		}
		return this;
	},
	runTask: function(taskName) {
		this.processes.push(new this.tasks[taskName](this));
		return this.processes[this.processes.length-1];
	},
	registerTask: function(taskName, evolve, prototype) {
		var Task = function() {
			evolve.apply(this, arguments);
		};
		Task.prototype = mixin(prototype, {
			constructor: Task
		});
		this.tasks[taskName] = Task;
		return Task;
	},
	warn: function(message) {
		var messages = Array.prototype.slice.apply(arguments);
		messages[0] = messages[0].yellow;
		console.log.apply(console, messages);
		return true;
	},
	log: function() {
		var messages = Array.prototype.slice.apply(arguments);
		messages[0] = messages[0].green;
		console.log.apply(console, messages);
		return true;
	},
	watchLocal: function(mask, changefn) {
		var self = this;
		mask=mask.replace('.', '\\.');
		if (mask.substr(0,1)==='*') mask='[\\d\\w \\-\\.]*'+mask.substr(1);
		if (mask.substr(0,1)!=='^') mask='^'+mask+(mask.substr(-1)!=='$' ? '$' : '');
		mask = new RegExp(mask);

		//^[\d\w \-\.]*.less$
		fs.readdir(this.dir, function(err, list) {

			var valid = [];
			for (var i = 0;i<list.length;++i) {
				if (mask.test(list[i]))
				valid.push(self.dir+list[i]);
			}
			if (valid.length>0) {
				
				// fires it now
				changefn(valid);

				// And after
				this.watch(valid, changefn);
			} else {
				this.warn('Nothing to watch ');
			}
		}.bind(this));
	},
	watch: function(files, changefn) {
		var watcher = new Watcher(),
		wid='w'+(new Date()).getTime();
		watcher.watch(wid, files);
		
		watcher.on(wid, function () {
		  changefn(Array.prototype.slice.apply(arguments));
		});
	}
}

module.exports = Dron;

/*
var Watcher = require('file-watch')
 
var watcher = new Watcher()
 
watcher.watch('custom event', [
  'file1.txt',
  'file2.txt',
])
 
watcher.on('custom event', function () {
  console.log('custom event!')
})
*/