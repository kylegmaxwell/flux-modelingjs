describe("operation-toJSON", function() {
    'use strict';

    var modeling = require("../dist/index.js");

    it ("operation tessellateJson should work", function() {
        var opJSON = ['tessellateJson', 'resultId-1', 1.2, 1.0];
        var tessOp = modeling.Operation.tessellateJson("resultId-1", 1.2, 1.0);
        expect(tessOp.toJSON()).toEqual(opJSON);
    });
});
