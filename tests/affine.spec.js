describe("affine", function() {
    'use strict';

    var modeling = require('../dist/index.js');
    // Tests non public API
    var types = require('../dist/types.js');

    it ("affine should work", function() {
        var result = modeling.geometry.affine.byMatrix(
            [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
        expect(result).toEqual({"primitive":"affineTransform","mat":
            [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]});

        expect(types.checkAll(["Result", types.helpers.Entity("affineTransform"), result]))
            .toEqual([undefined]);
    });
});
