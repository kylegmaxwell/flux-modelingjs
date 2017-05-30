'use strict';

var scene = require('../dist/index.js').scene;

/**
* Test date and results are stored in external files.
*/
describe("Scene Flattener test", function() {

    it("Flatten should work", function() {
        var flat = new scene.Flattener(require('./data/scene/fullScene.json'));
        var testResult = flat.flatten();
        var correctResult = require('./data/scene/fullSceneFlattened.json');
        expect(testResult.entities.length).toEqual(correctResult.entities.length);
        expect(testResult.transforms.length).toEqual(correctResult.transforms.length);
        for (var i=0;i<correctResult.entities.length;i++) {
            expect(testResult.entities[i]).toEqual(correctResult.entities[i]);
            expect(testResult.transforms[i]).toEqual(correctResult.transforms[i]);
        }
    });
});
