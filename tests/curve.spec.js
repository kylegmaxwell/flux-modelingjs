describe("curve", function() {
    'use strict';

    var modeling = require('../index.js').modeling();
    var types = require('../index.js').types();

    // Sanity test.
    it ("Should work with control points passed as arrays, point objects, and wire format", function() {
        var result = modeling.entities.curve(1,[[0,0,0],[0,20,30]], [0,0,1,1]);

        expect(result.primitive).toEqual("curve");
        expect(result.controlPoints[0]).toEqual([0,0,0]);
        expect(result.controlPoints[1]).toEqual([0,20,30]);
        expect(types.checkAll(["Result", types.helpers.Entity("curve"), result]))
            .toEqual([undefined]);

        var p1 = modeling.entities.point([0,0,0]);
        var p2 = modeling.entities.point([0,20,30]);

        result = modeling.entities.curve(1,[p1, p2], [0,0,1,1]);
        expect(result.controlPoints[0]).toEqual([0,0,0]);
        expect(result.controlPoints[1]).toEqual([0,20,30]);
        expect(types.checkAll(["Result", types.helpers.Entity("curve"), result]))
            .toEqual([undefined]);

        p1 = modeling.entities.point([0,0,0]);
        p2 = modeling.entities.point([0,20,30]);

        result = modeling.entities.curve(1,[p1, p2], [0,0,1,1]);
        expect(result.controlPoints[0]).toEqual([0,0,0]);
        expect(result.controlPoints[1]).toEqual([0,20,30]);
        expect(types.checkAll(["Result", types.helpers.Entity("curve"), result]))
            .toEqual([undefined]);
    });

    it ("Should explode when given weights or knots of the wrong length", function() {
        expect(function(){modeling.entities.curve(
                1,
                [[0,0,0],[0,20,30]],
                [0,0,1],
                [1.0, 1.0])})
            .toThrow();
        expect(function(){modeling.entities.curve(
                1,
                [[0,0,0],[0,20,30]],
                [0,0,1,1],
                [1.0, 1.0, 1.0])})
            .toThrow();
    });
});
