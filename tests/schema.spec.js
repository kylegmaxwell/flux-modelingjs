describe("Schema test", function() {
    'use strict';
    var Ajv   = require('ajv');
    var fs    = require('fs');
    var flux  = require('../index');
    var schema = flux.schemas.pbw;
    var modeling = flux.modeling({ schema: null, registry: null, genId: null });

    var ajv = Ajv({ allErrors: true });
    ajv.addSchema(schema, "_");

    it ("Sphere should work with the right schema", function() {
        var origin = [0,5,0];
        var radius = 1.25;
        var sphereEntity = modeling.entities.sphere(origin,radius);
        var sphere = JSON.parse(JSON.stringify(sphereEntity));

        var schemaId = "#/entities/circle";
        var validate = ajv.compile({ $ref: "_" + schemaId });
        var isValid = validate(sphere);

        // Check the results
        expect(isValid).toEqual(false);
        expect(validate.errors[0].dataPath).toEqual(".primitive");

        schemaId = "#/entities/sphere";
        validate = ajv.compile({ $ref: "_" + schemaId });
        isValid = validate(sphere);

        expect(isValid).toEqual(true);
    });


    it ("Should allow additional properties", function() {
        var sphere = {"origin":[0,0,0],"primitive":"sphere","radius":10,"bad":"stuff"}

        var schemaId = "#/entities/sphere";
        var validate = ajv.compile({ $ref: "_" + schemaId });
        var isValid = validate(sphere);

        // Check the results
        expect(isValid).toEqual(true);
    });

    it ("Should allow attributes on instances", function() {
        var scene = {
            "primitive": "scene",
            "version":"0.0.1",
            "elements":[ {
                    "id": "thing",
                    "attributes":{"label":"My thing"},
                    "primitive": "instance",
                    "entity": "ball",
                    "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -20, 0, 0, 1]
                }
            ]
        };
        var schemaId = "#/scene";
        var validate = ajv.compile({ $ref: "_" + schemaId });
        var isValid = validate(scene);

        // Check the results
        expect(isValid).toEqual(true);
    });

    it ("Should manage units", function() {
        var cone = {
            "units":{
                "height":"cm",
                "ORIGIN":"m",
                "radius":"in"
            },
            "height":10,
            "origin":[0,0,0],
            "primitive":"cone",
            "radius":10,
            "semiAngle":10
        };

        var schemaId = "#/entities/cone";
        var validate = ajv.compile({ $ref: "_" + schemaId });
        var isValid = validate(cone);

        // Check the results
        expect(isValid).toEqual(true);

        var badUnits = {
            "units":{
                "height":123,
                "ORIGIN":"m",
                "radius":"in"
            },
            "height":10,
            "origin":[0,0,0],
            "primitive":"cone",
            "radius":10,
            "semiAngle":10
        };
        var isValid = validate(badUnits);

        // Check the results
        expect(isValid).toEqual(false);
    });

});