describe("Constructor utilities test", function() {
    'use strict';
    var modeling = require("../dist/index.js");
    // Tests non public API
    var units = require("../dist/units.js");

    it ("Coords should work", function() {
        var a = units.coords([1,2,3]);
        expect(a).toEqual([1,2,3]);
        a = units.coords(modeling.geometry.point([4,5,6]));
        expect(a).toEqual([4,5,6]);
        a = units.coords(modeling.geometry.point([8,9,0]));
        expect(a).toEqual([8,9,0]);
    });

    it ("vecCoords should work", function() {
        var a = units.vecCoords([1,2,3]);
        expect(a).toEqual([1,2,3]);
        a = units.vecCoords(modeling.geometry.vector([4,5,6]));
        expect(a).toEqual([4,5,6]);
        a = units.vecCoords(modeling.geometry.vector([8,9,0]));
        expect(a).toEqual([8,9,0]);
    });


    // TODO(andrew): these tests currently fail, which is naively a somewhat
    // surprising result. This is because the Point and Vector class definitions
    // are coupled to various configuration parameters for the module (schema, ...)
    //
    // When https://vannevar.atlassian.net/browse/LIB3D-624, we should be able to
    // re-enable this.
    var modeling2 = require("../dist/index.js");
    // Tests non public API
    var units2 = require("../dist/units.js");
    it ("Coords and vecCoords should work with data from different instances of the modeling package", function() {
        var a = units2.coords(modeling2.geometry.point([4,5,6]));
        expect(a).toEqual([4,5,6]);
        a = units2.vecCoords(modeling2.geometry.vector([4,5,6]));
        expect(a).toEqual([4,5,6]);
    })
});
