'use strict';

var scene = require('../dist/index.js').scene;

/**
* Test date and results are stored in external files.
*/
describe("Scene Flattener test", function() {

    it("Flatten should work", function() {
        var testResult = new scene.Flattener(require('./data/scene/fullScene.json')).flatten();
        var correctResult = require('./data/scene/fullSceneFlattened.json');
        expect(testResult).toEqual(correctResult);
    });
});