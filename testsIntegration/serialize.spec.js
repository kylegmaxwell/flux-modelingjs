/**
 * This test uses a module built by rollup to ensure that this workflow is
 * maintained, as other repositories rely on it.
 */
describe("Serialize and rollup test", function() {
    'use strict';

    var modeling = require('../build/rollup-test.common.js');
    var schemaJson = modeling.schema.entity;

    it ("Scene should serialize to json", function() {
        var scene = new modeling.Query();
        scene.add("resultId", {"origin":[0,0,0],"primitive":"sphere","radius":10});
        var tessOp = modeling.Operation.tessellateJson("resultId", 1.4, 1.0);
        scene.add("resultId", tessOp);
        expect(JSON.parse(JSON.stringify(scene)))
        .toEqual({
            "Entities": {
                "resultId": {
                    "origin": [0, 0, 0],
                    "primitive": "sphere",
                    "radius":10
                }
            },
            "Operations": [
                {   "name": "resultId",
                    "op": [ "tessellateJson", "resultId", 1.4, 1.0 ]
                }
            ]
        });
    });

    it ("Rollup should process JSON", function() {
        expect(JSON.stringify(schemaJson).indexOf('sphere')).not.toEqual(-1);
    });
});
