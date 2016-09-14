'use strict';

var modeling = require("../dist/index.js");
// Tests non public API
var types = require('../dist/types.js');
var lookupDimensions = types.lookupFieldDimensions;

describe("modeling/measure/lookupDimensions", function() {
    'use strict';

    it("Should look up field dimensions correctly", function(){
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

    it("should convert unitful entities passed to constructors to a common unit", function() {
        var p1 = modeling.geometry.point([100,200,300]);
        p1.units.point = "cm";
        var p2 = modeling.geometry.point([4,5,6]);

        expect(p1.units.point).toNotEqual(p2.units.point);

        var l1 = modeling.geometry.line(p1, p2);
        expect(l1.units.start).toEqual("meters");
        expect(l1.units.end).toEqual("meters");
        expect(l1.start).toEqual([1,2,3]);
        expect(l1.end).toEqual([4,5,6]);

        var v1 = modeling.geometry.vector([10,20,30]);
        var b1 = modeling.geometry.block(p1, v1);
        expect(b1.origin).toEqual([1,2,3]);
        expect(b1.dimensions).toEqual([10,20,30]);
    })
})

describe("modeling/measure/detectUnits", function() {
    'use strict';

    it("should detect units correctly", function() {
        var v1 = modeling.measure.detectUnits({});
        expect(v1).toEqual(false);

        var v2 = modeling.measure.detectUnits({"primitive":"brep"});
        expect(v2).toEqual(true);

        var v3 = modeling.measure.detectUnits({"primitive":"sphere", "units":{"origin":"meters"}});
        expect(v3).toEqual(true);

        var v4 = modeling.measure.detectUnits({"primitive":"polycurve",
            "curves":[{"units":{"points":"meters"}}]});
        expect(v4).toEqual(true);

        var v5 = modeling.measure.detectUnits({"primitive":"polycurve",
            "curves":[{}]});
        expect(v5).toEqual(false);

        var v6 = modeling.measure.detectUnits({"primitive":"polysurface",
            "surfaces":[{"units":{"points":"meters"}}]});
        expect(v4).toEqual(true);

        var v7 = modeling.measure.detectUnits({"primitive":"polysurface",
            "surfaces":[{}]});
        expect(v5).toEqual(false);

    })
})
