describe("modeling/measure/lookupDimensions", function() {
    'use strict';

    it("Should look up field dimensions correctly", function(){
        var lookupDimensions = require("../modeling.js").utilities.lookupFieldDimensions;
        expect(lookupDimensions("point")).toEqual( { point: 'length' });
        expect(lookupDimensions("curve")).toEqual( { controlPoints: 'length' });
        expect(lookupDimensions("block")).toEqual( { origin: 'length', dimensions: 'length' });
        expect(lookupDimensions("mesh")).toEqual( { vertices: 'length' });

        // TODO(andrew): think about, and then implement, a better way to track
        // units for composite entities.
        expect(lookupDimensions("polycurve")).toEqual( {});
    })

})