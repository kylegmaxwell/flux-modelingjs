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

describe("modeling/measure/constructors", function() {
    'use strict';

    var modeling = require("../modeling.js");
    it("should convert unitful entities passed to constructors to a common unit", function() {
        var p1 = modeling.entities.point([100,200,300]).toJSON();
        p1.units.point = "cm";
        var p2 = modeling.entities.point([4,5,6]).toJSON();

        expect(p1.units.point).toNotEqual(p2.units.point);

        var l1 = modeling.entities.line(p1, p2).toJSON();
        expect(l1.units.start).toEqual("meters");
        expect(l1.units.end).toEqual("meters");
        expect(l1.start).toEqual([1,2,3]);
        expect(l1.end).toEqual([4,5,6]);

        var v1 = modeling.entities.vector([10,20,30]).toJSON();
        var b1 = modeling.entities.block(p1, v1).toJSON();
        expect(b1.origin).toEqual([1,2,3]);
        expect(b1.dimensions).toEqual([10,20,30]);
    })

    it("should extract coordinates from points and vectors in correct units", function() {
        var p1 = modeling.entities.point([1000,2000,3000]).toJSON();
        var a1 = modeling.utilities.coords(p1, {"length":"km"})
        expect(a1).toEqual([1,2,3]);

        var v1 = modeling.entities.vector([1000,2000,3000]).toJSON();
        var a2 = modeling.utilities.vecCoords(v1, {"length":"km"})
        expect(a2).toEqual([1,2,3]);
    })
})