#! /usr/bin/env node
"use strict";
console.log('Hi. Im dron.')
var dron = require('./lib/dron.js')(process.cwd(), process.argv);
