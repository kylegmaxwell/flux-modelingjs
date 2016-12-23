'use strict';

var test = require('tape-catch');
var modeling = require('../dist/index.js');
var fixtures = require('./data/fixturesPrep.js');

test('Prep scene data', function (t) {
    Object.keys(fixtures).forEach(function (key) {
        var data = fixtures[key];
        var primStatus = new modeling.scene.StatusMap();
        var entity = modeling.scene.prep(data.start, primStatus);
        var succeedStr = data.succeed ? 'pass' : 'fail';
        var hasException = false;
        try {
            t.deepEqual(entity, data.end, 'Prep '+key+' has expected result.');
        } catch (err) {
            hasException = true;
            t.equal(err.constructor, modeling.FluxModelingError);
        }
        t.equal(!hasException, data.succeed, 'Scene prep should '+succeedStr+' for '+key+'.');
    });
    t.end();
});
