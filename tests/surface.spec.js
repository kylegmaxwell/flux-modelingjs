describe("surface", function(){
    'use strict';

    var modeling = require('../dist/index.js');
    // Tests non public API
    var types = require('../dist/types.js');

    it("Should work", function() {
        var result = modeling.geometry.surface(1,1,[[[0,0,0],[0,20,30]],
            [[10,0,0],[10,20,30]]], [0,0,1,1], [0,0,1,1]);

        expect(result.primitive).toEqual("surface");
        expect(result.uKnots.length).toEqual(4);
        expect(result.vKnots.length).toEqual(4);
        expect(result.controlPoints.length).toEqual(2);
        expect(result.controlPoints[0].length).toEqual(2);
        expect(result.controlPoints[0][0]).toEqual([0,0,0]);
        expect(result.controlPoints[1][0]).toEqual([10,0,0]);

        expect(types.checkAll(["Result", types.helpers.Entity("surface"), result]))
            .toEqual([undefined]);

    });

    it("Should throw when passed knots of the wrong length", function() {
        expect(function(){modeling.geometry.surface(
            1,
            1,
            [[[0,0,0],[0,20,30]],
                [[10,0,0],[10,20,30]]],
            [0,0,1],
            [0,0,1,1])}).toThrow();
        expect(function(){modeling.geometry.surface(
            1,
            1,
            [[[0,0,0],[0,20,30]],
                [[10,0,0],[10,20,30]]],
            [0,0,1,1],
            [0,0,1])}).toThrow();
    });

    it("Should throw when passed misshappen controlpoints", function() {
        expect(function(){modeling.geometry.surface(
            1,
            1,
            [[[0,0,0],[0,20,30]],
                [[10,0,0]]],
            [0,0,1,1],
            [0,0,1,1])}).toThrow();
    })

});
