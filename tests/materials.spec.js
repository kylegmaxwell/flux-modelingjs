describe("materials", function() {
    'use strict';

    var materials = require("../index").materials;

    var colorData = [{
        input:'red',
        output:[255,0,0]
    }, {
        input:'mintcream',
        output:[245,255,250]
    }, {
        input:'#F5DEB3',
        output:[245,222,179]
    }
    ];
    it ("Colors", function() {
        for (var i=0;i<colorData.length;i++) {
            var data = colorData[i];
            var rgb = materials.colorToArray(data.input);
            expect(rgb[0]).toEqual(data.output[0]/255);
            expect(rgb[1]).toEqual(data.output[1]/255);
            expect(rgb[2]).toEqual(data.output[2]/255);
        }
    });
});