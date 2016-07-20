function forceJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * This test uses a module built by rollup to ensure that this workflow is
 * maintained, as other repositories rely on it.
 */
describe("Serialize and rollup test", function() {
    'use strict';

    var modeling = require("../index").modeling();

    it ("Scene should serialize to json", function() {
        var scene = modeling.query();
        scene.add("resultId", {"origin":[0,0,0],"primitive":"sphere","radius":10});
        var tessOp = modeling.operations.tessellateJson("resultId",2,0.5);
        scene.add("resultId", tessOp);
        var expected = {
            Entities: {
                resultId: {
                    primitive: "sphere",
                    origin:    [ 0, 0, 0 ],
                    radius:    10
                }
            },
            Operations: [
                {   name: "resultId",
                    op: [ "tessellateJson", "resultId", 2, 0.5]
                }
            ]
        };
        expect(forceJSON(scene.toJSON())).toEqual(forceJSON(expected));
    });
});