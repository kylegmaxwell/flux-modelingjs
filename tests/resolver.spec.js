
// We have tests that assert several different code paths result in this query.
var simplePointQuery = {
  "Entities": {
    "circle@1": {
      "primitive": "circle",
      "origin": [
        0,
        1,
        2
      ],
      "radius": 10,
      "units": {
        "origin": "meters",
        "radius": "meters"
      }
    }
  },
  "Operations": [
    {
      "name": "result",
      "op": [
        "evalMassProps",
        "circle@1"
      ]
    }
  ]
};

var nestedOperationsQuery = {
  "Entities": {
    "circle@1": {
      "primitive": "circle",
      "origin": [
        0,
        1,
        2
      ],
      "radius": 10,
      "units": {
        "origin": "meters",
        "radius": "meters"
      }
    },
    "vector@2": {
      "primitive": "vector",
      "coords": [
        0,
        0,
        1
      ],
      "units": {
        "coords": "meters"
      }
    }
  },
  "Operations": [
    {
      "name": "result",
      "op": [
        "evalMassProps",
        [
          "extrudeWithDistance",
          "circle@1",
          "vector@2",
          20
        ]
      ]
    }
  ]
}

var multipleOpsSameObjectQuery = {
  "Entities": {
    "circle@1": {
      "primitive": "circle",
      "origin": [
        0,
        1,
        2
      ],
      "radius": 10,
      "units": {
        "origin": "meters",
        "radius": "meters"
      }
    },
    "vector@2": {
      "primitive": "vector",
      "coords": [
        0,
        0,
        1
      ],
      "units": {
        "coords": "meters"
      }
    }
  },
  "Operations": [
    {
      "name": "extruded",
      "op": [
        "extrudeWithDistance",
        "circle@1",
        "vector@2",
        20
      ]
    },
    {
      "name": "circleProps",
      "op": [
        "evalMassProps",
        "circle@1"
      ]
    }
  ]
}


// Bounce an object to json, and rehydrated it. This is useful in testing
// what happens when a datum comes 'over the wire', rather than being generated
// inside the same javascript context.
function forceJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

var modeling  = require('../dist/index.js');
var Query = modeling.Query;
var Operation = modeling.Operation;

var cases = [
    {
        name: "simple",
        makeQuery: function() {
            var q = new Query();
            var c = modeling.geometry.circle([0,1,2], 10);
            var o = Operation.evalMassProps(c);
            q.add("result", o);
            return q;
        },
        expected: simplePointQuery
    },
    {
        name: "simpleFromJSON",
        makeQuery: function() {
            var q = new Query();
            var c = forceJSON(modeling.geometry.circle([0,1,2], 10));
            var o = Operation.evalMassProps(c);
            q.add("result", o);
            return q;
        },
        expected: simplePointQuery
    },
    {
        name: "simpleFromJSONDirect",
        makeQuery: function() {
            var q = new Query();
            var c = forceJSON(modeling.geometry.circle([0,1,2], 10));
            q.add("result", Operation.evalMassProps(c));
            return q;
        },
        expected: simplePointQuery
    },
    {
        name: "simpleFromPreAdded",
        makeQuery: function() {
            var q = new Query();
            var c = modeling.geometry.circle([0,1,2], 10);
            q.add("myCircle", c);
            q.add("result", Operation.evalMassProps(c));
            return q;
        },
        expected: {
          "Entities": {
            "myCircle": {
              "primitive": "circle",
              "origin": [
                0,
                1,
                2
              ],
              "radius": 10,
              "units": {
                "origin": "meters",
                "radius": "meters"
              }
            }
          },
          "Operations": [
            {
              "name": "result",
              "op": [
                "evalMassProps",
                "myCircle"
              ]
            }
          ]
        }
    },
    {
        name: "nestedQuery1",
        makeQuery: function() {
            var q = new Query();
            var c = modeling.geometry.circle([0,1,2], 10);
            var s = Operation.extrudeWithDistance(c, modeling.geometry.vector([0,0,1]), 20);
            var o = Operation.evalMassProps(s);
            q.add("result", o);
            return q;
        },
        expected: nestedOperationsQuery
    },
    {
        name: "nestedQuery2",
        makeQuery: function() {
            var q = new Query();
            var c = forceJSON(modeling.geometry.circle([0,1,2], 10));
            var v = forceJSON(modeling.geometry.vector([0,0,1]));
            var s = Operation.extrudeWithDistance(c, v, 20);
            var o = Operation.evalMassProps(s);
            q.add("result", o);
            return q;
        },
        expected: nestedOperationsQuery
    },
    {
        name: "multipleOpsSameObject",
        makeQuery: function() {
            var q = new Query();
            var c = forceJSON(modeling.geometry.circle([0,1,2], 10));
            var v = forceJSON(modeling.geometry.vector([0,0,1]));
            var s = Operation.extrudeWithDistance(c, v, 20);
            var o = Operation.evalMassProps(c);
            q.add("extruded", s)
            q.add("circleProps", o);
            return q;
        },
        expected: multipleOpsSameObjectQuery
    },
];



describe("Resolver test", function() {

    for(var i = 0; i < cases.length; i++) {
        var c = cases[i];
        it("It should resolve case "+i + ": " + c.name, function() {
            var r = JSON.stringify(c.makeQuery(modeling), null, '  ');
            expect(JSON.parse(r)).toEqual(c.expected);
        });
    }

});
