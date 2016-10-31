'use strict';

var modeling = require('../dist/index.js');

var transf = {
  "mat": [2,
          0,
          0,
          10,
          0,
          1.5186607837677002,
          3.4496169090270996,
          13.68624496459961,
          0,
          -2.587212562561035,
          2.02488112449646,
          -3.5618398189544678,
          0,
          0,
          0,
          1],
  "primitive": "affineTransform"
};

var geomPrimitives = [
            "arc",
            "block",
            "circle",
            "curve",
            "ellipse",
            "line",
            "mesh",
            "plane",
            "point",
            "polycurve",
            "polyline",
            "polysurface",
            "rectangle",
            "sphere",
            "surface",
            "vector"
      ];

/**
*     Test the transform function.
*/
describe("Transform Tests", function() {
      geomPrimitives.forEach(function (testData) {
            it("Transform " + testData, function() {
              var geom = require("./data/math/" + testData + ".json");
              var expectedResult = require("./data/math/transformed-" + testData + ".json");
              var transformedGeom = modeling.math.transform(geom, transf.mat);
              expect(transformedGeom).toEqual(expectedResult);
            });
      });

      it("Transform brep should fail", function() {
        var brep = {
          "content": "SVNPLTEwMzAzLTIxOwpIRUFERVI7Ci8qIEdlbmVyYXRlZCBieSBzb2Z0d2FyZSBjb250YWluaW5EwMzAzLTIxOwo=",
          "format": "step",
          "primitive": "brep"
        }
        var errorName = "FluxModelingError";
        var errorMessage = "Failed to transform brep";
        var actualName;
        var actualMessage;
        try {
          var result = modeling.math.transform(brep, transf.mat);
        } catch(error) {
          actualName = error.name;
          actualMessage = error.message;
        }
        expect(actualName).toEqual(errorName);
        expect(actualMessage).toEqual(actualMessage);
      });
});