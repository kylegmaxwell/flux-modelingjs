'use strict';

var test = require('tape-catch');
var modeling = require('../dist/index.js');

test('Create scene instance', function (t) {
    var child = 'theChild';
    var label = 'Building';
    var inst = modeling.scene.element.instance(child, label);
    t.deepEqual(inst, {
        "entity": "theChild",
        "id": inst.id,
        "matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        "label": label,
        "primitive": "instance"
    }, 'Created correct instance');
    t.end();
});

test('Create scene layer', function (t) {
    var elements = ['theChild'];
    var label = 'Building';
    var layer = modeling.scene.element.layer(elements, [1,1,1], label, true);
    t.deepEqual(layer, {
        "elements": elements,
        "color": [1,1,1],
        "id": layer.id,
        "label": label,
        "visible": true,
        "primitive": "layer"
    }, 'Created correct layer');
    t.end();
});
