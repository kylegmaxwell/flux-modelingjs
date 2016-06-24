/**
 * This test uses a module built by rollup to ensure that this workflow is
 * maintained, as other repositories rely on it.
 */
describe("Serialize and rollup test", function() {
    'use strict';

    var modules = require('../build/rollup-test.common.js');
    var modeling = modules.getModeling();
    var schemaJson = modules.getSchema();

    it ("Scene should serialize to json", function() {
        var scene = modeling.query();
        scene.add("resultId", {"origin":[0,0,0],"primitive":"sphere","radius":10});
        var tessOp = modeling.operations.tesselateStl("resultId",1);
        scene.add("resultId", tessOp);
        var sceneStr = JSON.stringify({'Scene':scene});
        var expectedStr = '{"Scene":{"Entities":{"resultId":{"origin":[0,0,0],"primitive":"sphere","radius":10}},"Operations":[{"name":"resultId","op":["tessellateStl","resultId",1]}]}}';
        expect(sceneStr).toEqual(expectedStr);
    });

    it ("Rollup should process JSON", function() {
        expect(JSON.stringify(schemaJson).indexOf('sphere')).not.toEqual(-1);
    });
});