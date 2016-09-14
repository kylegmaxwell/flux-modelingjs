describe("mesh", function(){
    'use strict';

    var modeling = require('../dist/index.js');
    // Tests non public API
    var types = require('../dist/types.js');

    it("Should work", function() {
        var result = modeling.geometry.mesh([[0,0,0], [0,0,1],[0,1,0]], [[0,1,2]]);
        expect(result.vertices).toEqual([[0,0,0], [0,0,1],[0,1,0]]);
        expect(result.faces).toEqual([[0,1,2]]);

        expect(types.checkAll(["Result", types.helpers.Entity("mesh"), result]))
            .toEqual([undefined]);
    });

});
