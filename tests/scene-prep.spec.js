'use strict';

var scene = require('../dist/index.js').scene;

/**
* Test date and results are stored in external files.
*/
describe("Scene prep test", function() {

    it("prep should work", function() {
        var sphere = {"origin":[0,0,0],"primitive":"sphere","radius":10};
        var result = scene.prep(sphere);
        expect(result).toEqual([sphere]);
    });
});
