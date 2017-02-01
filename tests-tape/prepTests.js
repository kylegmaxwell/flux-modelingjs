'use strict';

var test = require('tape-catch');
var modeling = require('../dist/index.js');
var fixtures = require('./data/fixturesPrep.js');

test('Prep scene data', function (t) {
    Object.keys(fixtures).forEach(function (key) {
        var data = fixtures[key];
        var primStatus = new modeling.scene.StatusMap();
        var entity = modeling.scene.prep(data.start, primStatus);
        t.deepEqual(entity, data.end, 'Prep '+key+' has expected result.');
        var errors = primStatus.invalidKeySummary();
        if (data.errors) {
            t.ok(errors.indexOf(data.errors) !== -1, 'Scene prep should error for '+key+'.');
        } else {
            t.equal(errors, '', 'Scene prep should pass for '+key+'.');
            if (modeling.scene.isScene(data.start)) {
                var sceneValidator = new modeling.scene.Validator();
                var sceneValid = sceneValidator.validateJSON(entity);
                t.equal(sceneValid.getMessage(), '', 'No errors from validator');
            }
        }
    });
    t.end();
});
