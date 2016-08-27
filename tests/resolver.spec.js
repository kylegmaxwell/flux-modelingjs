
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
    },
    "circle@3": {
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
        "circle@3"
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


var cases = [
    {
        name: "simple",
        makeQuery: function(modeling) {
            var q = modeling.query();
            var c = modeling.entities.circle([0,1,2], 10);
            var o = modeling.operations.evalMassProps(c);
            q.add("result", o);
            return q;
        },
        expected: simplePointQuery
    },
    {
        name: "simpleFromJSON",
        makeQuery: function(modeling) {
            var q = modeling.query();
            var c = forceJSON(modeling.entities.circle([0,1,2], 10));
            var o = modeling.operations.evalMassProps(c);
            q.add("result", o);
            return q;
        },
        expected: simplePointQuery
    },
    {
        name: "simpleFromJSONDirect",
        makeQuery: function(modeling) {
            var q = modeling.query();
            var c = forceJSON(modeling.entities.circle([0,1,2], 10));
            q.add("result", modeling.operations.evalMassProps(c));
            return q;
        },
        expected: simplePointQuery
    },
    {
        name: "simpleFromPreAdded",
        makeQuery: function(modeling) {
            var q = modeling.query();
            var c = modeling.entities.circle([0,1,2], 10);
            q.add("myCircle", c);
            q.add("result", modeling.operations.evalMassProps(c));
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
        makeQuery: function(modeling) {
            var q = modeling.query();
            var c = modeling.entities.circle([0,1,2], 10);
            var s = modeling.operations.extrudeWithDistance(c, modeling.entities.vector([0,0,1]), 20);
            var o = modeling.operations.evalMassProps(s);
            q.add("result", o);
            return q;
        },
        expected: nestedOperationsQuery
    },
    {
        name: "nestedQuery2",
        makeQuery: function(modeling) {
            var q = modeling.query();
            var c = forceJSON(modeling.entities.circle([0,1,2], 10));
            var v = forceJSON(modeling.entities.vector([0,0,1]));
            var s = modeling.operations.extrudeWithDistance(c, v, 20);
            var o = modeling.operations.evalMassProps(s);
            q.add("result", o);
            return q;
        },
        expected: nestedOperationsQuery
    },
    // NOTE: if you inspect the expected result for this test
    // (multipleOpsSameObjectQuery), you will see that two copies of of the
    // circle entity are added to the query. This is a flaw in the current
    // implementation of resolution and potentially wasteful. This test serves
    // to document the current behavior, not the intended or best behavior.
    // TODO(andrew): fix resolution to handle things that aren't Entities well.
    {
        name: "multipleOpsSameObject",
        makeQuery: function(modeling) {
            var q = modeling.query();
            var c = forceJSON(modeling.entities.circle([0,1,2], 10));
            var v = forceJSON(modeling.entities.vector([0,0,1]));
            var s = modeling.operations.extrudeWithDistance(c, v, 20);
            var o = modeling.operations.evalMassProps(c);
            q.add("extruded", s)
            q.add("circleProps", o);
            return q;
        },
        expected: multipleOpsSameObjectQuery
    },
];



describe("Resolver test", function() {
    var flux  = require('../index');
    var modeling = flux.modeling();

    for(var i = 0; i < cases.length; i++) {
        var c = cases[i];
        describe("It should resolve case "+i + ": " + c.name, function() {
            var r = JSON.stringify(c.makeQuery(modeling), null, '  ');
            expect(JSON.parse(r)).toEqual(c.expected);
        });
    }

});