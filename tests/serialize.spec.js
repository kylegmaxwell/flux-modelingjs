'use strict';

function forceJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * This test uses a module built by rollup to ensure that this workflow is
 * maintained, as other repositories rely on it.
 */
describe("Serialize and require test", function() {
    'use strict';

    var modeling = require("../dist/index.js");

    it ("Scene should serialize to json", function() {
        var scene = new modeling.Query();
        scene.add("resultId", {"origin":[0,0,0],"primitive":"sphere","radius":10});
        var tessOp = modeling.Operation.tessellateJson("resultId",2,0.5);
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
