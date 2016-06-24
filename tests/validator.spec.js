/**
 * This test runs several scenes through the validator and checks the results.
 */
describe("Scene validator test", function() {
    'use strict';

    var SceneValidator = require('../SceneValidator.js');
    var badLayerScene = require('./data/scene/badLayerScene.json');
    var basicScene = require('./data/scene/basicScene.json');
    var maxRectangles = require('./data/scene/maxRectangles.json');
    var validAssembly = require('./data/scene/validAssembly.json');

    it ("Bad layer scene should error", function() {
        var validator = new SceneValidator();
        var results = validator.validateJSON(badLayerScene);
        expect(results.getResult()).toEqual(false);
        expect(results.getMessage().indexOf('element')).not.toEqual(-1);
    });

    it ("Basic scene should validate", function() {
        var validator = new SceneValidator();
        var results = validator.validateJSON(basicScene);
        expect(results.getResult()).toEqual(true);
        expect(results.getMessage()).toEqual('');
    });

    it ("Rectangles scene should validate", function() {
        var validator = new SceneValidator();
        var results = validator.validateJSON(maxRectangles);
        expect(results.getResult()).toEqual(true);
        expect(results.getMessage()).toEqual('');
    });

    it ("Assembly scene should validate", function() {
        var validator = new SceneValidator();
        var results = validator.validateJSON(validAssembly);
        expect(results.getResult()).toEqual(true);
        expect(results.getMessage()).toEqual('');
    });

});