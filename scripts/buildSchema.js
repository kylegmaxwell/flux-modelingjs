'use strict';

var scene = require('../dist/schema/index.js');
var fs = require('fs');

// Write out the schemas as .json for tools that dont understand .js
fs.writeFile('./dist/schema/flux-entity.json', JSON.stringify(scene.entity));
fs.writeFile('./dist/schema/flux-material.json', JSON.stringify(scene.material));
fs.writeFile('./dist/schema/flux-revit.json', JSON.stringify(scene.revit));

console.log('Schema exported to json');
