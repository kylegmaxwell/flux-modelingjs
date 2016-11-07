'use strict';

var modeling = require('../dist/index.js');

var boundingBox =
    {
        "primitive" : "block",
        "origin" : [ 5, 10, 10],
        "dimensions" : [ 10, 10, 20 ],
        "axis" : [ 0, 0, 1 ],
        "reference" : [ 1, 0, 0 ],
        "units" : { "origin" : 'meters', "dimensions" : 'meters' }
    };

describe("Mesh BoundingBox Tests", function() {
    it("Mesh", function() {
        var geom = require("./data/math/mesh.json");
        var actual = modeling.math.meshBoundingBox(geom);
        console.log(actual);
        expect(actual).toEqual(boundingBox);
    });

    it ("Other(non-mesh) geometry", function() {
        var geom = require("./data/math/line.json");
        var errorName = "FluxModelingError";
        var errorMessage = "Input is not a valid mesh.";
        var actualName, actualMessage;
        try {
            var boundingBox = modeling.math.meshBoundingBox(geom);

        } catch(error) {
            actualName = error.name;
            actualMessage = error.message;
        }
        expect(actualName).toEqual(errorName);
        expect(actualMessage).toEqual(errorMessage);
    });
});