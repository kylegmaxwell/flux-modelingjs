describe("modeling/toJSON", function() {
    'use strict';

    var modeling = require("../index").modeling({genId: null});

    it ("entity toJSON should work", function() {
        var ptJSON = {
            "id" : undefined,
            "primitive": "point",
            "point": [10,10,10],
            "units": {
                "point": "meters"
            }
        }
        var point = modeling.entities.point([10,10,10]);
        expect(point.toJSON()).toEqual(ptJSON);
    });

    it ("operation toJSON should work", function() {
        var opJSON = ['tessellateStl', 'resultId-1', 1.2 ];
        var tessOp = modeling.operations.tesselateStl("resultId-1", 1.2);
        expect(tessOp.toJSON()).toEqual(opJSON);
    });
});