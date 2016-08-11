describe("mesh", function(){
    'use strict';

    var modeling = require('../index.js').modeling();
    var types = require('../index.js').types();

    it("Should work", function() {
        var result = modeling.entities.mesh([[0,0,0], [0,0,1],[0,1,0]], [[0,1,2]]);
        expect(result.vertices).toEqual([[0,0,0], [0,0,1],[0,1,0]]);
        expect(result.faces).toEqual([[0,1,2]]);

        expect(types.checkAll(["Result", types.helpers.Entity("mesh"), result]))
            .toEqual([undefined]);
    });

});