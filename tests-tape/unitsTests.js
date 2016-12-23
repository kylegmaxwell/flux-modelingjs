'use strict';

var test = require('tape-catch');
var modeling = require('../dist/index.js');
var fixturesUnits = require('./data/fixturesUnits.js');

test( 'Units translation', function ( t ) {
    Object.keys(fixturesUnits).forEach(function (key) {
        var primStatus = new modeling.scene.StatusMap();
        var entity = modeling.scene.prep(fixturesUnits[key].start, primStatus);
        var succeedStr = fixturesUnits[key].succeed ? 'pass' : 'fail';
        var hasException = false;
        try {
            t.deepEqual(entity, fixturesUnits[key].end, 'Convert '+key+' to meters.');
        } catch (err) {
            hasException = true;
            t.equal(err.constructor, modeling.FluxModelingError);
        }
        t.equal(!hasException, fixturesUnits[key].succeed, 'Unit normalization should '+succeedStr+' for '+key+'.');
    });
    t.end();
});
