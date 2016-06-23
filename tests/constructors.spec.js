describe("Constructor utilities test", function() {
    'use strict';
    var modeling = require("../index").modeling();

    it ("Coords should work", function() {
        var a = modeling.utilities.coords([1,2,3]);
        expect(a).toEqual([1,2,3]);
        a = modeling.utilities.coords(modeling.entities.point([4,5,6]));
        expect(a).toEqual([4,5,6]);
        a = modeling.utilities.coords(modeling.entities.point([8,9,0]).toJSON());
        expect(a).toEqual([8,9,0]);
    });

    it ("vecCoords should work", function() {
        var a = modeling.utilities.vecCoords([1,2,3]);
        expect(a).toEqual([1,2,3]);
        a = modeling.utilities.vecCoords(modeling.entities.vector([4,5,6]));
        expect(a).toEqual([4,5,6]);
        a = modeling.utilities.vecCoords(modeling.entities.vector([8,9,0]).toJSON());
        expect(a).toEqual([8,9,0]);
    });


    // TODO(andrew): these tests currently fail, which is naively a somewhat
    // surprising result. This is because the Point and Vector class definitions
    // are coupled to various configuration parameters for the module (schema, ...)
    //
    // When https://vannevar.atlassian.net/browse/LIB3D-624, we should be able to
    // re-enable this.
    // var modeling2 = require('../index').modeling();
    // it ("Coords and vecCoords should work with data from different instances of the modeling package", function() {
    //     var a = modeling.utilities.coords(modeling2.entities.point([4,5,6]));
    //     expect(a).toEqual([4,5,6]);
    //     a = modeling.utilities.vecCoords(modeling.entities.vector([4,5,6]));
    //     expect(a).toEqual([4,5,6]);
    // })
});