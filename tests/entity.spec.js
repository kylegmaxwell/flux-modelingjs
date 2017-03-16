describe("entity", function() {
    'use strict';

    var modeling = require('../dist/index.js');

    it ("Should work with sphere", function() {
        var result = modeling.geometry.sphere([-10000,-10000,10000], 2000);
        expect(result!=null).toEqual(true);
    });
    it ("Ellipse should work with no direction", function() {
        var result = modeling.geometry.ellipse([-10000,-10000,10000], 2000, 1000);
        expect(result!=null).toEqual(true);
    });

});
