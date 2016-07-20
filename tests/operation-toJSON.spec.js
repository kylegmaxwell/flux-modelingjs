describe("modeling/toJSON", function() {
    'use strict';

    var modeling = require("../index").modeling({genId: null});

    it ("operation toJSON should work", function() {
        var opJSON = ['tessellateStl', 'resultId-1', 1.2 ];
        var tessOp = modeling.operations.tessellateStl("resultId-1", 1.2);
        expect(tessOp.toJSON()).toEqual(opJSON);
    });
});