describe("modeling/measure/lookupDimensions", function() {
    'use strict';

    it("Should look up field dimensions correctly", function(){
        var lookupDimensions = require("../index").modeling().utilities.lookupFieldDimensions;
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

    var modeling = require("../index").modeling();
    it("should convert unitful entities passed to constructors to a common unit", function() {
        var p1 = modeling.entities.point([100,200,300]);
        p1.units.point = "cm";
        var p2 = modeling.entities.point([4,5,6]);

        expect(p1.units.point).toNotEqual(p2.units.point);

        var l1 = modeling.entities.line(p1, p2);
        expect(l1.units.start).toEqual("meters");
        expect(l1.units.end).toEqual("meters");
        expect(l1.start).toEqual([1,2,3]);
        expect(l1.end).toEqual([4,5,6]);

        var v1 = modeling.entities.vector([10,20,30]);
        var b1 = modeling.entities.block(p1, v1);
        expect(b1.origin).toEqual([1,2,3]);
        expect(b1.dimensions).toEqual([10,20,30]);
    })

    it("should extract coordinates from points and vectors in correct units", function() {
        var p1 = modeling.entities.point([1000,2000,3000]);
        var a1 = modeling.utilities.coords(p1, {"length":"km"})
        expect(a1).toEqual([1,2,3]);

        var v1 = modeling.entities.vector([1000,2000,3000]);
        var a2 = modeling.utilities.vecCoords(v1, {"length":"km"})
        expect(a2).toEqual([1,2,3]);
    })
})

describe("modeling/measure/detectUnits", function() {
    'use strict';

    var modeling = require("../index").modeling();
    it("should detect units correctly", function() {
        var v1 = modeling.utilities.detectUnits({});
        expect(v1).toEqual(false);

        var v2 = modeling.utilities.detectUnits({"primitive":"brep"});
        expect(v2).toEqual(true);

        var v3 = modeling.utilities.detectUnits({"primitive":"sphere", "units":{"origin":"meters"}});
        expect(v3).toEqual(true);

        var v4 = modeling.utilities.detectUnits({"primitive":"polycurve",
            "curves":[{"units":{"points":"meters"}}]});
        expect(v4).toEqual(true);

        var v5 = modeling.utilities.detectUnits({"primitive":"polycurve",
            "curves":[{}]});
        expect(v5).toEqual(false);

        var v6 = modeling.utilities.detectUnits({"primitive":"polysurface",
            "surfaces":[{"units":{"points":"meters"}}]});
        expect(v4).toEqual(true);

        var v7 = modeling.utilities.detectUnits({"primitive":"polysurface",
            "surfaces":[{}]});
        expect(v5).toEqual(false);

    })
})